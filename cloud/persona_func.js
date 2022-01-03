//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

const Persona = Moralis.Object.extend("Persona");
const Contract = Moralis.Object.extend("Contract");

//-- Helper Functions
/**
 * Resolve IPFS Links
 */
// const resolveLink = (url) => (!url || !url.includes("ipfs://")) ? url : url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/"); 
// const resolveLink = (url) => (!url || !url.includes("ipfs://")) ? url : url.replace("ipfs://", "https://ipfs.moralis.io:2053/ipfs/"); 
const resolveLink = (url) => (!url || !url.includes("ipfs://")) ? url : url.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/"); 

/**
 * Check if User Owns NFT
 * @param {*} userId  User ID
 * @param {*} hash   NFTs Hash
 * @returns 
 */
 const isHandleFree = async (handle) => {
  const reserved = ['persona','account', '...'];
  if(reserved.includes(String(handle).toLowerCase())) return false;

  // const Persona = Moralis.Object.extend("Persona");
  
  //Check if Handle Already Exists in DB
  const query = new Moralis.Query(Persona);
  query.equalTo("handle", String(handle).toLowerCase());
  const results = await query.find();

  logger.warn("[TEST] isHandleFree() Found "+results.length+" Results for Handle:"+handle+"");
  // logger.warn("[TEST] isHandleFree() Found "+results.length+" Results for Handle:"+handle+" Results: " + JSON.stringify(results));

  //True if Empty
  return (results.length == 0);
};//isHandleFree()
  
/**
 * Get ABI For Contract (From DB)
 * @param {*} chain     Chain ID
 * @param {*} address   Contract Address
 * @returns array       Contract's ABI
 */
 const getABI = async (chain, address) => {
  const query = new Moralis.Query(Contract);
  query.equalTo("chain", chain);
  query.equalTo("address", address);
  const results = await query.limit(1).find();
  // logger.warn("[TEST] getABI() Found "+results.length+" Results for Contract:"+address+" Chain:"+chain+"");  //V
  if(results.length === 0) return null;
  else return results[0].get('abi');
};//getABI()
  
/**
 * Get the Token Owner
 * @param {*} chain 
 * @param {*} contract 
 * @param {*} tokenId 
 */
const getTokenOwner = async (chain, contract, tokenId) => {
  //Fetch ABI for Contract
  let abi = await getABI(chain, contract);
  //Validate
  if(!abi) throw new Error("Missing ABI for Contract:"+contract+" on Chain:"+chain);
  let options = {
    abi: JSON.parse(abi),
    address: contract,
    // function_name: 'tokenURI',
    function_name: 'ownerOf',
    params: { tokenId },
    chain,
  };
  //Log
  // logger.warn("[TEST] getTokenOwner() Run W3 Request:" + JSON.stringify(options) );  //V
  //Run W3 Request
  let res = await Moralis.Web3API.native.runContractFunction(options);
  //Validate
  if(!res) throw new Error("getTokenOwner() Failed to Fetch Persona res("+res+") from Chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"'");
  //Log
  // logger.warn("[TEST] getTokenOwner() Request Params: chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"' Ret:" + JSON.stringify(res) );  //V
  return res;
};

/**
 * Get the Token URI
 * @param {*} chain 
 * @param {*} contract 
 * @param {*} tokenId 
 */
 const getTokenURI = async (chain, contract, tokenId) => {
  //Fetch ABI for Contract
  let abi = await getABI(chain, contract);
  //Validate
  if(!abi) throw new Error("Missing ABI for Contract:"+contract+" on Chain:"+chain);
  let options = {
    abi: JSON.parse(abi),
    address: contract,
    function_name: 'tokenURI',
    params: { tokenId },
    chain,
  };
  //Log
  // logger.warn("[DEBUG] getTokenURI() Run W3 Request:" + JSON.stringify(options) );  //V
  //Run W3 Request
  let res = await Moralis.Web3API.native.runContractFunction(options);
  //Validate
  if(!res) throw new Error("getTokenURI() Failed to Fetch Persona res("+res+") from Chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"'");
  //Log
  // logger.warn("[DEBUG] getTokenURI() Request Params: chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"' Ret:" + JSON.stringify(res) );  //V
  return res;
};

/**
 * Fetch Persona from Chain & Save to DB
 * @param {*} chain 
 * @param {*} contract 
 * @param {*} tokenId 
 * @returns ParseObject
 */
const cachePersona = async (chain, contract, tokenId) => {
  //Validate
  if(!chain || !contract || !tokenId) throw new Error("Missing Parameters -- Contract:"+contract+" Chain:"+chain+" TokenId:"+tokenId);
  //Fetch Token Owner
  let owner = await getTokenOwner(chain, contract, tokenId);
  // let token_uri = await getTokenURI(chain, contract, tokenId);
  
  //Register & return ParseObject
  let persona = new Persona(
    // {
    //   chain,
    //   address: contract,
    //   token_uri: tokenId,
    // }
  );
  await persona.save({
    chain,
    address: contract,
    token_id: tokenId.toString(),
    // token_uri, 
    owner, 
  }, {useMasterKey: true});
  // logger.warn("[i] cachePersona() Cached New Persona: chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"' owner:'"+owner+"' Persona:" + JSON.stringify(persona) ); //V
  //Return new Persona Object
  return persona;
};

//-- PRODUCTION

/**
 * Register Persona to Network
 * @param {*} chain
 * @param {*} contract
 * @param {*} token_id
 * @param {*} handle
 */
 Moralis.Cloud.define("personaRegister", async (request) => {
  const { handle, contract, token_id, chain } = request.params;
  //Validate Parameters
  if(!contract || !token_id || !chain) throw new Error("Missing Parameters (chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"' handle:'"+handle+"')");
  //Validate Handle
  let isFree = await isHandleFree(handle);
  if(!isFree) throw new Error({msg:"Handle:'"+handle+"' is already owned", code:"owned"});

  //Log
  logger.warn("[TEST] personaRegister() Request Params: chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"' handle:'"+handle+"'");
    
  //Get / Add Persona
  const query = new Moralis.Query(Persona);
  query.equalTo("chain", chain);
  query.equalTo("address", contract);
  query.equalTo("token_id", token_id);
  const results = await query.limit(1).find();
  //Extract Persona From Result or Make New
  const personaGet = async (results) => {
    if(results.length) return results[0];
    logger.warn("[TEST] personaRegister() Register Token to DB chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'");
    return await cachePersona(chain, contract, token_id);
    // logger.warn("[TEST] personaRegister() Cached New Persona:" + JSON.stringify(persona) );
  }
  //Fetch Persona (Get or Make New)
  let persona = await personaGet(results);
  //Validate
  if(!persona) throw new Error("Failed to Fetch Persona -- chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'")
  if(handle){
    //Add Handle to Persona
    persona.save({handle: String(handle).trim().toLowerCase()}, {useMasterKey: true});
    //Log
    logger.log("personaRegister() Saved Persona to Handle:'"+String(handle).trim().toLowerCase()+"'");
  }
  return true;
});//personaRegister()


//-- TESTING

/**
 * Fetch Metadata From URI
 * @param string uri 
 * @returns object
 */
const fetchMetadata = async (uri) => {
  //Validate URI
  if(!uri || !uri.includes('://'))throw new Error("Invalid URI:'"+uri+"'");
  logger.warn("[DEBUG] fetchMetadata() Valid URI:'"+uri);

  try{
    //Fetch
    // let metadata = await fetch(uri).then(res => res.json()); //No fetch on Cloud Server
    let metadata = await Moralis.Cloud.httpRequest({url: uri})
      .then(httpResponse => httpResponse.text)
      .catch(err => { throw new Error("fetchMetadata() Failed to Fetch URI:'"+uri+"' Error:"+err+""); } );
    //Validate
    if(!metadata) throw new Error("fetchMetadata() No Metadata found on URI:'"+uri+"'");
    metadata = JSON.parse(metadata);  //JSON As Object
    // logger.warn("[DEBUG] fetchMetadata() Found metadata type:" + typeof metadata);
    // logger.warn("[DEBUG] fetchMetadata() Found metadata: " + metadata);
    logger.warn("[DEBUG] fetchMetadata() Found metadata Obj: " + JSON.stringify(metadata));
    //Return
    return metadata;
  }catch(err){
    throw new Error("[DEBUG] fetchMetadata()  Failed to Fetch URI:'"+uri+"' Error:"+err+"");
  }
};//fetchMetadata

/**
 * Update Persona Metadata
 * @param {*} personaId 
 * @returns object metadata
 */
Moralis.Cloud.define("personaMetadata", async (request) => {
  //Extract Params
  const { personaId } = request.params;

  // logger.warn("[TEST] personaMetadata() Start W/Persona ID:'"+personaId+"'" );

  //Validate Parameters
  if(!personaId) throw new Error("Missing Parameters (personaId:'"+personaId+"')  Params: "+JSON.stringify(request.params));
  const query = new Moralis.Query(Persona);
  let persona = await query.get(personaId,  {useMasterKey: true})
    .catch(err => {throw new Error("personaMetadata() Failed to Fetch Persona:'"+personaId+"' Error:'"+err+"'")});
  if(!persona) throw new Error("Failed to Load Persona:"+personaId);
  const { chain, address:contract, token_id:tokenId } = persona.attributes;

  // logger.warn("[DEBUG] personaMetadata() Extracted Data Persona:"+personaId+" -- Address:"+contract+" Chain:"+chain+" token_id:"+tokenId);

  // const { chain, address:contract, token_id:tokenId } = persona; 
  // const cachePersona = async (chain, contract, tokenId) => {
    //Validate
    if(!chain || !contract || !tokenId) throw new Error("Missing Data on Persona:"+personaId+" -- Address:"+contract+" Chain:"+chain+" token_id:"+tokenId);

    if(!persona.get('owner')){
      // logger.warn("[TEST] personaMetadata() Fetch Owner for Persona:"+persona.id );  //V
      //Fetch Token Owner
      getTokenOwner(chain, contract, tokenId).then(owner => {
        //Update Owner
        if(owner) persona.save({owner: owner}, {useMasterKey: true});
        else logger.error("personaMetadata() Found no Owner for Persona:"+persona.id+" (Owner:'"+owner+"')"); 
      })
      .catch(err => { logger.error("personaMetadata() Failed to Fetch Owner for Persona:"+persona.id+" Error:"+err); });
    }//No owner
    // else logger.warn("[TEST] personaMetadata() Has Owner:'"+persona.get('owner')+"' on Persona:"+persona.id+"");  //V

    //Fetch Token URI
    let token_uri = await getTokenURI(chain, contract, tokenId)
      .catch(err => {throw new Error("personaMetadata() Failed to Fetch Token Owner:'"+personaId+"' Error:'"+err+"'")});
    // logger.warn("[DEBUG] personaMetadata() Got Token URI:'"+token_uri+"' current URI:"+persona.get('token_uri') ); 

  try{
    //Validate
    if(token_uri !== persona.get('token_uri')){
      // logger.warn("[DEBUG] personaMetadata() Run Metadata Fetch for Token URI:'"+token_uri);

      //Fetch Metadata
      // let metadata = await fetchMetadata(token_uri);
      let metadata = await fetchMetadata(resolveLink(token_uri))
        .catch(err => {throw new Error("personaMetadata() Failed to Fetch Metadata for Persona:'"+personaId+"' URI:'"+resolveLink(token_uri)+"' Error:'"+err+"'")});
      //Validate
      if(!metadata || Object.keys(metadata).length === 0) throw new Error("Empty Metadata Pulled from Token URI:'"+resolveLink(token_uri)+"' metadata:'"+JSON.stringify(metadata)+"'");
      //Log
      logger.warn("[DEBUG] personaMetadata() Save URI:'"+token_uri+"' Metadata:"+JSON.stringify(metadata));

      //Save
      await persona.save({token_uri, metadata}, {useMasterKey: true})
        .catch(err => {throw new Error("personaMetadata() Failed to Save Persona:'"+personaId+"' Error:'"+err+"'")});

      // logger.log("[i] personaMetadata() Updated Metadata for Persona:'"+personaId+"'" );

      //Return
      return metadata;
    }
    // else logger.log("[i] personaMetadata() URI Up to date -- No Update Needed for Persona:'"+personaId);   //Error: TypeError: args is not iterable
  }catch(err){
    throw new Error(" personaMetadata() Failed to Fetch Metadata -- From URI:'"+token_uri+"' for Persona:'"+personaId+"' (same:"+(token_uri == persona.get('token_uri'))+")Error:"+err);
  }
  // };

  // logger.warn("[DEBUG] personaMetadata() DONE -- Same URI:'"+token_uri+"' Persona:"+JSON.stringify(persona));
  // logger.warn("[DEBUG] personaMetadata() DONE -- Same URI:'"+token_uri+"' Return Metadata:"+JSON.stringify(persona.get('metadata')));

  //Return new Persona Object
  return persona.get('metadata');


});//personaMetadata() 

/**
 * Un-Register Persona from Network
 */
Moralis.Cloud.define("personaUnregister", async (request) => { 
    const handle = request?.params?.handle;
    if(!handle) throw new Error("Missing Handle");
    const query = new Moralis.Query(Persona);
    query.equalTo("handle", String(handle).trim().toLowerCase());
    const results = await query.find();
    if(!results.length) throw new Error("Handle:'"+handle+"' not found");
    const persona = results[0];
    //Remove Handle
    persona.save({handle:null}, {useMasterKey: true});
    //Return
    return true;
});

/**
 * Get Personas for Account
 */
Moralis.Cloud.define("getPersonas", async (request) => {  
    let options = {
      chainId: "0x4", //Default to Rinkbey
    };
  
    // options.account = request.params?.account ? request.params.account : "CURRENT_ACCOUNT";
    if(request.params?.account) options.account = request.params.account;
  
    //Log
    logger.warn("[TEST] getPersonas() for Current User:"+request.user?.id, {options});
  
    //Fetch 
    let nfts = Moralis.getNFTBalance(options);
    
    
    logger.warn(nfts);
    logger.log(request.user);
    
    //Return NFTs
    return nfts;
});
  