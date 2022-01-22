import React from "react";
import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
// import { Link } from "react-router-dom";
import { Button } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';

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
                    <NFTDisplaySingle key={nft.token_address+nft.token_id} nft={nft} />
                ))}
            </div>
        {/* </Link> */}
        {(flip && collection.items.length) && <FlipButtons id={"NFTitems"+collection.hash}/>}
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
            if(dir===1) container.appendChild(container.childNodes[0]);
            else container.prepend(container.lastElementChild);
        }
        catch(error){
            console.error("[CAUGHT] flipCards() Exception:", {id, error})
        }
    }

    return (
        <div className="flip_buttons">
        <Button className="lightUp" title="Back" onClick={(evt) => { evt.stopPropagation(); flipCards(id, 0); return false; }}  
            style={{zIndex:'102'}} icon={<LeftOutlined />}></Button>
            
        <Button className="lightUp" title="Next" onClick={(evt) => { evt.stopPropagation(); flipCards(id); return false; }} 
            style={{zIndex:'102'}} icon={<RightOutlined />}></Button>
        </div>
    );
}//FlipButtons()
