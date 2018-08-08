import axios from 'axios';
import { Module } from 'vuex';
import { createHash, randomBytes } from 'crypto';
import { AppEntry } from '../../data/app-entry';
import { AppsStateType } from './types/apps.state';
import { StateType } from './types/state';

function makeState(): AppsStateType {
  return {
    apps: [],
    recent: [],
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
    updateAppList(state, { apps }: { apps: AppEntry[] }) {
      if(apps) state.apps = Object.assign([], apps);
      else state.apps = [];
      // state.version = version;
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
    addRecent(state, app: AppEntry) {
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
      const res = await axios.get('https://app-co-api.herokuapp.com/api/apps');
      commit('updateAppList', { apps: res.data.apps.filter(a => a.authentication === 'Blockstack') })
    }
  }
}

export default appsModule;
