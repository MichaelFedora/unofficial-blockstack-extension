/// <reference types="node" />
export declare function getHexFromBN(bnInput: any): any;
/**
 * Encrypt content to elliptic curve publicKey using ECIES
 * @private
 * @param {String} publicKey - secp256k1 public key hex string
 * @param {String | Buffer} content - content to encrypt
 * @return {Object} Object containing (hex encoded):
 *  iv (initialization vector), cipherText (cipher text),
 *  mac (message authentication code), ephemeral public key
 *  wasString (boolean indicating with or not to return a buffer or string on decrypt)
 */
export declare function encryptECIES(publicKey: string, content: string | Buffer): {
    iv: string;
    ephemeralPK: any;
    cipherText: string;
    mac: string;
    wasString: boolean;
};
/**
 * Decrypt content encrypted using ECIES
 * @private
 * @param {String} privateKey - secp256k1 private key hex string
 * @param {any} cipherObject - object to decrypt, should contain:
 *  iv (initialization vector), cipherText (cipher text),
 *  mac (message authentication code), ephemeralPublicKey
 *  wasString (boolean indicating with or not to return a buffer or string on decrypt)
 * @return {Buffer} plaintext
 * @throws {Error} if unable to decrypt
 */
export declare function decryptECIES(privateKey: string, cipherObject: any): string | Buffer;
