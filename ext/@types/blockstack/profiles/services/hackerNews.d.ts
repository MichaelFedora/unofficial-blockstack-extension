import { Service } from './service';
declare class HackerNews extends Service {
    static getBaseUrls(): string[];
    static getProofUrl(proof: Object): string;
    static getProofStatement(searchText: string): string;
}
export { HackerNews };
