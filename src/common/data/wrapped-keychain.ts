import { HDNode } from 'bitcoinjs-lib';
import { createHash } from 'crypto';

import { IdentityAddressOwnerNode } from './identity-address-owner-node';

const IDENTITY_KEYCHAIN = 888;
const BLOCKSTACK_ON_BITCOIN = 0;

const BIP_44_PURPOSE = 44;
const BITCOIN_COIN_TYPE = 0;
const ACCOUNT_INDEX = 0;

export class WrappedKeychain {
  private node: HDNode;

  private _identityPrivateKeychain: HDNode;
  private _identityPublicKeychain: HDNode;

  private _bitcoinPrivateKeychain: HDNode;
  private _bitcoinPublicKeychain: HDNode;

  private derivedIdentityKeyPair;

  constructor(hdNode: HDNode) {
    this.node = hdNode;
    this._identityPrivateKeychain = this.node.deriveHardened(IDENTITY_KEYCHAIN).deriveHardened(BLOCKSTACK_ON_BITCOIN);
    this._identityPublicKeychain = this._identityPrivateKeychain.neutered();
    this._bitcoinPrivateKeychain = this.node.deriveHardened(BIP_44_PURPOSE).deriveHardened(BITCOIN_COIN_TYPE).deriveHardened(ACCOUNT_INDEX);
    this._bitcoinPublicKeychain = this._bitcoinPrivateKeychain.neutered();
  }

  get masterKeychain() { return this.node; }

  get identityPrivateKeychain() { return this._identityPrivateKeychain; }
  get identityPublicKeychain() { return this._identityPublicKeychain; }
  get identityKeychain() { return { private: this.identityPrivateKeychain, public: this.identityPublicKeychain }; }

  get bitcoinPrivateKeychain() { return this._bitcoinPrivateKeychain; }
  get bitcoinPublicKeychain() { return this._bitcoinPublicKeychain; }
  get bitcoinKeychain() { return { private: this.bitcoinPrivateKeychain, public: this.bitcoinPublicKeychain }; }

  getIdentityOwnerAddressNode(identityIndex?: number) {
    identityIndex = identityIndex || 0;
    const publicKey = this.identityPrivateKeychain.keyPair.getPublicKeyBuffer().toString('hex');
    const salt = createHash('sha256').update(publicKey).digest('hex');
    return new IdentityAddressOwnerNode(this.identityPrivateKeychain.deriveHardened(identityIndex), salt);
  }

  getBitcoinAddressNode(index: number, options?: Partial<{ address: 'EXTERNAL' | 'CHANGE', keychain: 'PRIVATE' | 'PUBLIC' }>) {
    options = Object.assign({}, { address: 'EXTERNAL', keychain: 'PRIVATE' }, options);
    const chain = options.address === 'CHANGE' ? 1 : 0; // external address
    return ((options.keychain === 'PUBLIC') ?
        this._bitcoinPublicKeychain :
        this._bitcoinPrivateKeychain).derive(chain).derive(index);
  }

  getFirstBitcoinAddress() {
    return this.bitcoinPublicKeychain.derive(0).derive(0);
  }
}

export default WrappedKeychain;
