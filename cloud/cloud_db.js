


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