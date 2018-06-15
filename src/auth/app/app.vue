<template>
<div id='app'>
  <div id='modal' v-if='!working && !error'>
    <h4 class='title is-5'>Blockstack Sign in Request</h4>
    <figure id='icon'><img :src='app.icon || "assets/images/icon-128.png"'/></figure>

    <p>The app "<b>{{app.name}}</b>" located at {{app.url}} wants to:</p>
    <div class='perm-list'>
      <span>Read your basic info</span>
      <span v-if='app.scopes.email'>Read your email address</span>
      <span v-if='app.scopes.publish_data'>Publish data stored for this app</span>
      <span v-if='app.scopes.store_write'>Store and write data</span>
    </div>

    <form>
      <b-field label='Choose a Blockstack ID to sign in with:'>
        <b-select v-model='currentIdentityIndex' expanded>
          <option disabled value='0' v-if='userIds.length == 0'>No ID's available...</option>
          <option v-for='(id, index) in userIds' :key='id.ownerAddress' :value='index'>
            {{id.username || (id.name ? `${id.name}: ID-${id.ownerAddress}` : `ID-${id.ownerAddress}`)}}
          </option>
        </b-select>
      </b-field>
    </form>

    <button class='button is-primary' :disabled='!loggedIn' style='width: 100%' @click='approve()'>{{ loggedIn ? 'Approve' : 'Login to Approve' }}</button>
    <button class='button is-danger is-outlined' style='width: 100%' @click='deny()'>{{ loggedIn ? 'Deny' : 'Cancel' }}</button>
  </div>
  <div id='loading' v-show='working && !error'>
    <h3 class='title is-4'>Working...</h3>
    <bs-loading></bs-loading>
  </div>
  <div id='error-modal' class='has-background-danger' v-show='error'>
    <h4 class='title is-5'>Blockstack Extension Error!</h4>
    <p>{{error}}</p>
    <button class='button is-outlined is-dark' style='width: 100%' @click='close()'>Exit</button>
  </div>
</div>
</template>
<script src='./app.ts'></script>
<style lang='scss'>
#app {

  display: flex;
  flex-flow: row;
  flex-wrap: nowrap;
  justify-content: center;
  min-height: 100%;
  height: 100%;
  min-width: 100%;
  align-items: center;

  figure#icon {
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 128px;
    max-width: 100%;
    > img {
      max-height: inherit;
      height: 100%;
    }
  }

  div.perm-list {
    display: flex;
    flex-flow: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    > span {
      font-weight: bold;
      font-size: 0.9rem;
    }
  }

  form {
    width: 100%;
  }

  #modal {
    display: flex;
    flex-flow: column;
    flex-wrap: nowrap;
    align-items: center;
    max-width: 415px;
    width: 100%;
    min-height: 100%;
    padding: 2.5rem 3rem;
    background-color: #fff;
    border: 1px solid #fafafa;
    box-shadow: 0 0 25px 0 rgba(0, 0, 0, 0.25);
    transition: all 300ms ease-in-out;
    text-align: center;
    > * {
      margin: 0;
      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
  }

  #error-modal {
    display: flex;
    flex-flow: column;
    flex-wrap: nowrap;
    align-items: center;
    max-width: 415px;
    padding: 2.5rem 3rem;
    color: #fff;
    box-shadow: 0 0 25px 0 rgba(0, 0, 0, 0.25);
    transition: all 300ms ease-in-out;
    text-align: center;
    > * {
      margin: 0;
      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
  }

  #loading {
    > h3 {
      position: fixed;
      top: 0;
      width: 100%;
      padding: 1rem;
      text-align: center;
    }
    display: flex;
    flex-flow: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: #fafafa;
  }
}
</style>
