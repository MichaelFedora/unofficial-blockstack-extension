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

interface Verification {
  service: string;
  proof_url: string;
  identifier: string;
  valid: boolean;
}

export class LocalIdentity {
  username?: string;
  usernames: string[];
  usernameOwned: boolean;
  usernamePending: boolean;
  profile: Profile;
  verifications: Verification[];
  trustLevel: number;
  registered: boolean;
  ownerAddress: string;
  zoneFile: string;
  canAddUsername: boolean;
  constructor(ownerAddress: string) {
    this.username = null;
    this.usernames = [];
    this.usernameOwned = false;
    this.usernamePending = false;
    this.profile = Object.assign({}, DEFAULT_PROFILE);
    this.verifications = [];
    this.trustLevel = 0;
    this.registered = false;
    this.ownerAddress = ownerAddress;
    this.zoneFile = '';
    this.canAddUsername = false;
  }
}

export interface IdentityStateType {
  default: number;
  localIdentities: LocalIdentity[];
  createProfileError: boolean;
}
