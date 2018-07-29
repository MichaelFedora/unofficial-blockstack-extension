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
          dispatch('account/createIdentity', { password: value }).then(async () => {
            const index = this.$store.state.identity.localIdentities.length - 1;
            const identity = this.$store.state.identity.localIdentities[index];
            const a = await dispatch('identity/download', { index }).then(() => true, () => false);
            if(a) return this.$toast.open('Identity added!');
            console.log('Trying to download profile for ID-' + this.$store.state.account.identityAccount.addresses[index] + ' again...');
            const b = await dispatch('identity/download', { index }).then(() => true, () => false);
            if(b) return this.$toast.open('Identity added!');
            console.warn(`No profile for the new identity ID-${identity.ownerAddress}: asking what to do!`);
            const res = await new Promise(resolve => this.$dialog.confirm({
              title: 'New Identity - Profile not Found',
              message: 'No profile found for this identity - create a new one?',
              cancelText: 'Cancel',
              confirmText: 'Go for it',
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false)
            }));
            if(res) {
              await dispatch('identity/upload', { index });
              return this.$toast.open('Identity added!');
            }
          }).catch(e => {
            console.error('Error creating identity:', e);
            this.$dialog.confirm({ message: 'Error creating identity: ' + e });
          });
        }
      });
    },
  }
});
