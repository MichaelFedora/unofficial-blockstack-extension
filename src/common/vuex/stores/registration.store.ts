
import { transactions as bsTransactions, safety } from 'blockstack';
import { BlockstackNetwork } from 'blockstack/network';
import { Module } from 'vuex';
import axios from 'axios';
import { RegistrationStateType } from './types/registration.state';
import { StateType } from './types/state';

async function registerSubdomain(
  api: { subdomains: { [key: string]: { registerUrl } }, coreApiPassword: string },
  domainName: string,
  identityIndex: number,
  ownerAddress: string,
  zoneFile: string) {

  const nameTokens = domainName.split('.');
  if(nameTokens.length < 3) throw new Error(`Cannot register ${domainName} as a subdomain!`);

  const domain = nameTokens.slice(1).join('.');

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'applicatoin/json',
    Authorization: `bearer ${api.coreApiPassword}` // capitalize?
  };

  const res = await axios.post(api.subdomains[domain].registerUrl, {
    name: nameTokens[0],
    owner_address: ownerAddress,
    zonefile: zoneFile
  }, { headers });

  return res.data;
}

async function registerDomain(
  network: BlockstackNetwork,
  transactions: typeof bsTransactions,
  domainName: string,
  identityIndex: number,
  ownerAddress: string,
  paymentKey: string,
  zoneFile: string) {

  const compressedKey = `${paymentKey}01`; // ... o k
  const coercedAddress = network.coerceAddress(ownerAddress);

  const canReceive = await safety.addressCanReceiveName(ownerAddress);
  if(!canReceive) throw new Error(`Address ${ownerAddress} cannot receive names!`);
  const nameValid = await safety.isNameValid(domainName);
  if(!nameValid) throw new Error(`Name ${domainName} is not valid!`);
  const preorderTx = await transactions.makePreorder(domainName, coercedAddress, compressedKey);
  network.modifyUTXOSetFrom(preorderTx);
  const registerTx = await transactions.makeRegister(domainName, coercedAddress, compressedKey, zoneFile);
  network.modifyUTXOSetFrom(registerTx); // to not double spend (??)
  return network.broadcastNameRegistration(preorderTx, registerTx, zoneFile);
}

function makeState(): RegistrationStateType {
  return {
    profileUploading: false,
    registrationSubmitting: false,
    registrationSubmitted: false,
    error: null,
    preventRegistration: false
  };
}

export const registrationModule: Module<RegistrationStateType, StateType> = {
  namespaced: true,
  state: makeState(),
  mutations: {
    reset(state) {
      Object.assign(state, makeState());
    }
  },
  actions: {
    reset({ commit }) {
      commit('reset');
    },
    /*async registerName({ state, commit },
      { api, domainName, identity, identityIndex, ownerAddress, keyPair, paymentKey }: {
        api: {
          gaiaHubConfig: GaiaHubConfig,
          gaiaHubUrl: string,
          subdomains: { [key: string]: { registerUrl } },
          coreApiPassword: string,
          regTestMode: boolean
        },
        domainName: string,
        identity: { zoneFile: string },
        identityIndex: number,
        ownerAddress: string,
        keyPair: { key: string },
        paymentKey: string
    }) {
      const signedProfileTokenData = signProfileForUpload(DEFAULT_PROFILE, keyPair);
      const profileUrl = await uploadProfile(api, identity, keyPair, signedProfileTokenData);
      const zoneFile = makeProfileZoneFile(domainName, profileUrl);

      const nameTokens = domainName.split('.');
      if(nameTokens.length >= 3) {
        const data = await registerSubdomain(api, domainName, identityIndex, ownerAddress, zoneFile);
        if(data.error) state.error = true;
        else {
          commit('identity/addUsername', { index: identityIndex, username: domainName }, { root: true });
        }
      } else {
        const res: any = registerDomain(config.network, bsTransactions, domainName, identityIndex, ownerAddress, paymentKey, zoneFile);
        if(res.status) {
          commit('identity/addUsername', { index: identityIndex, username: domainName }, { root: true });
        } else throw new Error('Error submitting name registration: ' + res);
      }
    }*/
  }
}

export default registrationModule;
