import Vue from 'vue';
import Vuex from 'vuex';
import Buefy from 'buefy';
import VeeValidate from 'vee-validate';
import initialStore from 'common/vuex/initial-store';

import AppComponent from './app/app';
import BsLoadingComponent from 'common/components/bs-loading/bs-loading';

import '@mdi/font/css/materialdesignicons.css';
import 'buefy/lib/buefy.css'
import './styles.scss';
import { initializeRemoteChild } from 'common/vuex/remote-interface';
import { makeInitializerComponent } from 'common/render-util';

console.log('Environment:', process.env.NODE_ENV);

Vue.use(Vuex);
Vue.use(VeeValidate);
Vue.use(Buefy);

const store = new Vuex.Store(initialStore);

const v = new Vue({
  el: '#app',
  store,
  data: { loaded: false },
  components: { AppComponent, BsLoadingComponent },
  render(h) {
    if(this.loaded) return h(AppComponent)
    else return makeInitializerComponent(h, BsLoadingComponent);
  }
});

initializeRemoteChild(store).then(
  () => {
    console.log('Initialized Auth!');
    v.loaded = true
  },
  e => console.error('Error initializing Auth:', e));
