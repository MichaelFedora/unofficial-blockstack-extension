import { HDNode } from 'bitcoinjs-lib';
import { AppsNode } from './apps-node';

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

export class IdentityAddressOwnerNode {

  private _node: HDNode;
  private _salt: string;

  private _appsNode: AppsNode;

  constructor(node: HDNode, salt: string) {
    this._node = node;
    this._salt = salt;
    this._appsNode = new AppsNode(this.node.deriveHardened(APPS_NODE_INDEX), this.salt);
  }

  get node() { return this._node; }
  get salt() { return this._salt; }

  get identityKey() {
    return (this.node.keyPair.d.toBuffer(32) as Buffer).toString('hex');
  }

  get identityKeyId() {
    return this.node.keyPair.getPublicKeyBuffer().toString('hex');
  }

  get appsNode() {
    return this._appsNode;
  }

  get address() {
    return this.node.getAddress();
  }

  getEncryptionNode() {
    return this.node.deriveHardened(ENCRYPTION_NODE_INDEX);
  }

  getSigningNode() {
    return this.node.deriveHardened(SIGNING_NODE_INDEX);
  }

  get derivedIdentityKeyPair(): KeyPair {
    return {
      key: this.identityKey,
      keyId: this.identityKeyId,
      address: this.address,
      appsNodeKey: this.appsNode.toBase58(),
      salt: this.appsNode.salt
    };
  }
}
