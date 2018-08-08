import ccopy from 'clipboard-copy';
import Vue from 'vue';
import { AppEntry } from 'common/data/app-entry';
import { validateMnemonic, mnemonicToSeed, generateMnemonic } from 'bip39';
import bip32 from 'bip32';
import { mapGetters, mapState } from 'vuex';
import { randomBytes } from 'crypto';
import { encrypt } from 'common/util';
import _ from 'lodash';
import { FieldFlags } from 'vee-validate';
import { browser } from 'webextension-polyfill-ts';
import { dispatch, commit } from 'common/vuex/remote-interface';
import { VVue } from 'common/vvue';

import ProfileComponent from './components/profile';
import { StateType } from 'common/vuex/stores/types/state';
import { RecommendedAppNames } from 'common/recommended-apps';

window.onbeforeunload = (ev) => {
  console.log('unloading!');
  return null;
};

export default (Vue as VVue).extend({
  components: { ProfileComponent },
  data() {
    return {
      loading: true,

      view: '',

      phrase: '',
      email: '',
      pass: '',
      confirm: '',

      search: '',
      appResults: [] as AppEntry[],
      resultCount: 0,

      profileSidebar: false,

      error: '',
      working: false,

      dialogSpace: false,

      appIcons: { } as { [key: string]: string },
      erroredIcons: { } as { [key: string]: number }
    }
  },
  computed: {
    ...mapGetters({
      loggedIn: 'account/isLoggedIn',
      defaultId: 'identity/defaultId',
    }),
    ...mapState({
      logoutReason: (state: StateType) => state.meta.logoutReason
    }),
    fullForm: function() {
      return ((this.view === 'restore' ? this.phrase : true) && this.pass && this.confirm) ? true : false;
    },
    profileName: function() {
      const identity = this.$store.state.identity.localIdentities[this.$store.state.identity.default];
      if(!identity) return `{null}`;
      if(identity.username) return identity.username;
      if(identity.profile && identity.profile.name) return identity.profile.name;
      return '';
    },
    idString: function() {
      const identity = this.$store.state.identity.localIdentities[this.$store.state.identity.default];
      return identity ? `ID-${identity.ownerAddress}` : '';
    },
    profileImg: function() {
      const defaultIdentity = this.$store.state.identity.localIdentities[this.$store.state.identity.default];
      return (defaultIdentity &&
          defaultIdentity.profile &&
          defaultIdentity.profile.image &&
          defaultIdentity.profile.image[0]) ?
          defaultIdentity.profile.image[0].contentUrl : '';
    },
    recentApps() {
      const ret = (this.$store.state.apps.recent && this.$store.state.apps.recent.slice(0, 5)) || [];
      for(const app of ret)
        if(!this.appIcons[app.name])
          Vue.set(this.appIcons, app.name, app.imageUrl);
      return ret;
    },
    recommendedApps: function() {
      const ret = this.$store.state.apps.apps
            .filter(a => RecommendedAppNames.find(b => a.name === b) &&
                        !this.recentApps.find(b => b.name === a.name || a.website === b.website));

      for(const app of ret)
        if(!this.appIcons[app.name])
          Vue.set(this.appIcons, app.name, app.imageUrl);

      return ret;
    }
  },
  mounted() {
    console.log('Mounted popup!');
    this.loading = false;
    this.updateSearch = _.debounce(this._updateSearch, 150);
    this.initializeIdentity().catch(e => console.log(`Couldn't initialize identity:`, e));
  },
  watch: {
    view(n) {
      if(n !== 'showKey')
        this.phrase = '';
      this.pass = '';
      this.email = '';
      this.confirm = '';
      this.error = '';
      this.search = '';
      if(this.$store.state.meta.logoutReason) commit('setLogoutReason', '');
      this.$validator.reset();
    },
    loggedIn(n) {
      this.error = '';
      console.log('loggedIn:', n);
    },
    search(n, o) {
      if(n !== o)
        this.updateSearch(n);
    }
  },
  methods: {
    getType(field: FieldFlags, ignoreTouched?: boolean) {
      if(!field || (!field.dirty && (ignoreTouched || !field.touched))) return '';
      if(field.valid) return 'is-success';
      return 'is-danger';
    },
    incrementError(app: AppEntry) {
      if(!this.erroredIcons[app.name])
        this.erroredIcons[app.name] = 1;
      else
        this.erroredIcons[app.name]++;

      if(app.imageUrl.startsWith('http') && this.erroredIcons[app.name] === 1) {
        this.appIcons[app.name] = app.imageUrl.replace(
            'http://blockstack-browser-server.appartisan.com/static/images/',
            'https://browser.blockstack.org/images/');
      } else this.appIcons[app.name] = 'assets/images/icon-48.png';
    },
    copy(text: string) {
      ccopy(text);
    },
    updateSearch(n?: string) { },
    _updateSearch(n?: string) {
      if(!n) { this.appResults.splice(0, this.appResults.length); this.resultCount = 0; return; }
      n = n.toLocaleLowerCase();
      const res = this.$store.state.apps.apps
        .map((app: AppEntry) => [app, app.name.toLocaleLowerCase().indexOf(n)] as [AppEntry, number])
        .filter(([app, score]) => score >= 0)
        .sort((a, b) => (a[1] - b[1]) || a[0].name.localeCompare(b[0].name))
        .map(a => a[0]);
      this.resultCount = res.length;
      if(res.length > 5) res.length = 5;
      this.appResults.splice(0, this.appResults.length, ...res);
      for(const app of this.appResults)
        if(!this.appIcons[app.name])
          Vue.set(this.appIcons, app.name, app.imageUrl);
    },
    initializeWallet() {
      console.log('Initializing Wallet!');
      let masterKeychain: bip32 = null;
      if(this.phrase && validateMnemonic(this.phrase)) {
        const seedBuffer = mnemonicToSeed(this.phrase);
        masterKeychain = bip32.fromSeed(seedBuffer);
      } else if(!this.phrase) {
        this.phrase = generateMnemonic(128, randomBytes);
        const seedBuffer = mnemonicToSeed(this.phrase);
        masterKeychain = bip32.fromSeed(seedBuffer);
      } else {
        throw new Error('Tried to initialize a wallet with a bad phrase');
      }
      return encrypt(this.phrase, this.pass).then(encryptedBackupPhrase => {
        console.log('Creating account w/ enc phrase: "' + encryptedBackupPhrase + '"!');
        return dispatch('account/createAccount',
              { email: this.email, encryptedBackupPhrase, masterKeychain: masterKeychain.toBase58() });
      });
    },
    initializeIdentity() {
      console.log('Initializing identity...');
      return dispatch('connectSharedService')
        .then(() => dispatch('identity/downloadAll') as Promise<boolean[]>)
        .then(async results => {
          for(let i = 0, a = results[0]; i < results.length; a = results[++i]) {
            if(a) continue;
            const addrId = this.$store.state.account.identityAccount.addresses[i];
            console.log('Trying to download profile for ID-' + addrId + ' again...');
            const b = await dispatch('identity/download', { index: i }).then(() => true, () => false);
            if(b) continue;
            console.log('No profile (after two tries) for address ID-' + addrId + '.');
            this.dialogSpace = true;
            this.working = false;
            const res = await new Promise(resolve => this.$dialog.confirm({
              title: 'Login - No Profile',
              message: 'No profile found for ' + (i === 0 ? 'the main' : `a derived (${i})`) + ` identity ID-${addrId} - create a new one?`,
              cancelText: 'Cancel & Logout',
              confirmText: 'Go for it',
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false)
            }));
            this.working = true;
            this.dialogSpace = false;
            if(res) {
              await dispatch('identity/upload', { i });
              console.log('Uploaded profile for ID {' + i + '}!');
            } else { await dispatch('logout'); this.working = false; return; }
          }
        });
    },
    restore() {
      console.log('Restoring!');
      this.email = '';
      this.working = true;

      if(!validateMnemonic(this.phrase)) {
        console.error(this.error = 'Invalid keychain phrase entered!');
        this.working = false;
        return;
      }

      if(this.pass !== this.confirm) {
        console.warn(this.error = 'Confirm-password is not equal to the password!')
        this.working = false;
        return;
      }

      this.initializeWallet()
        .then(() => this.initializeIdentity())
        .then(() => {
          console.log('Successfully logged in!')
          this.view = '';
          this.working = false;
        }).catch(e => {
          console.error(this.error = 'Error finalizing restore: ' + e);
          console.error(e);
          this.view = 'restore';
          this.working = false;
      });
    },
    register() {
      console.log('Registering!');
      this.phrase = '';
      this.working = true;

      if(this.pass !== this.confirm) {
        console.warn(this.error = 'Confirm-password is not equal to the password!')
        this.working = false;
        return;
      }

      this.initializeWallet()
        .then(() => this.initializeIdentity())
        .then(() => {
          console.log('Registered! Phrase:', this.phrase);
          this.view = 'showKey'
          this.working = false;
        },
        e => {
          console.error(this.error = 'Error finalizing after register: ' + e);
          console.error(e);
          this.view = 'register';
          this.working = false;
      });
      this.view = 'showKey'
      this.working = false;
    },
    logout() {
      this.view = '';
      dispatch('logout');
    },
    close() {
      window.close();
    },
    async gotoApp(app: AppEntry) {
      const win = await browser.windows.getCurrent({ populate: true });
      for(const tab of win.tabs) {
        if(tab.id && tab.url && tab.url.length >= app.website.length && tab.url.slice(0, app.website.length) === app.website) {
          browser.tabs.update(tab.id, { active: true });
          this.close();
          return;
        }
      }
      browser.tabs.create({ url: app.website, active: true });
      this.close();
    },
    async gotoMain(hash?: string) {
      console.warn('gotoMain called', hash);
      const url = browser.extension.getURL('main.html');
      const win = await browser.windows.getCurrent({ populate: true });
      for(const tab of win.tabs) {
        if(tab.id >= 0 && tab.url && tab.url.length >= url.length && tab.url.slice(0, url.length) === url) {
          browser.tabs.update(tab.id, { url: (hash ? `${url}#/${hash}` : url), active: true });
          this.close();
          return;
        }
      }
      browser.tabs.create({ url: (hash ? `${url}#${hash}` : url), active: true });
      this.close();
    }
  }
});
