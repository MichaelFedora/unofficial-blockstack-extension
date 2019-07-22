import { verifyProfileToken } from 'blockstack';
import { TokenVerifier, decodeToken } from 'jsontokens';

export const VALID_AUTH_SCOPES = {
  store_write: true,
  email: true,
  publish_data: true
}

export function validateAuthScopes(scopes: Array<string>): boolean {
  if (!scopes) return false;
  if (scopes.length === 0) return true;
  for (const scope of scopes)
    if(VALID_AUTH_SCOPES[scope] !== true) return false;
  return true;
}

export function verifyToken(token: string) {
  const decodedToken = decodeToken(token);
  if(typeof decodedToken.payload === 'string')
    throw new Error('Error verifying token: payload is *still* a string');
  const tokenVerifier = new TokenVerifier(decodedToken.header.alg, decodedToken.payload.issuer.publicKey)
  return (tokenVerifier && tokenVerifier.verify(token)) ? true : false;
}

export function verifyProfileTokenRecord(tokenRecord: any, publicKeyOrAddress: string) {
  if(publicKeyOrAddress == null) throw new Error('A public key or keychain is required!');
  if(typeof publicKeyOrAddress !== 'string') throw new Error('An address or public key must be a string to be valid!');
  return verifyProfileToken(tokenRecord.token, publicKeyOrAddress);
}

export interface AuthTokenHeader {
  typ: string,
  alg: string;
}

export interface AuthTokenPayload {
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  public_keys: string[];
  domain_name: string;
  manifest_uri: string;
  redirect_uri: string;
  version: string;
  do_not_include_profile: boolean;
  supports_hub_url: boolean;
  scopes: string[];
  hubUrl?: string;
  associationToken?: string;
}
