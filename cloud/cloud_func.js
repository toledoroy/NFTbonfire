//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

const logger = Moralis.Cloud.getLogger();

//-- PRODUCTION

const matchUserNFT = (userId, nftId) => {
  const query = new Moralis.Query("NFTs");
  query.equalTo("userId", userId);
  query.equalTo("nftId", nftId);
  let res = query.find();
  console.log("[TEST] matchUserNFT()", {res, userId, nftId});

  return true;
}//matchUserNFT()


//-- TESTING

Moralis.Cloud.define("matchUserNFT", async (request) => {  
  return matchUserNFT(request.params?.userId, request.params?.nftId);
});



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
      logger.warn("[TEST] post() Current User:"+request.user.id, request.user);
      logger.warn(data);
      
      const Post = Moralis.Object.extend("Post");
      const post = new Post();
      // post.set("userId", request.user.id);
      data.userId = request.user.id;
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
  if (!request.user || request.user.id !== 'masterUser') {
    throw 'Unauthorized';
  }
}

Moralis.Cloud.define('adminFunction', request => {
  // do admin code here, confident that request.user.id is masterUser, or masterKey is provided
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


  
  