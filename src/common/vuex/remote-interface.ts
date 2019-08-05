import { Store, CommitOptions, DispatchOptions } from 'vuex';
import { browser } from 'webextension-polyfill-ts';

const debug = false;

export enum RemoteMessageType {
  FETCH_INITIAL_STATE = '$$STORE_FETCH_INITIAL_STATE',
  INVOKE_MUTATION = '$$STORE_INVOKE_MUTATION',
  INVOKE_ACTION = '$$STORE_INVOKE_ACTION',

  SYNC_MUTATION = '$$STORE_SYNC_MUTATION',
};

export async function initializeRemoteChild<S>(store: Store<S>) {
  if(debug) console.log('Initializing remote child!');
  const initialState = await browser.runtime.sendMessage({ type: RemoteMessageType.FETCH_INITIAL_STATE }).then(res => JSON.parse(res));
  store.replaceState(initialState);

  browser.runtime.onMessage.addListener((msg?: any) => {
    if(debug) console.log('Child: onMessage', msg);
    if(!msg) return Promise.resolve();
    if(msg.type === RemoteMessageType.SYNC_MUTATION) {
      const data = JSON.parse(msg.data);
      store.commit(data.type, data.payload);
    }
    return Promise.resolve();
  });
}

export function commit(type: string, payload?: any, options?: CommitOptions) {
  if(debug) console.log('commit', type, payload);
  return browser.runtime.sendMessage({ type: RemoteMessageType.INVOKE_MUTATION, data: { type, payload, options } });
}

export function dispatch(type: string, payload?: any, options?: DispatchOptions) {
  if(debug) console.log('dispatch SEND:', type, payload);
  return browser.runtime.sendMessage({ type: RemoteMessageType.INVOKE_ACTION, data: { type, payload, options } })
      .then(a => {
      if(debug) console.log('dispatch RETURN: ', a);
      return a != null ? JSON.parse(a) : a;
    }, e => {
      if(debug) console.error('dispatch ERROR: ', e);
      throw e;
    });
}

export function initializeRemoteMaster<S = any>(store: Store<S>) {
  if(debug) console.log('Initializing remote master!');
  browser.runtime.onMessage.addListener(async (msg: any) => {
    if(debug) console.log('Master: onMessage', msg);
    if(!msg)
      return;
    else if(msg.type === RemoteMessageType.FETCH_INITIAL_STATE) {
      return JSON.stringify(store.state);
    } else if(msg.type === RemoteMessageType.INVOKE_ACTION)
      return store.dispatch(msg.data.type, msg.data.payload, msg.data.options)
                  .then(a => a != null ? JSON.stringify(a) : a,
                  e => {
                    if(debug) console.error('Master Store Dispatch ERROR: ', e);
                    throw e;
                  });
    else if(msg.type === RemoteMessageType.INVOKE_MUTATION) {
      store.commit(msg.data.type, msg.data.payload, msg.data.options);
    }
  });

  // Sync mutations on change with other parts of extension
  store.subscribe((mutation) => {
    if(debug) console.log('Master MUTATION: ', mutation);
    browser.runtime.sendMessage({
      type: RemoteMessageType.SYNC_MUTATION,
      data: JSON.stringify(mutation)
    });
  });
}
