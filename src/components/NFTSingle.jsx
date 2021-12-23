import { useMoralis } from "react-moralis";
// import { useERC20Balance } from "../../hooks/useERC20Balance";
// import { useNFTCollections } from "hooks/useNFTCollections";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";
// import { getEllipsisTxt } from "../../helpers/formatters";
import NFTDisplayCollection from "components/NFT/NFTDisplayCollection";
import Space from "components/NFTSingle/Space";

/** DEPRECATED
 * Page: Display Single NFT
 */
function NFTSingle(props) {
  const { NFTCollections, isLoading } = useNFTCollections();
  const { Moralis, isWeb3Enabled } = useMoralis();
  const { hash } = props.match.params;

  function isValid(hash){ 
    return (hash in NFTCollections); 
  }

  //Log
  console.log('NFTSingle() ID: '+props.match.params.hash, {props, hash, valid:isValid(hash)});
  // console.log("NFTSingle() props.NFT:", props.nft); 
  
  //TODO: Single: Load NFT TXs: getNFTTransfers
  const options = { token_address: hash };
  // const options = { chain: 'matic', address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1', /*token_address: '0x...'*/ };
  // const options = { address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1', token_address: hash, };    //[DEV]
  // options.address = '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1';    //[DEV]
  // const options = { address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1',};



  //TESTING
  // const polygonNFTs = await Moralis.Web3API.account.getNFTsForContract(options);
  // Moralis.start();   //Required, but doesn't work
  Moralis.Web3.enableWeb3().then(Web3 => {
    if (isWeb3Enabled) {
      // console.log("NFTSingle() HAs W3");
      Moralis.Web3API.account.getNFTsForContract(options).then(DudesNFTs => {
        console.log("NFTSingle() DudesNFTs:", {options, DudesNFTs});
      });
    }
  });


  if(isLoading) return <div>Loading...</div>; //Waiting
  else if(isValid(hash)){//Valid Access
    //Get NFT
    const collectionCurrent = NFTCollections[hash];
    return (
      <div className="pageContent pageSpace">
        <div className="top">
          <div className="network">[NETWORK]</div>
          <div className="address">{hash}</div>
          <h1>NFT Collection</h1>
        </div>
          <div className="middle">
            <div className="stack">
              <NFTDisplayCollection collection={collectionCurrent} />
            </div>
            <Space hash={hash} collection={collectionCurrent} />
          </div>
      </div>
    );
  }//Valid Access
  else{//Invalid Access
    console.warn("Invalid Access", {hash, NFTCollections});
    return (
      <div className="pageContent">
        <h1>Access Denied</h1>
        <p>NFT Collection:'{hash}'</p>
        <p>
          To Access Collection You Must Connect a Wallet that Owns An NFT From That Collection
        </p>
      </div>
    );
  }//Invalid Access

}//NFTSingle()

export default NFTSingle;