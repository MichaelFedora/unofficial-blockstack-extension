import { Service } from './service';
declare class Github extends Service {
    static getBaseUrls(): string[];
    static getProofUrl(proof: Object): string;
}
export { Github };
