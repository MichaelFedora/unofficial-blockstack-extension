import { Profile } from '../profile';
export declare class Organization extends Profile {
    constructor(profile?: any);
    static validateSchema(profile: any, strict?: boolean): any;
    static fromToken(token: any, publicKeyOrAddress?: any): Organization;
}
