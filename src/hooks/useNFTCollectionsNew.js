import { useEffect, useState } from "react";
import { useNFTBalances } from "react-moralis";
import { useMoralis } from "react-moralis";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";

/**
 * Hook - Fetches NFT Balances for Account
 * @returns 
 */
export const useNFTCollections = (options) => {
  const { account, chainId } = useMoralis();
  const [ NFTCollections, setNFTCollections ] = useState({});
  const [ NFTpersonas, setPersonas ] = useState({});
  const { verifyMetadata, updateToken } = useVerifyMetadata();

  /**
   * Check if Token is a  Persona
   */
  const isPersona = (NFT) => (NFT.symbol === "PERSONA"); 

  /**
   * Arrange User's NFTs by Collection
   * @param array NFTs 
   * @ret object
   */
  function collect(NFTs){
    //Init Return
    let collections = {};
    let personas = [];
    for(let NFT of NFTs){
      if(isPersona(NFT)){
        //Force Full Metadata Update (Moralis sometimes gives outdated token_uri)
        // if(NFT.symbol === "PERSONA") 
        NFT = updateToken(NFT);
        //Append Persona
        personas.push(NFT);
      }else{//Regular Collection
        //Verify Metadata (Moralis sometimes gives outdated metadata)
        NFT = verifyMetadata(NFT);
        //Init Collection Slot
        if(!collections[NFT.token_address]) collections[NFT.token_address] = {owned:false, items:[], hash:NFT.token_address, symbol:NFT.symbol, name:NFT.name, contract_type:NFT.contract_type,};
        //Add NFT to Collection
        collections[NFT.token_address].items.push(NFT);
        //ANY - Ownes Something in This Collection
        if(NFT.owner_of === account) collections[NFT.token_address].owned = true;
        // else console.warn("No Match", NFT.owner_of, account);  //V
        // if(collections[NFT.token_address]?.est === undefined || collections[NFT.token_address].est > NFT.est) collections[NFT.token_address].est = NFT.est;   //Should be: Time sicne last TX
      }
    }//Each NFT
    // return collections;
    return { collections, personas };
  }//collect()

  //Get NFTs for Account
  const { data: NFTBalances, isLoading, error } = useNFTBalances(options);   
  useEffect(() => {
    // console.log("[TEST] NEW NFTBalances", NFTBalances, );
    if (NFTBalances?.result) {
      const NFTs = NFTBalances.result;
      for (let NFT of NFTs) {
        //Add Chain ID
        NFT.chain = options?.chain || chainId;
        //Check if Owned By Current User
        NFT.owned = (NFT.owner_of === account?.address);  //?
      }//Each NFT
      //Organize Into Collections
      // let collections = collect(NFTs);
      let { collections, personas } = collect(NFTs);
      //Log
      console.log("(i) useNFTCollections() collections:", {options, NFTs, collections});
      //Set
      setNFTCollections( collections );
      setPersonas( personas );
    }//Has Results
    // eslint-disable-next-line
  }, [NFTBalances]);

  return { NFTCollections, NFTpersonas, error, isLoading };
};//useNFTCollections
