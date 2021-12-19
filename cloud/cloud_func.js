//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

const logger = Moralis.Cloud.getLogger();

//-- PRODUCTION

/**
 * Use Contract's balanceOf() Function
 * @param {*} account 
 * @param {*} contractAddress 
 * @param {*} chainId 
 * @returns 
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


//-- TESTING

Moralis.Cloud.define("justLog", async (request) => {  
  let valid = matchUserNFT(request?.params?.userId, request?.params?.hash, request?.params?.chainId);
  logger.warn("[TEST] ******* justLog() User:"+request?.params?.userId+" is Valid: "+valid);
  logger.info(request?.params?.hash);
  return true;
});

Moralis.Cloud.define("validateAccess", async (request) => {  
  //Get Balance
  const balance = await getBalance(request?.params?.account, request?.params?.hash, request?.params?.chainId);
  //Log
  logger.warn("[TEST] validateAccess() Balance:"+balance);
  //True if has any balance
  return (balance > 0);
  // return matchUserNFT(request?.params?.userId, request?.params?.hash, request?.params?.chainId);
  // return true;
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
    logger.warn("[TEST] post()", request.params);
    if(request?.user?.id){
      //TODO: Further validation - Get NFT & Validte User's Relation to NFT

      // const query = new Moralis.Query("Post");
      // const results = await query.find();
      // return results;

      //Log
      logger.warn("[TEST] post() Current User:"+request.user?.id, request.user);
      logger.warn(data);
      
      const Post = Moralis.Object.extend("Post");
      const post = new Post();
      // post.set("userId", request.user?.id);
      data.userId = request.user?.id;
      return post.save(data);
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


Moralis.Cloud.define("sayHi", async (request) => {  
    return "Hi! 👋"; 
});
Moralis.Cloud.define("getPosts", async (request) => {  
  const query = new Moralis.Query("Posts");
  const results = await query.find();
  return results;
});

Moralis.Cloud.define("getRooms", async (request) => {  
  const query = new Moralis.Query("Rooms");
  const results = await query.find();
  return results;
});


  
  