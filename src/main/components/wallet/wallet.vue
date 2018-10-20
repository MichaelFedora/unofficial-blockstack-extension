<template>
<div id='bs-main-wallet'>

  <div class='tabs is-large is-fullwidth' style='width: 100%'>
    <ul>
      <li :class='{ "is-active": selected == "btc" }'>
        <a  @click='select("btc")'>
          <b-icon icon='currency-btc'></b-icon>
          <span>Bitcoin</span>
        </a>
      </li>
      <li class='disabled' :class='{ "is-active": selected == "stacks" }'>
        <a @click='select("stacks")'>
          <b-icon icon='coins'></b-icon>
          <span>Stacks</span>
        </a>
      </li>
    </ul>
  </div>

  <div id='content'>
    <button class='button is-info fab is-tr' title='Withdraw' @click='openSendDialog()'><b-icon icon='send'></b-icon></button>

    <div id='top'>

      <canvas ref='qrcode'></canvas>

      <div id='info'>
        <h4 class='title is-5'>Balance</h4>
        <div style='flex-grow:1'>
          <span>{{btc == null ? '?' : btc}} BTC</span><br>
          <span>${{usd == null ? '?.??' : usd}} USD</span>
        </div>
        <h4 class='title is-5'>Address</h4>
        <span>{{address}}</span>
      </div>
    </div>

    <h4 class='title is-5' style='width: 100%'>Transaction History</h4>

    <div id='history'>
      <div class='notification tx' v-for='tx in txs' :key='tx.txid' :class='{ "is-success": profit(tx) > 0, "is-danger": profit(tx) < 0 }'>
        <div>
          <span>tx id:</span>
          <a :href='"https://explorer.blockstack.org/tx/" + tx.txid'>{{tx.txid}}</a>
          <span>date: {{formatBlocktime(tx.blocktime)}}</span>
        </div>

        <div class='tx-inner'>
          <div>
            <div v-for='vi in tx.vin' :key='vi.scriptSig.hex'>
              <a v-if='vi.addr !== address' :href='"https://explorer.blockstack.org/address/" + vi.addr'>{{vi.addr}}</a>
              <span v-else style='font-weight:bold'>{{address}}</span>
              <span>{{vi.value}}</span>
            </div>
          </div>

          <b-icon icon='chevron-right' size='is-large'></b-icon>

          <div>
            <div v-for='vo in tx.vout' :key='vo.scriptPubKey.hex'>
              <a v-if='vo.scriptPubKey.addresses && vo.scriptPubKey.addresses.length > 0' :href='"https://explorer.blockstack.org/address/" + vo.scriptPubKey.addresses[0]'>{{vo.scriptPubKey.addresses[0]}}</a>
              <span v-else style='font-style:italic'>unknown address</span>
              <span>{{vo.value}}</span>
            </div>
          </div>
        </div>

        <div>
          <span>tx fee: {{tx.fees}}</span>
          <a :href='"https://explorer.blockstack.org/block/" + tx.blockhash'>block: {{tx.blockheight}}</a>
          <span>confirmations: {{tx.confirmations}}</span>
        </div>
      </div>
      <div v-if='txs.length === 0' class='notification'>
        <span>Nothing here...</span>
      </div>
    </div>

  </div>
</div>
</template>
<script src='./wallet.ts'></script>
<style lang='scss'>
#bs-main-wallet {

  display: flex;
  flex-flow: column;
  align-items: center;

  button.fab {

    height: 2.75rem;
    width: 2.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.33);

    &.is-tr {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    &.is-br {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
    }
  }

  > #content {
    max-width: 960px;
    width: 100%;

    position: relative;
    display: flex;
    flex-flow: column;
    align-items: center;

    padding: 1rem;
    flex-grow: 1;

    > #top {
      display: flex;
      width: 100%;
      margin-left: -55px;

      > #info {
        display: flex;
        flex-flow: column;
        margin: 26px 0;

        > *:not(:last-child) {
          margin-bottom: 0.5em;
        }
      }
    }

    > #history {
      width: 100%;
      font: monospace;

      .notification {
        padding: 1.25rem 1.5rem;

        &.tx {

          a {
            text-decoration: none;
            &:hover {
              text-decoration: underline;
            }
          }

          > :not(:last-child) {
            margin-bottom: 1rem;
          }

          > div.tx-inner {
            display: flex;
            justify-content: space-around;
            align-items: flex-start;
            font-size: 0.85rem;

            > *:not(:last-child) {
              margin-right: 1rem;
            }
            > div {

              width: 100%;
              display: flex;
              flex-flow: column;

              > div {
                &:not(:last-child) {
                  margin-bottom: 1rem;
                }

                display: flex;
                justify-content: space-between;
                padding: 0.5rem 1rem;
                width: 100%;

                background-color: rgba(white, 0.9);
                border-radius: 3px;
                color: rgba(black, 0.68);
                box-shadow: 0 1px 3px rgba(black, 0.24);

                > *:first-child {
                  margin-right: 1rem;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
