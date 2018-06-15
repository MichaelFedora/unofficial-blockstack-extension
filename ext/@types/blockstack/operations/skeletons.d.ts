import BigInteger from 'bigi';
export declare type AmountTypeV1 = number;
export declare type AmountTypeV2 = {
    units: string;
    amount: BigInteger;
};
export declare type AmountType = AmountTypeV1 | AmountTypeV2;
export declare class BlockstackNamespace {
    namespaceID: string;
    version: number;
    lifetime: number;
    coeff: number;
    base: number;
    buckets: Array<number>;
    nonalphaDiscount: number;
    noVowelDiscount: number;
    constructor(namespaceID: string);
    check(): boolean;
    setVersion(version: number): void;
    setLifetime(lifetime: number): void;
    setCoeff(coeff: number): void;
    setBase(base: number): void;
    setBuckets(buckets: Array<number>): void;
    setNonalphaDiscount(nonalphaDiscount: number): void;
    setNoVowelDiscount(noVowelDiscount: number): void;
    toHexPayload(): string;
}
export declare function makePreorderSkeleton(fullyQualifiedName: string, consensusHash: string, preorderAddress: string, burnAddress: string, burn: AmountType, registerAddress?: string): any;
export declare function makeRegisterSkeleton(fullyQualifiedName: string, ownerAddress: string, valueHash?: string): any;
export declare function makeRenewalSkeleton(fullyQualifiedName: string, nextOwnerAddress: string, lastOwnerAddress: string, burnAddress: string, burn: AmountType, valueHash?: string): any;
export declare function makeTransferSkeleton(fullyQualifiedName: string, consensusHash: string, newOwner: string, keepZonefile?: boolean): any;
export declare function makeUpdateSkeleton(fullyQualifiedName: string, consensusHash: string, valueHash: string): any;
export declare function makeRevokeSkeleton(fullyQualifiedName: string): any;
export declare function makeNamespacePreorderSkeleton(namespaceID: string, consensusHash: string, preorderAddress: string, registerAddress: string, burn: AmountType): any;
export declare function makeNamespaceRevealSkeleton(namespace: BlockstackNamespace, revealAddress: string): any;
export declare function makeNamespaceReadySkeleton(namespaceID: string): any;
export declare function makeNameImportSkeleton(name: string, recipientAddr: string, zonefileHash: string): any;
export declare function makeAnnounceSkeleton(messageHash: string): any;
