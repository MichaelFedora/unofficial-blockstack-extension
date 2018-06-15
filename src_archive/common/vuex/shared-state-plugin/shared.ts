import { createHash } from 'crypto';

export const CONNECTION_NAME = 'vuex-webext';

export enum RemoteMessageType {
  INITIAL_STATE = '@@STORE_INITIAL_STATE',
  SYNC_MUTATION = '@@STORE_SYNC_MUTATION',
  INVOKE_MUTATION = '@@STORE_INVOKE_MUTATION',
  INVOKE_ACTION = '@@STORE_INVOKE_ACTION'
};

export function hash(mutation: any) {
  return createHash('sha256').update(JSON.stringify(mutation)).digest('base64');
}

export function senderHash(sender: browser.runtime.MessageSender) {
  if(!sender) return '';
  return hash('' +
      sender.frameId +
      sender.id +
      ( (sender.tab && sender.tab.id !== browser.tabs.TAB_ID_NONE) ?
          sender.tab.id :
          ''
      ) +
      sender.url);
}
