<template>
<div id='bs-main-settings'>
  <div class='header'>
    <a @click='exit()'><b-icon icon='arrow-left'></b-icon></a>
  </div>
  <div class='settings-container' style='margin-bottom: 1rem'>
    <template v-if='loggedIn'>
      <h1 class='title is-5'>Account Settings</h1>

      <b-field label='Account Email (optional)'
        :type='getType(fields.email)'
        :message='errors.first("email")'>
        <b-input v-model='email' v-validate='"email"' name='email'></b-input>
      </b-field>
      <br>
      <section style='display: flex; flex-flow: column;'>
        <button class='button is-primary' style='margin-bottom: 1rem;' @click='showRecoveryKey()'>Show Recovery Key</button>
        <button class='button is-primary' @click='changePassword()'>Change Password</button>
      </section>
      <br>
    </template>

    <h1 class='title is-5'>Api Settings</h1>

    <section>
      <b-field label='Core Api URL (https)'
        :type='getType(fields.coreApi)'
        :message='errors.first("coreApi")'>
        <b-input v-model='coreApi' v-validate='{ url: { protocols: ["https"], require_protocol: true } }' name='coreApi'></b-input>
      </b-field>

      <b-field label='Gaia Hub URL (https)'
        :type='getType(fields.gaiaHubUrl)'
        :message='errors.first("gaiaHubUrl")'>
        <b-input v-model='gaiaHubUrl' v-validate='{ url: { protocols: ["https"], require_protocol: true } }' name='gaiaHubUrl'></b-input>
      </b-field>
    </section>
    <br>

    <div class='form-end'>
      <button class='button' :disabled='!applicable || errors.any() || !fullForm' @click='cancel()'>Cancel</button>
      <button class='button is-primary' :class='{ "is-loading": working }' :disabled='!applicable' @click='apply()'>Apply</button>
      <button class='button is-warning' :disabled='defaults' @click='resetDefaults()'>Reset Defaults</button>
    </div>
  </div>
</div>
</template>
<script src='./settings.ts'></script>
<style lang='scss'>
#bs-main-settings {
  text-align: left;
  display: flex;
  flex-flow: column;
  background-color: white;
  height: 100%;

  span.b {
    font-weight: bolder;
  }

  > div.header {
    width: 100%;
    padding: 0.5rem 0.5rem 0 0.5rem;
  }

  > button {
    margin: 0 2rem;
    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  > div.settings-container {
    text-align: center;
    width: 100%;
    padding: 1rem;
    > div.form-end {
      display: flex;
      flex-flow: row-reverse;
      > *:not(:first-child) {
        margin-right: 1rem;
      }
    }
  }
}
</style>
