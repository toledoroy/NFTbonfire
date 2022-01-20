// import { IPFS } from "helpers/IPFS";
const Moralis = require("moralis/node");
// const APP_ID = process?.env?.REACT_APP_MORALIS_APPLICATION_ID;
// const SERVER_URL = process?.env?.REACT_APP_MORALIS_SERVER_URL;
// Moralis.initialize(APP_ID);
// Moralis.serverURL = SERVER_URL;


//** Objects **/

//-- Contract
export const Contract = Moralis.Object.extend("Contract");

//-- Relationships
export const Relation = Moralis.Object.extend("Relation");

//-- Space
export const Space = Moralis.Object.extend("Space");

//-- Posts
export const Post = Moralis.Object.extend("Post", {
    // create: Moralis.Cloud.run("post", values),  //CANCELLED
});


//-- Room 
export const Room = Moralis.Object.extend("Post", { 
        sayHi: function() { 
            console.log("Hi! I'm Room "+this.id); 
            return '[COMMENTS]';
        },
    }, 
    // {
        // create: createPost,
    // },
);

//-- Comments
export const Comment = Moralis.Object.extend("Post");     //Sub-Posts
