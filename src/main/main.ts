import Vue from 'vue';
import Vuex, { mapGetters } from 'vuex';
import VeeValidate from 'vee-validate';
import Buefy from 'buefy';

import { initialStore } from 'common/vuex/initial-store';

import AppComponent from './app/app';
import BsLoadingComponent from 'common/components/bs-loading/bs-loading';

import router from './router';

import '@mdi/font/css/materialdesignicons.css';
import 'buefy/lib/buefy.css'
import './styles.scss';
import { initializeRemoteChild } from 'common/vuex/remote-interface';
import { makeCenterStyle, makeInitializerComponent } from 'common/render-util';

console.log('Environment:', process.env.NODE_ENV);

Vue.use(Vuex);
Vue.use(VeeValidate);
Vue.use(Buefy);

const store = new Vuex.Store(initialStore);

const v = new Vue({
  router,
  store,
  el: '#app',
  data: { loaded: false },
  computed: {
    ...mapGetters({
      loggedIn: 'account/isLoggedIn'
    }),
  },
  components: { AppComponent, BsLoadingComponent },
  render(h) {
    if(this.loaded) {
      if(this.loggedIn)
        return h(AppComponent);
      else return h('div', { staticStyle: makeCenterStyle() }, [
        h('h4', { staticClass: 'title is-5' }, 'Blockstack Extension'),
        h('p', 'Login using the Toolbar Popup to use!')
      ]);
    }
    return makeInitializerComponent(h, BsLoadingComponent);
  }
});

initializeRemoteChild(store).then(() => { console.log('Initialized Main!'); v.loaded = true });
