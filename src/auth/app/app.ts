import Vue, { VueConstructor } from 'vue';

import {
  getAuthRequestFromURL,
  verifyAuthRequestAndLoadManifest,
  makeAuthResponse,
  redirectUserToApp,
  getAppBucketUrl,
  isLaterVersion,
  updateQueryStringParameter
} from 'blockstack';

import bip32 from 'bip32';

import { VALID_AUTH_SCOPES, validateAuthScopes, AuthTokenHeader, AuthTokenPayload } from 'common/token-util';
import { decodeToken } from 'jsontokens'
import { browser } from 'webextension-polyfill-ts';

import { AppNode } from 'common/data/app-node';

import { StateType } from 'common/vuex/stores/types/state';
import { Store, mapGetters, mapState } from 'vuex';
import { parseQuery } from 'common/util';
import { dispatch, commit } from 'common/vuex/remote-interface';
import { AppEntry } from 'common/data/app-entry';

export function appRequestSupportsDirectHub(requestPayload: any) {
  return (
    isLaterVersion(requestPayload.version || '0', '1.2.0') ||
    requestPayload.supports_hub_url
  ) ? true : false;
}

interface VVue extends Vue {
  $store: Store<StateType>;
}

export default (Vue as VueConstructor<VVue>).extend({
  data() {
    return {
      app: {
        icon: '',
        name: '',
        url: '',
        description: '',
        scopes: Object.keys(VALID_AUTH_SCOPES).reduce((acc, v) => { acc[v] = false; return acc; }, {}) as typeof VALID_AUTH_SCOPES
      },
      userIds: [] as { userName?: string, name: string, givenName?: string, familyName?: string, ownerAddress: string }[],
      working: false,
      error: '',
      params: parseQuery(),

      decodedToken: (null as any) as { header: AuthTokenHeader, payload: AuthTokenPayload },
      manifest: (null as any),
      authRequest: (null as any),
      selectedIdx: this.$store.state.identity.identities.findIndex(a => a.index === this.$store.state.identity.default)
    }
  },
  computed: {
    ...mapState({
      localIdentities: (state: StateType) => state.identity.identities
    }),
    ...mapGetters({
      loggedIn: 'account/isLoggedIn'
    }),
  },
  watch: {
    localIdentities() { this.updateUserIds(); }
  },
  mounted() {
    dispatch('identity/downloadAll');

    const authRequest = getAuthRequestFromURL();
    this.authRequest = authRequest;
    let decodedToken: { payload: AuthTokenPayload, header: AuthTokenHeader };

    try {
      decodedToken = decodeToken(authRequest) as { payload: AuthTokenPayload, header: AuthTokenHeader };
    } catch(e) {
      console.error(this.error = 'Error decoding token: ' + e);
      console.error(e);
      return;
    }
    if(!decodedToken.payload ||
      !decodedToken.header ||
      Object.keys(decodedToken.header).length === 0 ||
      Object.keys(decodedToken.payload).length === 0) {
      console.error(this.error = 'Error decoding token: missing information (payload/header) on decode!');
      return;
    }

    if(!validateAuthScopes(decodedToken.payload.scopes)) {
      console.error(this.error = 'Scopes are not valid!');
      return;
    }

    this.decodedToken = decodedToken;

    verifyAuthRequestAndLoadManifest(authRequest).then((manifest: {
      name: string,
      description?: string,
      icons: {
        src: string
        sizes: string,
        type: string
      }[] }) => {

      this.manifest = Object.assign({}, manifest);

      this.updateUserIds();

      const appDomain = decodedToken.payload.domain_name;
      this.app.url = appDomain;
      this.app.name = manifest.name;
      this.app.description = manifest.description || '';
      let icon: { src: string };
      if(manifest.icons) {
        icon = manifest.icons.find(a => a.sizes === '128x128');
        if(!icon) icon = manifest.icons.find(a => a.sizes === '192x192');
        if(!icon) icon = manifest.icons[0];
      }
      this.app.icon = icon ? icon.src : '';
      for(const scope of decodedToken.payload.scopes)
        this.app.scopes[scope] = true;

    }, err => console.error(`Couldn't verify auth request/load manifest and/or get user:`, err));
  },
  methods: {
    updateUserIds() {
      this.userIds.splice(0, this.userIds.length, ...this.localIdentities.map(id => {
        const ret: any = { };
        if(id.profile.givenName) {
          ret.name = '' + id.profile.givenName;
          if(id.profile.familyName)
            ret.name += ' ' + id.profile.familyName;
        } else
          ret.name = id.profile.name || '';
        ret.address = id.address;
        ret.username = id.username || '';
        return ret;
      }));
    },
    async approve() {
      if(this.working) return;
      this.working = true;
      // login!

      const identity = this.$store.state.identity.identities[this.selectedIdx];

      if(!identity) {
        console.error(this.error = 'Identities not set up or not logged in!');
        return;
      }

      let hasUsername = (identity.username && !identity.usernamePending) ? true : false;
      const appDomain = this.decodedToken.payload.domain_name;
      const scopes = this.app.scopes;

      let blockchainId: string | undefined = undefined;
      if(hasUsername) {
        const lookupUrl = this.$store.state.settings.api.nameLookupUrl
          .replace('{coreApi}', this.$store.state.settings.api.coreApi)
          .replace('{name}', identity.username);
        let resText: string;

        try {
          resText = await fetch(lookupUrl).then(response => response.text());
        } catch(e) {
          console.error(this.error = 'Error fetching username data!', e)
          return;
        }

        const json = JSON.parse(resText);
        if(json.address) {
          // const nameOwningAddress = json.address;
          if(json.address === identity.address) {
            console.log('login: name has propageted on the network.');
            blockchainId = identity.username; // how odd...
          } else {
            hasUsername = false;
          }
        } else hasUsername = false;
      }

      if(scopes.store_write && !appRequestSupportsDirectHub(this.decodedToken.payload)) {
          console.error(this.error = 'Core-enabled storage is no longer supported!');
          return;
      }

      if(!(this.$store.state.settings.api.gaiaHubConfig && this.$store.state.settings.api.gaiaHubConfig.server)) {
        console.error(this.error = 'GaiaHubConfig not set!');
        return;
      }

      const privateKey = identity.keyPair.key;
      const appPrivateKey = AppNode.fromAppsNode(
        bip32.fromBase58(identity.keyPair.appsNodeKey),
          identity.keyPair.salt,
          appDomain).appPrivateKey;

      let profileUrlPromise

      if(identity.zoneFile && identity.zoneFile.length > 0) {
        const profileUrlFomZonefile = this.$store.getters['identity/getTokenFileUrl'](this.currentIdentityIndex);
        if(profileUrlFomZonefile != null)
          profileUrlPromise = Promise.resolve(profileUrlFomZonefile);
      }

      // const gaiaBucketAddress = this.$store.state.identity.identities[0].address;
      // const identityAddress = identity.address;
      // const gaiaUrlBase = this.$store.state.settings.api.gaiaHubConfig.url_prefix;

      if(!profileUrlPromise)
        profileUrlPromise = dispatch('identity/downloadProfiles', { index: this.currentIdentityIndex }).then(res => {
          if(res && res.profileUrl) return res.profileUrl;
          else return dispatch('identity/getDefaultUrl', { index: this.currentIdentityIndex });
        });

      profileUrlPromise.then((profileUrl: string) => {
        if(this.decodedToken.payload.scopes.find(a => a === 'publish_data')) {
          let apps = {};
          if(identity.profile['apps'])
            apps = identity.profile.apps;

          if(this.$store.state.settings.api.storageConnected) {
            return getAppBucketUrl('https://hub.blockstack.org', appPrivateKey).then(appBucketUrl => {
              apps[appDomain] = appBucketUrl;
              identity.profile.apps = apps;
              return commit('identity/updateApp',
                    { index: this.currentIdentityIndex, domain: appDomain, payload: appBucketUrl })
                    .then(() => dispatch('identity/upload', { index: this.currentIdentityIndex }));
            }).then(() => profileUrl)
          }
        } else return profileUrl;
      }).then(profileUrl => { // complete auth response
        const metadata = {
          email: this.app.scopes.email ? this.$store.state.account.email : null, // never not false
          profileUrl
        };

        const profileResponseData = this.decodedToken.payload.do_not_include_profile ? null : identity.profile;

        let transitPublicKey: any = undefined;
        let hubUrl = undefined;

        const requestVersion = this.decodedToken.payload.version || '0';
        if(isLaterVersion(requestVersion, '1.1.0') && this.decodedToken.payload.public_keys.length > 0)
          transitPublicKey = this.decodedToken.payload.public_keys[0];
        if(appRequestSupportsDirectHub(this.decodedToken.payload)) // should always be true
          hubUrl = this.$store.state.settings.api.gaiaHubConfig.server;

        const authResponse = makeAuthResponse(privateKey, profileResponseData, blockchainId,
                                              metadata, null, appPrivateKey,
                                              undefined, transitPublicKey, hubUrl);

        // (DNE): commit('removeCoreSessionToken', appDomain);

        commit('apps/addRecent', {
          name: this.app.name,
          imageUrl: this.app.icon,
          description: this.app.description || '',
          website: this.app.url
        } as AppEntry);

        if(window.history.length > 1) {
          redirectUserToApp(this.authRequest, authResponse);
        } else if(this.params.tabId && +this.params.tabId) {
          console.log('Getting tab with ID of ' + this.params.tabId + '...');
          return browser.tabs.get(+this.params.tabId).then(tab => {
            let redirectURI = (decodeToken(this.authRequest) as any).payload.redirect_uri;
            if(!(tab && tab.id && redirectURI)) throw new Error();
            redirectURI = updateQueryStringParameter(redirectURI, 'authResponse', authResponse);
            console.log('Trying to update the tab...');
            return Promise.all([
              browser.tabs.update(tab.id, { url: redirectURI, active: true }),
              this.close()
            ]);
          });
        } else return this.close(); // idk :(
      }).catch(e => {
        console.error(this.error = 'Uncaught exception in approve: ' + (e.message ? e.message : JSON.stringify(e)));
        console.error(e);
      });
    },
    async deny() {
      if(window.history.length > 1)
        window.history.back();
      else return this.close();
    },
    async close() {
      console.log('Closing...');
      try {
        const tab = await browser.tabs.getCurrent();
        if(tab && tab.id) await browser.tabs.remove(tab.id);
        else {
          const win = await browser.windows.getCurrent();
          if(win && win.id) await browser.windows.remove(win.id);
        }
      } catch(e) {
        console.error('Error closing Auth:', e);
      }
    }
  }
});
