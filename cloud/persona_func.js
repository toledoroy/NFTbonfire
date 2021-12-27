//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

// const logger = Moralis.Cloud.getLogger();

//-- PRODUCTION

/**
 * Check if User Owns NFT
 * @param {*} userId  User ID
 * @param {*} hash   NFTs Hash
 * @returns 
 */
const isHandleFree = async (handle) => {
  const reserved = ['persona','account', '...'];
  if(reserved.includes(handle.toLowerCase())) return false;

  //Check if Handle Already Exists in DB
  const Persona = Moralis.Object.extend("Persona");
  const query = new Moralis.Query(Persona);
  query.equalTo("handle", handle.toLowerCase());
  const results = await query.find();

  logger.warn("[TEST] Found "+results.length+" Results for Requested Handle:"+handle+" Results: " + JSON.stringify(results));

  //True if Empty
  return (results.length == 0);
};//isHandleFree()
  

const Persona = Moralis.Object.extend("Persona");

/**
 * Fetch Persona from Chain & Save to DB
 * @param {*} chain 
 * @param {*} contract 
 * @param {*} tokenId 
 * @returns ParseObject
 */
const cachePersona = async (chain, contract, tokenId) => {
    // address = Persona.getContractAddress(chain)
    let options = {
      abi: Persona.getABI(chain),
      address: contract,
      function_name: 'tokenURI',
      params: { tokenId },
      chain,
  };
  let res = await Moralis.Web3API.native.runContractFunction(options);   //Through Server (All Chains)
  //Validate
  if(!res) throw new Error("cachePersona() Failed to Fetch Persona from Chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"'");
  //Log
  logger.warn("[TEST] cachePersona() Request Params: chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"' Ret:" + JSON.stringify(ret) );
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
    token_uri: tokenId,
  }, {useMasterKey: true});

  logger.warn("[TEST] cachePersona() Cached New Persona: chain:'"+chain+"' tokenId:'"+tokenId+"' contract:'"+contract+"' Persona:" + JSON.stringify(persona) );
  //Return new Persona Object
  return persona;
};

//-- TESTING

/**
 * Register Persona to Network
 */
Moralis.Cloud.define("personaRegister", async (request) => {  
  const { handle, contract, token_id, chain } = request.params;
    
  //Log
  logger.warn("[TEST] personaRegister() Request Params: chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'");

  //Validate Parameters
  if(!handle || !contract || !token_id || !chain) throw new Error("Missing Parameters (handle, contract, token_id, chain)");
  //Validate Handle
  let isFree = await isHandleFree(handle);
  if(!isFree) throw new Error("Handle:'"+handle+"' is already owned");
  //Get / Add Persona
  const query = new Moralis.Query(Persona);
  query.equalTo("chain", chain);
  query.equalTo("address", contract);
  query.equalTo("token_id", token_id);
  const results = await query.limit(1).find();


  const personaGet = (res) => {
    return res[0] ? res[0] : 'Empty';
  }
  logger.warn("[TEST] personaRegister() personaGet:"+personaGet(res));


  if(results.length == 0){
    logger.warn("[TEST] personaRegister() Register Token to DB chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'");
    let persona = await cachePersona(chain, contract, tokenId);
    //Validate
    if(!persona) throw new Error("Failed to Fetc Persona -- chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'")
    persona.save({handle: handle.trim().toLowerCase()}, {useMasterKey: true});
    // persona.save({handle: handle.trim().toLowerCase(), owner:request.user?.id}, {useMasterKey: true});
  }
  else{
    let persona = resutls[0];
    // persona.set('handle', handle);
    persona.save({handle: handle.trim().toLowerCase()}, {useMasterKey: true});
    // persona.save({handle: handle.trim().toLowerCase(), owner:request.user?.id}, {useMasterKey: true});
  }
  
  //Log
  logger.log("personaRegister() Registered Handle:'"+handle+"' to token_id:'"+token_id+"' chain:'"+chain+"' contract:'"+contract+"'");
});

/**
 * Un-Register Persona from Network
 */
Moralis.Cloud.define("personaUnregister", async (request) => { 
    const handle = request?.params?.handle;
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
  