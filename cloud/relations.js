//Objects
const Relation = Moralis.Object.extend("Relation");


/**
 * Fetch Relation from DB, Create if Missing
 * @param {*} user 
 * @param {*} entity 
 * @returns ParseObject Persona
 */
 const relationGetOrMake = async (user, entity) => {
  //Validate
  if(!user || !entity) throw new Error("Missing Request Parameters (user, entity)");
  //Get / Add relation
  const query = new Moralis.Query(Relation);
  query.equalTo("user", user);
  query.equalTo("entity", entity);

  // const results = await query.limit(1).find();
  // logger.warn("[TEST] relationGetOrMake() "+results.length+" Results -- "+JSON.stringify(results)+"'");  //V
  //Extract relation From Result or Make New
  // const relationGet = async (results) => {
    // if(results.length) return results[0];
    
    const result = await query.first();
    if(result) return result;
    logger.warn("[TEST] relationGetOrMake() Create New Relation to DB entity:'"+entity+"' user:'"+user?.id+"'");
    //Create
    const relation = new Relation({user, entity});
    //ACL - Own + Public Read
    let acl = new Moralis.ACL(Moralis.User.current());
    acl.setPublicReadAccess(true);
    relation.setACL(acl);
    return relation;
  // }
  //Fetch relation (Get or Make New)
  // return await relationGet(results); //Promise
};

/**
 * Calculate Entity's Score (Based on Relationship Votes)
 * @param {*} entity 
 */
const calcEntityScore = async (entity) => {
  const pipeline = [ 
    { match: { entity: entity } },  //This Entity
    { group: { objectId: null, score: { $sum: '$opinion' } } }  //Sum of all Relations' Opinions
  ];
  
  const query = new Moralis.Query(Relation);
  let res =  await query.aggregate(pipeline).catch(function(error) {
    logger.error("calcEntityScore() Exception Caught: "+error+"  pipeline:"+JSON.stringify(pipeline));
  });
  
  // logger.warn("[TEST] calcEntityScore() entity:'"+entity+"' Result:"+JSON.stringify(res[0])+"' "+res[0]?.score); //V

  return res[0]?.score;
};//calcEntityScore()


/* VOTES */

/**
 * Vote on Post 
 * @var string postId
 * @var num vote [0/1/-1]
 */
Moralis.Cloud.define("postVote", async (request) => {  
  //Validate
  if(!request?.user?.id) throw new Error("postVote() Unauthorized User - Must Log In");
  //Log
  logger.warn("[TEST] postVote() for Current User:"+request.user?.id+" PostId:"+request.params?.postId+" Vote:"+request.params?.vote);
  //Extract Parameters
  const { postId, vote } = request.params;
  //Validate
  if(!postId || vote===undefined) throw new Error("Missing Request Parameters (postId, vote)");
  //Validate Vote Value
  if(isNaN(vote) || vote > 1 || vote < -1) throw new Error("postVote() Invalid Vote Value: "+vote);

  //1. Fetch Post
  let post = await new Moralis.Query('Post').get(postId, {useMasterKey: true});
  //Validate
  if(!post) throw new Error("postVote() Post Not Found: "+postId);
  //Validate Voter
  if(request.user.get('accounts').includes(String(post.get('account')).toLowerCase())) return logger.error("C'mon, this is your post");

  //2. Fetch Relation
  const relation = await relationGetOrMake(request.user, postId);
  logger.warn("[TEST] postVote() Relation:"+JSON.stringify(relation));

  //3. Update Relation
  // relation.set('opinion', vote); 
  logger.warn("[TEST] postVote() Relation:"+relation.id+" Vote:"+vote+" Set");
    //Register Vote (user->post)
  await relation.save({opinion:vote}, {useMasterKey: true}).catch(function(error) {
    logger.error("postVote() Exception Caught While Saving Vote:"+vote+" to Relation:"+relation.id+"  "+error);
  });
  logger.warn("[TEST] postVote() Relation:"+relation.id+" Saved");

  //4. Re-Calculate Post Score
  let score = await calcEntityScore(postId);
  logger.warn("[TEST] postVote() Total Score:'"+score+"' for PostId:'"+postId+"'");
  //Save Score to Post
  await post.save({score}, {useMasterKey: true});
  // logger.warn("[TEST] postVote() Saved Total Score:'"+score+"' for PostId:'"+postId+"'  "+JSON.stringify(post));

  /**
   * TODO: Algorithm   
   * - Opinon Add
   *  V Register Post Vote (user->post)
   *  V Re-Calculate Post Score
   *  - Fire Event -> Update User Score + Track Causality  (Listener?)
   * 
   * - Opinion Change
   *  V Remove/Change Current Vote
   *    - Undo Last Vote (Cascade Deletion)
   *      - Cancel Event
   *     - Recalculate Post Score
   *  - Add New Vote
   *   - ... Recalc
   * 
   *  --> Need a vote event & need to connect that event to all Effects
   */

});//postVote()

/**
 * Star a Post
 */
Moralis.Cloud.define("postStar", async (request) => {  
  //Validate
  if(!request?.user?.id) throw new Error("postStar() Unauthorized User - Must Log In");
  //Log
  logger.warn("[TEST] postStar() for Current User:"+request.user?.id+" PostId:"+request.params?.postId+" Vote:"+request.params?.vote);
  //Extract Parameters
  const { postId, star } = request.params;
  //Validate
  if(!postId || star===undefined) throw new Error("Missing Request Parameters (postId, star)");
  //Validate star Value
  if(typeof star !== 'boolean') throw new Error("poststar() Invalid star Value: "+star);

  //1. Fetch Post
  let post = await new Moralis.Query('Post').get(postId, {useMasterKey: true});
  //Validate
  if(!post) throw new Error("postStar() Post Not Found: "+postId);

  //2. Fetch Relation
  const relation = await relationGetOrMake(request.user, postId);
  // logger.warn("[TEST] postStar() Relation:"+JSON.stringify(relation));

  //3. Update Relation
  // relation.set('opinion', star); 
  logger.warn("[TEST] postStar() Relation:"+relation.id+" star:"+star+" Set");
    //Register star (user->post)
  await relation.save({star}, {useMasterKey: true}).catch(function(error) {
    logger.error("postStar() Exception Caught While Saving star:"+star+" to Relation:"+relation.id+"  "+error);
  });
  logger.warn("[TEST] postStar() Relation:"+relation.id+" Saved star:"+star);

});