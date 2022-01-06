import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { useMoralis } from "react-moralis";
// import { FireTwoTone } from '@ant-design/icons';
import { Skeleton, Pagination, Collapse, Badge, List, Comment } from 'antd';
// import { useMoralisQuery } from "react-moralis";
import { CollectionContext } from "common/context";
import __ from "helpers/__";


//TODO Run Search & Paginate Results

/**
 * Component: Space (W/Chat Room)
 */
function PageNFTs({hash, collection, NFTpersonas}) {
//   const { Moralis, isWeb3Enabled } = useMoralis();
//   const [ rooms, setRooms ] = useState([]);
  const [ limit, setLimit ] = useState(6);
  const [ isAllowed, setIsAllowed ] = useState(false);

  /**
   * Fetch Rooms for Current PageNFTs
   */
  useEffect(() => {
    //Log
    console.log("[TEST] PageNFTs() RUNNUING W/Hash:"+hash);
    
  }, [hash]);
 
  //Validate  
  // if(collection.contract_type!=="ERC1155") return <div>Unsupported Collection Type:'{collection.contract_type}'</div>;   //It's a mess out there, ERC721 0xcc14dd8e6673fee203366115d3f9240b079a4930 Contains Multiple NFTs (All Have amount=1)
  // if(!PageNFTs) return <div className="loading">...LOADING PageNFTs...</div>;    //Enable
  
  /* Consumer -- Fail   //Unhandled Rejection (TypeError): render is not a function
  console.log("PageNFTs() For CollectionContext:", {CollectionContext});
  // <CollectionContext.Consumer>
  //  {collection => {console.warn("[TEST] PageNFTs() CollectionContext: ", {collection})}} 
  //  </CollectionContext.Consumer> 
    */
  return (
    <CollectionContext.Consumer>
    {collection => (
    <Skeleton active loading={!PageNFTs}>
        <div className="content">
            [DISPLAY NFTs]
        </div>
        <Pagination
            total={85}
            showSizeChanger
            showQuickJumper
            showTotal={total => `Total ${total} items`}
        />
    </Skeleton>
    )} 
    </CollectionContext.Consumer> 
  );
}//PageNFTs()

export default PageNFTs;
