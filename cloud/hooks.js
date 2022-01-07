/* DB Hooks */
/**
 * DB - Custom Post Save Validation
 * Make sure that author has access to Room
 */
 Moralis.Cloud.beforeSave('Post', async request => {
    if(request.master) return;
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
  

  

//-- TESTING

//-- DEV

Moralis.Cloud.beforeSave('dbSchema', request => {
    
    //TODO: Test This

    //[DEV] Schema Stuff        https://parseplatform.org/Parse-SDK-JS/api/2.9.0/Parse.Schema.html
    const schema = new Moralis.Schema('Persona');
    console.warn("[DEV] Moralis Persona Schema:", schema);
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



Moralis.Cloud.afterSave(Relation, (request) => {
    console.log("Relation.afterSave() Request:"+JSON.stringify(request));
    console.log("Relation.afterSave() Object:"+JSON.stringify(request?.object));
	//Run Something...
})


//-- Examples

// Moralis.Cloud.afterSave("Monster", async (request) => {
//     const notifyMonsterGuild = request.context.notifyMonsterGuild;
//     if (notifyMonsterGuild) {
//       // Notify the guild about new monster.
//     }
// });
  
// Moralis.Cloud.beforeSave('_User', request => {
//     const user = request.object;
//     if (!user.get("email")) {
//       throw "Every user must have an email address.";
//     }
// });

/*
Moralis.Cloud.beforeSubscribe('Post', async request => {
  logger.warn("[TEST] beforeSubscribe(Post) Running! "+ JSON.stringify(request));
});
*/
