import { payments } from 'bitcoinjs-lib';
import bip32 from 'bip32';
import { createCipher, createDecipher } from 'crypto';

export function getAddress(node: bip32, network?: any) {
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
