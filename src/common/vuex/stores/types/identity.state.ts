import { KeyPair } from 'common/data/identity-address-owner-node';

export const DEFAULT_PROFILE: Profile = {
  '@type': 'Person',
  '@context': 'http://schema.org'
}

export interface Profile {
  '@type': 'Person';
  '@context': 'http://schema.org';
  name?: string;
  givenName?: string;
  familyName?: string;
  description?: string;
  image?: {
    '@type': 'ImageObject',
    name: string,
    contentUrl: string
  }[];
  account?: {
    '@type': 'Account',
    placeholder?: boolean,
    service: string,
    identifier: string,
    proofType: 'http' | 'https',
    proofUrl: string
  }[];
  apps?: { [key: string]: string };
}

/*interface Verification {
  service: string;
  proof_url: string;
  identifier: string;
  valid: boolean;
}*/

export class LocalIdentity {
  username?: string;
  usernames: string[];
  usernameOwned: boolean;
  usernamePending: boolean;
  profile: Profile;
  address: string;
  zoneFile: string;

  keyPair: KeyPair;
  index: number;

  constructor(keyPair: KeyPair, index: number) {
    this.username = null;
    this.usernames = [];
    this.usernameOwned = false;
    this.usernamePending = false;
    this.profile = Object.assign({}, DEFAULT_PROFILE);
    this.address = keyPair.address;
    this.zoneFile = '';

    this.keyPair = keyPair;
    this.index = index;
  }
}

export interface IdentityStateType {
  publicKeychain: string;
  default: number;
  identities: LocalIdentity[];
}
