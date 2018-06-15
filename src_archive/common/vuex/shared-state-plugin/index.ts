/**
 * src: https://github.com/MitsuhaKitsune/vuex-webextensions
 *
 * usage:
 *
 * Background script
 *
 * You need create a Vuex store instance on the background script because it's the unic permanent
 * script on WebExtensions, import the module on your background script with this line:
 *
 * import {setSharedStore} from 'vuex-webextensions'
 *
 * After initialize your Vuex store (I use the var store to refer to store instance on this example,
 * if you use another var name change it), pass the instance to the module with this line:
 *
 * setSharedStore(store);
 *
 * Your background script it's done now to act as master store instance and sync with other scripts.
 * Popup/Content scripts
 *
 * Import the module on your Popup/Content script with this line:
 *
 * import {getSharedStore} from 'vuex-webextensions'
 *
 * Then initialize again the same store instance that you initialize on the background (same states,
 * actions, mutations...), after it put this line on your script:
 *
 * getSharedStore(store);
 *
 * All installation done here, now just work with the store like standart Vue.js application, this
 * module gona sync all store instances for you.
 */

export { default as setSharedStore } from './background';
export { default as getSharedStore } from './foreground';
