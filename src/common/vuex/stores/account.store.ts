import { Module } from 'vuex';
import { WrappedKeychain } from '../../data/wrapped-keychain';
import { AccountStateType, SATOSHIS_IN_BTC } from './types/account.state';
import { StateType } from './types/state';
import { decrypt, encrypt, createIv } from '../../util';
import { validateMnemonic, mnemonicToSeed } from 'bip39';
import Axios, { AxiosPromise, AxiosResponse } from 'axios';
import { config, transactions, network } from 'blockstack';
import { WrappedNode } from '../../data/wrapped-node';

function makeState(): AccountStateType {
  return  {
    accountCreated: false,
    email: '',
    encryptedBackupPhrase: '',
    iv: null,
    bitcoinAccount: {
      publicKeychain: '',
      addresses: [] as string[],
      balances: {
        total: 0
      } as { [key: string]: number, total: number },
      addressIndex: 0
    }
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
    update(state, payload: Partial<AccountStateType>) {
      Object.assign(state, payload);
    },
    updateBalances(state, { balances }: { balances: { [key: string]: number } }) {
      state.bitcoinAccount.balances = Object.assign(
        {},
        balances,
        { total: Object.keys(balances).reduce((acc, k) => acc + balances[k], 0)}
      );
    },
  },
  actions: {
    async reset({ commit }) {
      commit('reset');
    },
    async createAccount({ commit, state }, { email, encryptedBackupPhrase, iv, masterKeychain, identitiesToGenerate }: {
      email?: string,
      encryptedBackupPhrase: string,
      iv: string,
      masterKeychain: string,
      identitiesToGenerate?: number
    }) {
      identitiesToGenerate = (identitiesToGenerate && identitiesToGenerate >= 1) ? identitiesToGenerate : 1;
      const wrapped = new WrappedKeychain(WrappedNode.fromBase58(masterKeychain));
      const firstBitcoinAddress = wrapped.getFirstBitcoinAddress().getAddress();
      // for-each address to generate...
      for(let i = 0; i < identitiesToGenerate; i++) {
        const identityOwnerAddressNode = wrapped.getIdentityOwnerAddressNode(i);
        const identityKeyPair = identityOwnerAddressNode.derivedIdentityKeyPair;
        commit('identity/create', { keyPair: identityKeyPair, index: i }, { root: true });
      }

      commit('identity/setPublicKeychain', { publicKeychain: wrapped.identityPublicKeychain.toBase58() }, { root: true });
      commit('update', {
        email: email || state.email,
        accountCreated: true,
        encryptedBackupPhrase,
        iv,
        bitcoinAccount: {
          publicKeychain: wrapped.bitcoinPublicKeychain.toBase58(),
          addresses: [firstBitcoinAddress],
          addressIndex: 0,
          balances: state.bitcoinAccount.balances // ?!
        }
      } as Partial<AccountStateType>);
    },
    async changePassword({ state, commit }, { newpass, oldpass }: { newpass: string, oldpass: string }) {
      const phrase = await decrypt(state.encryptedBackupPhrase, oldpass, state.iv);
      if(!validateMnemonic(phrase)) throw new Error('Wrong password!');
      const iv = await createIv();
      const encryptedBackupPhrase = await encrypt(phrase, newpass, iv);
      commit('update', { iv, encryptedBackupPhrase });
    },
    async refreshBalances({ state, commit, rootState }) {
      const balances: { [key: string]: number } = { };
      const insightUrl = 'https://blockstack-explorer-api.herokuapp.com/api/addresses/{address}?page=0'

      for(const addr of state.bitcoinAccount.addresses) {
        const url = insightUrl.replace('{address}', addr);
        let res: AxiosResponse;
        try {
          res = await Axios.get(url);
        } catch(e) {
          console.error(`Error getting balances for address ${addr}:`, e);
          continue;
        }
        balances[addr] = 1.0 * (res.data.balance) / SATOSHIS_IN_BTC;
      }
      commit('updateBalances', { balances });
    },
    async withdraw({ state, dispatch }, { to, amount, password }: { to: string, amount: number, password: string }) {
      if(amount > state.bitcoinAccount.balances[0]) throw new Error('Will not overwithdraw from the account.')
      const phrase = await decrypt(state.encryptedBackupPhrase, password, state.iv);
      if(!validateMnemonic(phrase)) throw new Error('Wrong password!');
      const seedBuffer = mnemonicToSeed(phrase);
      const masterKeychain = WrappedNode.fromSeed(seedBuffer);
      const wrapped = new WrappedKeychain(masterKeychain);

      const btcAddressNode = wrapped.getBitcoinAddressNode(0);
      const paymentKey = btcAddressNode.keyPair.privateKey.toString('hex');

      const amountSatoshis = Math.floor(amount * SATOSHIS_IN_BTC);
      transactions.makeBitcoinSpend(to, paymentKey, amountSatoshis)
            .then(transHex => config.network.broadcastTransaction(transHex))
            .then(() => dispatch('refreshBalances'));
    }
  }
}

export default accountModule;
