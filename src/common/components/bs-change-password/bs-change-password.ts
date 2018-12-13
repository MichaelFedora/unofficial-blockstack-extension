import Vue from 'vue';
import { FieldFlags } from 'vee-validate';
import { VVue } from 'common/vvue';
import { dispatch } from 'common/vuex/remote-interface';

export default (Vue as VVue).component('bs-change-password', {
  data() {
    return {
      oldpass: '',
      pass: '',
      confirm: '',
      error: '',
      working: false,
    }
  },
  mounted() {

  },
  methods: {
    getType(field: FieldFlags, ignoreTouched?: boolean) {
      if(!field || (!field.dirty && (ignoreTouched || !field.touched))) return '';
      if(field.valid) return 'is-success';
      return 'is-danger';
    },
    auth() {
      this.working = true;
      dispatch('account/changePassword', { oldpass: this.oldpass, newpass: this.pass }).then(() => {
        if(this.$parent['close']) this.$parent['close']();
        this.$toast.open('Password changed successfully!');
      }, e => {
        console.error('Error changing password:', e);
        this.$dialog.alert({
          title: 'Error changing password',
          message: `<div class='content'><blockquote>${e}</blockquote>It was probably just a wrong password.</div>`,
          type: 'is-danger'
        });
      }).then(() => this.working = false);
    }
  }
});
