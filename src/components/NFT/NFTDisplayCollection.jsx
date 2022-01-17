import React, { useState } from "react";
import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
import { Link } from "react-router-dom";

/**
 * Component: Display Single  NFT Colelction
 * @param {collection, dest} props
 *  object collection   - NFT collection (Contract)
 *  object dest         - Link Destination
 */
 function NFTDisplayCollection({ collection, dest }) {
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
        <Link key={collection.hash+'Link'} to={dest}>
            <div key={collection.symbol+'items'} className="NFTitems" id={"NFTitems"+collection.hash}> 
                {collection && collection.items.map((nft, index) => (
                    <NFTDisplaySingle key={nft.token_address+nft.token_id} nft={nft} />
                ))}
            </div>
        </Link>
        <FlipButtons id={"NFTitems"+collection.hash}/>
        </>
    );
}//NFTDisplayCollection()

export default NFTDisplayCollection;

/**
 * Component: Collection Flip Buttons
 */
 function FlipButtons({ id }) {

    const flipCards = (id, dir=1) => {
        try{
            let container = document.getElementById(id);
            if(dir==1) container.appendChild(container.childNodes[0]);
            else container.prepend(container.lastElementChild);
        }
        catch(error){
            console.error("[CAUGHT] flipCards() Exception:", {id, error})
        }
    }

    return (
        <>
        <button onClick={() => {flipCards(id, 0); return false; }} 
            style={{zIndex:'9999'}}>Prev</button>
            
        <button onClick={() => {flipCards(id); return false; }} 
            style={{zIndex:'9999'}}>Next</button>
        </>
    );
}//FlipButtons()
