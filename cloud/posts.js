//Objects
const Post = Moralis.Object.extend("Post");

//-- Production

/**
 * Calculate Entity's Score (Based on Relationship Votes)
 * @param {*} entity 
 */
const postChildCount = async (postId) => {
  
  // const results = await query.limit(1).find();
  const query = new Moralis.Query(Post);
  query.equalTo("parentId", postId);
  const count = await query.count({useMasterKey: true});
  //Log
  logger.warn("[TEST] postChildCount() entity:'"+postId+"' Count:"+count);

  return count;
};//postChildCount()


/**
 * DB - Custom Post Save Validation
 * Make sure that author has access to Room
 */
 Moralis.Cloud.afterSave('Post', async request => {
  if(request.master) return;
  //Fetch Post Object
  const object = request.object;
  // logger.warn("[DEV] Post afterSave Hook W/Object: "+JSON.stringify(object));
  // try{
    const parentId = object.get('parentId');
    // logger.warn("[TEST] Post afterSave Hook parentId:"+parentId);
    if(parentId){
      const count = await postChildCount(parentId);
      // logger.warn("[TEST] Post afterSave Hook PostCount:"+count);
      //Fetch Parent Post
      let parentPost = await new Moralis.Query('Post').get(parentId, {useMasterKey: true});
      //Update Parent Post
      parentPost.save({childCount:count}, {useMasterKey: true});
    }

  // }
  // catch(error){
  //   logger.error("[CAUGHT] afterSave Hook: "+JSON.stringify(error));
  // }
});

//-- DEV

/**
 * Post Subscription Management
 * @param string postId
 * @param bool action     [Optional] subscription action  [1-subscribe, 0-unsubscribe]
 */
Moralis.Cloud.define("postSubscribe", async (request) => {  
  //Validate
  if(!request?.user?.id) throw new Error("postSubscribe() Missing User ID:"+request?.user?.id+"'");

  //Extract Parameters
  const { postId, action } = request.params;
  //Validate
  if(!postId) throw new Error("Missing Request Parameters (postId)");
  //Fetch Post 
  let post = await new Moralis.Query('Post').get(postId, {useMasterKey: true});
  //Validate
  if(!post) throw new Error("postVote() Post Not Found: "+postId);

  //TBD...

  try{

    //Log
    // logger.warn("[TEST] post() by User:"+request?.user?.id);
    // logger.warn(JSON.stringify(Moralis.User.current()));
    // logger.warn(JSON.stringify(request?.user));
    // logger.warn(JSON.stringify(data));
  

  }
  catch(err){
    logger.error("[CAUGHT] post() Error:"+err, {err, request});
  }
});

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
      if(request?.user?.id){
        //TODO: Further validation - Get NFT & Validte User's Relation to NFT
  
        // const query = new Moralis.Query("Post");
        // const results = await query.find();
        // return results;
  
        //Log
        logger.warn("[TEST] post() Current User:"+request.user?.id, request.user);
        logger.warn(data);
        
        // const post = new Post();
        // post.set("userId", request.user?.id);
        data.userId = request.user?.id;
        
        // return post.save(data);
  
        const post = new Post(data);
  
        
        logger.error(JSON.stringify(Moralis.User.current()));
        logger.error(JSON.stringify(request?.user));
        logger.error(JSON.stringify(data));
        logger.warn("[TEST] post() Current User:"+request.user?.id);
  
        //ACL - Own + Public Read
        // const acl = new Moralis.ACL(request.user);
        const acl = new Moralis.ACL(Moralis.User.current());
        acl.setPublicReadAccess(true);
        // acl.setRoleWriteAccess("admins", true);
        // acl.setRoleReadAccess("opensea", true);   //TEST
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
  
  
/** TODO: Check NFT Privileges before returning posts
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