const Moralis = require("moralis/node");

//Objects
export const Post = Moralis.Object.extend("Post");
export const Room = Moralis.Object.extend("Post", { 
    sayHi: function() { console.log("Hi! I'm Room "+this.id); },
});
