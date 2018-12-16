<template>
<a id='bs-main-applet'>
<div class='details'>
  <!-- a v-if='app.description' @click='showInfo()'><b-icon icon='information' size='is-small'></b-icon></a -->
  <a @click='pin()'><b-icon :icon='pinned ? "pin-off" : "pin"'></b-icon></a>
</div>
<b-tooltip v-if='app.description' size='is-small' :label='app.description' multilined type='is-dark'>
<a :href='app.website' target='_blank' rel='noopener noreferrer'><figure><img :src='app.imageUrl'></figure></a>
</b-tooltip>
<a v-else :href='app.website' target='_blank' rel='noopener noreferrer'><figure><img :src='app.imageUrl'></figure></a>
<span class='name'><span>{{app.name}}</span></span>
</a>
</template>
<script src='./applet.ts'></script>
<style lang='scss'>
#bs-main-applet {
  position: relative;
  height: 150px;
  width: 100px;
  color: inherit;
  cursor: inherit;

  display: flex;
  flex-flow: column;
  justify-content: space-between;
  align-items: center;

  > div.details {
    opacity: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;

    display: flex;
    justify-content: flex-end;
    pointer-events: none;

    > a {
      color: inherit;
      background-color: white;
      pointer-events: auto;

      &:last-child {
        border-bottom-left-radius: 25%;
        border-top-right-radius: 25%;
      }
    }

    > *:not(:last-child) {
      margin-right: 0.4rem;
      border-bottom-right-radius: 25%;
      border-bottom-left-radius: 25%;
    }

    transition: opacity ease-out 150ms;
  }

  &:hover > div.details {
    opacity: 1;
  }

  > spanspan.tooltip {
    padding: 0;
  }

  > span > a > figure,
  > a > figure {
    height: 100px;
    width: 100px;

    display: flex;
    align-items: center;
    justify-content: center;

    > img {
      border-radius: 22.5%;
      // nice css drop shadows (but cpu intensive I guess?)
      filter: drop-shadow(0px 2px 1px rgba(0,0,0,0.33));
      /* nice circle shadows (but still has dumb pin issue)
      border-radius: 50%;
      box-shadow: 3px 3px 5px rgba(0,0,0,0,0.33);
      */
    }
  }

  > span.name {
    width: 100%;
    padding: 0 0.5rem;
    flex-grow: 1;
    display: flex;
    align-items: center;
    > span {
      text-align: center;
      width: 100%;
      font-weight: 600;
    }
  }
}
</style>
