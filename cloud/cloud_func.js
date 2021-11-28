//https://docs.moralis.io/moralis-server/cloud-code/cloud-functions

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