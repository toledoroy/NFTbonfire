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
   if(handle===null || handle===undefined) return true;
  //Validate Type
  if(typeof handle !== 'string') throw new Error("Handle expected to be a String. Received: "+JSON.stringify(handle));
  //Reserved 
  const reserved = [
    'persona','account', 'wait', 'get', 'home', 'nft', 'airdrop', 'airdrops', 'mint', 'burn', 'account', 'wallet', 'balance', 'chat', 'forum', 'enter',
    'info', 'contact', 'contactus', 'transfer', 'transfers', 'room', 'space', 'category', 'entity', 'product', 'products',  //Pages
    'send', 'view', 'edit', 'delete', 'api', 'api2', 'soap', 'rss', 'atom', 'exit', 'subscribe', 'unsubscribe', 'register', 'loging', 'logout', 'signin', 'signup',
    'roy', 'tatiana', 'maya', 'admin',   //Reserved
    '...'];
  if(reserved.includes(String(handle).toLowerCase())) return false;
  //Check if Handle Already Exists in DB
  const query = new Moralis.Query(Persona);
  query.equalTo("handle", String(handle).toLowerCase());
  const results = await query.find();

  // logger.warn("[TEST] isHandleFree() Found "+results.length+" Results for Handle:"+handle+"");
  // logger.warn("[TEST] isHandleFree() Found "+results.length+" Results for Handle:"+handle+" Results: " + JSON.stringify(results));

  //True if Empty
  return (results.length === 0);
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
  query.equalTo("address", String(address).toLowerCase(), 'i'); //Supposed to be Case Insensitive
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
  logger.warn("[DEBUG] getTokenURI() Request Params: chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"' Ret URI:" + JSON.stringify(res) );  //V
  return res;
};

/**
 * Fetch Metadata From URI
 * @param string uri 
 * @returns object
 */
 const fetchMetadata = async (uri) => {
  //Validate URI
  if(!uri || !uri.includes('://'))throw new Error("Invalid URI:'"+uri+"'");
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
 * Fetch Persona from Chain & Save to DB (Lasy Sync)
 *  Sould only be called when persona is not yet in DB
 * @param {*} chain 
 * @param {*} contract 
 * @param {*} tokenId 
 * @returns ParseObject
 */
const cachePersona = async (chain, contract, tokenId) => {
  //Validate
  if(!chain || !contract || !tokenId) throw new Error("Missing Parameters -- Contract:"+contract+" Chain:"+chain+" TokenId:"+tokenId);
  //Register & return ParseObject
  let persona = new Persona();
  //Basic Params
  let params = {
    chain,
    address: contract,
    token_id: tokenId.toString(),
  };
  await persona.save(params, {useMasterKey: true});//.then(async (res) => {
    
  //Fetch Token Owner
  getTokenOwner(chain, contract, tokenId).then((owner) => {
    persona.save({owner: owner.toLowerCase()}, {useMasterKey: true});
  }).catch((err) => {
    logger.error("cachePersona() Failed to Fetch Persona Owner from Chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"'");
  });

  //Fetch Token URI
  const token_uri = await getTokenURI(chain, contract, tokenId).catch((err) => {
    logger.error("cachePersona() Failed to Fetch Persona token_uri from Chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"'");
  });
  
  if(token_uri){
    //Save URI
    persona.save({token_uri}, {useMasterKey: true}).catch(async (err) => {
      logger.error("cachePersona() Error: "+err+"  Failed to Save Persona: "+JSON.stringify(persona));
    });
    //Fetch Metadata
    const metadata = await fetchMetadata(resolveLink(token_uri)).catch((err) => {
      logger.error("cachePersona() Failed to Fetch Persona metadata from Chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"'");
    });
    //Save Metadata
    await persona.save({metadata}, {useMasterKey: true});
  }//Has URI
  
  logger.warn(" [FYI] cachePersona() Cached New Persona: chain:'"+chain+"' tokenId:'"+tokenId+"'");
  //Return new Persona Object
  return persona;
};

/**
 * Check if User is The Owner of a Persona
 * @param {*} persona 
 * @param {*} user 
 * @returns 
 */
 const doesUserOwnPersona = (persona, user) => {
  //Validate
  if(!persona || !user) throw new Error("Missing Parameters (persona or user)");
  //Check
  return (user.get('accounts').includes(persona.get('owner').toLowerCase()));
};


//-- PRODUCTION

/**
 * Check if Handle is Free
 */
Moralis.Cloud.define("isHandleFree", async (request) => {
  //Validate
  if(request?.params?.handle===undefined) throw new Error("isHandleFree() Missing Handle Params:"+JSON.stringify(request?.params));
  // logger.warn("[i] isHandleFree() Request Params:" + JSON.stringify(request?.params));  //V
  //Check if Handle Already Exists in DB
  return isHandleFree(request.params.handle); 
});

/**
 * Register Handle to Persona by Persona ID
 */
Moralis.Cloud.define("personaRegisterById", async (request) => {
  let { handle, personaId } = request.params;
  //Validate Parameters
  if(!personaId) throw new Error("personaRegisterById() Missing Parameters for handle:'"+handle+"' (chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"' personaId:'"+personaId+"')");
  //Normalize Handle
  if(handle!==undefined && handle!==null) handle = String(handle).trim().toLowerCase();
  // if(handle==='') handle = null;
  //Get / Add Persona
  const query = new Moralis.Query(Persona);
  // const persona = await query.get(personaId, {useMasterKey: true});
  const persona = await query.get(personaId);
  //Validate
  if(!persona) throw new Error("personaRegisterById() Failed to Fetch Persona ID:'"+personaId+"'")
  //Validate
  // if(handle != curHandle){
  if(handle !== persona.get('handle')){
    //Validate Permissions
    if(!doesUserOwnPersona(persona, request.user)) throw new Error("personaRegisterById() User does not own Persona ID:'"+personaId+"'");
    //Validate Handle
    let isFree = await isHandleFree(handle);
    if(!isFree) throw new Error("Handle:'"+handle+"' is already owned");
    if(handle.match(/^[0-9a-zA-Z]+$/) === null) throw new Error("Handle:'"+handle+"' can't contain special characters");
    if(handle.length < 4) throw new Error("Handle:'"+handle+"' is too short");
    //Set Persona's Handle
    persona.save({handle}, {useMasterKey: true});
    //Log
    logger.info("personaRegisterById() Saved Persona to Handle:'"+handle+"'");
  }
  else logger.info("personaRegisterById() Persona:'"+persona.id+"' Already Owns Handle:'"+handle+"'");
  return true;
});//personaRegisterById()

/**
 * Register Persona to Network, Register Handle to Persona, or Both
 * @param {*} chain
 * @param {*} contract
 * @param {*} token_id
 * @param {*} handle
 */
 Moralis.Cloud.define("personaRegister", async (request) => {
  const { contract, token_id, chain } = request.params;
  let { handle } = request.params;
  //Normalize Handle
  if(handle!==undefined && handle!==null) handle = String(handle).trim().toLowerCase();
  // if(handle==='') handle = null;
  //Validate Parameters
  if(!contract || !token_id || !chain) throw new Error("Missing Parameters (chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"' handle:'"+handle+"')");
  //Log
  // logger.warn("[TEST] personaRegister() Request Params: chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"' handle:'"+handle+"'");
  //Fetch (Get or Make) Persona
  let persona = await personaGetOrMake(chain, contract, token_id);
  //Validate
  if(!persona) throw new Error("Failed to Fetch Persona -- chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'")
  if(handle){
    //Validate Permissions
    if(!doesUserOwnPersona(persona, request.user)) throw new Error("personaRegister() User does not own Persona chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'");
    //Register Handle to Persona
    if(handle !== persona.get('handle')){
      //Validate Handle
      let isFree = await isHandleFree(handle);
      if(!isFree) throw new Error("Handle:'"+handle+"' is already owned");
      //Set Persona's Handle
      persona.save({handle}, {useMasterKey: true});
      //Log
      logger.info("personaRegister() Saved Persona to Handle:'"+handle+"'");
    }//Different Handle
    else logger.info("personaRegister() Persona:'"+persona.id+"' Already Owns Handle:'"+handle+"'");
  }//Has Handle
  return true;
});//personaRegister()

/**
 * Sync Logic -- Update Persona on DB from Chain
 * @param {*} personaId 
 * @returns object metadata
 */
Moralis.Cloud.define("personaUpdate", async (request) => {
  //Extract Params
  const { personaId } = request.params;
  // logger.warn("[TEST] personaUpdate() Start W/Persona ID:'"+personaId+"'" );

  //Validate Parameters
  if(!personaId) throw new Error("personaUpdate() Missing Parameters (personaId:'"+personaId+"')  Params: "+JSON.stringify(request.params));
  const query = new Moralis.Query(Persona);
  let persona = await query.get(personaId,  {useMasterKey: true})
    .catch(err => {throw new Error("personaUpdate() Failed to Fetch Persona:'"+personaId+"' Error:'"+err+"'")});
  if(!persona) throw new Error("Failed to Load Persona:"+personaId);
  const { chain, address:contract, token_id:tokenId } = persona.attributes;
  //Validate
  if(!chain || !contract || !tokenId) throw new Error("Missing Data on Persona:"+personaId+" -- Address:"+contract+" Chain:"+chain+" token_id:"+tokenId);
  if(!persona.get('owner')){
    // logger.warn("[TEST] personaUpdate() Fetch Owner for Persona:"+persona.id );  //V
    //Fetch Token Owner
    getTokenOwner(chain, contract, tokenId).then(owner => {
      //Update Owner
      if(owner) persona.save({owner: owner}, {useMasterKey: true});
      else logger.error("personaUpdate() Found no Owner for Persona:"+persona.id+" (Owner:'"+owner+"')"); 
    })
    .catch(err => { 
      logger.error("personaUpdate() Failed to Fetch Owner for Persona:"+persona.id+" Error:"+err); 
    });
  }//No owner
  // else logger.warn("[TEST] personaUpdate() Has Owner:'"+persona.get('owner')+"' on Persona:"+persona.id+"");  //V

  //Fetch Token URI
  let token_uri = await getTokenURI(chain, contract, tokenId)
    .catch(err => { 
      if(err.code == 141){
        // throw new Error("personaUpdate() Failed to Fetch Token Owner:'"+personaId+"' Error:'"+err+"'");   
      }
      throw new Error("personaUpdate() Failed to Fetch Token Owner:'"+personaId+"' Error:'"+err+"'"); 
    });
  //Validate
  if(token_uri !== persona.get('token_uri')){
    //Fetch Metadata
    let metadata = await fetchMetadata(resolveLink(token_uri))
      .catch(err => {throw new Error("personaUpdate() Failed to Fetch Metadata for Persona:'"+personaId+"' URI:'"+resolveLink(token_uri)+"' Error:'"+err+"'")});
    //Validate
    if(!metadata || Object.keys(metadata).length === 0) throw new Error("Empty Metadata Pulled from Token URI:'"+resolveLink(token_uri)+"' metadata:'"+JSON.stringify(metadata)+"'");
    //Log
    // logger.warn("[DEBUG] personaUpdate() Save URI:'"+token_uri+"' Metadata:"+JSON.stringify(metadata));
    //Save
    await persona.save({token_uri, metadata}, {useMasterKey: true})
      .catch(err => {throw new Error("personaUpdate() Failed to Save Persona:'"+personaId+"' Error:'"+err+"'")});
    //Return
    return metadata;
  }
  // else logger.info("[i] personaUpdate() URI Up to date -- No Update Needed for Persona:'"+personaId);   //Error: TypeError: args is not iterable
  
  //Return new Persona Object
  return persona.get('metadata');
});//personaUpdate() 


//-- TESTING

/**
 * Fetch Persona from DB or Chain (if Missing)
 * @param {*} chain 
 * @param {*} contract 
 * @param {*} token_id 
 * @returns ParseObject Persona
 */
const personaGetOrMake = async (chain, contract, token_id) => {
  //Get / Add Persona
  const query = new Moralis.Query(Persona);
  query.equalTo("chain", chain);
  query.equalTo("address", contract, 'i');
  query.equalTo("token_id", token_id);
  const results = await query.limit(1).find();
  //Extract Persona From Result or Make New
  const personaGet = async (results) => {
    if(results.length) return results[0];
    // logger.info("personaRegister() Register Token to DB chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'");
    return await cachePersona(chain, contract, token_id);
  }
  //Fetch Persona (Get or Make New)
  // let persona = await personaGet(results);
  // return persona;
  return await personaGet(results); //Promise
};

/**
 * Get Persona (from DB or Chain)
 * @param {*} chain 
 * @param {*} contract 
 * @param {*} token_id 
 * @returns ParseObject Persona
 */
 Moralis.Cloud.define("getPersona", async (request) => {  
  //Extract Params
  // const { params } = request;
  const { contract, token_id, chain } = request.params;
  //Validate Parameters
  if(!contract || !token_id || !chain) throw new Error("getPersona() Missing Parameters (chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"')");

  //Fetch Persona
  let persona = await personaGetOrMake(chain, contract, token_id);

  //Log
  logger.warn("[TEST] getPersona() Return Persona for:"+token_id+" -- "+JSON.stringify(persona?.attributes));

  //Return
  return persona;
});

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

    //Remove Handle   (TESTING)
    // persona.save({handle:null}, {useMasterKey: true});
    // persona.save({handle:undefined}, {useMasterKey: true});
    persona.unset('handle').save(null, {useMasterKey: true});
    // persona.save({handle:''}, {useMasterKey: true});
    
    //Return
    return true;
});
