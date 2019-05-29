import { payments, ECPair } from 'bitcoinjs-lib';
import { BIP32Interface } from 'bip32';
import { createCipher, createDecipher, randomBytes } from 'crypto';
import { StateType } from './vuex/stores/types/state';
import { TokenSigner } from 'jsontokens';
import { connectToGaiaHub, uploadToGaiaHub } from 'blockstack';
import { GaiaHubConfig } from 'blockstack/storage';
import { dispatch, commit } from './vuex/remote-interface';

export function getAddress(node: BIP32Interface, network?: any) {
  return payments.p2pkh({ pubkey: node.publicKey }).address;
}

export async function encrypt(data: string, key: string): Promise<string> {
  const cipher = createCipher('aes192', key);
  let enc = cipher.update(data, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

export async function decrypt(data: string, key: string): Promise<string> {
  const decipher = createDecipher('aes192', key);
  let dec = decipher.update(data, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

/** from: the CLI, with modifications */
export function makeAssociationToken(appPrivateKey: string, identityKey: string): string {

  const appPublicKey = ECPair.fromPrivateKey(Buffer.from(appPrivateKey, 'hex'), { compressed: true }).publicKey.toString('hex');
  const identityPublicKey = ECPair.fromPrivateKey(Buffer.from(identityKey, 'hex'), { compressed: true }).publicKey.toString('hex');

  const FOUR_MONTH_SECONDS = 60 * 60 * 24 * 31 * 4; // apparently a standard
  const salt = randomBytes(16).toString('hex');

  const associationTokenClaim = {
    childToAssociate: appPublicKey,
    iss: identityPublicKey,
    exp: FOUR_MONTH_SECONDS + (new Date().getTime() / 1000),
    salt
  };

  const associationToken = new TokenSigner('ES256K', identityKey).sign(associationTokenClaim);

  return associationToken;
}

/** from: https://stackoverflow.com/a/3855394 */
export function parseQuery(query?: string): { [key: string]: string } {
  if(!query) {
    if(window && window.location && window.location.search) query = window.location.search
    else return { }
  }
  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      const [ key, value ] = param.split('=');
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      return params;
    }, { });
}

export function tryUpload(url: string, data: any, hubConfig: GaiaHubConfig, mimeType?: string) {
  const readPrefix = `${hubConfig.url_prefix}${hubConfig.address}/`;
  if(!url.startsWith(readPrefix)) return Promise.reject(new Error(`Url doesn't start with the right prefix!`));
  else url = url.substring(readPrefix.length);
  return uploadToGaiaHub(url, data, hubConfig, mimeType);
}

// Moved out of identity store b/c ArrayBuffer doesn't transfer over in chrome based browsers
export async function uploadProfileImage(state: StateType, index: number, file: ArrayBuffer, name?: string) {
  console.log('got file?:', file);
  name = name || 'avatar-0';
  const id = state.identity.identities.find(a => a.index === index);
  if(!id) throw new Error('No ID found with index ' + index + '!');
  if(!id.profile) throw new Error('No profile in the identity at index ' + index + '!');

  const identityHubConfig = await connectToGaiaHub(state.settings.api.gaiaHubUrl, id.keyPair.key);

  let profileUploadLoc: string = await dispatch('identity/getProfileUploadLocation', index);
  if(profileUploadLoc.endsWith('profile.json'))
    profileUploadLoc = profileUploadLoc.substr(0, profileUploadLoc.length - 'profile.json'.length);
  else
    throw new Error(`Can't determine profile-photo storage location (no profile.json in upload location): ${profileUploadLoc}`);

  const url = profileUploadLoc + '/' + name;
  return tryUpload(url, file, identityHubConfig)
    .catch(() => tryUpload(url, file, state.settings.api.gaiaHubConfig))
    .then(async () => {
      await commit('identity/addProfileImage', { index, payload: { name: name.replace(/-\d+$/, ''), contentUrl: url }});
      return dispatch('identity/upload', { index });
    }, e => Promise.reject(new Error(`Issue writing to ${url}: ` + e)));
}
