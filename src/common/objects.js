const Moralis = require("moralis/node");

/**
 * Create a new Post
 * @var object values
 * @ret Promise
 */
const createPost = (values) => {
    return Moralis.Cloud.run("post", values);
} 

//Objects
export const Post = Moralis.Object.extend("Post", {
    create: createPost,
});
export const Room = Moralis.Object.extend("Post", { 
    sayHi: function() { console.log("Hi! I'm Room "+this.id); },
    getComments: function() { 
        //Log
        console.log("[TODO] Get Comments for "+this.id); 
        return '[COMMENTS]';
    },
});
export const Comment = Moralis.Object.extend("Post");     //Sub-Posts
export const Persona = Moralis.Object.extend("Persona", {
    getDefaultMetadata(){ return personaDefaultMetadata; },
    insert(metadata){

    },
    update(){

    },
});     //Personas


//** ASSETS **/

//Example Metadata Object
const personaDefaultMetadata = {
    // username: handle,   //Internal User Handle (Slug)           //This Should Be Somewhere Else... 
    // name: "Satoshi",
    "firstname": "Satoshi",
    "lastname": "Nakamoto",
    "image": "https://images.unsplash.com/photo-1636716642701-01754aef1066?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    "cover": "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    "description": "I'm a rather cryptic fellow",
    "location": {
        "name":"Seattle, WA",
        "latitude": 47.60275857601884,
        "longitude": -122.33726455335282,
    },
    "social": {
        // twitter: "toledoroy",
        // facebook: "toledoroy",
        // github: "toledoroy",
    },
    "links": [
        {
            "type": "website",
            "title": "My Block Explorer",
            "url": "https://www.blockchain.com/explorer?view=btc",
        },
    ],
    "attributes": [	//OpenSea		https://docs.opensea.io/docs/metadata-standards
        {
            "trait_type": "Passion", 
            "value": "Cryptography",
        },
        {
            "trait_type": "Love", 
            "value": "Dogs",
        },
        {
            "trait_type": "Aqua Power", 
            "value": 40,

            "display_type": "boost_number",     //"number", "boost_number", "boost_percentage"
        },
    ],
    accounts: [
        {
            "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            "chain": "bitcoin",
        },
    ],
        
};