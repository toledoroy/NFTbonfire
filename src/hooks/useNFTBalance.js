import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useNFTBalance = (options) => {
  const { account } = useMoralisWeb3Api();
  // const { walletAddress } = useMoralis();
  const { chainId } = useMoralisDapp();
  const { resolveLink } = useIPFS();
  const [NFTBalance, setNFTBalance] = useState([]);
  const {
    // fetch: getNFTBalance,
    fetch,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, ...options });
  
  const dataTest = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, ...options });

  console.log("dataTest for Chain:"+chainId, dataTest, { chain: chainId, ...options });

  useEffect(() => {
    
    /* WORKS FINE
    let guestOptions = {chain: chainId, address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1'};
    account.getNFTs(guestOptions).then((data) => {
      console.warn("Guest NFTs Raw result", data);
    });
    */

    account.getNFTs(options).then((data) => {
      console.warn("NFTs Raw result", data);
    });

    if (data?.result) {
      const NFTs = data.result;
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          // metadata is a string type
          NFT.image = resolveLink(NFT.metadata?.image);
        }
      }
      setNFTBalance(NFTs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return { fetch, NFTBalance, error, isLoading };
};
