import Vue from 'vue';
import { AppEntry } from 'common/app-list';
import _ from 'lodash';
import { Route } from 'vue-router';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { LocalIdentity } from 'common/vuex/stores/types/identity.state';
import { dispatch } from 'common/vuex/remote-interface';
import { VVue } from 'common/vvue';
import { decrypt } from 'common/util';

import ChangePasswordComponent from './components/change-password';
import ManageIdentitiesComponent from './components/manage-identities';
import ProfileComponent from '../components/profile/profile';

export default (Vue as VVue).extend({
  data() {
    return {
      search: this.$route.query['q'] || '',
      showMenu: false,

      appResults: [],
      resultCount: 0,

      appIcons: { } as { [key: string]: string },
      erroredIcons: { } as { [key: string]: number },
    }
  },
  computed: {
    defaultIdentity: function() {
      return this.$store.state.identity.localIdentities[this.$store.state.identity.default];
    },
    profileName: function() {
      return this.getProfileName(this.defaultIdentity, true);
    },
    profileImg: function() {
      return (this.defaultIdentity &&
          this.defaultIdentity.profile &&
          this.defaultIdentity.profile.image &&
          this.defaultIdentity.profile.image[0]) ?
          this.defaultIdentity.profile.image[0].contentUrl : '';
    },
    ...mapState({
      defaultIdIndex: (state: StateType) => state.identity.default,
      identities: (state: StateType) => state.identity.localIdentities
    })
  },
  mounted() {
    this.updateSearch = _.debounce(this._updateSearch, 300);
  },
  watch: {
    $route(n: Route, o) {
      if(!o && n.query['q'] !== this.search)
        this.search = n.query['q']
      else if(n.query['q'] !== o.query['q'] && (n.query['q'] || o.query['q']) && n.query['q'] !== this.search)
        this.search = n.query['q']
      else if(n.path !== '/search' && this.search)
        this.search = '';

      if(n.path !== o.path)
        this.showMenu = false;
    },
    search(n, o) {
      if(n !== o && (n || o))
        this.updateSearch(n);
    }
  },
  methods: {
    getProfileName(id: LocalIdentity, noFallback?: boolean) {
      if(!id) return `{null}`;
      if(id.username) return id.username;
      if(id.profile && id.profile.name) return id.profile.name;
      if(!noFallback) return `ID-${id.ownerAddress}`;
    },
    active(url: string, absolute: boolean) {
      return absolute ? this.$route.path === url :
          this.$route.path.substr(0, url.length) === url;
    },
    incrementError(app: AppEntry) {
      if(!this.erroredIcons[app.name])
        this.erroredIcons[app.name] = 1;
      else
        this.erroredIcons[app.name]++;

      if(app.appIcon.small.startsWith('http') && this.erroredIcons[app.name] === 1) {
        this.appIcons[app.name] = app.appIcon.small.replace(
            'http://blockstack-browser-server.appartisan.com/static/images/',
            'https://browser.blockstack.org/images/');
      } else this.appIcons[app.name] = 'assets/images/blockstack-rounded-48x48.png';
    },
    updateSearch(n?: string) { },
    _updateSearch(n?: string) {
      if(!n) {
        this.appResults.splice(0, this.appResults.length);
        this.resultCount = 0;
        this.$router.push({ path: '/', query: { } });
        return;
      }
      this.$router.push({ path: '/search', query: { q: n }});
      n = n.toLocaleLowerCase();
      const res = this.$store.state.apps.apps
        .map((app: AppEntry) => [app, app.displayName.toLocaleLowerCase().indexOf(n)] as [AppEntry, number])
        .filter(([app, score]) => score >= 0)
        .sort((a, b) => (a[1] - b[1]) || a[0].displayName.localeCompare(b[0].displayName))
        .map(a => a[0]);
      this.resultCount = res.length;
      if(res.length > 5) res.length = 5;
      this.appResults.splice(0, this.appResults.length, ...res);
      for(const app of this.appResults)
        if(!this.appIcons[app.name])
          Vue.set(this.appIcons, app.name, app.appIcon.small);
    },
    openProfile() {
      this.showMenu = false;
      this.$modal.open({
        parent: this,
        component: ProfileComponent,
        hasModalCard: true
      });
    },
    switchIdentity() {
      this.showMenu = false;
      this.$modal.open({
        parent: this,
        component: ManageIdentitiesComponent,
        hasModalCard: true
      });
    },
    changePassword() {
      this.showMenu = false;
      this.$modal.open({
        parent: this,
        component: ChangePasswordComponent,
        hasModalCard: true
      });
    },
    viewPhrase() {
      this.showMenu = false;
      this.$dialog.prompt({
        message: 'Enter your password to view your Backup Phrase',
        confirmText: 'Authenticate',
        inputAttrs: {
          placeholder: 'password',
          type: 'password'
        },
        onConfirm: (value) => {
          decrypt(this.$store.state.account.encryptedBackupPhrase, value).then(phrase => {
            this.$dialog.alert({
              title: 'Backup Phrase',
              message: `<div class='content'>
              Anyone with this key can get into your account. Keep it safe.
              <blockquote style='font-family:monospace'>${phrase}</blockquote>
              </div>`,
              confirmText: 'Got it!'
            })
          }, e => {
            console.error('Error decrypting phrase: ' + e);
            this.$dialog.alert({
              title: 'Error decrypting phrase',
              message: `<div class='content'><blockquote>${e}</blockquote>It was probably just a wrong password.</div>`,
              type: 'is-danger',
              onConfirm: () => this.viewPhrase()
            });
          });
        }
      });
    },
    logout() {
      this.showMenu = false;
      dispatch('logout');
    }
  }
});
