<template>
<div id='app'>
  <div v-show='loading || working' id='loader'>
    <bs-loading></bs-loading>
  </div>

  <div class='sidebar' v-if='profileSidebar'>
    <bs-popup-profile :toggle.sync='profileSidebar' @working='() => {}' @gotoMain='gotoMain($event)'></bs-popup-profile>
  </div>

  <template v-else>
  <div id='header'>
    <figure><img src='/assets/images/icon-48.png'></figure>
    <h4 class='title is-5' style='position: relative'>Blockstack Extension</h4>
    <a class='profile-avatar' v-if='loggedIn' @click='profileSidebar = true'>
      <figure v-if='profileImg'><img :src='profileImg'></figure>
      <div v-else>
        <span>{{(profileName || '?')[0] }}</span>
      </div>
    </a>
    <a class='button is-inverted is-primary' @click='gotoMain()'>
      <b-icon icon='launch'></b-icon>
    </a>
  </div>

  <bs-login v-show='!loggedIn' :done.sync='loginDone' @working='working = $event' @error='error = $event' @showDialog='showDialog'></bs-login>

  <template v-if='loggedIn && loginDone'>
  <div id='profile' class='container'>
    <div style='width: 100%'>
      <b-field>
        <b-input style='width: 100%;' name='search' placeholder='search apps' type='search' icon='magnify' v-model.trim='search'></b-input>
      </b-field>
    </div>
    <div style='width: 100%' v-if='!search'>
      <template v-if='recentApps.length > 0'>
      <h5 class='title is-6' style='margin-bottom: 1rem' v-show='recentApps.length > 0'>Recent Apps</h5>
      <div class='results-apps'>
        <a v-for='app of recentApps' :key='app.name' :href='app.website'>
          <img :src='app.imageUrl'>
          <span>{{app.name}}</span>
        </a>
      </div>
      </template>
      <template v-if='pinnedApps.length > 0'>
      <h5 class='title is-6' style='margin: 1rem 0'>Pinned Apps</h5>
      <div class='results-apps'>
        <a v-for='app of pinnedApps' :key='app.name' :href='app.website'>
          <img :src='app.imageUrl'>
          <span>{{app.name}}</span>
        </a>
      </div>
      </template>
      <template v-else-if='recommendedApps.length > 0'>
      <h5 class='title is-6' style='margin: 1rem 0'>Recommended Apps</h5>
      <div class='results-apps'>
        <a v-for='app of recommendedApps' :key='app.name' :href='app.website'>
          <img :src='app.imageUrl'>
          <span>{{app.name}}</span>
        </a>
      </div>
      </template>
    </div>
    <div v-else style='width: 100%'>
      <div class='results-apps'>
        <a v-for='app of appResults' :key='app.name' :href='app.website'>
          <img :src='app.imageUrl'>
          <span>{{app.name}}</span>
        </a>
      </div>
      <span v-show='search.length > 0 && appResults.length === 0'>Nothing found!</span>
      <a v-show='resultCount > appResults.length' class='sudo-link' @click='gotoMain("search?q="+search)'>... and {{resultCount - appResults.length}} more.</a>
    </div>
    <span class='has-text-danger' v-if='error'>{{error}}</span>
  </div>

  <div v-if='dialogSpace' style='width: 20rem; height: 20rem;'></div>
  </template>
  </template>
</div>
</template>
<script src='./app.ts'></script>
<style lang='scss'>
#app {

  position: relative;

  display: flex;
  flex-flow: column;
  flex-wrap: nowrap;
  align-items: center;
  width: 320px;
  min-height: 160px;
  background-color: #fff;
  // transition: all 300ms ease-in-out;
  text-align: center;

  max-height: 600px;
  overflow-x: hidden;
  overflow-y: auto;

  > div#header {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 1em 0.9em 0;
    background-color: white;

    > figure {
      height: 1.5em;
      width: 1.5em;
      margin-right: 0.4rem;
    }
    > h4 {
      text-align: left;
      line-height: 1;
      width: auto;
      flex-grow: 1;
      margin: 0;
    }

    > a.button {
      display: flex;
      margin-left: 0.4rem;
    }

    a.profile-avatar {
      margin-left: 0.4em;
      display: flex;
      align-items: center;

      > figure:first-child {
        height: 24px;
        width: 24px;
        border-radius: 50%;
        > img {
          border-radius: 50%;
        }
      }

      transition: box-shadow 150ms;
      &:hover > * {
        box-shadow: 0 0 2px rgba(black, 0.33);
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
        cursor: inherit;
      }
    }
  }

  > div.sidebar {
    height: 100%;
    width: 100%;
    z-index: 10;
  }

  .sudo-link {
    cursor: pointer;
  }

  div.results-apps {
    display: flex;
    flex-flow: column;
    width: 100%;
    > * {
      width: 100%;
    }

    > a {
      cursor: pointer;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      height: 24px;
      text-overflow: ellipsis;
      color: inherit;
      position: relative;
      transition: padding 150ms;
      &:not(:last-child) {
        margin-bottom: 4px;
      }
      &:hover {
        font-weight: bold;
        padding-left: 8px;
        ::after {
          border: 2px solid #7957d5;
        }
      }
      ::after {
        border: 2px solid transparent;
        position: absolute;
        left: 0;
        height: 100%;
        top: 0;
        bottom: 0;
        width: 0;
        border-radius: 2px;
        content: "";
        transition: border-color 150ms;
      }
      > img {
        height: 24px;
        width: 24px;
        margin-right: 0.5rem;
        border-radius: 22.5%;
        filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.33));
      }
    }
  }

  > #bs-login {
    width: 100%;
    background-color: white;
  }

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

  div#loader {
    position: absolute;
    z-index: 1024;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(#fafafa, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slim {
    padding: .25rem .5rem;
  }
}
</style>
