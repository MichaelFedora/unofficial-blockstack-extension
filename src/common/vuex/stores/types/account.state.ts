import { KeyPair } from '../../../data/identity-address-owner-node';

export interface AccountStateType {
  accountCreated: boolean;
  promptedForEmail: boolean;
  email: string;
  encryptedBackupPhrase: string;
  identityAccount: {
    publicKeychain: string;
    addresses: string[];
    keypairs: KeyPair[];
    addressIndex: number;
  };
  bitcoinAccount: {
    publicKeychain: string;
    addresses: string[];
    balances: { [key: string]: number, total: number };
    addressIndex: number;
  };
  viewedRecoveryCode: boolean;
  connectedStorageAtLeastOnce: boolean;
}

export const SATOSHIS_IN_BTC = 100000000;
