export declare class Profile {
    constructor(profile?: any);
    toJSON(): any;
    toToken(privateKey: any): any;
    static validateSchema(profile: any, strict?: boolean): any;
    static fromToken(token: any, publicKeyOrAddress?: any): Profile;
    static makeZoneFile(domainName: any, tokenFileURL: any): any;
    static validateProofs(domainName: any): Promise<any>;
}
