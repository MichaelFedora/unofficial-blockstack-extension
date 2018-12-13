import Vue from 'vue';
import { AppEntry } from 'common/data/app-entry';
import { mapGetters, mapState } from 'vuex';
import _ from 'lodash';
import { browser } from 'webextension-polyfill-ts';
import { dispatch } from 'common/vuex/remote-interface';
import { VVue } from 'common/vvue';

import ProfileComponent from './components/profile';
import SettingsComponent from './components/settings';
import { StateType } from 'common/vuex/stores/types/state';
import { RecommendedAppNames } from 'common/recommended-apps';

window.onbeforeunload = (ev) => {
  console.log('unloading!');
  return null;
};

export default (Vue as VVue).extend({
  components: { ProfileComponent, SettingsComponent },
  data() {
    return {
      loading: true,

      search: '',
      appResults: [] as AppEntry[],
      resultCount: 0,

      showProfile: false,
      showSettings: false,

      error: '',
      working: false,
      loginDone: true,

      dialogSpace: false,
    }
  },
  computed: {
    ...mapGetters({
      loggedIn: 'account/isLoggedIn',
      defaultId: 'identity/defaultId',
    }),
    ...mapState({
      pinnedApps: (state: StateType) => state.apps.pinned,
      recentApps: (state: StateType) => state.apps.recent
    }),
    recommendedApps(): AppEntry[] {
      const visible = [].concat(this.$store.state.apps.recent, this.$store.state.apps.pinned);
      return this.$store.state.apps.apps
            .filter(a => RecommendedAppNames.find(b => b === a.name))
            .filter(a => !visible.find(b => b.name === a.name));
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
    }
  },
  mounted() {
    console.log('Mounted popup!');
    this.loading = false;
    this.updateSearch = _.debounce(this._updateSearch, 150);
    // this.initializeIdentity().catch(e => console.log(`Couldn't initialize identity:`, e));
  },
  watch: {
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
    },
    logout() {
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
    },
    showDialog({ type, options }: { type: string, options: any }) {
      if(this.$dialog[type])
        this.$dialog[type](options);
    }
  }
});
