export declare const BLOCKSTACK_GAIA_HUB_LABEL = "blockstack-gaia-hub-config";
export declare type GaiaHubConfig = {
    address: string;
    url_prefix: string;
    token: string;
    server: string;
};
export declare function uploadToGaiaHub(filename: string, contents: any, hubConfig: GaiaHubConfig, contentType?: string): Promise<any>;
export declare function getFullReadUrl(filename: string, hubConfig: GaiaHubConfig): string;
export declare function connectToGaiaHub(gaiaHubUrl: string, challengeSignerHex: string): Promise<any>;
/**
 * These two functions are app-specific connections to gaia hub,
 *   they read the user data object for information on setting up
 *   a hub connection, and store the hub config to localstorage
 * @private
 * @returns {Promise} that resolves to the new gaia hub connection
 */
export declare function setLocalGaiaHubConnection(): Promise<any>;
export declare function getOrSetLocalGaiaHubConnection(): Promise<any>;
export declare function getBucketUrl(gaiaHubUrl: any, appPrivateKey: any): Promise<any>;
