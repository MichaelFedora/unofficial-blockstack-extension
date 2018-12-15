<template>
<div class='modal-card' style='width: auto'>
  <header class='modal-card-head'>
    <p class='modal-card-title'>Add Identity</p>
  </header>

  <section class='modal-card-body'>
    <form>
      <b-field
        label='Password'
        :type='getType(fields["password"])'
        :message='errors.first("password")'>
        <b-input v-validate='{ required: true }' name='password' placeholder='password' type='password' v-model='pass'></b-input>
      </b-field>
      <b-field v-if='advance'
        label='Identity Offset'
        :type='getType(fields.offset)'
        :message='errors.first("offset") && errors.first("offset") + " Must be an whole number index that does not exist."'>
        <b-input v-validate='{ numeric: true, decimal: 0, min: 0, excluded: excluded }' name='offset' placeholder='automatic' type='number' v-model.number='offset'></b-input>
      </b-field>
    </form>
  </section>
  <footer class='modal-card-foot'>
    <button class='button' @click='$parent.close()'>Cancel</button>
    <button class='button is-primary' :class='{ "is-loading": working }'
            :disabled='errors.any() || !(pass) || working'
            @click='confirm()'>Confirm</button>
    <button class='button is-inverted is-primary' @click='advance = !advance'>{{advance ? 'Hide' : 'Show'}} Advance</button>
  </footer>
</div>
</template>
<script src='./bs-gen-identity.ts'></script>
<style lang='scss'>

</style>
