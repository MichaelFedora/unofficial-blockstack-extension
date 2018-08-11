<template>
<div id='bs-main-search'>
  <div class='app-section' v-if='pinnedAppResults.length > 0'>
    <h2 class='title is-5'><b-icon icon='pin'></b-icon>&nbsp;Pinned Apps</h2>
    <div>
      <bs-main-applet v-for='app in pinnedAppResults' :app='app' :pinned='true' :key='app.website' @pin='unpin(app)'></bs-main-applet>
    </div>
  </div>
  <div class='app-section'>
    <h2 class='title is-5' v-if='pinnedAppResults.length > 0'><b-icon icon='apps'></b-icon>&nbsp;Other Apps</h2>
    <div>
      <bs-main-applet v-for='app in appResults' :app='app' :key='app.website' @pin='pin(app)'></bs-main-applet>
    </div>
  </div>
</div>
</template>
<script src='./search.ts'></script>
<style lang='scss'>
#bs-main-search {
  > div.app-section {

    > h2 {
      margin: 1rem 0;
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
        margin-top: 0;
      }
    }
  }
}
</style>
