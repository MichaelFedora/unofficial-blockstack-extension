import Vue from 'vue';
import _ from 'lodash';
import { Route } from 'vue-router';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { LocalIdentity } from 'common/vuex/stores/types/identity.state';
import { dispatch } from 'common/vuex/remote-interface';
import { VVue } from 'common/vvue';
import { decrypt } from 'common/util';

import ChangePasswordComponent from 'common/components/bs-change-password/bs-change-password';

export default (Vue as VVue).extend({
  data() {
    return {
      search: '',
      showMenu: false,

      appIcons: { } as { [key: string]: string },
      erroredIcons: { } as { [key: string]: number },
    }
  },
  computed: {
    defaultIdentity(): LocalIdentity {
      return this.$store.state.identity.identities.find(a => a.index === this.$store.state.identity.default);
    },
    profileName(): string {
      return this.getProfileName(this.defaultIdentity, true);
    },
    profileImg(): string {
      return (this.defaultIdentity &&
          this.defaultIdentity.profile &&
          this.defaultIdentity.profile.image &&
          this.defaultIdentity.profile.image[0]) ?
          this.defaultIdentity.profile.image[0].contentUrl : '';
    },
    ...mapState({
      defaultIdIndex: (state: StateType) => state.identity.default,
      identities: (state: StateType) => state.identity.identities
    }) as { defaultIdIndex: () => number, identities: () => LocalIdentity[] }
  },
  mounted() {
    this.updateSearch = _.debounce(this._updateSearch, 300);
  },
  watch: {
    $route(n: Route, o) {
      if(!o && n.query['q'] !== this.search)
        this.search = n.query['q'] as string; // :/
      else if(n.query['q'] !== o.query['q'] && (n.query['q'] || o.query['q']) && n.query['q'] !== this.search)
        this.search = n.query['q'] as string;
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
      if(!noFallback) return `ID-${id.address}`;
    },
    active(url: string, absolute: boolean) {
      return absolute ? this.$route.path === url :
          this.$route.path.substr(0, url.length) === url;
    },
    updateSearch(n?: string) { },
    _updateSearch(n?: string) {
      if(!n) {
        this.$router.push({ path: '/', query: { } });
        return;
      }
      this.$router.push({ path: '/search', query: { q: n }});
    },
    openProfile() {
      this.showMenu = false;
      this.$router.push({ path: '/profile' });
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
          decrypt(this.$store.state.account.encryptedBackupPhrase, value, this.$store.state.account.iv).then(phrase => {
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
