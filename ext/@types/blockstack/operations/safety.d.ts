export declare const safety: {
    addressCanReceiveName: (address: string) => Promise<boolean>;
    isInGracePeriod: (fullyQualifiedName: string) => Promise<boolean>;
    ownsName: (fullyQualifiedName: string, ownerAddress: string) => Promise<boolean>;
    isNameAvailable: (fullyQualifiedName: string) => Promise<boolean>;
    isNameValid: (fullyQualifiedName?: string) => Promise<boolean>;
    isNamespaceValid: (namespaceID: string) => Promise<boolean>;
    isNamespaceAvailable: (namespaceID: string) => Promise<boolean>;
    revealedNamespace: (namespaceID: string, revealAddress: string) => Promise<boolean>;
    namespaceIsReady: (namespaceID: string) => Promise<any>;
    namespaceIsRevealed: (namespaceID: string) => Promise<boolean>;
};
