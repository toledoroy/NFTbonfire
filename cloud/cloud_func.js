//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

const logger = Moralis.Cloud.getLogger();

//-- PRODUCTION

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
  logger.warn("[TEST] getBalance() Account:'"+account+"' Balance:"+res);
  //Return
  return res;
}

/**
 * Check if User is Owns any assets in a Contract (Has Positive balance)
 * @var string account      Requesting Account
 * @var string hash         Contract
 * @var string chainId      Chain ID
 * @ret bool
 */
Moralis.Cloud.define("isAllowed", async (request) => { 
  //Validate
  if(!request?.params?.account || !request?.params?.hash || !request?.params?.chainId) throw new Error("Missing Request Parameters (account, hash, chainId)");
  //Get Balance
  const balance = await getBalance(request?.params?.account, request?.params?.hash, request?.params?.chainId);
  //Log
  logger.warn("[TEST] isAllowed() Chain:"+request?.params?.chainId+" Account:"+request?.params?.account+" Balance:"+balance);
  //True if has any balance
  return (balance > 0);
});

const isHash = (string) => (string.substr(0,2) === '0x');

/**
 * Something Like Contract's balanceOf() Function
 * @param string parentId
 * @returns ?
 */
 const hashByPostId = async (parentId) => {
  // const options = { 
  //   chain: chainId ? chainId : "0x4", //Default to Rinkbey
  //   address: account, 
  //   token_address: contractAddress,
  // };
  // // const userEthNFTs = await Moralis.Web3API.account.getNFTs(options);  //All NFTs
  // let res = await Moralis.Web3API.account.getNFTsForContract(options).then(res => res.total); //NFTs for specified contract
  // //Log
  // logger.warn("[TEST] hashByPostId() Account:'"+account+"' Balance:"+res);
  // //Return
  // return res;
}

//-- TESTING

/**
 * Post Validation
 * Make sure that author has access to Room
 */
Moralis.Cloud.beforeSave('Post', async request => {

  const object = request.object;
  logger.warn("Post Object: "+JSON.stringify(object));
  // logger.warn("Post User: "+JSON.stringify(request.user));
  logger.warn("Post User Account: "+request.user?.get('ethAddress'));
  // logger.warn("Post User Accounts: "+JSON.stringify(request.user?.get('accounts')));
  // logger.warn("Post Context: "+JSON.stringify(request.context));  

  let data = {
    account: request.user?.get('ethAddress'),
    
    account2: object.account, //X
    isHashTest:isHash(request.user?.get('ethAddress')),

    // hash:
    chainId: object.chain,
  }
  logger.warn("Post Data: "+JSON.stringify(data));  

  try{
    //Get Balance
    const balance = await getBalance(data.account, data.hash, data.chainId);
    if(balance <= 0) throw new Error("User Not Allowed in Room");
  }catch(error){  
    console.log("Exception Caught: "+JSON.stringify(error));
  }
  
  throw new Error("TEST FAILURE");
  
  // const user = request.object;
  // if (!user.get("email")) throw "Every user must have an email address.";

});


Moralis.Cloud.define("justLog", async (request) => {  
  let valid = matchUserNFT(request?.params?.userId, request?.params?.hash, request?.params?.chainId);
  logger.warn("[TEST] ******* justLog() User:"+request?.params?.userId+" is Valid: "+valid);
  logger.info(request?.params?.hash);
  return true;
});


/* VOTES */

/**
 * Vote on Post 
 * @var string postId
 * @var num vote [0/1/-1]
 */
Moralis.Cloud.define("postVote", async (request) => {  
  //Log
  logger.warn("[TEST] postVote() for Current User:"+request.user?.id+" PostId:"+request.params?.postId+" Vote:"+request.params?.vote);
  //Validate
  if(!request?.user?.id) throw "Unauthorized User - Must Log In";


});
/*
Moralis.Cloud.define("voteUp", async (request) => {  
  // request.user
  // request.params?.postId
  logger.log("[TEST] voteUp() from user:"+request.user?.id, {user:request.user, postId:request.params?.postId});
  //Validate
  if(!request?.user?.id) throw "Unauthorized User - Must Log In";
});
Moralis.Cloud.define("voteDown", async (request) => {  
  logger.log("[TEST] voteDown() from user:"+request.user?.id, {user:request.user, postId:request.params?.postId});
  //Validate
  if(!request?.user?.id) throw "Unauthorized User - Must Log In";
});
*/

//-- DEV

/**
 * Check if User Owns NFT
 * @param {*} userId  User ID
 * @param {*} hash   NFTs Hash
 * @returns 
 */
 const matchUserNFT = (userId, hash, chainId) => {
  // const query = new Moralis.Query("NFTs");
  // query.equalTo("userId", userId);
  // query.equalTo("hash", hash);
  // let res = query.find();

  //Log
  // logger.info("[TEST] matchUserNFT() Result for User:'"+userId+"' Contract:'"+hash+"' - "+res);
  // logger.info({res, userId, hash});
  // if(0) throw "User Not Autorized for Selected NFT:'"+hash+"'";
  return true;
}//matchUserNFT()

/** THIS SHOUD MOVE TO CLIENTSIDE!
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


const validationRules = request => {
  if (request.master) {
    return;
  }
  if (!request.user || request.user?.id !== 'masterUser') {
    throw 'Unauthorized';
  }
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
 */
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


  
  