import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
// import { useIPFS } from "./useIPFS";

export const useNFTBalance = (options) => {
  const { account } = useMoralisWeb3Api();
  const { chainId, isInitialized } = useMoralis();
  // const { resolveLink } = useIPFS();
  // const [NFTBalance, setNFTBalance] = useState([]);

  const {
    // fetch: getNFTBalance,
    fetch,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, ...options });

  // useEffect(() => {
  // console.warn("useNFTBalance() Data Changed", { data, error, isLoading });
  // }, [data]);

  useEffect(() => {
    if (isInitialized && options) {
      // console.warn("[TEST] useNFTBalance() Run Fetch", { data, error, isLoading, options });
      fetch();
      /* Moved Outside
      if (data?.result) {
        const NFTs = data.result;
        for (let NFT of NFTs) {
          if (NFT?.metadata && typeof NFT.metadata == 'string') {
            NFT.metadata = JSON.parse(NFT.metadata);
            // metadata is a string type
            NFT.image = resolveLink(NFT.metadata?.image);
          }
        }
        setNFTBalance(NFTs);
      }
      */
    }
    // else setNFTBalance([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [options, isInitialized]);
  }, [options?.chain, options?.address, isInitialized]);

  return { fetch, data, error, isLoading };
};
