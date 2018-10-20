import Vue from 'vue';
import { VVue } from 'common/vvue';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { LocalIdentity } from 'common/vuex/stores/types/identity.state';
import { commit, dispatch } from 'common/vuex/remote-interface';

export default (Vue as VVue).component('bs-main-profile', {
  props: { index: { required: false, type: Number, default: -1 } },
  data() {
    return {
      editing: false,
      working: false,

      name: '',
      bio: '',
      newImage: '',
    }
  },
  computed: {
    defaultId: function() {
      return this.$store.state.identity.localIdentities[this.$store.state.identity.default];
    },
    selectedId: function() {
      return this.$store.state.identity.localIdentities[this.index] || this.defaultId; // *shrug*
    },
    defaultSelected: function() {
      return this.selectedId.ownerAddress === this.defaultId.ownerAddress
    },
    ...mapState({
      defaultIdIndex: (state: StateType) => state.identity.default,
      identities: (state: StateType) => state.identity.localIdentities
    })  as { defaultIdIndex: () => number, identities: () => LocalIdentity[] },
    current: function() {
      if(this.index >= 0 && this.index < this.$store.state.identity.localIdentities.length)
        return this.index;
      else return this.$store.state.identity.default;
    }
  },
  methods: {
    showError(subject: string, e: any) {
      console.error(subject + ':', e);
      this.$dialog.alert({
        title: subject,
        message: `<div class='content'><blockquote>${e}</blockquote></div>`,
        type: 'is-danger'
      });
    },
    select(index: number) {
      if(index < 0 || index >= this.identities.length || this.working || index === this.current) return;
      this.editing = false;
      // this.current = index;
      if(index === this.$store.state.identity.default)
        this.$router.push('/profile');
      else
        this.$router.push(`/profile/${index}`);
    },
    cancel() {
      if(this.working) return;
      this.editing = false;
      if(this.newImage) location.reload();
    },
    edit() {
      if(this.working) return;
      if(this.selectedId.profile) {
        this.name = this.selectedId.profile.name || '';
        this.bio = this.selectedId.profile.description || '';
      } else {
        this.name = '';
        this.bio = '';
      }
      this.editing = true;
    },
    save() {
      if(!this.editing || this.working) return;
      commit('identity/update', { index: this.current, payload: { profile: { name: this.name, description: this.bio } } })
          .then(() => dispatch('identity/upload', { index: this.current }))
          .then(
            () => {
              this.editing = false;
              if(this.newImage) location.reload();
            },
            e => this.showError('Error updating profile', e))
          .then(() => this.working = false);
    },
    getProfileShortName(id: LocalIdentity, noFallback?: boolean) {
      if(!id) return `{null}`;
      if(id.username) return id.username;
      if(id.profile && id.profile.name) return id.profile.name;
      if(!noFallback) return `ID-${id.ownerAddress}`;
    },
    getProfileImage(id: LocalIdentity) {
      return (id &&
        id.profile &&
        id.profile.image &&
        id.profile.image[0]) ?
        id.profile.image[0].contentUrl : '';
    },
    addId() {
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
            } else
              return dispatch('account/removeIdentity', { index });
          }).catch(e => this.showError('Error creating identity', e));
        }
      });
    },
    removeId() {
      if(this.working) return;
      this.working = true
      dispatch('account/removeIdentity', { index: this.current })
        .catch(e => this.showError('Error removing Identity', e))
        .then(() => delete this.working);
    },
    makeDefault() {
      if(this.current === this.$store.state.identity.default) return;
      commit('identity/setDefault', { index: this.current });
      dispatch('identity/download', { index: this.current });
    },
    onProfileImageChange($event) {
      if(!$event || !$event.target || !$event.target.files || !$event.target.files.length) return;
      const newImage = $event.target.files[0] as File;
      const reader = new FileReader();
      new Promise((resolve, reject) => {
        reader.onload = function(e: any) { e.target && e.target.result ? resolve(e.target.result) : reject('No result.'); };
        reader.onabort = function() { reject('Aborted.'); }
        reader.onerror = function(e: any) { reject(e.error || 'Errored.'); }
      }).then(res => dispatch('identity/uploadProfileImage', { index: this.current, file: res}))
        .then(
          () => {
            const r = new FileReader();
            const dis = this;
            r.onload = function(e: any) { dis.newImage = e.target.result; }
            r.readAsDataURL(newImage);
          },
          e => this.showError('Error uploading profile image', e))
        .then(() => this.working = false)
        this.working = true;
      reader.readAsArrayBuffer(newImage);
    }
  }
});
