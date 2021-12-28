//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

// const logger = Moralis.Cloud.getLogger();

const Persona = Moralis.Object.extend("Persona");
const Contract = Moralis.Object.extend("Contract");

//-- Helper Functions

/**
 * Check if User Owns NFT
 * @param {*} userId  User ID
 * @param {*} hash   NFTs Hash
 * @returns 
 */
 const isHandleFree = async (handle) => {
  const reserved = ['persona','account', '...'];
  if(reserved.includes(handle.toLowerCase())) return false;

  // const Persona = Moralis.Object.extend("Persona");
  
  //Check if Handle Already Exists in DB
  const query = new Moralis.Query(Persona);
  query.equalTo("handle", handle.toLowerCase());
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
 * Get the Owner of a Token
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
 * Get the Owner of a Token
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
  // logger.warn("[TEST] getTokenURI() Run W3 Request:" + JSON.stringify(options) );  //V
  //Run W3 Request
  let res = await Moralis.Web3API.native.runContractFunction(options);
  //Validate
  if(!res) throw new Error("getTokenURI() Failed to Fetch Persona res("+res+") from Chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"'");
  //Log
  // logger.warn("[TEST] getTokenURI() Request Params: chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"' Ret:" + JSON.stringify(res) );  //V
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
 */
 Moralis.Cloud.define("personaRegister", async (request) => {
  const { handle, contract, token_id, chain } = request.params;
  //Validate Parameters
  if(!handle || !contract || !token_id || !chain) throw new Error("Missing Parameters (chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"' handle:'"+handle+"')");
  //Validate Handle
  let isFree = await isHandleFree(handle);
  if(!isFree) throw new Error("Handle:'"+handle+"' is already owned");

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
  //Add Handle to Persona
  persona.save({handle: handle.trim().toLowerCase()}, {useMasterKey: true});
  //Log  
  logger.log("personaRegister() Saved Persona to Handle:'"+handle.trim().toLowerCase()+"'");
  //Log
  // logger.warn("personaRegister() Registered Handle:'"+handle+"' to token_id:'"+token_id+"' chain:'"+chain+"' contract:'"+contract+"'");
  return true;
});


//-- TESTING

const fetchMetadata = async (uri) => {
  //Validate URI
  if(!token_uri || !token_uri.includes('://'))throw new Error("Invalid URI:'"+uri+"'");
  //Fetch
  let metadata = await fetch(uri).then(res => res.json());
  //Validate
  if(!metadata) throw new Error("fetchMetadata() No Metadata found on URI:'"+uri+"'");
  //Return
  return metadata;
};//fetchMetadata

/**
 * Update Persona Metadata
 * @param {*} personaId 
 * @returns object metadata
 */
Moralis.Cloud.define("personaMetadataUpdate", async (request) => {
  // const { contract, token_id, chain } = request.params;
  //Validate Parameters
  // if(!contract || !token_id || !chain) throw new Error("Missing Parameters (chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"' handle:'"+handle+"')");

  const { personaId } = request.params;
  //Validate Parameters
  if(!personaId) throw new Error("Missing Parameters (personaId:'"+personaId+"')");
  const query = new Moralis.Query(Persona);
  let persona = await query.get(personaId,  {useMasterKey: true});
  if(!persona) throw new Error("Failed to Load Persona:"+personaId);
  const {chain, address:contract, token_id:tokenId} = persona.attributes; 
  // const cachePersona = async (chain, contract, tokenId) => {
    //Validate
    if(!chain || !contract || !tokenId) throw new Error("Missing Data on Persona:"+personaId+" -- Address:"+contract+" Chain:"+chain+" token_id:"+tokenId);
    //Fetch Token Owner
    // let owner = await getTokenOwner(chain, contract, tokenId);
    let token_uri = await getTokenURI(chain, contract, tokenId);
    //Validate
    if(persona.get('token_uri') != token_uri){
      //Fetch Metadata
      let metadata = fetchMetadata(token_uri);
      //Save
      await persona.save({token_uri, metadata}, {useMasterKey: true});
      //Log
      logger.log("[i] personaMetadataUpdate() Updated Metadata for Persona:'"+personaId+"'" );
      //Return
      return metadata;
    }
    else logger.log("[i] personaMetadataUpdate() URI Up to date -- No Update Needed for Persona:'"+personaId+"'" );
    //Return new Persona Object
    return persona.get('metadata');
  // };
  
});
/**
 * Un-Register Persona from Network
 */
Moralis.Cloud.define("personaUnregister", async (request) => { 
    const handle = request?.params?.handle;
    if(!handle) throw new Error("Missing Handle");
    const query = new Moralis.Query(Persona);
    query.equalTo("handle", handle.trim().toLowerCase());
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
  