import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useNFTBalances } from "react-moralis";
// import { useIPFS } from "./useIPFS";
import { useMoralis } from "react-moralis";
// import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

import { useVerifyMetadata } from "hooks/useVerifyMetadata";


export const useNFTCollections = (options) => {
  const { account } = useMoralis();
  // const { account } = useMoralisWeb3Api();
  // const { chainId } = useMoralisDapp();
    // const { resolveLink } = useIPFS();
  const [ NFTCollections, setNFTCollections ] = useState({});
  const {verifyMetadata} = useVerifyMetadata();


  /**
   * Arrange User's NFTs by Collection
   * @param array NFTs 
   * @ret object
   */
  function collect(NFTs){
    //Init Return
    let collections = {};
    for(let NFT of NFTs){
      //Verify Metadata      
      NFT = verifyMetadata(NFT);
      //Init Collection Slot
      if(!collections[NFT.token_address]) collections[NFT.token_address] = {owned:false, items:[], hash:NFT.token_address, symbol:NFT.symbol, name:NFT.name, contract_type:NFT.contract_type,};
      //Add NFT to Collection
      collections[NFT.token_address].items.push(NFT);
      //ANY - Ownes Something in This Collection
      if(NFT.owner_of === account) collections[NFT.token_address].owned = true;
      else console.warn("No Match", NFT.owner_of, account);
      // if(collections[NFT.token_address]?.est === undefined || collections[NFT.token_address].est > NFT.est) collections[NFT.token_address].est = NFT.est;   //Should be: Time sicne last TX
    }//Each NFT
    return collections;
  }//collect()

  //Get NFTs for Account
  const { data: NFTBalances, isLoading, error } = useNFTBalances(options);   
  useEffect(() => {
    // console.log("[TEST] NEW NFTBalances", NFTBalances, );
    if (NFTBalances?.result) {
      const NFTs = NFTBalances.result;
      for (let NFT of NFTs) {
        //Check if Owned By Current User
        NFT.owned = (NFT.owner_of === account?.address);  //?
      }//Each NFT
      //Organize Into Collections
      let collections = collect(NFTs);
      //Log
      console.log("(i) useNFTCollections() collections:", {options, NFTs, collections});
      //Set
      setNFTCollections( collections );
    }//Has Results
  }, [NFTBalances]);

  return { NFTCollections, error, isLoading };
};//useNFTCollections
