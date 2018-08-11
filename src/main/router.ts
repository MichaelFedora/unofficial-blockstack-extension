import Vue from 'vue';
import VueRouter from 'vue-router';

import HomeComponent from './components/home/home';
import SearchComponent from './components/search/search';
import ProfileComponent from './components/profile/profile';
import WalletComponent from './components/wallet/wallet';
import ApiSettingsComponent from './components/api-settings/api-settings';
import NotFoundComponent from './components/not-found/not-found';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: HomeComponent },
    { path: '/search', component: SearchComponent, props: (route) => ({ search: route.query.q }) },
    { path: '/profile', component: ProfileComponent },
    { path: '/wallet', redirect: '/wallet/recieve' },
    { path: '/wallet/:action', component: WalletComponent, props: true },
    { path: '/settings/api', component: ApiSettingsComponent },
    { path: '*', component: NotFoundComponent }
  ]
});

router.beforeEach((to, from, next) => {
  if(to.path !== from.path) {
    if(to.path.length > 1) {
      const paths = to.path.slice(1).split('/').map(a => a[0].toLocaleUpperCase() + a.slice(1)).join(' - ');
      document.title = 'Blockstack Extension - ' + paths;
    } else document.title = 'Blockstack Extension';
  }
  next();
});

export default router;
