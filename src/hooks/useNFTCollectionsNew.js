import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useNFTBalances } from "react-moralis";
import { useIPFS } from "./useIPFS";
// import { useMoralis } from "react-moralis";


export const useNFTCollections = (options) => {
  // const { Moralis } = useMoralis();
  const { account } = useMoralisWeb3Api();
  const { chainId } = useMoralisDapp();
  
  const { resolveLink } = useIPFS();
  const [NFTCollections, setNFTCollections] = useState({});
  
  /**
   * Arrange User's NFTs by Collection
   * @param array NFTs 
   * @ret object
   */
  function collect(NFTs){
    //Init Return
    let collections = {};
    for(let NFT of NFTs){
      // if(NFT.contract_type == "ERC1155"){ //Item of an NFT Collection
        //Init Collection Slot
        if(!collections[NFT.token_address]) collections[NFT.token_address] = {owned:false, items:[], hash:NFT.token_address, symbol:NFT.symbol, name:NFT.name, contract_type:NFT.contract_type,};
        //Add NFT to Collection
        collections[NFT.token_address].items.push(NFT);
        //ANY - Ownes Something in This Collection
        if(NFT.owned) collections[NFT.token_address].owned = true;
        // if(collections[NFT.token_address]?.est === undefined || collections[NFT.token_address].est > NFT.est) collections[NFT.token_address].est = NFT.est;   //Should be: Time sicne last TX
      // }
      // else console.warn("collect() NFT Is Not a Collection (ERC1155) but "+NFT.contract_type, {NFT});
    }//Each NFT
    return collections;
  }//collect()


/* New Version (Which is missing metadata...) */
  const { data: NFTBalances, isLoading, error } = useNFTBalances(options);   //Get NFTs for Account
  useEffect(() => {
    console.log("[TEST] NEW NFTBalances", NFTBalances, );
    if (NFTBalances?.result) {
      const NFTs = NFTBalances.result;

      for (let NFT of NFTs) {

        /*
        // let metadata = (NFT.token_uri)
        Moralis.Cloud.httpRequest({
          url: NFT.token_uri,
          headers: {
            method: "GET",
            accept: "application/json",
          },
        })
        .then((httpResponse) => httpResponse.data)
        .then((data) => JSON.parse(data))
        .then((metadata) => console.log("[TEST] NEW NFTBalances Fetched Metadata", metadata, ))
        .catch((error) => console.log(error));
        */

        /* No Longer Needed
        //Overload Object
        if (NFT?.metadata && typeof NFT?.metadata === "string") {
          // metadata is a string type
          NFT.metadata = JSON.parse(NFT.metadata);
          //Image Might Be an IPFS ID
          if(NFT.metadata?.image) NFT.image = resolveLink(NFT.metadata?.image);
          //Check if Owned By Current User
          NFT.owned = (NFT.owner_of === account?.address);
        }
        else console.log("NFT.metadata (SHOULD BE A JSON STRING)", NFT.metadata);
        */
      }//Each NFT
      
      //Organize Into Collections
      let collections = collect(NFTs);
      //Log
      console.log("useNFTCollections() collections:", {options, NFTs, collections});
      //Set
      setNFTCollections( collections );
    }//Has Results
  }, [NFTBalances]);

  return { NFTCollections, error, isLoading };
};//useNFTCollections
