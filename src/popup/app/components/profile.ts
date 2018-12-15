import Vue from 'vue';
import { VVue } from 'common/vvue';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { LocalIdentity } from 'common/vuex/stores/types/identity.state';
import { dispatch } from 'common/vuex/remote-interface';

export default (Vue as VVue).component('bs-popup-profile', {
  props: {
    toggle: { required: true, type: Boolean }
  },
  data() { return { } },
  computed: {
    defaultId: function() { return this.identities.find(a => a.index === this.defaultIndex); },
    profileName: function() { return this.getProfileName(this.defaultId); },
    idString: function() { return this.defaultId ? `ID-${this.defaultId.address}` : ''; },
    profileImg: function() { return this.getProfileImage(this.defaultId); },
    bio: function() { return this.getBio(this.defaultId); },
    otherIdentities: function() {
      return this.identities.filter((a, i) => i !== this.defaultIndex);
    },
    ...mapState({
      identities: (state: StateType) => state.identity.identities,
      defaultIndex: (state: StateType) => state.identity.default
    }) as { identities: () => LocalIdentity[], defaultIndex: () => number }
  },
  methods: {
    getBio(identity: LocalIdentity) {
      if(!identity || !identity.profile) return `{null}`;
      if(identity.profile && identity.profile.description) return identity.profile.description;
      return '';
    },
    getProfileName(identity: LocalIdentity) {
      if(!identity) return `{null}`;
      if(identity.username) return identity.username;
      if(identity.profile && identity.profile.name) return identity.profile.name;
      return '';
    },
    getProfileImage(identity: LocalIdentity) {
      return (identity &&
        identity.profile &&
        identity.profile.image &&
        identity.profile.image[0]) ?
        identity.profile.image[0].contentUrl : '';
    },
    exit() {
      this.$emit('update:toggle', false);
    },
    gotoMain(hash: string) {
      this.$emit('gotoMain', hash);
    },
    logout() {
      dispatch('logout');
      this.exit();
    }
  }
});
