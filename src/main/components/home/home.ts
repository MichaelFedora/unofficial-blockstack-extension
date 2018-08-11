import Vue from 'vue';
import { VVue } from 'common/vvue';
import { mapState } from '../../../../node_modules/vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { AppEntry } from 'common/data/app-entry';
import { commit } from 'common/vuex/remote-interface';
import { RecommendedAppNames } from 'common/recommended-apps';

import draggable from 'vuedraggable';

export default (Vue as VVue).component('bs-main-home', {
  components: { draggable },
  data() { return { } },
  computed: {
    ...mapState({
      pinnedApps: (state: StateType) => state.apps.pinned,
      recentApps: (state: StateType) => state.apps.recent
    }),
    recommendedApps(): AppEntry[] {
      const visible = [].concat(this.$store.state.apps.recent, this.$store.state.apps.pinned);
      return this.$store.state.apps.apps
            .filter(a => RecommendedAppNames.find(b => b === a.name))
            .filter(a => !visible.find(b => b.name === a.name || b.website === a.website));
    },
    otherApps(): AppEntry[] {
      const visible = [].concat(this.$store.state.apps.recent, this.$store.state.apps.pinned, this.recommendedApps);
      return this.$store.state.apps.apps.filter(a => !visible.find(b => a.name === b.name || a.website === b.website));
    }
  },
  mounted() {
  },
  methods: {
    unpin(app: AppEntry) {
      commit('apps/unpin', { name: app.name });
    },
    pin(app: AppEntry) {
      commit('apps/pin', app);
    },
    togglePin(app: AppEntry) {
      if(this.isPinned(app)) this.unpin(app);
      else this.pin(app);
    },
    isPinned(app: AppEntry) {
      return this.$store.state.apps.pinned.find(a => a.website === app.website) != null;
    },
    change(event) {
      if(event.moved) commit('apps/movePinnedApp', { name: event.moved.element.name , position: event.moved.newIndex });
    }
  }
});
