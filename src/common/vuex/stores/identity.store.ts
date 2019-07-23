import Vue from 'vue';
import { Module } from 'vuex';
import {
  signProfileToken,
  connectToGaiaHub,
  Person,
  wrapProfileToken,
  resolveZoneFileToProfile
} from 'blockstack';
import { IdentityStateType, LocalIdentity, DEFAULT_PROFILE, Profile } from './types/identity.state';
import { StateType } from './types/state';
import axios from 'axios';
import { parseZoneFile } from 'zone-file';
import { verifyProfileTokenRecord } from '../../token-util';
import { KeyPair } from 'common/data/identity-address-owner-node';
import { decrypt, tryUpload } from 'common/util';
import { validateMnemonic, mnemonicToSeed } from 'bip39';
import { WrappedNode } from 'common/data/wrapped-node';
import WrappedKeychain from 'common/data/wrapped-keychain';

function makeState(): IdentityStateType {
  return {
    publicKeychain: '',
    default: 0,
    identities: [],
  };
}

export const identityModule: Module<IdentityStateType, StateType> = {
  namespaced: true,
  state: makeState(),
  mutations: {
    reset(state) {
      Object.assign(state, makeState());
    },
    setDefault(state, { index }: { index: number }) {
      if(state.identities.find(a => a.index === index))
        state.default = index;
    },
    setPublicKeychain(state, { publicKeychain }: { publicKeychain: string }) {
      state.publicKeychain = publicKeychain || '';
    },
    create(state, payload: Partial<LocalIdentity> & { keyPair: KeyPair, index?: number }) {

      if(!payload.index) {
        if(state.identities.length > 0)
          payload.index = state.identities[state.identities.length - 1].index + 1;
        else
          payload.index = 0;
      }

      state.identities.push(Object.assign({}, new LocalIdentity(payload.keyPair, payload.index), payload));

      if(state.identities.length > 2)
        state.identities.sort((a, b) => a.index - b.index);
    },
    update(state, { index, payload }: { index: number, payload: Partial<LocalIdentity> }) {
      const idx = state.identities.findIndex(a => a.index === index);
      const id = state.identities[idx];
      if(!id) {
        console.error(`Can't update local identity at index ${index}; it doesn't exist!`);
        return;
      }
      let profile: Profile;
      if(payload.profile)
        profile = Object.assign({}, DEFAULT_PROFILE, id.profile, payload.profile);

      Vue.set(state.identities, idx, Object.assign(
          {},
          id,
          payload,
          profile ? { profile } : undefined));
    },
    updateApp(state, { index, domain, payload }: { index: number, domain: string, payload: any }) {
      const id = state.identities.find(a => a.index === index);
      if(!id) {
        console.error(`Can't update local identitiy's apps at index ${index}; it doesn't exist!`);
        return;
      }
      if(!id.profile.apps)
        Vue.set(id.profile, 'apps', { [domain]: payload });
      else
        Vue.set(id.profile.apps, domain, payload);
    },
    remove(state, { index }: { index: number }) {
      if(index === 0) return;
      if(index === state.default) state.default = 0;

      state.identities.splice(0, state.identities.length,
        ...state.identities.filter(a => a && a.index !== index));
    },
    addProfileImage(state, { index, payload }: { index?: number, payload: any }) {
      index = index || state.default;
      const id = state.identities.find(a => a.index === index);
      if(!id || !id.profile) {
        console.error('No profile on index ' + index + ' to upload image to.');
        return;
      }

      if(!id.profile.image) {
        Vue.set(id.profile, 'image', [
          Object.assign({
            '@type': 'ImageObject',
            name: '',
            contentUrl: ''
          },
          payload) ]);
      } else {

        // sanitize
        if(id.profile.image.length > 1) {
          const newImages = id.profile.image.reduce((acc, v) => {
            if(!acc.find(a => a.name === v.name))
              acc.push(v);
            return acc;
          }, []);
          if(newImages.length !== id.profile.image.length)
            Vue.set(id.profile, 'image', newImages);
        }

        // insert
        const i = id.profile.image.findIndex(a => a.name === payload.name);
        if(i >= 0) {
          Vue.set(id.profile.image, i, Object.assign({
              '@type': 'ImageObject',
              name: '',
              contentUrl: ''
            },
            id.profile.image[i],
            payload));
        } else {
          id.profile.image.push(Object.assign({
              '@type': 'ImageObject',
              name: '',
              contentUrl: ''
            },
            payload));
        }
      }
    }
  },
  getters: {
    defaultId: (state) => {
      const id = state.identities.find(a => a.index === state.default);
      if(!id) return '{null}';
      if(id.username) return id.username;
      if(id.profile && id.profile.name) return `${id.profile.name}: ID-${id.address}`;
      return `ID-${id.address}`;
    },
    getZoneFile: (state) => (index?: number) => {
      index = index || state.default;
      const id = state.identities.find(a => a.index === index);
      if(!id) return null;
      return id.zoneFile;
    },
    getTokenFileUrl: (state, getters) => (index?: number) => {
      const zoneFile = getters.getZoneFile(index);
      if(!zoneFile) return null;

      let parsed: any;
      try {
        parsed = parseZoneFile(zoneFile)
      } catch(e) {
        return null;
      }
      if(!parsed['uri'] || !(parsed.uri instanceof Array) || parsed.uri.length <= 0)
        return null;

      const first = parsed.uri[0];

      if(!first['target'])
        return null;

      const tokenFileUrl: string = first.target;

      if(!(tokenFileUrl.startsWith('https') || tokenFileUrl.startsWith('http')))
        return `https://${tokenFileUrl}`;
      else return tokenFileUrl;
    }
  },
  actions: {
    reset({ commit }) {
      commit('reset');
    },
    async create({ commit, state, rootState }, { password, index }: { password: string, index?: number }) {
      const phrase = await decrypt(rootState.account.encryptedBackupPhrase, password, rootState.account.iv);
      if(!validateMnemonic(phrase)) throw new Error('Wrong password!');
      if(!index) {
        if(!state.identities.length) index = 0;
        else index = state.identities[state.identities.length - 1].index + 1;
      } else {
        if(state.identities.find(a => a.index === index))
          throw new Error('Identity with index ' + index + ' already exists!');
        if(index < 0)
          throw new Error('Cannot create an identity with an index < 0!');
      }

      const seedBuffer = mnemonicToSeed(phrase);
      const masterKeychain = WrappedNode.fromSeed(seedBuffer);
      const wrapped = new WrappedKeychain(masterKeychain);
      const identityOwnerAddressNode = wrapped.getIdentityOwnerAddressNode(index);
      const derivedIdentityKeyPair = identityOwnerAddressNode.derivedIdentityKeyPair;

      commit('create', { keyPair: derivedIdentityKeyPair, index: index });
    },
    async remove({ commit, state }, { index }: { index: number }) {
      if(!state.identities.find(a => a.index === index)) throw new Error('No identity exists with index ' + index);
      commit('remove', { index });
    },
    async getDefaultProfileUrl({ state, rootState }, payload: { index?: number }) {
      let index;
      if(!payload || !payload.index) index = state.default;
      else index = payload.index;

      const id = state.identities.find(a => a.index === index);
      if(!id) throw new Error('No ID found with index ' + index + '!');
      return rootState.settings.api.gaiaHubConfig.url_prefix + id.address + '/profile.json';
    },
    async getProfileUploadLocation({ state, getters, rootState }, index?: number) {
      index = index || state.default;
      const id = state.identities.find(a => a.index === index);
      if(!id) throw new Error('No ID found with index ' + index + '!');

      const zoneFile = getters.getZoneFile(index);
      const gaiaHubConfig = rootState.settings.api.gaiaHubConfig;
      // using id account addr instead of `gaiaHubConfig.address`
      if(!zoneFile) return gaiaHubConfig.url_prefix + id.address + '/profile.json';
      else return getters.getTokenFileUrl(index);
    },
    async resolveProfile({ getters }, { publicKeyOrAddress }: { publicKeyOrAddress: string }) {
      const zoneFile = getters.getZoneFile();
      const tokenFileUrl = getters.getTokenFileUrl();

      if(!zoneFile) { // don't catch errors I guess
        let profile = JSON.parse(zoneFile);
        profile = Person.fromLegacyFormat(profile).profile();
        return profile;
      }

      if(!tokenFileUrl) {
        console.warn('No token file url to resolve profile with!');
        return { };
      }

      try {
        return await axios.get(tokenFileUrl).then(res => {
          const profile = { }
          const tokenRecords: any[] = res.data;
          for(const tokenRecord of tokenRecords) {
            let decodedToken
            try {
              decodedToken = verifyProfileTokenRecord(tokenRecord, publicKeyOrAddress);
            } catch(e) { console.warn('Error decoding token:', e); }

            if(decodedToken !== null)
              Object.assign(profile, decodedToken.payload.claim);
          }
          return profile;
        });
      } catch(e) {
        console.error('Error fetching token file:', e)
        return { };
      }
    },
    async downloadProfiles({ state, dispatch, rootState }, { index }: { index?: number }) {
      index = index || state.default;
      const gaiaUrlBase = rootState.settings.api.gaiaHubConfig.url_prefix;
      const firstAddress = state.identities[0].address;
      const id = state.identities.find(a => a.index === index);
      if(!id) throw new Error('No ID found with index ' + index + '!');

      const urls: string[] = [ await dispatch('getDefaultProfileUrl', { index }) ];

      if(index < 2) {
        urls.push(gaiaUrlBase + '/' + firstAddress + '/' + id.address + '/profile.json');
      } else if (index % 2 === 1) {
        const buggedIndex = 1 + Math.floor(index / 2); // apparently, blockstack counts in odd integers
        urls.push(gaiaUrlBase + '/' + firstAddress + '/' + buggedIndex + '/profile.json');
      }

      for(const url of urls) {
        try {
          const res = await axios.get(url)
          const profile = { };
          for(const tokenRecord of res.data) {
            const decodedToken = verifyProfileTokenRecord(tokenRecord, id.address);
            Object.assign(profile, decodedToken.payload.claim);
          }
          return { profile, profileUrl: url };
        } catch(e) {
          console.warn('Error downloading profile data from "' + url + '": ', e);
        }
      }
      console.warn('No profile data found...');
      return;
    },
    download({ commit, state, dispatch, rootState}, { index }: { index: number }) {
      const id = state.identities.find(a => a.index === index);
      if(!id) throw new Error('No ID found with index ' + index + '!');

      const url = rootState.settings.api.bitcoinAddressLookupUrl
          .replace('{coreApi}', rootState.settings.api.coreApi)
          .replace('{address}', id.address);
      return axios.get(url).then(res => {
        if(res.data.names.length === 0) {
          console.log('Address ' + id.address + ' has no names, checking default locations.');
          return dispatch('downloadProfiles', { index: index }).then((data?: any) => {
            if(!(data && data.profile)) throw new Error('No profile data found!');
            commit('update', { index: index, payload: { profile: data.profile, zoneFile: '' } });
          }, e => console.error('Error fetching info for address ' + id.address + ':', e));
        } else {
          if(res.data.names.length > 1) console.warn('Address ' + id.address + ' has multiple names; only using the first!');
          commit('update', {
            index: index,
            payload: { username: res.data.names[0], usernames: res.data.names, usernamePending: false, usernameOwned: true }
          });

          /** Todo?: Make it so it falls-back to other usernames */
          const lookupUrl = rootState.settings.api.nameLookupUrl
              .replace('{coreApi}', rootState.settings.api.coreApi)
              .replace('{name}', res.data.names[0]);
          return axios.get(lookupUrl).then(lookupRes => {
            if(!lookupRes.data || !lookupRes.data.zonefile || !lookupRes.data.address) {
              console.warn(`Malformed return from lookup url: (${lookupRes.status}) ${lookupRes.statusText}!`);
              throw new Error('Bad response from lookup url!');
            }
            return resolveZoneFileToProfile(lookupRes.data.zonefile, lookupRes.data.address).then(profile => {
              if(!profile) throw new Error('No profile data found!');
              commit('update', { index: index, payload: { profile, zoneFile: lookupRes.data.zonefile} });
            }, (e) => { console.error(e); return Promise.reject(e); });
          });
        }
      });
    },
    downloadAll({ dispatch, state }) {
      const proms = [];
      for(const id of state.identities) {
        proms.push(dispatch('download', { index: id.index }).then(() => true, () => false));
      }
      return Promise.all(proms);
    },
    async upload({ dispatch, state, rootState }, { index }: { index?: number }) {
      index = index || state.default;
      const id = state.identities.find(a => a.index === index);
      if(!id) throw new Error('No ID found with index ' + index + '!');

      const identityHubConfig = await connectToGaiaHub(rootState.settings.api.gaiaHubUrl, id.keyPair.key);
      const globalHubConfig = rootState.settings.api.gaiaHubConfig;

      const url: string = await dispatch('getProfileUploadLocation', index);
      const profile = id.profile;
      const token = signProfileToken(profile, id.keyPair.key, { publicKey: id.keyPair.keyId });
      const tokenRecords = [ wrapProfileToken(token) ];

      const signedProfileData = JSON.stringify(tokenRecords, null, 2);

      return tryUpload(url, signedProfileData, identityHubConfig, 'application/json')
          .catch(() => tryUpload(url, signedProfileData, globalHubConfig, 'application/json'))
          .catch(e => Promise.reject(new Error(`Issue writing to ${url}: ` + e)));
    },
  }
}

export default identityModule;
