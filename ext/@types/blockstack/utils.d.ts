import { ECPair } from 'bitcoinjs-lib';
export declare const BLOCKSTACK_HANDLER = "blockstack";
/**
 * Time
 * @private
 */
export declare function nextYear(): Date;
export declare function nextMonth(): Date;
export declare function nextHour(): Date;
/**
 * Query Strings
 * @private
 */
export declare function updateQueryStringParameter(uri: string, key: string, value: string): string;
/**
 * Versioning
 * @param {string} v1 - the left half of the version inequality
 * @param {string} v2 - right half of the version inequality
 * @returns {bool} iff v1 >= v2
 * @private
 */
export declare function isLaterVersion(v1: string, v2: string): boolean;
export declare function hexStringToECPair(skHex: string): any;
export declare function ecPairToHexString(secretKey: ECPair): any;
/**
 * UUIDs
 * @private
 */
export declare function makeUUID4(): string;
/**
 * Checks if both urls pass the same origin check & are absolute
 * @param  {[type]}  uri1 first uri to check
 * @param  {[type]}  uri2 second uri to check
 * @return {Boolean} true if they pass the same origin check
 * @private
 */
export declare function isSameOriginAbsoluteUrl(uri1: string, uri2: string): boolean;
