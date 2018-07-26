import axios, { AxiosResponse } from 'axios';
// @ts-ignore
import { payments } from 'bitcoinjs-lib';
import bip32 from 'bip32';
import { createCipher, createDecipher } from 'crypto';

export const BLOCKSTACK_INC = 'gaia-hub'

export function isABlockstackName(s) {
  return /^[a-z0-9_-]+\.[a-z0-9_-]+$/.test(s)
}

export function isABlockstackIDName(s) {
  return /^[a-z0-9_]+\.id$/.test(s)
}

export function isABlockstackAppName(s) {
  return /^[a-z0-9-]+\.app$/.test(s)
}

export function getAddress(node: bip32, network?: any) {
  return payments.p2pkh({ pubkey: node.publicKey }).address;
}

async function isNameAvailable(lookupUrl: string, domainName: string) {
  const url = lookupUrl.replace('{name}', domainName);
  return axios.get(url).then(res => {
    if(res.status >= 200 && res.status < 300) return false;
    if(res.status === 404) return true;
    console.error('Name Available Check went awry: ', res);
    throw new Error(`Name Available Check went awry! (${res.status}) ${res.statusText}`)
  });
}

async function getNamePrices(priceUrl: string, domainName: string): Promise<{
  name_price: { satoshis: number, btc: number },
  total_tx_fees: number,
  register_tx_fee: { satoshis: number, btc: number },
  preorder_tx_fee: { satoshis: number, btc: number },
  warnings: string[],
  total_estimated_cost: { satoshis: number, btc: number },
  update_tx_fee: { satoshis: number, btc: number }
}> {
  if(!/^[a-z0-9_-]+\.[a-z0-9_-]+$/.test(domainName))
    throw new Error(`Domain name ${domainName} is not a blockstack name!`);

  const url = priceUrl.replace('{name}', domainName) + '?single_sig=1';
  let res: AxiosResponse;
  try {
    res = await axios.get(url);
  } catch(e) {
    throw new Error('Error retrieving price: ' + e);
  }

  if(res.status >= 200 && res.status < 300) {
    return res.data;
  } else {
    throw new Error(`Price response was not OK: (${res.status}) ${res.statusText}`);
  }
}

export async function checkNameAvailabilityAndPrice(
  api: { subdomains: {[key: string]: any}, nameLookupUrl: string, priceUrl: string },
  domainName: string) {

  const nameTokens = domainName.split('.');
  if(nameTokens.length >= 3) { // is subdomain
    const subdomain = nameTokens.slice(1).reduce((acc, v) => acc += '.' + v);
    if(!api.subdomains[subdomain]) {
      console.error(`No config for subdomain ${subdomain}!`);
      throw new Error(`No config for subdomain ${subdomain}!`);
    }
  }

  const ret = {
    nameAvailable: false,
    namePrice: 0
  };

  const isAvailable = await isNameAvailable(api.nameLookupUrl, domainName);
  if(isAvailable) {
    ret.nameAvailable = true;
    if(nameTokens.length >= 3) {
      ret.namePrice = 0;
    } else {
      const prices = await getNamePrices(api.priceUrl, domainName);
      ret.namePrice = prices.total_estimated_cost.btc;
    }
  }
  return ret;
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
