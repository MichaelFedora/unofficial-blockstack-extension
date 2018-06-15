import { Store } from 'vuex';

import { CONNECTION_NAME, RemoteMessageType, hash } from './shared';

let store: Store<any> = null as any;
let receivedMutation = false;
// const mutationHashes: {[key: string]: boolean} = {};

function handleMessage(msg?: any) {
  if(!msg) return;
  if(msg.type === RemoteMessageType.INITIAL_STATE) {
    console.log('Initializing state!');
    store.replaceState(msg.data);
  } else if (msg.type === RemoteMessageType.SYNC_MUTATION) {
    receivedMutation = true;
    // mutationHashes[hash(msg.data)] = true;
    store.commit(msg.data.type, msg.data.payload);
  }
}

export default function getSharedStore(str) {

  if (typeof str !== 'object') {
    throw new Error(`Wrong type of vuex store, are you sure that you use store instance?`);
  }

  store = str;

  // Init connection with the background
  const connection = browser.runtime.connect(undefined, { name: CONNECTION_NAME });

  connection.onMessage.addListener(handleMessage);
  console.log('Connected to background!');

  // Watch for mutation changes
  const unsubscribe = store.subscribe((mutation) => {
    const h = hash(mutation);
    if (!receivedMutation/*mutationHashes[h]*/) {
      connection.postMessage({
        type: RemoteMessageType.SYNC_MUTATION,
        data: mutation
      });
    } else {
      // delete mutationHashes[h];
      receivedMutation = false;
    }
  });

  connection.onDisconnect.addListener(() => {
    unsubscribe();
  });

  return store;
}
