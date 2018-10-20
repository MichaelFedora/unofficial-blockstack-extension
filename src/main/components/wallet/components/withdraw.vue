<template>
<div class='modal-card' style='width: auto;min-width: 384px;'>
  <header class='modal-card-head'>
    <p class='modal-card-title'>Withdraw</p>
  </header>

  <section class='modal-card-body'>
    <form style='padding: 1rem 0'>
      <b-field label='Wallet'>
        <b-select v-model='walletIndex' disabled expanded>
          <option value='0'>Default Wallet</option>
          <!-- option disabled value='0' v-if='userIds.length == 0'>No ID's available...</option>
          <option v-for='(id, index) in walletIds' :key='id.ownerAddress' :value='index'>
            {{id.username || (id.name ? `${id.name}: ID-${id.ownerAddress}` : `ID-${id.ownerAddress}`)}}
          </option -->
        </b-select>
      </b-field>
      <b-field
        label='Recipient Wallet Address (Base58)'
        :type='getType(fields.recipient)'
        :message='(fields.recipient && fields.recipient.invalid) ? "Must be a valid Base58 BTC Address" : ""'>
        <b-input v-validate='{ required: true, regex: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/ }' name='recipient' placeholder='1111111111111111111114oLvT2' type='text' v-model='recipient'></b-input>
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
  </section>
  <footer class='modal-card-foot'>
    <button class='button' @click='$parent.close()'>Cancel</button>
    <button class='button is-primary' :class='{ "is-loading": sending }'
            :disabled='errors.any() || !(recipient && amount && pass) || sending'
            @click='send()'>Send</button>
  </footer>
</div>
</template>
<script src='./withdraw.ts'></script>
<style lang='scss'>

</style>
