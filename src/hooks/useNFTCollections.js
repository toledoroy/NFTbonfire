import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useNFTCollections = (options) => {
  const { account } = useMoralisWeb3Api();
  const { chainId } = useMoralisDapp();
  const { resolveLink } = useIPFS();
  const [NFTCollections, setNFTCollections] = useState([]);
  
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

  //Get NFTs for Account
  const {
    fetch: getNFTBalance,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, ...options });

  useEffect(() => {
    console.log("data", data);
    if (data?.result) {
      const NFTs = data.result;
      
      for (let NFT of NFTs) {
        
        //Overload Object
        if (NFT?.metadata && typeof NFT?.metadata === "string") {
          // metadata is a string type
          NFT.metadata = JSON.parse(NFT.metadata);
          //Image Might Be an IPFS ID
          if(NFT.metadata?.image) NFT.image = resolveLink(NFT.metadata?.image);
          //Check if Owned By Current User
          NFT.owned = (NFT.owner_of === account);
        }
        else console.log("NFT.metadata (SHOULD BE A JSON STRING)", NFT.metadata);

        //TODO: Overload NFT:
        //Get Owner/Creator      //https://docs.moralis.io/moralis-server/web3-sdk/token#getnftowners
        // const options = { address: "0xd...07", chain: "bsc" };
        // const nftOwners = await Moralis.Web3API.token.getNFTOwners(options);
        //Last Price
        // const options = { address: "0xd...07", days: "3" };
        // const NFTLowestPrice = await Moralis.Web3API.token.getNFTLowestPrice(options);
        //TODO: Get Fee Structure

      }//Each NFT
      //Organize Into Collections
      let collections = collect(NFTs);
      //Log
      console.log("useNFTCollections() collections:", {options, NFTs, collections});
      //Set
      setNFTCollections( collections );
    }//Has Results
    else console.log("useNFTCollections() NO RESULT", data , account, account.getNFTs());
  }, [data]);
  

  return { getNFTBalance, NFTCollections, error, isLoading };
};//useNFTCollections
