import { BIP32Interface } from 'bip32';
import { AppsNode } from './apps-node';
import { WrappedNode } from './wrapped-node';

const APPS_NODE_INDEX = 0
const SIGNING_NODE_INDEX = 1
const ENCRYPTION_NODE_INDEX = 2

export interface KeyPair {
  key: string;
  keyId: string;
  address: string;
  appsNodeKey: string;
  salt: string;
}

export class IdentityAddressOwnerNode extends WrappedNode {

  private _salt: string;

  private _appsNode: AppsNode;

  constructor(node: BIP32Interface, salt: string) {
    super(node);
    this._salt = salt;
    this._appsNode = new AppsNode(this.node.deriveHardened(APPS_NODE_INDEX), this.salt);
  }

  get salt() { return this._salt; }

  getIdentityKey() {
    // @ts-ignore
    return this.keyPair.privateKey.toString('hex');
  }

  getIdentityKeyId() {
    // @ts-ignore
    return this.keyPair.publicKey.toString('hex');
  }

  get appsNode() {
    return this._appsNode;
  }

  getEncryptionNode() {
    return this.node.deriveHardened(ENCRYPTION_NODE_INDEX);
  }

  getSigningNode() {
    return this.node.deriveHardened(SIGNING_NODE_INDEX);
  }

  get derivedIdentityKeyPair(): KeyPair {
    return {
      key: this.getIdentityKey(),
      keyId: this.getIdentityKeyId(),
      address: this.getAddress(),
      appsNodeKey: this.appsNode.toBase58(),
      salt: this.appsNode.salt
    };
  }
}
