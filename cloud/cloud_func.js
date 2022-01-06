//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

const logger = Moralis.Cloud.getLogger();

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
  logger.warn("[TEST] isAllowed() Chain:"+request?.params?.chain+" Account:"+request?.params?.account+" Balance:"+balance);
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
    while(ret && !isHash(ret)){
      // logger.warn("hashByPostId() '"+ret+"' is Not Hash");
      //Fetch Parent
      // let parentPost = await query.get(ret);
      let parentPost = await query.select("parentId").get(ret, {useMasterKey: true});
      logger.error("hashByPostId() Parent Post for id:'"+ret+"' -- "+JSON.stringify(parentPost)); 
      logger.warn("hashByPostId() Climb from:"+ret+" to "+parentPost.get('parentId')); 
      //Get its Parent
      ret = parentPost.get('parentId');
    }
  }
  catch(error){ 
    logger.error("hashByPostId() Exception Caught: "+JSON.stringify(error)); 
    // logger.error(error);
  }
  //Return
  return ret;
}

/**
 * DB - Custom Post Save Validation
 * Make sure that author has access to Room
 */
 Moralis.Cloud.beforeSave('Post', async request => {
  //Fetch Post Object
  const object = request.object;
  // logger.warn("Post Object: "+JSON.stringify(object)); //V
  // logger.warn("Post User: "+JSON.stringify(request.user)); //V
  // logger.warn("Post User Accout: "+request.user?.get('ethAddress')); //V
  // logger.warn("Post User Accounts: "+JSON.stringify(request.user?.get('accounts'))); //V
  // logger.warn("Post Context: "+JSON.stringify(request.context));  //Nothing
  //Fetch Top Hash
  let hash = await hashByPostId(object.get('parentId'));
  // logger.warn("[TEST] beforeSave(Post) parentId:"+object.get('parentId')+"  hash:"+hash);
  //Validate Hash
  if(!hash) throw new Error("Failed to find Hash for Post:'"+object.get('parentId')+"'");
  let data = {
    hash,
    account: request.user?.get('ethAddress'),
    chainId: object.get('chain'),
  }
  // logger.warn("beforeSave(Post) Post Data: "+JSON.stringify(data));  
  //Get Balance
  const balance = await getBalance(data.account, data.hash, data.chainId);
  if(balance <= 0) throw new Error("User Not Allowed in Room (balance:"+balance+")");
});


/* VOTES */

//-- TESTING



//-- DEV



/**
 * Vote on Post 
 * @var string postId
 * @var num vote [0/1/-1]
 */
Moralis.Cloud.define("postVote", async (request) => {  
  
  //Validate
  if(!request?.user?.id) throw "Unauthorized User - Must Log In";
  
  //Log
  logger.warn("[TEST] postVote() for Current User:"+request.user?.id+" PostId:"+request.params?.postId+" Vote:"+request.params?.vote);

  //Extract Parameters
  const { postId, vote } = request.params;
  //Validate
  if(!postId || !vote) throw new Error("Missing Request Parameters (postId, vote)");

  /**
   * TODO: 
   * - Opinon Add
   *  - Add Vote to Post
   *  - Calculate Score
   *  - Fire Event -> Update User Score
   * 
   * - Opinion Change
   *  - Remove Current Vote
   *    - Undo Last Vote (Cascade Deletion)
   *      - Cancel Event
   *     - Recalculate Post Score
   *  - Add New Vote
   *   - ... Recalc
   * 
   *  --> Need a vote event & need to connect that event to all Effects
   */

    //...


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


/** UNUSED
 * 

Moralis.Cloud.define("getPosts", async (request) => {  
  //Extract Parent ID
  let parentId = request?.params?.parentId;
  //Validate
  if(!parentId) throw new Error("Parameter parentId Missing");
  // let limit = request?.params?.limit;
  const query = new Moralis.Query("Posts");
  query.equalTo("parentId", parentId);
  const results = await query.find();
  return results;
});

Moralis.Cloud.define("getRooms", async (request) => {  
  const query = new Moralis.Query("Rooms");
  const results = await query.find();
  return results;
});
*/
  
/** UNUSED - THIS SHOUD MOVE TO CLIENTSIDE!
 * New Post
 *  name: String
 *  text: String      
 *  parentId: String  
 *  userId: String      
 */
 Moralis.Cloud.define("post", async (request) => {  
  try{
    let data = request.params;
    //Log
    // logger.warn("[TEST] data()", request.params);
    logger.warn("[TEST] post() by User:"+request?.user?.id);
    logger.warn(request.params);
    logger.warn(request.user);
    if(request?.user?.id){
      //TODO: Further validation - Get NFT & Validte User's Relation to NFT

      // const query = new Moralis.Query("Post");
      // const results = await query.find();
      // return results;

      //Log
      logger.warn("[TEST] post() Current User:"+request.user?.id, request.user);
      logger.warn(data);
      
      const Post = Moralis.Object.extend("Post");
      // const post = new Post();
      // post.set("userId", request.user?.id);
      data.userId = request.user?.id;
      
      // return post.save(data);

      const post = new Post(data);

      //ACL - Own + Public Read
      // const acl = new Moralis.ACL(request.user);
      
      logger.error(JSON.stringify(Moralis.User.current()));
      logger.error(JSON.stringify(request?.user));
      logger.error(JSON.stringify(data));
      logger.warn("[TEST] post() Current User:"+request.user?.id);

      // const acl = new Moralis.ACL();
      const acl = new Moralis.ACL(Moralis.User.current());
      acl.setPublicReadAccess(true);

      // acl.setRoleWriteAccess("admins", true);
      acl.setRoleReadAccess("opensea", true);   //TEST
      // acl.setWriteAccess(request.user?.id, true);
      post.setACL(acl);

      logger.warn("[TEST] post() ACL: "+JSON.stringify(acl));

      return post.save();

    }//Has User
    else logger.error("[TEST] post() Missing User ID:"+request?.user?.id+"'");
  }
  catch(err){
    logger.error("[CAUGHT] post() Error:"+err, {err, request});
  }
});
