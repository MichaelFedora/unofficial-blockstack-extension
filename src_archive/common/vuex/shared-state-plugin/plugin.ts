import { Plugin, CommitOptions, DispatchOptions } from 'vuex';
import { RemoteMessageType, CONNECTION_NAME } from './shared';

export function SharedStateForegroundPlugin<S = any>(): Plugin<S> {
  return store => {
    const connection = browser.runtime.connect(undefined, { name: CONNECTION_NAME });

    connection.onMessage.addListener((msg?: any) => {
      if(!msg) return;
      if(msg.type === RemoteMessageType.INITIAL_STATE) {
        console.log('Initializing state!');
        store.replaceState(msg.data);
      } else if (msg.type === RemoteMessageType.SYNC_MUTATION) {
        store.commit(msg.data.type, msg.data.payload);
      }
    });

    console.log('Connected to background!');

    store.registerModule('sharedStateModule' as any, {
      mutations: {
        remote(_, data?: { type: string, data?: any, options?: CommitOptions }) {
          browser.runtime.sendMessage({ type: RemoteMessageType.INVOKE_MUTATION, data })
        }
      },
      actions: {
        commit(_, data?: { type: string, data?: any, options?: CommitOptions }) {
          return browser.runtime.sendMessage({ type: RemoteMessageType.INVOKE_MUTATION, data })
        },
        remote(_, data?: { type: string, data?: any, options?: DispatchOptions }) {
          return browser.runtime.sendMessage({ type: RemoteMessageType.INVOKE_ACTION, data })
        }
      }
    });
  };
};
