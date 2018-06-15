import Vuex, { Store } from 'vuex';

import { CONNECTION_NAME, RemoteMessageType, hash, senderHash } from './shared';

let store: Store<any> = null as any;
let receivedMutation = false;
// const mutationHashes: {[key: string]: string} = {};

function handleMessage(conn: browser.runtime.Port, msg?: any) {
  if(msg.type === RemoteMessageType.SYNC_MUTATION) {
    receivedMutation = true;
    // mutationHashes[hash(msg.data)] = senderHash(conn.sender);
    store.commit(msg.data.type, msg.data.payload, msg.data.options);
  } else if(msg.type === RemoteMessageType.INVOKE_ACTION) {
    store.dispatch(msg.data.type, msg.data.payload, msg.data.options);
  } else if(msg.type === RemoteMessageType.INVOKE_MUTATION) {
    store.commit(msg.data.type, msg.data.payload, msg.data.options);
  }
}

function handleConnection(connection: browser.runtime.Port) {

  if (connection.name !== CONNECTION_NAME) {
    console.warn('Not syncing: wrong connection name "' + connection.name + '"!');
    return;
  }
  console.log('Connected to foreground!');

  // Send current state on connect
  connection.postMessage({
    type: RemoteMessageType.INITIAL_STATE,
    data: store.state
  });

  connection.onMessage.addListener((msg?: any) => handleMessage(connection, msg));

  // Sync mutations on change with other parts of extension
  const unsubscribe = store.subscribe((mutation) => {
    // const h = hash(mutation);
    if (!receivedMutation/*mutationHashes[h]*/) {
      connection.postMessage({
        type: RemoteMessageType.SYNC_MUTATION,
        data: mutation
      });
    } else {
      /*if(senderHash(connection.sender) !== mutationHashes[h]) {
        connection.postMessage({
          type: RemoteMessageType.SYNC_MUTATION,
          data: mutation
        });
      }
      delete mutationHashes[h];*/
      receivedMutation = false;
    }
  });

  // Unsuscribe on disconnect
  connection.onDisconnect.addListener(() => {
    unsubscribe();
  });
}

export default function setSharedStore(str) {

  if (typeof str !== 'object') {
    throw new Error(`Wrong type of vuex store, are you sure that you use store instance?`);
  }

  store = str;

  // Initialize connection with other webextension parts
  browser.runtime.onConnect.addListener(handleConnection);

  return store;
}
