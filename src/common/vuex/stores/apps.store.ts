import Vue from 'vue';
import axios from 'axios';
import { Module } from 'vuex';
import { createHash, randomBytes } from 'crypto';
import { appList, AppEntry } from '../../app-list';
import { AppsStateType } from './types/apps.state';
import { StateType } from './types/state';

function makeState(): AppsStateType {
  return {
    apps: JSON.parse(JSON.stringify(appList.apps)), // (or [])
    recent: [],
    version: '' + appList.version,
    lastUpdated: 0,
    instanceIdentifier: null,
    instanceCreationDate: null
  };
}

export const appsModule: Module<AppsStateType, StateType> = {
  namespaced: true,
  state: makeState(),
  mutations: {
    reset(state, { justUserdata }: { justUserdata?: boolean }) {
      if(justUserdata) {
        state.recent.splice(0, state.recent.length);
      } else
        Object.assign(state, makeState());
    },
    updateAppList(state, { apps, version }: { apps: AppEntry[], version: string }) {
      if(apps) state.apps = Object.assign([], apps);
      else state.apps = [];
      state.version = version;
      state.lastUpdated = Date.now();
    },
    updateAppInstanceIdentifier(state, { instanceIdentifier }: { instanceIdentifier: string }) {
      state.instanceIdentifier = instanceIdentifier;
      state.instanceCreationDate = Date.now();
    },
    generateAndUpdateAppInstanceIdentifier(state) {
      state.instanceIdentifier = createHash('sha256').update(randomBytes(256)).digest('hex');
      state.instanceCreationDate = Date.now();
    },
    addRecent(state, app: { name: string, appIcon: { small: string }, launchLink: string }) {
      const newRecent = state.recent.slice().filter(a => a.name !== app.name);
      newRecent.unshift(app);
      state.recent.splice(0, state.recent.length, ...newRecent.slice(0, 5));
    }
  },
  actions: {
    reset({ commit }, options?: { justUserdata?: boolean }) {
      commit('reset', options);
    },
    async updateAppList({ commit, rootState }) {
      const res = await axios.get(rootState.settings.api.browserServerUrl + '/data');
      commit('updateAppList', { apps: res.data.apps, version: res.data.version })
    }
  }
}

export default appsModule;
