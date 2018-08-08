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
    profileName: function() {
      const identity = this.$store.state.identity.localIdentities[this.$store.state.identity.default];
      return this.getProfileName(identity);
    },
    idString: function() {
      const identity = this.$store.state.identity.localIdentities[this.$store.state.identity.default];
      return identity ? `ID-${identity.ownerAddress}` : '';
    },
    profileImg: function() {
      const defaultIdentity = this.$store.state.identity.localIdentities[this.$store.state.identity.default];
      return this.getProfileImage(defaultIdentity);
    },
    bio: function() {
      const defaultIdentity = this.$store.state.identity.localIdentities[this.$store.state.identity.default];
      return this.getBio(defaultIdentity);
    },
    ...mapState({
      localIdentities: (state: StateType) => state.identity.localIdentities,
      defaultIndex: (state: StateType) => state.identity.default
    })
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
