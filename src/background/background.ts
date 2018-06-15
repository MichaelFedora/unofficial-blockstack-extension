import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import { browser } from 'webextension-polyfill-ts';
import initialStore from '../common/vuex/initial-store';
import { initializeRemoteMaster } from 'common/vuex/remote-interface';

Vue.use(Vuex);
const bgInitialStore = Object.assign({ plugins: [] }, initialStore);
bgInitialStore.plugins.push(createPersistedState());
const store = new Vuex.Store(bgInitialStore);
initializeRemoteMaster(store);

const ext_url = browser.extension.getURL('');
const ext_url_prefix_length = 'moz-extension://'.length;

const uuid = ext_url.substr(ext_url_prefix_length, ext_url.length - ext_url_prefix_length - 1);
console.log('Got UUID: ', uuid);

if(browser.runtime.lastError && browser.runtime.lastError.message)
  console.error('lastError:', browser.runtime.lastError.message);

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if(/^data:/.test(details.url) || /\.(png|jpg)$/.test(details.url)) return;
    console.log('going places!', details.url);

    if(/blockstack\.org\/auth/.test(details.url)) {
      // try-auth-here
      const match = /blockstack\.org\/auth(\?.+)/.exec(details.url);
      if(!match || match.length < 2) return;
      const url = browser.extension.getURL('auth.html') + match[1];
      if(browser.windows) {
        browser.windows.create({
          url: url + '&tabId=' + (details.tabId || -1),
          type: 'popup' as any,
          height: 600,
          width: 350
        }).catch(() => {
          if(details.tabId >= 0)
            browser.tabs.update(details.tabId, { url })
          else
            browser.tabs.update({ url })
        });
      } else {
        if(details.tabId >= 0)
          browser.tabs.update(details.tabId, { url })
        else
          browser.tabs.update({ url })
      }

      // return { cancel: true };
      return { redirectUrl: 'javascript:' };
    }
  },
  {urls: ['<all_urls>']},
  // @ts-ignore
  ['blocking']
);


// browser.omnibox.setDefaultSuggestion({ description: 'Search Blockstack' });
browser.omnibox.onInputChanged.addListener((text, suggest) => {
  const matchingApps = store.state.apps.apps.filter(a => a.displayName.substr(0, text.length).toLowerCase() === text.toLowerCase());
  suggest(matchingApps.map(a => ({ content: a.name, description: a.name + ': ' + a.description })));
});
browser.omnibox.onInputEntered.addListener((text, disposition) => {
  const app = store.state.apps.apps.find(a => a.name.toLowerCase() === text.toLowerCase());
  if(app) {
    browser.tabs.update({
      url: app.launchLink // app ? app.launchLink : browser.extension.getURL('main.html#apps?search="' + text + '"')
    });
  }
});

console.log('Initial loading of Blockstack Extension done!')

Promise.all([
  store.dispatch('connectSharedService')
    .then(() => store.dispatch('identity/downloadAll') as Promise<boolean[]>)
    .then(results => Promise.all(results.map((a, i) => {
      if(a) return Promise.resolve();
      console.log('No profile for address ID-' + store.state.account.identityAccount.addresses[i] + '; uploading ours!');
      return store.dispatch('identity/upload', { index: i });
    })))
    .then(() => console.log('Connected to shared service & initialized identity!'),
          err => console.error('Error connecting to shared service & initializing identity:', err)),

  store.dispatch('apps/updateAppList').then(
    () => console.log('Updated app list! Version: ' + store.state.apps.version),
    err => console.error('Error updating app list:', err))
]).then(() => {
  console.log('Loaded Blockstack Extension!')
}, err => console.error('Error loading blockstack extension:', err));




