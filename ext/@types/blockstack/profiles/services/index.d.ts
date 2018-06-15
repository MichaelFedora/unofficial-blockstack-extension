import { Facebook } from './facebook';
import { Github } from './github';
import { Twitter } from './twitter';
import { Instagram } from './instagram';
import { HackerNews } from './hackerNews';
import { LinkedIn } from './linkedIn';
export declare const profileServices: {
    facebook: typeof Facebook;
    github: typeof Github;
    twitter: typeof Twitter;
    instagram: typeof Instagram;
    hackerNews: typeof HackerNews;
    linkedIn: typeof LinkedIn;
};
export { containsValidProofStatement, containsValidAddressProofStatement } from './serviceUtils';
