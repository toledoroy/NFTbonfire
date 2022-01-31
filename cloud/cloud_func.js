//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

const logger = Moralis.Cloud.getLogger();
//Objects
// const Relation = Moralis.Object.extend("Relation");  //on Relations

//-- PRODUCTION

const isHash = (string) => (string.substr(0,2) === '0x');

/**
 * Something Like Contract's balanceOf() Function
 *  How many Tokens does Account owns on Contract
 * @param string account 
 * @param string contractAddress 
 * @param string chainId 
 * @returns number
 */
const getBalance = async (account, contractAddress, chainId) => {
  const options = { 
    chain: chainId ? chainId : "0x4", //Default to Rinkbey
    address: account, 
    token_address: contractAddress,
  };
  // const userEthNFTs = await Moralis.Web3API.account.getNFTs(options);  //All NFTs
  let res = await Moralis.Web3API.account.getNFTsForContract(options).then(res => res.total); //NFTs for specified contract
  //Log
  // logger.warn("[TEST] getBalance() Account:'"+account+"' Balance:"+res); //V
  //Return
  return res;
}

/**
 * Check if User is Owns any assets in a Contract (Has Positive balance)
 * @var string account      Requesting Account
 * @var string hash         Contract
 * @var string chain        Chain ID
 * @ret bool
 */
Moralis.Cloud.define("isAllowed", async (request) => { 
  //Validate
  // if(!request?.params?.account || !request?.params?.hash || !request?.params?.chain) throw new Error("Missing Request Parameters (account, hash, chain)");
  if(!request?.params?.hash || !request?.params?.chain) throw new Error("Missing Request Parameters (hash, chain)");
  // const account = request?.params?.account || request.user?.get('ethAddress'); //Check other Accounts
  const account = request.user?.get('ethAddress');  //Only Check Current Account
  // const accounts = request.user?.get('accounts');  //Any of Current Addresses [?]
  //Get Balance
  const balance = await getBalance(account, request.params.hash, request.params.chain);
  //Log
  logger.info("(i) isAllowed() Chain:"+request?.params?.chain+" Account:"+account+" Balance:"+balance);
  //True if has any balance
  return (balance > 0);
});

/**
 * Something Like Contract's balanceOf() Function
 * @param string parentId
 * @returns ?
 */
const hashByPostId = async (parentId) => {
  if(!parentId || isHash(parentId)) return parentId;
  let ret = parentId;
  try{
    const query = new Moralis.Query("Post");
    //Climb up the Parent Ladder untill hitting a Hash (or Empty)
    let count = 0;
    while(ret && !isHash(ret)){
      // logger.warn("hashByPostId() '"+ret+"' is Not Hash");
      //Fetch Parent
      // let parentPost = await query.get(ret);
      let parentPost = await query.select("parentId").get(ret, {useMasterKey: true});
      // logger.warn("hashByPostId() Parent Post for id:'"+ret+"' -- "+JSON.stringify(parentPost)); 
      // logger.warn("hashByPostId() Climb from:"+ret+" to "+parentPost.get('parentId'));   //V
      //Get its Parent
      ret = parentPost.get('parentId');
      //Depth Check
      ++count;
      if(count >= 10) throw new Error("hashByPostId() Entity is too Deep (D:"+count+")");
    }
  }
  catch(error){ 
    logger.error("hashByPostId() Exception Caught: "+JSON.stringify(error)); 
    // logger.error(error);
  }
  //Return
  return ret;
}


//-- TESTING




//-- DEV

Moralis.Cloud.define('dbSchema', request => {
    
  //TODO: Test This

  //[DEV] Schema Stuff        https://parseplatform.org/Parse-SDK-JS/api/2.9.0/Parse.Schema.html
  const schema = new Moralis.Schema('Persona');
  console.warn("[DEV] Moralis Persona Schema:"+JSON.stringify(schema));
  // const options = { required: true, defaultValue: 'hello world' };
  // schema.addString('TestField', options);
  schema.addIndex('i_handle', { 'handle': 1 });
  // schema.save();
  schema.save(null, {useMasterKey: true});

  /* TODO: Edit Schema
  const schema = new Moralis.Schema('Post');
  console.warn("[DEV] Moralis Schema:", schema);
  const options = { required: true, defaultValue: 'hello world' };
  schema.addString('TestField', options);
  schema.addIndex('index_name', { 'TestField': 1 });
  schema.save();
  */
});


const validationRules = request => {
  if (request.master) { return; }
  if (!request.user || request.user?.id !== 'masterUser') { throw 'Unauthorized'; }
}

Moralis.Cloud.define('adminFunction', request => {
  // do admin code here, confident that request.user?.id is masterUser, or masterKey is provided
},validationRules)

/** TEST Func.
 * 
 */
Moralis.Cloud.define("sayHi", async (request) => {  
    return "Hi! 👋"; 
});
