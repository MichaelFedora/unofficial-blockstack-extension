import axios from 'axios';
import { Module } from 'vuex';
import { createHash, randomBytes } from 'crypto';
import { AppEntry } from '../../data/app-entry';
import { AppsStateType } from './types/apps.state';
import { StateType } from './types/state';
import Vue from '../../../../node_modules/vue';

function makeState(): AppsStateType {
  return {
    apps: [],
    recent: [],
    pinned: [],
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
      const newRecent = state.recent.slice().filter(a => a.name !== app.name && a.website !== app.website);
      const storeApp = state.apps.find(a => a.name === app.name || a.website === app.website);

      newRecent.unshift(storeApp || app);
      state.recent.splice(0, state.recent.length, ...newRecent.slice(0, 5));

      const i = state.pinned.findIndex(a => a.name === app.name || a.website === app.website);
      if(i > 0) {
        if(storeApp) return;
        else Vue.set(state.pinned, i, app);
      }
    },
    pin(state, app: AppEntry) {
      state.pinned.push(app);
    },
    unpin(state, { name }: { name: string }) {
      const newPinned = state.pinned.slice().filter(a => a.name !== name);
      state.pinned.splice(0, state.pinned.length, ...newPinned);
    },
    movePinnedApp(state, { name, position }: { name: string, position: number }) {
      if(position < 0 || position > state.pinned.length - 1) return;

      const i = state.pinned.findIndex(a => a.name === name);
      if(i === position || i < 0) return;

      const app = state.pinned[i];
      if(!app) return;

      let newPinned;
      if(i < position)
        newPinned = [...state.pinned.slice(0, i), ...state.pinned.slice(i + 1, position + 1), app, ...state.pinned.slice(position + 1)];
      else
        newPinned = [...state.pinned.slice(0, position), app, ...state.pinned.slice(position, i), ...state.pinned.slice(i + 1)];
      state.pinned.splice(0, state.pinned.length, ...newPinned);

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
