import React from "react";
// import { useMoralis, useNFTBalances } from "react-moralis";
import __ from "helpers/__";
// import { PropertySafetyFilled } from "@ant-design/icons";

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
          {/* <p>{nft.contract_type}: {nft.symbol}</p> */}
          {nft?.metadata && <dl>
            {/* <dt>Metadata:</dt> */}
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
 function DisplayMetadataField(props){
   let { label, value } = props;
  // console.log("DisplayMetadataField() Start W/", {label, value})
  // const { Moralis } = useMoralis();
  const exclusions = ['compiler'];
  if(!label || exclusions.includes(label)) return '';

  if(typeof value == 'string' || typeof value == 'number'){
    if(label === 'date'){
      //Process Date
      value = new Date(value).toString();
    }
    return (
      <dd key={label}>
        <label>{__.sanitize(label)}</label> 
        <span key="spacer" className="spacer"> – </span>
        <span key="value" className="value" title={value}>{__.sanitize(value)}</span>
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
      if(items.length > 0){
        return (
          <dd className={label}>
            <dl>
              {/* <dt>{__.sanitize(label)}</dt> */}
              <dt><i className="bi bi-bookmarks"></i> Properties</dt>
              {items}
            </dl>
          </dd>
        );
      }//Has Data
    }//Attribures
    else if(label === 'accounts'){
      if(value.length > 0){
        return (<DisplayMetadataField key={label} label={"Crypto "+label} value={value.length} className="item"/>)
        return (
          <dd key={label}>
            <label>{label}</label> 
            <span className="value" title={value}>
              {(value.length > 0) && <dl>
                {value.map((field) => {
                    return ['address','chain'].map((key) => <DisplayMetadataField key={key} label={key} value={field[key]} className="item"/>);
                })}
              </dl>}
              {/* {value.map((field) => (<DisplayMetadataField key={field.label} label={field.label} value={field.value} className="item"/>))} */}
            </span>
          </dd>
        );
      }//Has Data
    }//Accounts
    else if(label === 'links'){
      if(value.length> 0){
        console.warn("[UNHANDLED] DisplayMetadataField() "+label+" is an Array", {label, value});
      }//Has Data
    }//Links
    else{
      console.warn("[UNHANDLED] DisplayMetadataField() "+label+" is an Array", {label, value});
      return (
        <dd key={label} className="debug">
          <label>{label}: (IS ARRAY) </label> 
          <span className="value" title={value}>
            {value.toString(value)}
            {value.map((field) => {
              // if(typeof field === 'object') console.warn("[TEST] DisplayMetadata() '"+label+"' FIeld is an Object", field);
              // else console.error("[TEST] DisplayMetadata() '"+label+"' FIeld is NOT an Object", field);
              // if(typeof field === 'object') return (<DisplayMetadataField key={field.label} label={field.label} value={field.value} className="item"/>)
            })}
          </span>
        </dd>
      );
    }
  }//Array
  else if(typeof value === 'object'){
    let items = [];
    for(let key in value){
      let val = value[key];
      if(val) items.push(<DisplayMetadataField key={key} label={key} value={val} className="item"/>);
      // if(val) return (
      //   <>
      //   {value.toString(value)}
      //   </>
      // );
    }
    if(items.length > 0){
      return (
        <dd className={label}>
          <dl>
            {/* <dt>{__.sanitize(label)}</dt> */}
            <dt><i className="bi bi-people-fill"></i> Social Accounts</dt>
            {items}
          </dl>
        </dd>
      );
    }
  }
  else{
    console.error("[UNHANDLED] DisplayMetadataField() Datatype " + typeof value+" is Not Supported", {label, value});
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