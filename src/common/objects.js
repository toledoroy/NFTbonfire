const Moralis = require("moralis/node");

//Objects
export const Post = Moralis.Object.extend("Post");
export const Room = Moralis.Object.extend("Post", { 
    sayHi: function() { console.log("Hi! I'm Room "+this.id); },
    getComments: function() { 
        //Log
        console.log("[TODO] Get Comments for "+this.id); 
        return '[COMMENTS]';
    },
});
export const Comment = Moralis.Object.extend("Post");     //Sub-Posts