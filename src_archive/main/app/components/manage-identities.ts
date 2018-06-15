import Vue from 'vue';
import { VVue } from 'common/vvue';
import { LocalIdentity } from 'common/vuex/stores/types/identity.state';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { dispatch, commit } from 'common/vuex/remote-interface';

export default (Vue as VVue).component('bs-main-change-password', {
  data() {
    return {
      chosenIdIndex: this.$store.state.identity.default,
      removing: {} as {[key: number]: boolean}
    }
  },
  computed: {
    ...mapState({
      localIdentities: (state: StateType) => state.identity.localIdentities,
      defaultIdIndex: (state: StateType) => state.identity.default
    })
  },
  watch: {
    chosenIdIndex(n) {
      if(n !== this.$store.state.identity.default)
        this.setDefaultId(n);
    }
  },
  mounted() {

  },
  methods: {
    getProfileName(identity: LocalIdentity) {
      if(!identity) return `{null}`;
      if(identity.username) return identity.username;
      if(identity.profile && identity.profile.name) return identity.profile.name;
      return '';
    },
    setDefaultId(index: number) {
      if(index === this.$store.state.identity.default) return;
      commit('identity/setDefault', { index });
      dispatch('identity/download', { index });
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
      this.showMenu = false;
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
  }
});
