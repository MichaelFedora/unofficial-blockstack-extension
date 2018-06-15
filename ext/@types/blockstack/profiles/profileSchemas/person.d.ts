import { Profile } from '../profile';
export declare class Person extends Profile {
    constructor(profile?: any);
    static validateSchema(profile: any, strict?: boolean): any;
    static fromToken(token: any, publicKeyOrAddress?: any): Person;
    static fromLegacyFormat(legacyProfile: any): Person;
    toJSON(): {
        profile: any;
        name: any;
        givenName: any;
        familyName: any;
        description: any;
        avatarUrl: any;
        verifiedAccounts: any;
        address: any;
        birthDate: any;
        connections: any[];
        organizations: any;
    };
    profile(): any;
    name(): any;
    givenName(): any;
    familyName(): any;
    description(): any;
    avatarUrl(): any;
    verifiedAccounts(verifications: any): any[];
    address(): any;
    birthDate(): any;
    connections(): any[];
    organizations(): any;
}
