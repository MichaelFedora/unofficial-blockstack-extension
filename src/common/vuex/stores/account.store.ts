import { Module } from 'vuex';
import { WrappedKeychain } from '../../data/wrapped-keychain';
import { AccountStateType, SATOSHIS_IN_BTC } from './types/account.state';
import { StateType } from './types/state';
import { decrypt, encrypt, getAddress } from '../../util';
import { validateMnemonic, mnemonicToSeed } from 'bip39';
import { KeyPair } from '../../data/identity-address-owner-node';
import Axios from 'axios';
import { config, transactions } from 'blockstack';
import { WrappedNode } from '../../data/wrapped-node';

function makeState(): AccountStateType {
  return  {
    accountCreated: false,
    promptedForEmail: false,
    email: '',
    encryptedBackupPhrase: '',
    identityAccount: {
      publicKeychain: '',
      addresses: [],
      keypairs: [],
      addressIndex: 0
    },
    bitcoinAccount: {
      publicKeychain: '',
      addresses: [] as string[],
      balances: {
        total: 0
      } as { [key: string]: number, total: number },
      addressIndex: 0
    },
    viewedRecoveryCode: false,
    connectedStorageAtLeastOnce: false
  };
}

export const accountModule: Module<AccountStateType, StateType> = {
  namespaced: true,
  state: makeState(),
  getters: {
    isLoggedIn(state) {
      return (state.accountCreated && state.encryptedBackupPhrase) ? true : false;
    }
  },
  mutations: {
    reset(state) {
      Object.assign(state, makeState());
    },
    updateAccount(state, payload: Partial<AccountStateType>) {
      Object.assign(state, payload);
    },
    addIdentity(state, { keyPair }: { keyPair: KeyPair }) {
      state.identityAccount.addresses.push(keyPair.address);
      state.identityAccount.keypairs.push(keyPair);
      state.identityAccount.addressIndex++;
    },
    updateBalances(state, { balances }: { balances: { [key: string]: number } }) {
      state.bitcoinAccount.balances = Object.assign(
        {},
        balances,
        { total: Object.keys(balances).reduce((acc, k) => acc + balances[k], 0)}
      );
    },
    removeIdentity(state, { index }: { index: number}) {
      if(index >= state.identityAccount.addresses.length || index <= 0)
        return;

      const addrs = state.identityAccount.addresses;
      const keypairs = state.identityAccount.keypairs;

      const newAddrs = addrs.slice(0, index).concat(addrs.slice(index + 1));
      const newKeypairs = keypairs.slice(0, index).concat(keypairs.slice(index + 1));

      state.identityAccount.addresses.splice(0, addrs.length, ...newAddrs);
      state.identityAccount.keypairs.splice(0, keypairs.length, ...newKeypairs);
    }
  },
  actions: {
    async reset({ commit }) {
      commit('reset');
    },
    async createAccount({ commit, dispatch, state }, { email, encryptedBackupPhrase, masterKeychain, identitiesToGenerate }: {
      email?: string,
      encryptedBackupPhrase: string,
      masterKeychain: string,
      identitiesToGenerate?: number
    }) {
      identitiesToGenerate = (identitiesToGenerate && identitiesToGenerate >= 1) ? identitiesToGenerate : 1;
      const wrapped = new WrappedKeychain(WrappedNode.fromBase58(masterKeychain));
      const firstBitcoinAddress = wrapped.getFirstBitcoinAddress().getAddress();
      const identityAddresses = [];
      const identityKeypairs = [];
      // for-each address to generate...
      for(let i = 0; i < identitiesToGenerate; i++) {
        const identityOwnerAddressNode = wrapped.getIdentityOwnerAddressNode(i);
        const identityKeyPair = identityOwnerAddressNode.derivedIdentityKeyPair;
        identityKeypairs.push(identityKeyPair);
        identityAddresses.push(identityKeyPair.address);
        commit('identity/create', { ownerAddress: identityKeyPair.address }, { root: true });
      }

      commit('updateAccount', {
        email: email || state.email,
        accountCreated: true,
        encryptedBackupPhrase,
        identityAccount: {
          publicKeychain: wrapped.identityPublicKeychain.toBase58(),
          addresses: identityAddresses,
          keypairs: identityKeypairs,
          addressIndex: identityAddresses.length
        },
        bitcoinAccount: {
          publicKeychain: wrapped.bitcoinPublicKeychain.toBase58(),
          addresses: [firstBitcoinAddress],
          addressIndex: 0,
          balances: state.bitcoinAccount.balances // ?!
        }
      } as Partial<AccountStateType>);
    },
    async createIdentity({ commit, state }, { password }: { password: string }) {
      const phrase = await decrypt(state.encryptedBackupPhrase, password);
      if(!validateMnemonic(phrase)) throw new Error('Wrong password!');

      const seedBuffer = mnemonicToSeed(phrase);
      const masterKeychain = WrappedNode.fromSeed(seedBuffer);
      const wrapped = new WrappedKeychain(masterKeychain);
      const nextIdentityIndex = state.identityAccount.addressIndex;
      const identityOwnerAddressNode = wrapped.getIdentityOwnerAddressNode(nextIdentityIndex)
      const derivedIdentityKeyPair = identityOwnerAddressNode.derivedIdentityKeyPair;

      commit('addIdentity', { keyPair: derivedIdentityKeyPair });
      commit('identity/create', { ownerAddress: derivedIdentityKeyPair.address }, { root: true })
    },
    async removeIdentity({ commit, state }, payload: { index: number }) {
      if(payload.index >= state.identityAccount.addresses.length || payload.index <= 0)
        throw new Error('Index is out of range: Must be valid and not 0!');
      commit('removeIdentity', payload);
      commit('identity/remove', payload, { root: true });
    },
    async changePassword({ state, commit }, { newpass, oldpass }: { newpass: string, oldpass: string }) {
      const phrase = await decrypt(state.encryptedBackupPhrase, oldpass);
      if(!validateMnemonic(phrase)) throw new Error('Wrong password!');
      const encryptedBackupPhrase = await encrypt(phrase, newpass);
      commit('updateAccount', { encryptedBackupPhrase });
    },
    async refreshBalances({ state, commit, rootState }) {
      const balances: { [key: string]: number } = { };
      for(const addr of state.bitcoinAccount.addresses) {
        const rootUrl = rootState.settings.api.insightUrl.replace('{address}', addr);
        const results = await Promise.all([
          Axios.get(rootUrl + '/balance'),
          Axios.get(rootUrl + '/unconfirmedBalance')
        ]);
        balances[addr] = 1.0 * (results[0].data + results[1].data) / SATOSHIS_IN_BTC;
      }
      commit('updateBalances', { balances });
    },
    async withdraw({ state, dispatch }, { to, amount, password }: { to: string, amount: number, password: string }) {
      if(amount > state.bitcoinAccount.balances[0]) throw new Error('Will not overwithdraw from the account.')
      const phrase = await decrypt(state.encryptedBackupPhrase, password);
      if(!validateMnemonic(phrase)) throw new Error('Wrong password!');
      const seedBuffer = mnemonicToSeed(phrase);
      const masterKeychain = WrappedNode.fromSeed(seedBuffer);
      const wrapped = new WrappedKeychain(masterKeychain);

      const btcAddressNode = wrapped.getBitcoinAddressNode(0);
      // @ts-ignore
      const paymentKey = btcAddressNode.keyPair.privateKey.toString('hex');

      const amountSatoshis = Math.floor(amount * SATOSHIS_IN_BTC);
      transactions.makeBitcoinSpend(to, paymentKey, amountSatoshis)
            .then(transHex => config.network.broadcastTransaction(transHex))
            .then(() => dispatch('refreshBalances'));
    }
  }
}

export default accountModule;
