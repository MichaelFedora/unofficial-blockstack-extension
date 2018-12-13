<template>
<div id='bs-main-api-settings'>
  <div>
    <h1 class='title is-3'>Api Settings</h1>

    <section>
      <b-field label='Core API Endpoint'>
        <b-input v-model='coreApi'></b-input>
      </b-field>

      <b-field label='GaiaHub URL'>
        <b-input :value='gaiaHubUrl' disabled></b-input>
      </b-field>

      <b-field label='GaiaHub URL Override'>
        <b-input v-model='gaiaHubOverride'></b-input>
      </b-field>
    </section>
    <br>
    <div class='form-end'>
      <button class='button' :disabled='!applicable' @click='cancel()'>Cancel</button>
      <button class='button is-primary' :class='{ "is-loading": working }' :disabled='!applicable' @click='apply()'>Apply</button>
    </div>
  </div>
</div>
</template>
<script src='./api-settings.ts'></script>
<style lang='scss'>
#bs-main-api-settings {
  padding: 1rem;
  padding-top: 1.5rem;

  display: flex;
  flex-flow: column;
  align-items: center;

  > div {
    width: 100%;
    max-width: 768px;
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
