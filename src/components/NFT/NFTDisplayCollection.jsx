import React from "react";
import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
import FlipButtons from "components/NFT/FlipButtons";
// import { Link } from "react-router-dom";

/**
 * Component: Display Single  NFT Colelction
 * @param {collection, dest} props
 *  object collection   - NFT collection (Contract)
 *  object dest         - Link Destination
 */
 function NFTDisplayCollection(props) {
     const { collection, flip } = props;    //dest, 
    /* Structure
    contract_type: "ERC1155"
    name: "OpenSea Collections"
    owned: false
    symbol: "OPENSTORE"
    token_address: "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656"
    items: (3) [{…}, {…}, {…}]
    */
    //Log
    // console.log("[TEST] NFTDisplayCollection", {collection, dest});
    return (
        <>
        {/* <Link key={collection.hash+'Link'} to={dest}>   MOVED OUTSIDE */}
            <div key={collection.symbol+'items'} className="NFTitems" id={"NFTitems"+collection.hash} style={props.style}> 
                {collection && collection.items.map((nft, index) => (
                    <NFTDisplaySingle key={nft.token_address+':'+nft.token_id} nft={nft} />
                ))}
            </div>
        {/* </Link> */}
        {(flip && collection.items.length) && <FlipButtons id={"NFTitems"+collection.hash}/>}
        </>
    );
}//NFTDisplayCollection()

export default NFTDisplayCollection;
