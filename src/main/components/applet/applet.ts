import Vue from 'vue';
import { VVue } from 'common/vvue';

export default (Vue as VVue).component('bs-main-applet', {
  props: {
    app: { type: Object, required: true },
    pinned: { type: Boolean, required: false, default: false }
  },
  data() {
    return { }
  },
  methods: {
    showInfo() {
      this.$dialog.alert({
        title: this.app.name,
        message: this.app.website + '\n\n' + this.app.description,
        confirmText: 'Okay'
      });
    },
    pin() {
      this.$emit('pin');
    }
  }
});
