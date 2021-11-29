import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";

/**
 * Display NFT Colelction
 */
 function NFTDisplayCollection({ collection }) {
    /* Structure
    contract_type: "ERC1155"
    name: "OpenSea Collections"
    owned: false
    symbol: "OPENSTORE"
    token_address: "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656"
    items: (3) [{…}, {…}, {…}]
    */
    return (
        <div key={collection.symbol+'items'} className="NFTitems"> 
            {collection && collection.items.map((nft, index) => (<NFTDisplaySingle key={nft.token_address+nft.token_id} nft={nft} index={collection.items.length-index}  style={{ zIndex: index}} />)
            )}
        </div>
    );
}//NFTDisplayCollection()

export default NFTDisplayCollection;
