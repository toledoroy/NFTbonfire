import { useEffect, useState } from "react";
import { useNFTBalances } from "react-moralis";
import { useMoralis } from "react-moralis";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import __ from "helpers/__";
import { Persona } from "objects/Persona";

/**
 * Hook - Fetches NFT Balances for Account
 * @returns 
 */
export const useNFTCollections = (options) => {
  const { account, chainId, isWeb3Enabled } = useMoralis();
  const [ NFTCollections, setNFTCollections ] = useState({});
  const [ NFTpersonas, setPersonas ] = useState([]);
  const { verifyMetadata, personaUpdateFromDB } = useVerifyMetadata();  //updateToken

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
        //Moralis Persona data is often Out of Date
        try{
          /* This is too heavy for the Moralis Web3 API. Use Personas from DB 
          //Force Full Metadata Update (Moralis sometimes gives outdated token_uri)
          NFT = updateToken(NFT);
          */
         NFT = personaUpdateFromDB(NFT);
          //Append Persona
          personas.push(NFT);
        }
        catch(error){
          console.error("[CAUGHT] collect() Exception while updating token", {NFT, error});
        }
      }//Persona


      // else{//Regular Collection
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
      // }//Default
    }//Each NFT
    // return collections;
    return { collections, personas };
  }//collect()

  //Get NFTs for Account
  const { data: NFTBalances, isLoading, error } = useNFTBalances(options);   
  useEffect(() => {
    // console.log("[TEST] useNFTCollections() NFTBalances", NFTBalances, options);
    if (isWeb3Enabled && NFTBalances?.result) {
      const NFTs = NFTBalances.result;
      for (let NFT of NFTs) {
        //Add Chain ID
        NFT.chain = options?.chain || chainId;
        //Check if Owned By Current User
        NFT.owned = __.matchAddr(account, NFT.owner_of);
      }//Each NFT
      //Organize Into Collections
      // let collections = collect(NFTs);
      let { collections, personas } = collect(NFTs);
      //Log
      console.log("(i) useNFTCollections() collections:", {options, NFTs, collections, personas});
      //Set
      setNFTCollections( collections );
      setPersonas( personas );
    }//Has Results
    // eslint-disable-next-line
  }, [NFTBalances, isWeb3Enabled]);
// }, [NFTBalances, isWeb3Enabled, options]);

  return { NFTCollections, NFTpersonas, error, isLoading };
};//useNFTCollections
