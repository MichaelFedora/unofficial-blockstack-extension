import { Service } from './service';
declare class LinkedIn extends Service {
    static getBaseUrls(): string[];
    static getProofUrl(proof: Object): any;
    static shouldValidateIdentityInBody(): boolean;
    static getProofIdentity(searchText: string): any;
    static getProofStatement(searchText: string): string;
}
export { LinkedIn };
