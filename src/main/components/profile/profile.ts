import Vue from 'vue';
import { VVue } from 'common/vvue';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { LocalIdentity } from 'common/vuex/stores/types/identity.state';
import { commit, dispatch } from 'common/vuex/remote-interface';
import bsGenIdentity from 'common/components/bs-gen-identity/bs-gen-identity';
import { uploadProfileImage } from 'common/util';

export default (Vue as VVue).component('bs-main-profile', {
  props: { index: { required: false, default: -1 } },
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
      return this.$store.state.identity.identities.find(a => a.index === this.$store.state.identity.default);
    },
    selectedId: function() {
      return this.$store.state.identity.identities.find(a => a.index === this.current) || this.defaultId; // *shrug*
    },
    defaultSelected: function() {
      return this.selectedId.address === this.defaultId.address
    },
    ...mapState({
      defaultIdIndex: (state: StateType) => state.identity.default,
      identities: (state: StateType) => state.identity.identities
    })  as { defaultIdIndex: () => number, identities: () => LocalIdentity[] },
    current: function() {
      const index = Number(this.index);
      const id = this.$store.state.identity.identities.find(a => a.index === index);
      if(id) return index;
      else return this.$store.state.identity.default;
    },
    entries: function() {
      const ids = this.$store.state.identity.identities;
      const e = [];
      for(let i = 0; i < ids.length; i++) {
        e.push(ids[i]);
        if(ids.length - i > 1 && ids[i + 1].index - ids[i].index > 1)
          e.push({ amt: ids[i + 1].index - ids[i].index, nextLoc: ids[i].index + 1 });
      }
      return e;
    }
  },
  mounted() {
    if(this.index && !this.$store.state.identity.identities.find(a => a.index === Number(this.index)))
      this.$router.push('/profile');
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
      if(index < 0 || !this.identities.find(a => a.index === index) || this.working || this.index === this.current) return;
      this.editing = false;
      // this.current = index;
      if(this.index === this.$store.state.identity.default)
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
      if(!noFallback) return `ID-${id.address}`;
    },
    getProfileImage(id: LocalIdentity) {
      return (id &&
        id.profile &&
        id.profile.image &&
        id.profile.image[0]) ?
        id.profile.image[0].contentUrl : '';
    },
    addId() {
      this.$modal.open({
        parent: this,
        component: bsGenIdentity,
        hasModalCard: true,
        events: { done: ({ identity, index }) => this.finishAddIdentity(identity, index) }
      });
    },
    addIdBetween(nextLoc: number) {
      this.$modal.open({
        parent: this,
        component: bsGenIdentity,
        props: { startOffset: nextLoc, startAdvance: true },
        hasModalCard: true,
        events: { done: ({ identity, index }) => this.finishAddIdentity(identity, index) }
      });
    },
    async finishAddIdentity(identity, index: number) {
      const a = await dispatch('identity/download', { index }).then(() => true, () => false);
      if(a) return this.$toast.open('Identity added!');
      console.log(`Trying to download profile for ID-${identity.address} again...`);
      const b = await dispatch('identity/download', { index }).then(() => true, () => false);
      if(b) return this.$toast.open('Identity added!');
      console.warn(`No profile for the new identity ID-${identity.address}: asking what to do!`);
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
        return dispatch('identity/remove', { index });
    },
    removeId() {
      if(this.working) return;
      this.working = true
      dispatch('identity/remove', { index: this.current })
        .catch(e => this.showError('Error removing Identity', e))
        .then(() => this.working = false);
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
        reader.onload = function(e: any) {
          console.log('got content:', { result: e.target.result });
          e.target && e.target.result ? resolve(e.target.result) : reject('No result.');
        };
        reader.onabort = function() { reject('Aborted.'); }
        reader.onerror = function(e: any) { reject(e.error || 'Errored.'); }
      }).then(res => uploadProfileImage(this.$store.state, this.current, res as any))
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
