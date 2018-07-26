import Vue from 'vue';
import { VVue } from 'common/vvue';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { LocalIdentity } from 'common/vuex/stores/types/identity.state';
import { commit, dispatch } from 'common/vuex/remote-interface';


export default (Vue as VVue).component('bs-popup-sidebar', {
  props: {
    toggle: { required: true, type: Boolean }
  },
  data() {
    return {
      removing: {} as {[key: string]: boolean}
    }
  },
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
    ...mapState({
      localIdentities: (state: StateType) => state.identity.localIdentities,
      defaultIndex: (state: StateType) => state.identity.default
    })
  },
  methods: {
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
    remove(index: number) {
      this.removing[index] = true
      dispatch('account/removeIdentity', { index }).catch(e => {
        console.error('Error decrypting phrase: ' + e);
        this.$dialog.alert({
          title: 'Error removing identity',
          message: `<div class='content'><blockquote>${e}</blockquote></div>`,
          type: 'is-danger'
        });
      }).then(() => delete this.removing[index]);
    },
    deriveNewIdentity() {
      this.$dialog.prompt({
        message: 'Enter your password to create another Identity',
        confirmText: 'Authenticate',
        inputAttrs: {
          placeholder: 'password',
          type: 'password'
        },
        onConfirm: (value) => {
          dispatch('account/createIdentity', { password: value }).then(() => {
            const index = this.$store.state.identity.localIdentities.length - 1;
            const identity = this.$store.state.identity.localIdentities[index];
            return dispatch('identity/download', { index })
                  .catch(() => {
                    console.warn(`No profile for the new identity ID-${identity.ownerAddress}: uploading!`);
                    return dispatch('identity/upload', { index });
                  }).then(() => this.$toast.open('Identity added!'));
          }).catch(e => {
            console.error('Error creating identity:', e);
            this.$dialog.confirm({ message: 'Error creating identity: ' + e });
          });
        }
      });
    },
    switchProfile(index: number) {
      commit('identity/setDefault', { index });
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
