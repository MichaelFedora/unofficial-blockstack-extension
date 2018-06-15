import { Service } from './service';
declare class Twitter extends Service {
    static getBaseUrls(): string[];
    static getProofStatement(searchText: string): any;
}
export { Twitter };
