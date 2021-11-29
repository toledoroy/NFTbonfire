import React from "react";
import __ from "helpers/__";

function NFTDisplayMetadata({nft}) {
  //Excluded Keys
  const excludedKeys = ['image'];
  //Determine if Should Show Metadata
  const shouldShow = (key, value) => (!excludedKeys.includes(key));

  //<a href={nft.token_uri} target="_blank" rel="noreferrer"><h3>{nft.name}: {nft?.metadata?.name}</h3></a>
  return (
    <> 
      <div className={nft.amount>1 ? 'metadata many' : 'metadata single'}>
          {/* <h3>{nft.name}: {nft?.metadata?.name}</h3> */}
          <p>Type: {nft.contract_type}</p>
          <p>Amount: {nft.amount}</p>
          <p>Symbol: {nft.symbol}</p>
          
          {nft?.metadata && <dl>
            <dt>Metadata:</dt>
            {Object.keys(nft?.metadata).map((key, index) => {
              if(shouldShow(key)){
                // {console.log("NFT:", nft)}
                // console.log("Metadata key:'"+key+"'", nft.metadata, key, nft?.metadata[key]);
                //Only if Has Content
                if(nft.metadata[key]) return <DisplayMetadataField label={key} value={nft.metadata[key]} />
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
 * Component: Single Metadata ITem
 */
 function DisplayMetadataField({label, value}){
  // console.log("DisplayMetadataField() Start W/", {label, value})
   
  if(typeof value == 'string' || typeof value == 'number'){
    if(label === 'date'){
      //Process Date
      value = new Date(value).toString();
    }
    return (
      <dd key={label}>
        <label>{__.sanitize(label)}: </label> 
        <span className="value">{__.sanitize(value)}</span>
      </dd>
    );
  }//string/number
  else if(Array.isArray(value)){
    if(label === 'attributes'){
      /* E.G.
        0: {trait_type: 'bg_light_blue', value: 'bg_light_blue'}
        1: {trait_type: 'Shadow', value: 'floor_shadow'}
        2: {trait_type: 'T-Rex', value: 'trex_purple'}
        3: {trait_type: 'Fin', value: 'fin_neon'}
        4: {trait_type: 'Emotion', value: 'eye_exiting'}
      */
      let items = [];
      // for(let field of value) if(field.trait_type && field.value){ //Validate
      for(let field of value) if(field.trait_type && field.value && !field.trait_type.startsWith('bg_')){ //Validate
        items.push(<DisplayMetadataField label={field.trait_type} value={field.value} />);
      }
      if(items.length>0){
        return (
          <dd>
            <dl>
              <dt>{__.sanitize(label)}:</dt>
              {items}
            </dl>
          </dd>
        );
      }
    }
    else{
      console.warn("[UNHANDLED] DisplayMetadataField() DisplayMetadataField() Attribute is an Array", {label, value});
      return (
        <dd key={label}>
          <label>{label}: (IS ARRAY) </label> 
          <span className="value">{value.toString()}</span>
        </dd>
      );
    }
  }//Array
  else{
    console.error("DisplayMetadataField() Datatype Not Supported", {label, value}, typeof value);
    //TODO: Try to Recurse on Objects...
  } 
  return null;
}//DisplayMetadataField()
