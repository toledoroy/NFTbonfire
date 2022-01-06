// import { IPFS } from "helpers/IPFS";
const Moralis = require("moralis/node");
const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
Moralis.initialize(APP_ID);
Moralis.serverURL = SERVER_URL;

const Contract = Moralis.Object.extend("Contract");

//** GLOBAL FUNCTIONS **/
/** DEPRECATE?
 * Create a new Post
 * @var object values
 * @ret Promise
 */
const createPost = async (values) => {
    return Moralis.Cloud.run("post", values);    //Server Side

    /* Doesn't Work. Needs to be in Context. There's no Authenricated User here...
    // const Post = Moralis.Object.extend("Post");
    // const post = new Post();
    // post.set("userId", request.user?.id);
    values.userId = Moralis.User.current()?.id;

    const post = new Post(values);

    //ACL - Own + Public Read
    const acl = new Moralis.ACL(Moralis.User.current());
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess("admins", true);
    if(values.parentId.substr(0,2) === '0x') acl.setRoleWriteAccess(values.parentId, true);
    else console.error("RoomAddForm() Parent is not a Hash", {parentId:values.parentId, values});
    acl.setRoleReadAccess("opensea", true);   //TEST
    // acl.setWriteAccess(request.user?.id, true);
    post.setACL(acl);

    console.warn("[TEST] post() ACL: "+JSON.stringify(acl), post);
    
    return post.save();
    */

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
    }, 
    // {
        // create: createPost,
    // },
);

//-- Comments
export const Comment = Moralis.Object.extend("Post");     //Sub-Posts
