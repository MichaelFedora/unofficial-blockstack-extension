import { getAddress } from '../util';
import { ECPair } from 'bitcoinjs-lib';
import * as bip32 from 'bip32';
import { BIP32Interface } from 'bip32';

export class WrappedNode {

  private _node: BIP32Interface;
  private _keyPair: ECPair;

  constructor(node: BIP32Interface) {
    if(node instanceof WrappedNode)
      this._node = node.node;
    else
      this._node = node;
    if(this._node.privateKey)
      // @ts-ignore
      this._keyPair = ECPair.fromPrivateKey(this._node.privateKey);
    else if(this._node.publicKey)
      // @ts-ignore
      this._keyPair = ECPair.fromPublicKey(this._node.publicKey);
    else
      this._keyPair = null;
  }

  public static fromBase58(base58: string, network?: any) {
    return new WrappedNode(bip32.fromBase58(base58, network));
  }

  public static fromPrivateKey(privateKey: any, chainCode: any, network?: any) {
    return new WrappedNode(bip32.fromPrivateKey(privateKey, chainCode, network));
  }

  public static fromPublicKey(publicKey: any, chainCode: any, network?: any) {
    return new WrappedNode(bip32.fromPublicKey(publicKey, chainCode, network));
  }

  public static fromSeed(seed: Buffer, network?: any) {
    return new WrappedNode(bip32.fromSeed(seed, network));
  }

  public get node() { return this._node; }
  public get keyPair() { return this._keyPair; }
  public getAddress() { return getAddress(this._node); }

  public get chainCode() { return this._node.chainCode; }
  public get depth() { return this._node.depth; }
  public get index() { return this._node.index; }
  public get network() { return this._node.network; }
  public get parentFingerprint() { return this._node.parentFingerprint; }

  public get identifier() { return this._node.identifier; }
  public get fingerprint() { return this._node.fingerprint; }
  public get privateKey() { return this._node.privateKey; }
  public get publicKey() { return this._node.publicKey; }

  public isNeutered() { return this._node.isNeutered(); }
  public neutered() { return new WrappedNode(this._node.neutered()); }

  public toBase58() { return this._node.toBase58(); }
  public toWIF() { return this._node.toWIF(); }

  public derive(index: number) { return new WrappedNode(this._node.derive(index)); }
  public deriveHardened(index: number) { return new WrappedNode(this._node.deriveHardened(index)); }
  public derivePath(path: string) { return new WrappedNode(this._node.derivePath(path)); }

  public sign(hash: any) { return this._node.sign(hash); }
  public verify(hash: Buffer, signature: Buffer) { return this._node.verify(hash, signature); }
}
