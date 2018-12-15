import Vue from 'vue';
import { FieldFlags } from 'vee-validate';
import { VVue } from 'common/vvue';
import { dispatch } from 'common/vuex/remote-interface';

export default (Vue as VVue).component('bs-main-wallet-withdraw', {
  props: { type: { type: String, required: true } },
  data() {
    return {
      recipient: '',
      amount: 0,
      pass: '',
      walletIndex: 0,
      sending: false,
    }
  },
  mounted() {
    this.$validator.reset();
  },
  methods: {
    getType(field: FieldFlags, ignoreTouched?: boolean) {
      if(!field || (!field.dirty && (ignoreTouched || !field.touched))) return '';
      if(field.valid) return 'is-success';
      return 'is-danger';
    },
    async send() {
      if(this.sending || !(this.recipient && this.amount && this.pass) || this.$validator.errors.any()) return;
      try {
        if(this.$store.state.identity.identities.find(a => a.usernamePending)) {
          const choice = await new Promise(resolve => {
            this.$dialog.confirm({
              message: 'Withdrawing BTC may interfere with the pending name registration you currently have.',
              type: 'is-danger',
              confirmText: 'Do it anyway',
              hasIcon: true,
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false)
            })
          });
          if(!choice) { this.sending = false; return }
        }
        await dispatch('account/withdraw', { to: this.recipient, amount: this.amount, password: this.pass });
      } catch(e) {
        this.$dialog.alert({
          title: 'Error Sending BTC',
          message: `<div class='content'><blockquote>${e}</blockquote></div>`,
          type: 'is-danger'
        });
        console.error('Error sending BTC:', e);
      }
      this.sending = false;
    },
  }
});
