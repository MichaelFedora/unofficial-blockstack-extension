import { BIP32Interface } from 'bip32';
import { AppNode, hashCode } from './app-node';
import { createHash } from 'crypto';
import { WrappedNode } from './wrapped-node';

export class AppsNode extends WrappedNode {
  private _salt: string;

  constructor(node: BIP32Interface, salt: string) {
    super(node);
    this._salt = salt;
  }

  get salt() { return this._salt; }

  getAppNode(appDomain: string) {
    const hash = createHash('sha256').update(`${appDomain}${this.salt}`).digest('hex');
    const appIndex = hashCode(hash);
    return new AppNode(this.node.deriveHardened(appIndex), appDomain);
  }
}

export default AppsNode;
