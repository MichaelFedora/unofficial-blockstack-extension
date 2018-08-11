import Vue from 'vue';
import { mapState } from 'vuex';
import { VVue } from 'common/vvue';
import { AppEntry } from 'common/data/app-entry';
import { StateType } from 'common/vuex/stores/types/state';

import _ from 'lodash';
import { commit } from 'common/vuex/remote-interface';

export default (Vue as VVue).component('bs-main-search', {
  props: { search: { required: true, type: String } },
  data() {
    return {
      pinnedAppResults: [] as AppEntry[],
      appResults: [] as AppEntry[],
      resultCount: 0,
    }
  },
  computed: {
    ...mapState({
      pinnedApps: (state: StateType) => state.apps.pinned,
      recentApps: (state: StateType) => state.apps.recent
    }),
    otherApps(): AppEntry[] {
      const otherRecent = this.$store.state.apps.recent
        .filter(a => !this.$store.state.apps.pinned.find(b => a.name === b.name || a.website === b.website));
      const visible = [].concat(otherRecent, this.$store.state.apps.pinned);
      const otherApps = this.$store.state.apps.apps.filter(a => !visible.find(b => a.name === b.name || a.website === b.website));
      return [].concat(otherRecent, otherApps);
    },
  },
  watch: {
    search(n, o) {
      if(n !== o)
        this.updateSearch(n);
    },
    pinnedApps() {
      this.updateSearch(this.search);
    },
    recentApps() {
      this.updateSearch(this.search);
    }
  },
  mounted() {
    this.updateSearch = _.debounce(this._updateSearch, 150);
    this.updateSearch(this.search);
  },
  methods: {
    filterApps(arr: AppEntry[], n: string) {
      return arr.map((app: AppEntry) => [app, app.name.toLocaleLowerCase().indexOf(n)] as [AppEntry, number])
      .filter(([app, score]) => score >= 0)
      .sort((a, b) => (a[1] - b[1]) || a[0].name.localeCompare(b[0].name))
      .map(a => a[0]);
    },
    updateSearch(n?: string) { },
    _updateSearch(n?: string) {
      if(!n) {
        this.pinnedAppResults.splice(0, this.pinnedAppResults.length);
        this.appResults.splice(0, this.appResults.length);
        this.resultCount = 0;
        return;
      }
      n = ('' + n).toLocaleLowerCase();
      this.appResults.splice(0, this.appResults.length, ...this.filterApps(this.otherApps, n));
      this.pinnedAppResults.splice(0, this.pinnedAppResults.length, ...this.filterApps(this.$store.state.apps.pinned, n));
    },
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
  }
});
