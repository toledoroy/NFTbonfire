import { useEffect, useState } from "react";
import { useNFTBalances } from "react-moralis";
import { useMoralis } from "react-moralis";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import __ from "helpers/__";

/**
 * Hook - Fetches NFT Balances for Account
 * @returns 
 */
export const useNFTCollections = (options) => {
  const { account, chainId, isWeb3Enabled, isInitialized } = useMoralis();
  const [ NFTCollections, setNFTCollections ] = useState({});
  const [ NFTpersonas, setPersonas ] = useState([]);
  const { verifyMetadata, personaUpdateFromDB, updateToken } = useVerifyMetadata();  //updateToken

  /**
   * Check if Token is a  Persona
   */
  const isPersona = (NFT) => (NFT.symbol === "PERSONA"); 

  /**
   * Arrange User's NFTs by Collection
   * @param array NFTs 
   * @ret object
   */
  function collect(NFTs, chain){
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
          // NFT = personaUpdateFromDB(NFT);  //Could Potentially Update Persona tokens Cached on DB
          //Append Persona
          personas.push(NFT);

          //If Has Persona, Still Show a Placeholder for Simple Onboarding (Only One)
          if(!collections[NFT.token_address]) collections[NFT.token_address] = {
            items:[], 
            hash:NFT.token_address, 
            symbol:'', 
            name:'NFT Bonfire', 
            contract_type:NFT.contract_type, 
            chain,
            owned:(NFT.owner_of === account), 
            items: [{
              ...NFT, 
              //Override
              name:'NFT Bonfire', 
              image: "https://ipfs.moralis.io:2053/ipfs/QmUZci2fwc6wjTMQPy7AwCQKyPdb6aSt24t1eVbtyPY2hz",
              metadata: {name: 'Early Adopter', description: null, external_link: null, image: 'https://ipfs.moralis.io:2053/ipfs/QmUZci2fwc6wjTMQPy7AwCQKyPdb6aSt24t1eVbtyPY2hz',}
            }],
          };

        }
        catch(error){
          console.error("[CAUGHT] collect() Exception while updating token", {NFT, error});
        }
      }//Persona
      else{

        if(NFT.contract_type == "ERC1155"){ //Item of an NFT Collection
          console.warn("[DEV] This is an ERC1155 Collection", NFT);
        }

        //Support ERC1155
        const collectionId = (NFT.contract_type == "ERC1155") ? NFT.token_address+':'+NFT.token_id : NFT.token_address;
        
        //Verify Metadata (Moralis sometimes gives outdated metadata)
        NFT = verifyMetadata(NFT);

        //Init Collection Slot
        if(!collections[collectionId]) collections[collectionId] = {
          items:[], 
          hash:NFT.token_address, 
          symbol:NFT.symbol, 
          name:NFT.name, 
          contract_type:NFT.contract_type, 
          chain,        //For OWnership Verification
          owned:false, 
        };
        //Add NFT to Collection
        collections[collectionId].items.push(NFT);
        //ANY - Ownes Something in This Collection
        if(NFT.owner_of === account) collections[collectionId].owned = true;
        // else console.warn("No Match", NFT.owner_of, account);  //V
        // if(collections[collectionId]?.est === undefined || collections[collectionId].est > NFT.est) collections[collectionId].est = NFT.est;   //Should be: Time sicne last TX
      }//Non-Persona (Regular NFT)

    }//Each NFT

    // return collections;
    return { collections, personas };
  }//collect()

  //Get NFTs for Account
  const { data: NFTBalances, isLoading, error } = useNFTBalances(options);   
  useEffect(() => {
    // console.log("[TEST] useNFTCollections() TRIGGERED", {NFTBalances, options, isInitialized, isLoading, error});
    // if (isWeb3Enabled && NFTBalances?.result) {
    if (isInitialized && NFTBalances?.result) {
      const chain = options?.chain || chainId;
      const NFTs = NFTBalances.result;
      for (let NFT of NFTs) {
        //Add Chain ID
        NFT.chain = chain;
        //Check if Owned By Current User
        NFT.owned = __.matchAddr(account, NFT.owner_of);
      }//Each NFT
      //Organize Into Collections
      // let collections = collect(NFTs);
      let { collections, personas } = collect(NFTs, chain);
      //Log
      // console.warn("(i) useNFTCollections() collections:", {options, NFTs, collections, personas});
      //Set
      setNFTCollections( collections );
      setPersonas( personas );
    }//Has Results
    // eslint-disable-next-line
  }, [NFTBalances, isWeb3Enabled, isInitialized]);
// }, [NFTBalances, isWeb3Enabled, options]);

  return { NFTCollections, NFTpersonas, error, isLoading };
};//useNFTCollections
