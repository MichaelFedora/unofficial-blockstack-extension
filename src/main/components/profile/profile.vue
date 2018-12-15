<template>
<div id='bs-main-profile'>

  <b-loading :active='working'></b-loading>

  <div id='sidebar'>
    <div>
      <template v-for='identity of entries'>
      <a class='identity' v-if='!identity.nextLoc' :class='{ selected: current == identity.index }' :key='identity.address' @click='select(identity.index)'>
        <figure v-if='getProfileImage(identity)'><img :src='getProfileImage(identity)'></figure>
        <div v-else>
          <span>{{(getProfileShortName(identity, true) || '?')[0] }}</span>
        </div>
        <div>
          <span>{{getProfileShortName(identity, true) || 'Anonymous' }}</span>
          <span>ID-{{identity.address}}</span>
        </div>
      </a>
      <a class='identity-skip' v-else :key='identity.nextLoc' title='Add Identity Between' @click='addIdBetween(identity.nextLoc)'>
        <span>{{identity.amt}} places skipped...</span>
      </a>
      </template>
    </div>
    <button class='button is-info fab is-br' title='Add Identity' @click='addId()'><b-icon icon='plus'></b-icon></button>
  </div>

  <div id='content' class='content'>
    <template v-if='!editing'>
      <figure v-if='getProfileImage(selectedId)'><img :src='getProfileImage(selectedId)'></figure>
      <div v-else>
        <span>{{ (getProfileShortName(selectedId, true) || '?')[0] }}</span>
      </div>
      <h3 class='is-title is-4'>{{(selectedId.profile && selectedId.profile.name) || 'Anonymous'}}</h3>
      <h4 class='is-title is-5' style='padding: 0.375em 0' v-if='selectedId.username'>{{selectedId.username}}</h4>
      <button v-else class='button' style='margin-bottom: 1rem;' disabled title='Not Yet Implemented'>Add a Username</button>
      <span>ID-{{selectedId.address}}</span>
      <div class='button-bar'>
        <button class='button is-primary' :disabled='defaultSelected' @click='makeDefault()'>{{ defaultSelected ? 'Default' : 'Make Default' }}</button>
        <button class='button' @click='edit()'><span>Edit</span></button>
        <button v-if='current !== 0' class='button is-danger' @click='removeId()'><span>Remove</span></button>
        <button v-else class='button is-primary' disabled><b-icon icon='crown'></b-icon><span>Root ID</span></button>
      </div>
      <p style='margin-top: 2rem'>{{(selectedId.profile && selectedId.profile.description) || 'I am a secretive person.'}}</p>
    </template>
    <template v-else>
      <input type='file' id='profile-image' @change='onProfileImageChange' accept='image/png,image/jpeg,image/gif'>
      <label class='image-edit' for='profile-image'>
        <figure v-if='newImage || getProfileImage(selectedId)'><img :src='newImage || getProfileImage(selectedId)'></figure>
        <div v-else>
          <span>{{(getProfileShortName(selectedId, true) || '?')[0] }}</span>
        </div>
        <span>Change</span>
      </label>
      <b-field style='margin-top: 1.45rem; margin-bottom: 1rem'>
        <b-input placeholder='Anonymous' v-model='name' style='text-align: center'></b-input>
      </b-field>
      <h4 class='is-title is-5' style='padding: 0.375em 0' v-if='selectedId.username'>{{selectedId.username}}</h4>
      <button v-else class='button' style='margin-bottom: 1rem;' disabled title='Not Yet Implemented'>Add a Username</button>
      <span>ID-{{selectedId.address}}</span>
      <div class='button-bar'>
        <button class='button is-danger' @click='cancel()'><span>Cancel</span></button>
        <button class='button is-success' @click='save()'><span>Save</span></button>
      </div>
      <b-field style='margin-top: 2rem;'>
        <b-input placeholder='I am a secretive person.' type='textarea' v-model='bio' style='text-align: center'></b-input>
      </b-field>
      <p><i>Accounts and Verifications are not yet implemented</i></p>
    </template>
  </div>
</div>
</template>
<script src='./profile.ts'></script>
<style lang='scss'>
#bs-main-profile {
  display: flex;

  > div#sidebar {
    position: relative;
    max-width: 50%;
    width: 20rem;
    border-right: 2px solid rgba(0, 0, 0, 0.05);

    > div {
      display: flex;
      flex-flow: column;

      > a.identity-skip {
        display: flex;
        align-items: center;
        justify-content: center;
        color: inherit;
        padding: 1rem;

        &:not(:last-child) {
          border-bottom: 2px solid rgba(0,0,0,0.05);
        }
        &:hover {
          background-color: rgba(0,0,0,0.05);
        }
        &.selected {
          background-color: rgba(0,0,0,0.15);
        }

        > span {
          font-style: italic;
        }
      }

      > a.identity {
        display: flex;
        align-items: center;
        color: inherit;
        padding: 1rem;

        &:not(:last-child) {
          border-bottom: 2px solid rgba(0,0,0,0.05);
        }
        &:hover {
          background-color: rgba(0,0,0,0.05);
        }
        &.selected {
          background-color: rgba(0,0,0,0.15);
        }

        > figure:first-child{
          height: 32px;
          width: 32px;
          min-width: 32px;
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
          height: 32px;
          width: 32px;
          min-width: 32px;

          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
          line-height: 1;
          color: white;
          background-color: hsl(171, 100%, 41%);
          font-size: 16px;
        }

        > div:not(:first-child) {
          display: flex;
          flex-flow: column;
          flex-shrink: 1;
          flex-grow: 1;
          align-items: center;
          padding-left: 1rem;
          overflow: hidden;

          > * {

            width: 100%;
            overflow: hidden;

            &:first-child {
              display: flex;
              justify-content: space-between;
              font-weight: 600;
            }
            &:last-child {
              text-overflow: ellipsis;
              overflow: hidden;
              font-size: 0.75rem;
            }
          }
        }
      }
    }
  }

  > #content {
    position: relative;
    display: flex;
    flex-flow: column;
    align-items: center;

    padding: 1rem;
    flex-grow: 1;

    > div.button-bar {
      display: flex;
      align-items: center;
      margin-top: 1rem;
      > *:not(:last-child) {
        margin-right: 1rem;
      }
    }

    > input#profile-image {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      z-index: -1;

      + label.image-edit {
        height: 100px;
        width: 100px;
        margin: 0;
        margin-top: 2rem;
        border-radius: 50%;
        position: relative;
        overflow: hidden;
        cursor: pointer;

        > span {
          display: none;
          position: absolute;
          width: 100%;
          text-align: center;
          color: white;
          background-color: rgba(0,0,0,0.3);
          font-size: 0.8rem;
          bottom: 10%;
          width: 100%;
        }

        &:hover > span {
          display: block;
        }

        > figure:first-child {
          height: 100%;
          width: 100%;
          margin: 0;
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
          height: 100%;
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          user-select: none;
          text-shadow: 4px 4px 1px rgba(0,0,0,0.1);
          line-height: 1;
          color: white;
          background-color: hsl(171, 100%, 41%);
          font-size: 48px;
        }
      }
    }

    > figure:first-child {
      height: 100px;
      width: 100px;
      margin: 0;
      margin-top: 2rem;
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
      height: 100px;
      width: 100px;
      margin: 0;
      margin-top: 2rem;

      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
      user-select: none;
      cursor: default;
      text-shadow: 4px 4px 1px rgba(0,0,0,0.1);
      line-height: 1;
      color: white;
      background-color: hsl(171, 100%, 41%);
      font-size: 48px;
    }
  }
}
</style>
