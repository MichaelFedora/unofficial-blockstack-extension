import { HDNode } from 'bitcoinjs-lib';
import { createHash } from 'crypto';

export function hashCode(string) {
  let hash = 0
  if (string.length === 0) return hash
  for (let i = 0; i < string.length; i++) {
    const character = string.charCodeAt(i)
    hash = (hash << 5) - hash + character
    hash = hash & hash
  }
  return hash & 0x7fffffff
}

export class AppNode {

  private _node: HDNode;
  private _appDomain: string;

  constructor(node: HDNode, appDomain: string) {
    this._node = node;
    this._appDomain = appDomain;
  }

  static fromAppsHdNode(appsHdNode: HDNode, salt: string, appDomain: string) {
    const hash = createHash('sha256').update(`${appDomain}${salt}`).digest('hex');
    const appIndex = hashCode(hash);
    return new AppNode(appsHdNode.deriveHardened(appIndex), appDomain);
  }

  get node() { return this._node; }
  get appDomain() { return this._appDomain; }

  get appPrivateKey() {
    return (this.node.keyPair.d.toBuffer(32) as Buffer).toString('hex');
  }

  get address() {
    return this.node.getAddress();
  }
}

export default AppNode;
