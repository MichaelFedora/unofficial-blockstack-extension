<template>
<div id='bs-main-wallet'>
  <div id='inner'>
    <div id='controls' class='buttons has-addons'>
      <router-link class='button' :class='{ "is-primary": action === "receive" }'
          to='/wallet/receive' @click='switchTo("receive")'>Recieve</router-link>
      <router-link class='button' :class='{ "is-primary": action === "send" }'
          to='/wallet/send' @click='switchTo("send")'>Send</router-link>
    </div>

    <div id='balance'>
      <h4 class='title is-5'>Balance</h4>
      <span>{{btc == null ? '?' : btc}} BTC</span>
      <span>${{usd == null ? '?.??' : usd}} USD</span>
    </div>

    <div class='action-content' v-show='action === "receive"'>
      <canvas ref='qrcode'></canvas>
      <span>{{address}}</span>
    </div>
    <div class='action-content' v-show='action === "send"'>
      <form style='padding: 1rem 0'>
        <b-field
          label='Recipient Wallet Address'
          :type='getType(fields.recipient)'
          :message='errors.first("recipient")'>
          <b-input v-validate='"required"' name='recipient' placeholder='recipient wallet address' type='text' v-model='recipient'></b-input>
        </b-field>
        <b-field
          label='BTC Amount'
          :type='getType(fields.amount)'
          :message='errors.first("amount")'>
          <b-input v-validate='"required|min_value:0|decimal:8"' name='amount' placeholder='btc amount' type='text' v-model='amount'></b-input>
        </b-field>
        <b-field
          label='Password'
          :type='getType(fields.password)'
          :message='errors.first("password")'>
          <b-input v-validate='"required"' name='password' placeholder='password' type='password' v-model='pass'></b-input>
        </b-field>
      </form>
      <button class='button is-primary' style='align-self: flex-end' :disabled='!(recipient && amount && pass) || errors.any()'>Send</button>
    </div>
  </div>
</div>
</template>
<script src='./wallet.ts'></script>
<style lang='scss'>
#bs-main-wallet {
  display: flex;
  justify-content: center;

  > #inner {
    display: flex;
    flex-flow: column;
    align-items: center;

    > #balance {
      display: flex;
      flex-flow: column;
      align-items: center;
      > h4 {
        margin-bottom: 0.5em;
      }
    }

    > div.action-content {
      display: flex;
      flex-flow: column;
      align-items: center;
    }
  }
}
</style>
