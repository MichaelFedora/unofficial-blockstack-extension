<template>
<div id='bs-login'>
<div class='container' id='login' v-show='!view'>
  <span class='has-text-danger' :class='{ marg: error || logoutReason }' v-show='error || logoutReason'>{{error || logoutReason}}</span>
  <button class='button is-primary slim' @click='view = "restore"'>Restore Existing Keychain</button>
  <button class='button is-info slim' @click='view = "register"'>Create New Identity</button>
</div>

<div class='container' id='restore' v-if='view === "restore"'>
  <h5 class='subtitle'>Restore Existing Keychain</h5>
  <form>
    <b-field
      label='Recovery Keychain Phrase'
      :type='getType(fields.phrase)'
      :message='fields.phrase && fields.phrase.invalid ? "Recovery Phrase Invalid: Must be 12 lowercase words" : ""'>
      <b-input v-validate='{ required: true, regex: /^\s*(?:[a-z]+\s){11}[a-z]+\s*$/ }' name='phrase' placeholder='apple banana orange cherry mango kiwi grape watermelon strawberry lemon keyboard cat' type='text' v-model.trim='phrase'></b-input>
    </b-field>
    <b-field
      label='Local Password to use'
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
  <span class='has-text-danger' v-show='error'>{{error}}</span>
  <button class='button is-primary slim' :disabled='errors.any() || !fullForm' @click='restore()'>Restore Keychain</button>
  <button class='button is-danger is-outlined slim' @click='view = ""'>Cancel</button>
</div>

<div id='register' class='container' v-if='view === "register"'>
  <h5 class='subtitle'>Register New Identity</h5>
  <form>
    <b-field
      label='Email (optional)'
      :type='getType(fields.email, true)'
      :message='errors.first("email")'>
      <b-input v-validate='"email"' name='email' placeholder='email@example.com' type='text' v-model='email'></b-input>
    </b-field>
    <b-field
      label='Local Password to use'
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
  <span class='error has-text-danger' v-show='error'>{{error}}</span>
  <button class='button is-primary slim' :disabled='errors.any() || !fullForm' @click='register()'>Register</button>
  <button class='button is-danger is-outlined slim' @click='view = ""'>Cancel</button>
</div>
<div v-else-if='view === "showKey"' id='showKey' class='container'>
  <h5 class='subtitle'>Backup Key</h5>
  <textarea ref='textarea' class='textarea' style='width:100%;resize:none' readonly cols='32' rows='3' v-model='phrase'></textArea>
  <p>Make sure you write this down somewhere safe - there is no password recovery, and this is the only way into your account!</p>
  <button class='button is-info slim' @click='$refs.textarea.focus();$refs.textarea.select();copy(phrase)'>Copy</button>
  <button class='button is-primary slim' @click='finish()'>Got it!</button>
</div>
</div>
</template>
<script src='./bs-login.ts'></script>
<style lang='scss'>
div#bs-login {
  div.container {
    button {
      width: 100%;
    }
    padding: 2rem;

    display: flex;
    flex-flow: column;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    background-color: white;
    > * {
      margin: 0;
    }
    > span.marg {
      margin-bottom: 1rem;
    }
    > :not(span):not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  form {
    width: 100%;
    display: flex;
    flex-flow: column;
    > * {
      width: 100%;
    }
  }

  .slim {
    padding: .25rem .5rem;
  }
}
</style>
