<template>
<div id='bs-popup-profile'>
  <div class='header'>
    <a @click='exit()'><b-icon icon='arrow-left'></b-icon></a>
  </div>
  <div class='profile-container' style='margin-bottom: 1rem'>
    <figure v-if='profileImg'><img :src='profileImg'></figure>
    <div v-else>
      <span>{{(profileName || '?')[0] }}</span>
    </div>
    <div>
      <span v-if='profileName'>{{profileName}}</span>
      <span v-else><i>Anonymous</i></span>
      <span>{{idString}}</span>
      <p v-if='bio'>{{bio}}</p>
    </div>
    <template v-if='otherIdentities.length > 0'>
    <hr style='width:100%'>
    <p>
      <span>Also signed in as</span>
      <template v-if='otherIdentities.length === 1'>
        <span><span class='b' :title='"ID-" + otherIdentities[0].ownerAddress'>{{getProfileName(otherIdentities[0]) || '{anon}'}}</span>.</span>
      </template>
      <template v-else-if='otherIdentities.length === 2'>
        <span class='b' :title='"ID-" + otherIdentities[0].ownerAddress'>{{getProfileName(otherIdentities[0]) || '{anon}'}}</span>
        <span>and</span>
        <span><span class='b' :title='"ID-" + otherIdentities[1].ownerAddress'>{{getProfileName(otherIdentities[1]) || '{anon}'}}</span>.</span>
      </template>
      <template v-else>
        <span><span class='b' :title='"ID-" + otherIdentities[0].ownerAddress'>{{getProfileName(otherIdentities[0]) || '{anon}'}}</span>,</span>
        <span v-for='(altId, index) of otherIdentities' v-if='index > 0 && index < otherIdentities.length - 1' :key='altId.ownerAddress'><span class='b' :title='"ID-" + altId.ownerAddress'>{{getProfileName(altId) || '{anon}'}}</span>,</span>
        <span><span class='b' :title='"ID-" + otherIdentities[otherIdentities.length - 1].ownerAddress'>{{getProfileName(otherIdentities[otherIdentities.length - 1]) || '{anon}'}}</span>.</span>
      </template>
    </p>
    </template>
  </div>
  <button class='button is-info' @click='gotoMain("profile")'><span>Manage Profile(s)</span><b-icon icon='launch' size='is-small'></b-icon></button>
  <button class='button is-success' @click='gotoMain("wallet")'><span>Manage Wallets(s)</span><b-icon icon='launch' size='is-small'></b-icon></button>
  <button class='button is-danger' @click='logout()'>Logout</button>
</div>
</template>
<script src='./profile.ts'></script>
<style lang='scss' scoped>
div#bs-popup-profile {
  text-align: left;
  display: flex;
  flex-flow: column;
  background-color: white;
  height: 100%;
  padding-bottom: 2rem;

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

  div.profile-container {
    display: flex;
    flex-flow: column;
    align-items: center;
    text-align: center;
    padding: 0.25rem 2rem;

    > figure:first-child {
      height: 100px;
      width: 100px;
      display: flex;
      justify-content: center;
      align-content: center;
      border-radius: 50%;
      overflow: hidden;
      > img {
        align-self: center;
      }
    }

    > div:first-child {
      border-radius: 50%;
      height: 24px;
      width: 24px;

      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
      text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
      line-height: 1;
      color: white;
      background-color: hsl(171, 100%, 41%);
      font-size: 12px;
      user-select: none;
      cursor: default;
    }

    > div:nth-child(2) {
      margin-top: 1rem;
      display: flex;
      flex-flow: column;
      flex-grow: 1;
      > span:first-child {
        font-weight: 600
      }
      > span:nth-child(2) {
        font-size: 0.67em;
      }
      > p:last-child {
        margin-top: 1rem;
        font-style: italic;
      }
    }
  }
}
</style>
