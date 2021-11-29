import React from "react";

function NFTDisplayMetadata({nft}) {
  //Excluded Keys
  const excludedKeys = ['image'];
  //Determine if Should Show Metadata
  const shouldShow = (key, value) => (!excludedKeys.includes(key));

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
              // {console.log("Metadata key:'"+key+"'", nft.metadata, key, nft?.metadata[key]);}
              if(shouldShow(key)){
                
                // {console.log("NFT:", nft)}
                //Only if Has Content
                if(nft.metadata[key]) return <DisplayMetadataField label={key} value={nft.metadata[key]} />
                
                // if(typeof nft.metadata[key] === 'string') {
                //   return (
                //     <dd key={index+key}>
                //       <label>{key}: </label> 
                //       <span className="value">{nft.metadata[key]}</span>
                //     </dd>
                //   );
                // }
                // else{
                //   console.log("Metadata is not a String  key:"+key, nft.metadata[key]);
                //   return (
                //     <dd key={index+key}>
                //       <label>{key}: </label> 
                //       <span className="value">{nft.metadata[key].toString()}</span>
                //     </dd>
                //   );
                // }
              }//Should Show
            })}
          </dl>}
          {/* <p>Token ID:{nft.token_id}</p> */}
          {/* <p>Token Addr:{nft.token_address}</p> */}
      </div>
  </>
  );
}//NFTDisplayMetadata()

export default NFTDisplayMetadata;


/**
 * 404 Page
 */
 function DisplayMetadataField({label, value}){
   if(typeof value == 'string'){
      return (
        <dd key={label}>
          <label>{label}: </label> 
          <span className="value">{value}</span>
        </dd>
      );
   }
   else if(Array.isArray(value)){
    console.warn("DisplayMetadataField() Attribute is an Array", {label, value});
      return (
        <dd key={label}>
          <label>{label}: (IS ARRAY) </label> 
          <span className="value">{value.toString()}</span>
        </dd>
      );
  }
  else console.error("DisplayMetadataField() Datatype Not Supported", {label, value}, typeof value);
  return null;
}//DisplayMetadataField()
