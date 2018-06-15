/// <reference types="node" />
import { GaiaHubConfig, connectToGaiaHub, uploadToGaiaHub, BLOCKSTACK_GAIA_HUB_LABEL } from './hub';
/**
 * Fetch the public read URL of a user file for the specified app.
 * @param {String} path - the path to the file to read
 * @param {String} username - The Blockstack ID of the user to look up
 * @param {String} appOrigin - The app origin
 * @param {String} [zoneFileLookupURL=null] - The URL
 * to use for zonefile lookup. If falsey, this will use the
 * blockstack.js's getNameInfo function instead.
 * @return {Promise} that resolves to the public read URL of the file
 * or rejects with an error
 */
export declare function getUserAppFileUrl(path: string, username: string, appOrigin: string, zoneFileLookupURL?: string): any;
/**
 * Encrypts the data provided with the transit public key.
 * @param {String|Buffer} content - data to encrypt
 * @param {Object} [options=null] - options object
 * @param {String} options.privateKey - the hex string of the ECDSA private
 * key to use for decryption. If not provided, will use user's appPrivateKey.
 * @return {String} Stringified ciphertext object
 */
export declare function encryptContent(content: string | Buffer, options?: {
    privateKey?: string;
}): string;
/**
 * Decrypts data encrypted with `encryptContent` with the
 * transit private key.
 * @param {String|Buffer} content - encrypted content.
 * @param {Object} [options=null] - options object
 * @param {String} options.privateKey - the hex string of the ECDSA private
 * key to use for decryption. If not provided, will use user's appPrivateKey.
 * @return {String|Buffer} decrypted content.
 */
export declare function decryptContent(content: string, options?: {
    privateKey?: string;
}): string | Buffer;
/**
 * Retrieves the specified file from the app's data store.
 * @param {String} path - the path to the file to read
 * @param {Object} [options=null] - options object
 * @param {Boolean} [options.decrypt=true] - try to decrypt the data with the app private key
 * @param {String} options.username - the Blockstack ID to lookup for multi-player storage
 * @param {String} options.app - the app to lookup for multi-player storage -
 * defaults to current origin
 * @param {String} [options.zoneFileLookupURL=null] - The URL
 * to use for zonefile lookup. If falsey, this will use the
 * blockstack.js's getNameInfo function instead.
 * @returns {Promise} that resolves to the raw data in the file
 * or rejects with an error
 */
export declare function getFile(path: string, options?: {
    decrypt?: boolean;
    username?: string;
    app?: string;
    zoneFileLookupURL?: string;
}): Promise<any>;
/**
 * Stores the data provided in the app's data store to to the file specified.
 * @param {String} path - the path to store the data in
 * @param {String|Buffer} content - the data to store in the file
 * @param {Object} [options=null] - options object
 * @param {Boolean} [options.encrypt=true] - encrypt the data with the app private key
 * @return {Promise} that resolves if the operation succeed and rejects
 * if it failed
 */
export declare function putFile(path: string, content: string | Buffer, options?: {
    encrypt?: boolean;
}): Promise<any>;
/**
 * Get the app storage bucket URL
 * @param {String} gaiaHubUrl - the gaia hub URL
 * @param {String} appPrivateKey - the app private key used to generate the app address
 * @returns {Promise} That resolves to the URL of the app index file
 * or rejects if it fails
 */
export declare function getAppBucketUrl(gaiaHubUrl: string, appPrivateKey: string): Promise<any>;
/**
 * Deletes the specified file from the app's data store. Currently not implemented.
 * @param {String} path - the path to the file to delete
 * @returns {Promise} that resolves when the file has been removed
 * or rejects with an error
 * @private
 */
export declare function deleteFile(path: string): void;
export { connectToGaiaHub, uploadToGaiaHub, BLOCKSTACK_GAIA_HUB_LABEL, GaiaHubConfig };
