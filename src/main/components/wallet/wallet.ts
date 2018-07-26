import Vue from 'vue';
import { VVue } from 'common/vvue';
import { toCanvas } from 'qrcode-lite';
import Axios from 'axios';
import { dispatch } from 'common/vuex/remote-interface';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { FieldFlags } from 'vee-validate';

export default (Vue as VVue).component('bs-main-wallet', {
  data() {
    return {
      btcPrice: 1000,
      refreshing: false,
      action: this.$route.params.action,

      recipient: '',
      amount: 0,
      pass: '',
      sending: false
    };
  },
  computed: {
    ...mapState({
      address: (state: StateType) => state.account.bitcoinAccount.addresses[0],
      btc: (state: StateType) => state.account.bitcoinAccount.balances[state.account.bitcoinAccount.addresses[0]]
    }) as { address: () => string, btc: () => number },
    usd: function() { return ((this.btc || 0) * this.btcPrice).toFixed(2); }
  },
  watch: {
    $route(n, o) {
      if(this.$route.params.action !== 'receive' && this.$route.params.action !== 'send')
        this.$router.push({ params: { action: 'receive' }});
      else this.action = this.$route.params.action;
    },
    action(n, o) {
      if(n !== o) {
        this.recipient = '';
        this.amount = 0;
        this.pass = '';
      }
    }
  },
  mounted() {
    if(this.$route.params.action !== 'receive' && this.$route.params.action !== 'send')
      this.$router.push({ params: { action: 'receive' }});

    toCanvas(this.$refs.qrcode, this.address, { scale: 7, color: { dark: '#000000ff', light: '#ffffff00'}})
      .catch(e => console.error('Error generating QRCode:', e));

    this.refreshBalances();
  },
  methods: {
    switch(to: string) {
      if((to !== 'send' && to !== 'receive') || to === this.address) return;
        this.$router.push({ params: { action: to }});
    },
    getType(field: FieldFlags, ignoreTouched?: boolean) {
      if(!field || (!field.dirty && (ignoreTouched || !field.touched))) return '';
      if(field.valid) return 'is-success';
      return 'is-danger';
    },
    async refreshBalances() {
      if(this.refreshing) return;
      this.refreshing = true;
      try {
        const [_, data] = await Promise.all([
          dispatch('account/refreshBalances'),
          Axios.get(this.$store.state.settings.api.btcPriceUrl)
              .catch(() => fetch(this.$store.state.settings.api.btcPriceUrl).then(res => ({ data: res.json() })))
              .then(res => res.data.last)/*,
                () => Axios.get('https://api.coindesk.com/v1/bpi/currentprice/usd.json')
                      .then(res => res.data.bpi.USD.rate))*/
        ]);
        this.btcPrice = data || 1000;
      } catch(e) { console.error('Error refreshing balances:', e); }
      this.refreshing = false;
    },
    async send() {
      if(this.sending || !(this.recipient && this.amount && this.pass) || this.$validator.errors.any()) return;
      try {
        if(this.$store.state.identity.localIdentities.find(a => a.usernamePending)) {
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
          title: 'Error sending BTC',
          message: `<div class='content'><blockquote>${e}</blockquote></div>`,
          type: 'is-danger'
        });
        console.error('Error sending BTC:', e);
      }
      this.sending = false;
    }
  }
});
