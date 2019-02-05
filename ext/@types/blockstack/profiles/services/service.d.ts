import 'cross-fetch/polyfill';
export declare class Service {
    static validateProof(proof: Object, ownerAddress: string, name?: string): Promise<Object>;
    static getBaseUrls(): any[];
    static getProofIdentity(searchText: string): string;
    static getProofStatement(searchText: string): string;
    static shouldValidateIdentityInBody(): boolean;
    static prefixScheme(proofUrl: string): string;
    static getProofUrl(proof: Object): any;
}
