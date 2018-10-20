<template>
<div id='bs-main-search'>
  <div class='app-section' v-if='pinnedAppResults.length > 0'>
    <h2 class='title is-5'><b-icon icon='pin'></b-icon>&nbsp;Pinned Apps</h2>
    <div>
      <bs-main-applet v-for='app in pinnedAppResults' :app='app' :pinned='true' :key='app.website' @pin='unpin(app)'></bs-main-applet>
    </div>
  </div>
  <div class='app-section'>
    <h2 class='title is-5'><b-icon icon='apps'></b-icon>&nbsp;{{ pinnedAppResults.length > 0 ? 'Other Apps' : 'Apps' }}</h2>
    <div>
      <bs-main-applet v-for='app in appResults' :app='app' :key='app.website' @pin='pin(app)'></bs-main-applet>
    </div>
  </div>
</div>
</template>
<script src='./search.ts'></script>
<style lang='scss'>
#bs-main-search {
  padding: 1rem;

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
