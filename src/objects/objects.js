// import { IPFS } from "helpers/IPFS";
const Moralis = require("moralis/node");
const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
Moralis.initialize(APP_ID);
Moralis.serverURL = SERVER_URL;


// const { chainId } = useMoralis();

//** GLOBAL FUNCTIONS **/
/**
 * Create a new Post
 * @var object values
 * @ret Promise
 */
const createPost = (values) => {
    return Moralis.Cloud.run("post", values);
} 



//** Objects **/
//-- Space
export const Space = Moralis.Object.extend("Space");


//-- Posts
export const Post = Moralis.Object.extend("Post", {
    create: createPost,
});


//-- Room 
export const Room = Moralis.Object.extend("Post", { 
        sayHi: function() { 
            console.log("Hi! I'm Room "+this.id); 
            return '[COMMENTS]';
        },
        /* This Doesn't Work as Intended... Functions Seem to get lost when in state */
        getComments: function() { 
            const query = new Moralis.Query(this);
            query.equalTo("parentId", this.id);
            let res = query.find();

            return res;
            //Log
            // console.log("[TODO] Get Comments for "+this.id); 
            console.log("Hi! I'm Room "+this.id);  
            // return '[COMMENTS]';
        },
        
    }, 
    // {
        // create: createPost,
    // },
);

//-- Comments
export const Comment = Moralis.Object.extend("Post");     //Sub-Posts
