export interface UTXO {
    value?: number;
    confirmations?: number;
    tx_hash: string;
    tx_output_n: number;
}
export declare class BlockstackNetwork {
    blockstackAPIUrl: string;
    broadcastServiceUrl: string;
    layer1: any;
    DUST_MINIMUM: number;
    includeUtxoMap: any;
    excludeUtxoSet: Array<UTXO>;
    btc: BitcoinNetwork;
    constructor(apiUrl: string, broadcastServiceUrl: string, bitcoinAPI: BitcoinNetwork, network?: any);
    coerceAddress(address: string): any;
    getDefaultBurnAddress(): any;
    getNamePrice(fullyQualifiedName: string): Promise<any>;
    getNamespacePrice(namespaceID: string): Promise<any>;
    getGracePeriod(): Promise<any>;
    getNamesOwned(address: string): Promise<any>;
    getNamespaceBurnAddress(namespace: string): Promise<any>;
    getNameInfo(fullyQualifiedName: string): Promise<any>;
    getNamespaceInfo(namespaceID: string): Promise<any>;
    getZonefile(zonefileHash: string): Promise<string>;
    /**
     * Performs a POST request to the given URL
     * @param  {String} endpoint  the name of
     * @param  {String} body [description]
     * @return {Promise<Object|Error>} Returns a `Promise` that resolves to the object requested.
     * In the event of an error, it rejects with:
     * * a `RemoteServiceError` if there is a problem
     * with the transaction broadcast service
     * * `MissingParameterError` if you call the function without a required
     * parameter
     *
     * @private
     */
    broadcastServiceFetchHelper(endpoint: string, body: any): Promise<Object | Error>;
    /**
    * Broadcasts a signed bitcoin transaction to the network optionally waiting to broadcast the
    * transaction until a second transaction has a certain number of confirmations.
    *
    * @param  {string} transaction the hex-encoded transaction to broadcast
    * @param  {string} transactionToWatch the hex transaction id of the transaction to watch for
    * the specified number of confirmations before broadcasting the `transaction`
    * @param  {number} confirmations the number of confirmations `transactionToWatch` must have
    * before broadcasting `transaction`.
    * @return {Promise<Object|Error>} Returns a Promise that resolves to an object with a
    * `transaction_hash` key containing the transaction hash of the broadcasted transaction.
    *
    * In the event of an error, it rejects with:
    * * a `RemoteServiceError` if there is a problem
    *   with the transaction broadcast service
    * * `MissingParameterError` if you call the function without a required
    *   parameter
    */
    broadcastTransaction(transaction: string, transactionToWatch?: string, confirmations?: number): Promise<Object>;
    /**
     * Broadcasts a zone file to the Atlas network via the transaction broadcast service.
     *
     * @param  {String} zoneFile the zone file to be broadcast to the Atlas network
     * @param  {String} transactionToWatch the hex transaction id of the transaction
     * to watch for confirmation before broadcasting the zone file to the Atlas network
     * @return {Promise<Object|Error>} Returns a Promise that resolves to an object with a
     * `transaction_hash` key containing the transaction hash of the broadcasted transaction.
     *
     * In the event of an error, it rejects with:
     * * a `RemoteServiceError` if there is a problem
     *   with the transaction broadcast service
     * * `MissingParameterError` if you call the function without a required
     *   parameter
     */
    broadcastZoneFile(zoneFile: string, transactionToWatch?: string): Promise<any>;
    /**
     * Sends the preorder and registration transactions and zone file
     * for a Blockstack name registration
     * along with the to the transaction broadcast service.
     *
     * The transaction broadcast:
     *
     * * immediately broadcasts the preorder transaction
     * * broadcasts the register transactions after the preorder transaction
     * has an appropriate number of confirmations
     * * broadcasts the zone file to the Atlas network after the register transaction
     * has an appropriate number of confirmations
     *
     * @param  {String} preorderTransaction the hex-encoded, signed preorder transaction generated
     * using the `makePreorder` function
     * @param  {String} registerTransaction the hex-encoded, signed register transaction generated
     * using the `makeRegister` function
     * @param  {String} zoneFile the zone file to be broadcast to the Atlas network
     * @return {Promise<Object|Error>} Returns a Promise that resolves to an object with a
     * `transaction_hash` key containing the transaction hash of the broadcasted transaction.
     *
     * In the event of an error, it rejects with:
     * * a `RemoteServiceError` if there is a problem
     *   with the transaction broadcast service
     * * `MissingParameterError` if you call the function without a required
     *   parameter
     */
    broadcastNameRegistration(preorderTransaction: string, registerTransaction: string, zoneFile: string): Promise<Object | Error>;
    getFeeRate(): Promise<number>;
    countDustOutputs(): void;
    getUTXOs(address: string): Promise<Array<UTXO>>;
    /**
     * This will modify the network's utxo set to include UTXOs
     *  from the given transaction and exclude UTXOs *spent* in
     *  that transaction
     * @param {String} txHex - the hex-encoded transaction to use
     * @return {void} no return value, this modifies the UTXO config state
     * @private
     */
    modifyUTXOSetFrom(txHex: string): void;
    resetUTXOs(address: string): void;
    getConsensusHash(): Promise<any>;
    getTransactionInfo(txHash: string): Promise<{
        block_height: Number;
    }>;
    getBlockHeight(): Promise<Number>;
    getNetworkedUTXOs(address: string): Promise<Array<UTXO>>;
}
export declare class LocalRegtest extends BlockstackNetwork {
    constructor(apiUrl: string, broadcastServiceUrl: string, bitcoinAPI: BitcoinNetwork);
    getFeeRate(): Promise<number>;
}
export declare class BitcoinNetwork {
    broadcastTransaction(transaction: string): Promise<Object>;
    getBlockHeight(): Promise<Number>;
    getTransactionInfo(txid: string): Promise<{
        block_height: Number;
    }>;
    getNetworkedUTXOs(address: string): Promise<Array<UTXO>>;
}
export declare class BitcoindAPI extends BitcoinNetwork {
    bitcoindUrl: string;
    bitcoindCredentials: any;
    constructor(bitcoindUrl: string, bitcoindCredentials: {
        username: string;
        password: string;
    });
    broadcastTransaction(transaction: string): Promise<any>;
    getBlockHeight(): Promise<any>;
    getTransactionInfo(txHash: string): Promise<{
        block_height: Number;
    }>;
    getNetworkedUTXOs(address: string): Promise<Array<UTXO>>;
}
export declare class InsightClient extends BitcoinNetwork {
    apiUrl: string;
    constructor(insightUrl?: string);
    broadcastTransaction(transaction: string): Promise<any>;
    getBlockHeight(): Promise<any>;
    getTransactionInfo(txHash: string): Promise<{
        block_height: Number;
    }>;
    getNetworkedUTXOs(address: string): Promise<Array<UTXO>>;
}
export declare class BlockchainInfoApi extends BitcoinNetwork {
    utxoProviderUrl: string;
    constructor(blockchainInfoUrl?: string);
    getBlockHeight(): Promise<any>;
    getNetworkedUTXOs(address: string): Promise<Array<UTXO>>;
    getTransactionInfo(txHash: string): Promise<{
        block_height: Number;
    }>;
    broadcastTransaction(transaction: string): Promise<any>;
}
export declare const network: {
    BlockstackNetwork: typeof BlockstackNetwork;
    LocalRegtest: typeof LocalRegtest;
    BlockchainInfoApi: typeof BlockchainInfoApi;
    BitcoindAPI: typeof BitcoindAPI;
    InsightClient: typeof InsightClient;
    defaults: {
        LOCAL_REGTEST: LocalRegtest;
        MAINNET_DEFAULT: BlockstackNetwork;
    };
};
