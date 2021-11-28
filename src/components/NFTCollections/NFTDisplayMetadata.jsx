import React from "react";

function NFTDisplayMetadata({nft}) {
  //<a href={nft.token_uri} target="_blank" rel="noreferrer"><h3>{nft.name}: {nft?.metadata?.name}</h3></a>
  return (
    <> 
      <div className={nft.amount>1 ? 'metadata many' : 'metadata single'} style={{overflow:'hidden', padding:'4px'}}>
          {/* <h3>{nft.name}: {nft?.metadata?.name}</h3> */}
          <p>Type: {nft.contract_type}</p>
          <p>Amount: {nft.amount}</p>
          <p>Symbol: {nft.symbol}</p>
          
          {nft?.metadata && <dl>
            <dt>Metadata:</dt>
            {Object.keys(nft?.metadata).map((key, index) => {
            // {console.log("Metadata:", nft.metadata)}
            // {console.log("NFT:", nft)}
            if(nft.metadata[key]) //Only if Has Content
              return (
                <dd key={index+key}>
                  <label>{key}:</label> 
                  {/* <span className="value">{nft.metadata[key]}</span> */}
                </dd>
              );
            })}
          </dl>}
          {/* <p>Token ID:{nft.token_id}</p> */}
          {/* <p>Token Addr:{nft.token_address}</p> */}
      </div>
  </>
  );
}//NFTDisplayMetadata()

export default NFTDisplayMetadata;