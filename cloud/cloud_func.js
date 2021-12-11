//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

const logger = Moralis.Cloud.getLogger();

//-- PRODUCTION

/**
 * Check if User Owns NFT
 * @param {*} userId  User ID
 * @param {*} nftId   NFTs Hash
 * @returns 
 */
const matchUserNFT = (userId, nftId) => {
  const query = new Moralis.Query("NFTs");
  query.equalTo("userId", userId);
  query.equalTo("nftId", nftId);
  let res = query.find();
  console.log("[TEST] matchUserNFT()", {res, userId, nftId});
  // if(0) throw "User Not Autorized for Selected NFT:'"+nftId+"'";
  return true;
}//matchUserNFT()


//-- TESTING

Moralis.Cloud.define("matchUserNFT", async (request) => {  
  return matchUserNFT(request.params?.userId, request.params?.nftId);
});

/* PERSONA FUNCTIONS */
/**
 * Get Personas for Account
 */
Moralis.Cloud.define("getPersonas", async (request) => {  
  let options = {
    chainId: "rinkeby",
  };

  // options.account = request.params?.account ? request.params.account : "CURRENT_ACCOUNT";
  if(request.params?.account) options.account = request.params.account;

  //Log
  logger.warn("[TEST] getPersonas() for Current User:"+request.user?.id, {options});

  //Fetch 
  let nfts = Moralis.getNFTBalance(options);
  
  
  logger.warn(nfts);
  logger.log(request.user);
  

  return nfts;
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
  console.log("[TEST] voteUp() from user:"+request.user?.id, {user:request.user, postId:request.params?.postId});
  //Validate
  if(!request?.user?.id) throw "Unauthorized User - Must Log In";
});
Moralis.Cloud.define("voteDown", async (request) => {  
  console.log("[TEST] voteDown() from user:"+request.user?.id, {user:request.user, postId:request.params?.postId});
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
    // console.warn("[TEST] data()", request.params);
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


  
  