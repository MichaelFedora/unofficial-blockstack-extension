import { KeyPair } from 'common/data/identity-address-owner-node';

export interface AccountStateType {
  accountCreated: boolean;
  email: string; // dumb =T
  encryptedBackupPhrase: string;
  publicIdentityKeychain: string;
  identities: {
    keyPair: KeyPair;
    index: number;
  }[];
  bitcoinAccount: {
    publicKeychain: string;
    addresses: string[];
    balances: { [key: string]: number, total: number };
    addressIndex: number;
  };
}

export const SATOSHIS_IN_BTC = 100000000;
