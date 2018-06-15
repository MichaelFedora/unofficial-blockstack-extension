<template>
<div id='bs-popup-sidebar'>
  <div class='header'>
    <a @click='exit()'><b-icon icon='arrow-left'></b-icon></a>
  </div>
  <div class='profile-container' style='margin-bottom: 1rem'>
    <figure v-if='profileImg'><img :src='profileImg'></figure>
    <div v-else>
      <span>{{(profileName || '?')[0] }}</span>
    </div>
    <div>
      <span>{{profileName}}</span>
      <span>{{idString}}</span>
    </div>
  </div>
  <template v-if='localIdentities.length > 1'>
  <h5 class='title is-6' style='margin: 0.5rem 1rem 1rem; text-align: center'>Switch Default Identity</h5>
  <div class='identities-container'>
    <a v-for='(identity, index) in localIdentities'
        v-show='index !== defaultIndex' :key='identity.ownerAddress'
        class='profile-container' @click='switchProfile(index)'>
      <figure v-if='getProfileImage(identity)'><img :src='getProfileImage(identity)'></figure>
      <div v-else>
        <span>{{(getProfileName(identity) || '?')[0] }}</span>
      </div>
      <div>
        <span>{{getProfileName(identity)}}</span>
        <span>ID-{{identity.ownerAddress}}</span>
      </div>
      <div>
        <button v-if='index !== 0' class='button is-danger' @click='remove(index)'><b-icon icon='delete'></b-icon></button>
        <button v-else class='button is-primary' disabled><b-icon icon='crown'></b-icon></button>
      </div>
    </a>
  </div>
  </template>
  <button class='button is-primary' @click='deriveNewIdentity()'>Add Identity</button>
  <button class='button is-info' disabled>Dashboard</button>
  <button class='button is-info' disabled>Settings</button>
  <button class='button is-danger' @click='logout()'>Logout</button>
</div>
</template>
<script src='./sidebar.ts'></script>
<style lang='scss' scoped>
div#bs-popup-sidebar {
  text-align: left;
  display: flex;
  flex-flow: column;
  background-color: white;
  height: 100%;
  padding-bottom: 2rem;

  > div.header {
    width: 100%;
    padding: 0.5rem 0.5rem 0 0.5rem;
  }


  > div.identities-container {
    box-shadow: inset 0 0 3px rgba(black, 0.27);
    margin-bottom: 1.5rem;
  }

  > button {
    margin: 0 2rem;
    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  a.profile-container {
    color: inherit;
    &:hover {
      background-color: rgba(black, 0.05);
    }
    > div:first-child {
      cursor: inherit;
    }
  }

  .profile-container {
    display: flex;
    align-items: center;
    padding: 0.25rem 2rem;

    > figure:first-child {
      height: 24px;
      width: 24px;
      > img {
        border-radius: 50%;
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
      margin-left: 0.5rem;
      display: flex;
      flex-flow: column;
      flex-grow: 1;
      > span:first-child {
        font-weight: 600
      }
      > span:last-child {
        font-size: 0.67em;
      }
    }

    > div:nth-child(3) {
      height: 100%;
      margin-left: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
