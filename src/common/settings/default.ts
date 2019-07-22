import { GaiaHubConfig } from 'blockstack/lib/storage/hub';

export const DEFAULT_CORE_API_ENDPOINT = 'https://core.blockstack.org'
export const REGTEST_CORE_API_ENDPOINT = 'http://localhost:6270'

export const DEFAULT_GAIA_HUB = 'https://hub.blockstack.org'

const DEFAULT_API = {
  coreApi: DEFAULT_CORE_API_ENDPOINT,
  // apiCustomizationEnabled: true,
  nameLookupUrl: '{coreApi}/v1/names/{name}',
  // searchServiceUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/search?query={query}`,
  // registerUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/names`,
  bitcoinAddressLookupUrl: '{coreApi}/v1/addresses/bitcoin/{address}',
  // zeroConfBalanceUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/wallet/balance/0`,
  // insightUrl: 'https://utxo.blockstack.org/insight-api/addr/{address}',
  // broadcastUrl: 'https://utxo.blockstack.org/insight-api/tx/send',
  // priceUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/prices/names/{name}`,
  // walletPaymentAddressUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/wallet/payment_address`,
  // pendingQueuesUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/blockchains/bitcoin/pending`,
  // coreWalletWithdrawUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/wallet/balance`,
  // bitcoinAddressUrl: 'https://explorer.blockstack.org/address/{identifier}',
  // ethereumAddressUrl: 'https://tradeblock.com/ethereum/account/{identifier}',
  // pgpKeyUrl: 'https://pgp.mit.edu/pks/lookup?search={identifier}&op=vindex&fingerprint=on',
  // corePingUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/node/ping`,
  // zoneFileUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/names/{name}/zonefile`,
  // nameTransferUrl: `${DEFAULT_CORE_API_ENDPOINT}/v1/names/{name}/owner`,
  /*subdomains: {
    'foo.id': {
      registerUrl: 'http://localhost:7103/register'
    }
  } as { [key: string]: { registerUrl: string } },*/
  // browserServerUrl: 'https://blockstack-browser-server.appartisan.com',
  // hostedDataLocation: BLOCKSTACK_INC, // which is `gaia-hub`
  // coreHost: 'localhost',
  // corePort: 6270,
  // coreApiPassword: DEFAULT_CORE_PHONY_PASSWORD, // which is `PretendPasswordAPI`
  // regTestMode: false,
  storageConnected: false,
  gaiaHubConfig: null as GaiaHubConfig,
  gaiaHubUrl: 'https://hub.blockstack.org',

  // btcPriceUrl: 'https://www.bitstamp.net/api/v2/ticker/btcusd/?cors=1',
  // networkFeeUrl: 'https://bitcoinfees.21.co/api/v1/fees/recommended',
}

export type ApiSettingsType = typeof DEFAULT_API;

export function makeDefaultApiClone(): ApiSettingsType {
  return {
    // actual settings
    coreApi: DEFAULT_CORE_API_ENDPOINT,
    gaiaHubUrl: DEFAULT_GAIA_HUB,

    // things used by storage setup
    storageConnected: false,
    gaiaHubConfig: null as GaiaHubConfig,

    // things used by the app
    nameLookupUrl: `{coreApi}/v1/names/{name}`,
    bitcoinAddressLookupUrl: `{coreApi}/v1/addresses/bitcoin/{address}`,
  }
}

export default DEFAULT_API
