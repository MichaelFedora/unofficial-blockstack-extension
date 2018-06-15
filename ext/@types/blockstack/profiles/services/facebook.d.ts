import { Service } from './service';
declare class Facebook extends Service {
    static getProofUrl(proof: Object): any;
    static normalizeFacebookUrl(proof: Object): any;
    static getProofStatement(searchText: string): any;
}
export { Facebook };
