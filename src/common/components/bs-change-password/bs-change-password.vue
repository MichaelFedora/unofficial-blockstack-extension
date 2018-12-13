<template>
<div class='modal-card' style='width: auto'>
  <header class='modal-card-head'>
    <p class='modal-card-title'>Reset Password</p>
  </header>

  <section class='modal-card-body'>
    <form>
      <b-field
        label='Old Password'
        :type='getType(fields["old password"])'
        :message='errors.first("old password")'>
        <b-input v-validate='{ required: true }' name='old password' placeholder='password' type='password' v-model='oldpass'></b-input>
      </b-field>
      <b-field
        label='New Password to use'
        :type='getType(fields.password)'
        :message='errors.first("password")'>
        <b-input v-validate='{ required: true, confirmed: confirm }' name='password' placeholder='password' type='password' v-model='pass'></b-input>
      </b-field>
      <b-field
        label='Confirm Password'
        :type='getType(fields.confirm)'
        :message='errors.first("confirm")'>
        <b-input v-validate='{ required: true }' name='confirm' placeholder='password' type='password' v-model='confirm'></b-input>
      </b-field>
    </form>
  </section>
  <footer class='modal-card-foot'>
    <button class='button' @click='$parent.close()'>Cancel</button>
    <button class='button is-primary' :class='{ "is-loading": working }'
            :disabled='errors.any() || !(oldpass && pass && confirm) || working'
            @click='auth()'>Authenticate</button>
  </footer>
</div>
</template>
<script src='./bs-change-password.ts'></script>
<style lang='scss'>

</style>
