<template>
<div id='bs-main-home'>
  <div class='app-section' v-if='recentApps.length > 0'>
    <h2 class='title is-5'><b-icon icon='history'></b-icon>&nbsp;Recent Apps</h2>
    <div>
      <bs-main-applet v-for='app in recentApps' :app='app' :key='app.website' :pinned='isPinned(app)' @pin='togglePin(app)'></bs-main-applet>
    </div>
  </div>
  <div class='app-section' v-if='pinnedApps.length > 0'>
    <h2 class='title is-5'><b-icon icon='pin' custom-class='mdi-rotate-45'></b-icon>&nbsp;Pinned Apps</h2>
    <draggable :list='pinnedApps' @change='change($event)'>
      <bs-main-applet v-for='app in pinnedApps' :app='app' :key='app.website' :pinned='true' @pin='unpin(app)'></bs-main-applet>
    </draggable>
  </div>
  <div class='app-section' v-if='recommendedApps.length > 0'>
    <h2 class='title is-5'><b-icon icon='checkbox-multiple-marked'></b-icon>&nbsp;Recommended Apps</h2>
    <div>
      <bs-main-applet v-for='app in recommendedApps' :app='app' :key='app.website' @pin='pin(app)'></bs-main-applet>
    </div>
  </div>
  <div class='app-section' v-if='otherApps.length > 0'>
    <h2 class='title is-5'><b-icon icon='apps'></b-icon>&nbsp;Other Apps</h2>
    <div>
      <bs-main-applet v-for='app in otherApps' :app='app' :key='app.website' @pin='pin(app)'></bs-main-applet>
    </div>
  </div>
</div>
</template>
<script src='./home.ts'></script>
<style lang='scss'>
#bs-main-home {
  padding: 1rem;
  padding-top: 1.5rem;

  > div.app-section {

    > h2 {
      margin: 1rem 0;
      display: flex;
    }

    > div {
      display: flex;
      flex-wrap: wrap;
      padding: 0 0.8rem;

      > * {
        margin: 1rem;
      }
    }

    &:first-child {
      > h2 {
        margin-top: 0.5rem;
      }
    }
  }
}
</style>
