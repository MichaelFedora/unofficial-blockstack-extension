import { Service } from './service';
declare class Instagram extends Service {
    static getBaseUrls(): string[];
    static getProofUrl(proof: Object): any;
    static normalizeInstagramUrl(proof: Object): any;
    static shouldValidateIdentityInBody(): boolean;
    static getProofIdentity(searchText: string): any;
    static getProofStatement(searchText: string): any;
}
export { Instagram };
