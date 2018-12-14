import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import { browser } from 'webextension-polyfill-ts';
import initialStore from 'common/vuex/initial-store';
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

// one day return user profiles too eh?
function search(text: string) {
  return store.state.apps.apps.filter(a => a.name.substr(0, text.length).toLowerCase() === text.toLowerCase());
}

browser.webRequest.onBeforeRequest.addListener((details) => {
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
    }/* else if(/blockstack\.org\/browser\/search/.test(details.url)) {
      const match = /blockstack\.org\/browser\/search\/?\?q=(.*)/.exec(details.url);
      if(!match || match.length < 2) return;
      const url = browser.extension.getURL('main.html#/search?q=' + match[1] + '');
      if(details.tabId >= 0)
        browser.tabs.update(details.tabId, { url })
      else
        browser.tabs.update({ url })

    } else if(/blockstack\.org\/browser\/suggest/.test(details.url)) {
      const match = /blockstack\.org\/browser\/suggest\/?\?q=(.*)/.exec(details.url);
      if(!match || match.length < 2) return { redirectUrl: JSON.stringify(['', []]) };
      const matchingApps = search(match[1]);
      return { redirectUrl: 'data:application/json,' + JSON.stringify([
        match[1],
        matchingApps.map(a => a.name)
      ]) }; // still doesn't work :(
    }*/
  },
  {urls: ['<all_urls>']},
  // @ts-ignore
  ['blocking']
);


// browser.omnibox.setDefaultSuggestion({ description: 'Search Blockstack' });
browser.omnibox.onInputChanged.addListener((text, suggest) => {
  const matchingApps = search(text);
  suggest(matchingApps.map(a => ({ content: a.name, description: a.name + ': ' + a.description })));
});
browser.omnibox.onInputEntered.addListener((text, disposition) => {
  const app = store.state.apps.apps.find(a => a.name.toLowerCase() === text.toLowerCase());
  if(app) {
    browser.tabs.update({
      url: app.website
    });
  } else {
    browser.tabs.update({
      url: browser.extension.getURL('main.html#/search?q=' + text + '')
    });
  }
});

console.log('Initial loading of Blockstack Extension done!')

Promise.all([
  store.dispatch('connectSharedService')
    .then(() => store.dispatch('identity/downloadAll') as Promise<boolean[]>)
    .then(results => Promise.all(results.map(async (a, i) => {
      if(a) return Promise.resolve();
      const addrId = store.state.account.identities[i].keyPair.address;
      console.log('Trying to download profile for ID-' + addrId + ' again...');
      const b = await store.dispatch('identity/download', { index: i }).then(() => true, () => false);
      if(b) return Promise.resolve();
      console.log('No profile (after two tries) for address ID-' + addrId + '; logging out!');
      const errReason = `Couldn't fetch profile for ` + (i === 0 ? 'the main' : `a derived(${i})`) + ` identity ID-${addrId}.`;
      await store.dispatch('logout', errReason);
      throw new Error(errReason);
      // return store.dispatch('identity/upload', { index: i });
    })))
    .then(() => console.log('Connected to shared service & initialized identity!'),
          err => console.error('Error connecting to shared service & initializing identity:', err)),

  store.dispatch('apps/updateAppList').then(
    () => console.log('Updated app list! Last Updated: ' + store.state.apps.lastUpdated),
    err => console.error('Error updating app list:', err))
]).then(() => {
  console.log('Loaded Blockstack Extension!')
}, err => console.error('Error loading blockstack extension:', err));
