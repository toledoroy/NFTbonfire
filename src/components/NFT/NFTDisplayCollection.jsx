import React, { useState } from "react";
import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
import { Link } from "react-router-dom";

/**
 * Display NFT Colelction
 * @param {collection, dest} props
 *  object collection   - NFT collection (Contract)
 *  object dest         - Link Destination
 */
 function NFTDisplayCollection({ collection, dest }) {

    const [items, setItems] = useState(collection.items);

    const flip = (arr) => {
       arr.push(arr.shift());
        
        console.warn("[TEST] Flip Collection", {arr, collection});
        // setItems(arr.push(arr.shift()));
        setItems(arr);
        return arr;
      }

    React.useEffect(() => {
      console.error("[TEST] Collection() Items Changed:", {items});
    }, [items]);
  


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
            <div key={collection.symbol+'items'} className="NFTitems"> 
                {/* {collection && collection.items.map((nft, index) => ( */}
                {collection && items.map((nft, index) => (
                    <NFTDisplaySingle key={nft.token_address+nft.token_id} nft={nft} index={collection.items.length-index} style={{ zIndex: index}} />
                ))}
            </div>
        </Link>
        {/* <button onClick={() => {setItems(flip(collection.items)); return false; }}  */}
        <button onClick={() => {flip(items); return false; }} 
            style={{zIndex:'9999'}}>Flip</button>
        </>
    );
}//NFTDisplayCollection()

export default NFTDisplayCollection;
