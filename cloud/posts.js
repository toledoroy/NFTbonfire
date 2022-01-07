//Objects
const Post = Moralis.Object.extend("Post");


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
  
  
//-- DEV

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