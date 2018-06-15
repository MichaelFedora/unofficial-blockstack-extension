import Vue from 'vue';
import { VVue } from 'common/vvue';

export default (Vue as VVue).component('bs-main-profile', {
  props: {
    avatar: { required: true, type: String, default: '' },
    id: { required: true, type: String, default: '' },
    name: { required: true, type: String, default: '' },
    bio: { required: true, type: String, default: '' },
    usernames: { required: true, type: Array, default() { return []; } },
    accounts: { required: true, type: Array, default() { return []; } }
  } as { avatar: any, id: any, name: any, bio: any, usernames: any, accounts: any },
  data() {
    return {
      editing: false
    }
  },
  computed: {
    isSelf: function() { return this.$store.state.identity.localIdentities[0].ownerAddress === this.id; }
  },
  mounted() {

  },
  methods: {

  }
});
