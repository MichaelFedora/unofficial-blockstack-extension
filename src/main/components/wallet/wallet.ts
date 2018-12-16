import Vue from 'vue';
import { VVue } from 'common/vvue';
import { toCanvas } from 'qrcode-lite';
import Axios from 'axios';
import { dispatch } from 'common/vuex/remote-interface';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { DateTime } from 'luxon';

import WithdrawComponent from './components/withdraw';

export default (Vue as VVue).component('bs-main-wallet', {
  data() {
    return {
      btcPrice: 1000,
      refreshing: false,
      selected: 'btc',
      // txs: [],

      btcPriceUrl: 'https://www.bitstamp.net/api/v2/ticker/btcusd/?cors=1',
      networkFeeUrl: 'https://bitcoinfees.21.co/api/v1/fees/recommended',
    };
  },
  computed: {
    ...mapState({
      address: (state: StateType) => state.account.bitcoinAccount.addresses[0],
      btc: (state: StateType) => state.account.bitcoinAccount.balances[state.account.bitcoinAccount.addresses[0]]
    }) as { address: () => string, btc: () => number },
    usd: function() { return ((this.btc || 0) * this.btcPrice).toFixed(2); }
  },
  mounted() {
    toCanvas(this.$refs.qrcode, this.address, { scale: 7, color: { dark: '#000000ff', light: '#ffffff00'}})
      .catch(e => console.error('Error generating QRCode:', e));

    this.refreshBalances();
  },
  methods: {
    async refreshBalances() {
      if(this.refreshing) return;
      this.refreshing = true;
      try {
        const [_, /*txs,*/ btcPrice] = await Promise.all([
          dispatch('account/refreshBalances'),
          // v-- also nice, gets balance, stuff like that
          /*Axios.get('https://blockstack-explorer-api.herokuapp.com/api/addresses/' + '1J3PUxY5uDShUnHRrMyU6yKtoHEUPhKULs' + '?page=0')
              .then(res => res.data.fullTransactions),*/
          Axios.get(this.btcPriceUrl)
              .catch(() => fetch(this.btcPriceUrl).then(res => ({ data: res.json() })))
              .then(res => res.data.last)/*,
                () => Axios.get('https://api.coindesk.com/v1/bpi/currentprice/usd.json')
                      .then(res => res.data.bpi.USD.rate))*/
        ]);
        this.btcPrice = btcPrice || 1000;
        // this.txs.splice(0, this.txs.length, ...(txs || []));
      } catch(e) { console.error('Error refreshing balances:', e); }
      this.refreshing = false;
    },
    /*formatBlocktime(millis: number) {
      return DateTime.fromMillis(millis * 1000, { zone: 'utc' }).toLocaleString(DateTime.DATETIME_MED);
    },
    profit(tx: { inputs: any[], outputs: any[] }) {
      if(!tx) return;
      let val = 0;
      if(tx.inputs && tx.inputs.length) {
        val = tx.inputs.reduce((acc, v) => acc + v.addr === this.address ? v.value : 0, val);
      }

      if(tx.vout && tx.vout.length) {
        val = tx.vout.reduce((acc, v) => {
          if(v.scriptSig && v.scriptSig.addresses && v.scriptSig.addresses.find(a => a === this.address))
            return acc - v.value;
          return acc;
        }, val);
      }

      return val;
    },*/

    openSendDialog() {
      this.$modal.open({
        parent: this,
        component: WithdrawComponent,
        hasModalCard: true,
        props: { type: this.selected }
      });
    },
    selectAccount() {
      console.log('TODO: selectAccount(account)');
    },
  }
});
