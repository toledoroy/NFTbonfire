import React from "react";
import { useMoralis, useNFTBalances } from "react-moralis";
import __ from "helpers/__";
// import { DoubleRightOutlined } from '@ant-design/icons';

/**
 * Component: Display NFT's Metadata
 * //https://docs.opensea.io/docs/metadata-standards
 */
function NFTDisplayMetadata({nft}) {
  //Excluded Keys
  const excludedKeys = ['image','background_color'];    //TODO: Should Apply 'background_color' as actual background color
  //Determine if Should Show Metadata
  const shouldShow = (key, value) => (!excludedKeys.includes(key));

  //<a href={nft.token_uri} target="_blank" rel="noreferrer"><h3>{nft.name}: {nft?.metadata?.name}</h3></a>
  return (
    <> 
      <div className={nft.amount>1 ? 'metadata many' : 'metadata single'}>
        <div className="inner">
          {/* <h3>{nft.name}: {nft?.metadata?.name}</h3> */}
          {/* <p>Type: {nft.contract_type}</p> */}
          {/* <p>Amount: {nft.amount}</p> */}
          {/* <p>Symbol: {nft.symbol}</p> */}
          <p>{nft.contract_type}: {nft.symbol}</p>
          {nft?.metadata && <dl>
            <dt>Metadata:</dt>
            {Object.keys(nft?.metadata).map((key, index) => {
              return (nft.metadata[key] && shouldShow(key)) ? <DisplayMetadataField key={key} label={key} value={nft.metadata[key]} /> : null;
            })}
          </dl>}
          {/* <p>Token ID:{nft.token_id}</p> */}
          {/* <p>Token Addr:{nft.token_address}</p> */}
        </div>
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
  // const { Moralis } = useMoralis();

  if(typeof value == 'string' || typeof value == 'number'){
    if(label === 'date'){
      //Process Date
      value = new Date(value).toString();
    }
    return (
      <dd key={label}>
        <label>{__.sanitize(label)}</label> 
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
        items.push(<DisplayMetadataField key={field.trait_type} label={field.trait_type} value={field.value} className="item"/>);
      }
      if(items.length>0){
        return (
          <dd className={label}>
            <dl>
              {/* <dt>{__.sanitize(label)}</dt> */}
              <dt>
              {/* <DoubleRightOutlined /> */}
              <i class="bi bi-bookmarks"></i>
              Properties</dt>
              {items}
            </dl>
          </dd>
        );
      }
    }
    else{
      console.warn("[UNHANDLED] DisplayMetadataField() DisplayMetadataField() Attribute is an Array", {label, value});
      // logger.warn("[UNHANDLED] DisplayMetadataField() DisplayMetadataField() Attribute is an Array", {label, value}); 
      return (
        <dd key={label}>
          <label>{label}: (IS ARRAY) </label> 
          <span className="value">{value.toString()}</span>
        </dd>
      );
    }
  }//Array
  else{
    console.error("DisplayMetadataField() Datatype " + typeof value+" is Not Supported", {label, value});
    // logger.error("DisplayMetadataField() Datatype Not Supported", {label, value}, typeof value);
    //TODO: Try to Recurse on Objects...
  } 
  return null;
}//DisplayMetadataField()

/**
 * Component
 */
function DisplayAttributeField({label, value}){

}//DisplayAttributeField