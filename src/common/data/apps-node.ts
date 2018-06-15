import { HDNode } from 'bitcoinjs-lib';
import { AppNode, hashCode } from './app-node';
import { createHash } from 'crypto';

export class AppsNode {
  private _node: HDNode;
  private _salt: string;

  constructor(node: HDNode, salt: string) {
    this._node = node;
    this._salt = salt;
  }

  get node() { return this._node; }
  get salt() { return this._salt; }

  getAppNode(appDomain: string) {
    const hash = createHash('sha256').update(`${appDomain}${this.salt}`).digest('hex');
    const appIndex = hashCode(hash);
    return new AppNode(this.node.deriveHardened(appIndex), appDomain);
  }

  toBase58() {
    return this.node.toBase58();
  }
}

export default AppsNode;
