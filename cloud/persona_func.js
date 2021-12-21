//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

// const logger = Moralis.Cloud.getLogger();

/* PERSONA FUNCTIONS */
/**
 * Check if User Owns NFT
 * @param {*} userId  User ID
 * @param {*} hash   NFTs Hash
 * @returns 
 */
 const isHandleFree = (handle) => {
    const reserved = ['persona','...'];
    if(reserved.includes(handle)) return false;

    //TODO: Check if Handle Already Exists in DB
    const Persona = Moralis.Object.extend("Persona");
    const query = new Moralis.Query(Persona);
    query.equalTo("handle", handle);
    const results = await query.find();

    logger.warn("[TEST] Found "+results.length+" Results for Requested Handle:"+handle);
    logger.warn(results);


    // handle
    return true;
  };//isHandleFree()
  

//-- PRODUCTION


//-- TESTING


/**
 * Register Persona to Network
 */
Moralis.Cloud.define("personaRegister", async (request) => {  
  const { handle, contract, token_id, chain } = request.params;
  // const handle = request?.params?.handle;
  // const personaId = request?.params?.personaId;

  //Log
  logger.warn("[TEST] personaRegister() Request Params: chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"'");
  logger.warn("[TODO] personaRegister() Request from  User:"+request.user?.id+" To Register Handle:'"+handle+"'");

  if(token_id){
    //Register Persona [?]
  }
  
  if(handle){
    //Validate
    if(isHandleFree()){
        //TODO: Register Handle / Save Persona to DB

        const Persona = Moralis.Object.extend("Persona");
        Persona.save({handle, contract, token_id, chain});

        logger.warn("[TEST] personaRegister() Saved Persona chain:'"+chain+"' token_id:'"+token_id+"' contract:'"+contract+"' handle:'"+handle+"' ");
    }
    else throw "Handle Not Available";
  }

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
  