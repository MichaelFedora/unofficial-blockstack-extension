import 'isomorphic-fetch';
export declare class Service {
    static validateProof(proof: Object, ownerAddress: string, name?: string): Promise<any>;
    static getBaseUrls(): any[];
    static getProofIdentity(searchText: string): string;
    static getProofStatement(searchText: string): string;
    static shouldValidateIdentityInBody(): boolean;
    static prefixScheme(proofUrl: string): string;
    static getProofUrl(proof: Object): any;
}
