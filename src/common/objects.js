import { IPFS } from "helpers/IPFS";
const Moralis = require("moralis/node");
Moralis.enableWeb3();
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

//-- Posts
export const Post = Moralis.Object.extend("Post", {
    create: createPost,
});

//-- Room 
export const Room = Moralis.Object.extend("Post", { 
    sayHi: function() { console.log("Hi! I'm Room "+this.id); },
    getComments: function() { 
        //Log
        console.log("[TODO] Get Comments for "+this.id); 
        return '[COMMENTS]';
    },
});

//-- Comments
export const Comment = Moralis.Object.extend("Post");     //Sub-Posts

//-- Persona
export const Persona = Moralis.Object.extend("Persona", 
    { /* Instance Methods */

        //Insert New Persona
        insert(metadata){

        },
        //Update Persona
        update(){
            return "TODO";
        },

        //-- Loaders
        /**
         * Load Metadata from Chain
         */
         async loadMetadata(){
            return await this.updateToken();
        },
        /**
         * Update Token (URI & Metadata)
         * @returns object metadata
         */
        async updateToken(){
            let chain = this.get("chain") || this.get("chainId");
            // console.log("[TEST] Persona.updateToken()  Address:", this.get('address'), Persona.getContractAddress(chain), chain, this);
            // return;
            
            //TODO: Validate Current Chain Matches Contract's Chain

            //W3 - Fetch Token URI
            let options = {
                contractAddress: Persona.getContractAddress(chain),
                params: { tokenId:this.get('token_id') },
                functionName: "tokenURI",
                abi:[{
                    "name": "tokenURI",
                    "type": "function",
                    "stateMutability": "view",
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }
                    ],
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                }],
            };
            
            try{
                //Fetch Token URI
                let uri = await Moralis.executeFunction(options);
                
                //Compare & Update Metadata if Needed
                if(1 || this.get('token_uri') !== uri) {    //Always Load New Metadata
                    //Log
                    console.log("Persona.updateToken() Updating Token URI", {before:this.get('token_uri'), after:uri, perosna:this})
                    //Update NFT
                    this.set('token_uri', uri);
                    //Update Metadata
                    return await this.fetchMetadata(uri);
                    
                }//Different URI
                else{
                    //Log
                    console.log("Persona.fetchMetadata() Metadata URI is Up to Date -- Return Saved Metadata", {persona:this});
                    return this.get('metadata');
                } 
            }
            catch(error){
                //Log
               console.log("[TEST] Persona.updateToken() Error", {perosna:this, options, error});
            }
        },//updateToken()

        /**
         * Extract Metadata from NFT, 
         *  Fallback: Fetch from URI
         * @returns object metadata
         */
         async fetchMetadata(token_uri) {
            // const token_uri = this.get('token_uri');
            //Validate URI
            if(!token_uri || !token_uri.includes('://')){
                console.log('Persona.fetchMetadata() Invalid URI', {URI: token_uri});
                return;
            }
            //Get Metadata
            let uri = IPFS.resolveLink(token_uri);
            //Log
            // console.log('Persona.fetchMetadata() Running With ', {token_uri, uri});
            try{
                let metadata = await fetch(uri).then(res => res.json());
                if(!metadata){
                    //Log
                    console.error("Persona.fetchMetadata() No Metadata found on URI:", {uri});
                }
                //Handle Setbacks
                else if(metadata?.detail  && metadata.detail.includes("Request was throttled")){
                    //Log
                    console.warn("Persona.fetchMetadata() Bad Result for:"+uri+"  Will retry later", {metadata});
                    //Retry That Again after 1s
                    // setTimeout(function() { this.fetchMetadata(uri); }, 1000);
                    await new Promise(resolve => setTimeout(resolve, 1000));        //WAIT 1s
                    //Run Again
                    return await this.fetchMetadata(uri);
                }//Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
                else{//No Errors
                    //Set
                    this.set('metadata', metadata);
                    //Log
                    console.log("Persona.fetchMetadata() New Metadata From"+uri, {persona:this, metadata});
                    //Return Metadata
                    return metadata;
                }//Valid Result
            }
            catch(error){
                //Log
               console.error("[TEST] Persona.updateToken() Error", {perosna:this, error});
            }
        },//fetchMetadata()

        //-- View

        /* DEPRECATED
        //Get Persona Main Image
        getImage(){ //DEPRECATED - Use getFallback() 
            return this.get('metadata')?.image || personaDefaultMetadata.image; //"https://joeschmoe.io/api/v1/random"; 
            // return this.get('metadata')?.image || this.getDefaultMetadata()?.image;      //Error: getDefaultMetadata is not a func.
        },
        getCover(){ //DEPRECATED - Use getFallback()
            return this.get('metadata')?.cover || personaDefaultMetadata.cover; //"https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"; 
            // return this.get('metadata')?.cover || this.getDefaultMetadata()?.cover;       //Error: getDefaultMetadata is not a func.
        },
        */

        /**
         * Get Requested Property from Metadata & Fallback to Defaults if Not Found
         * @returns 
         */
        getFallback(property){ return this.get('metadata')?.[property] || personaDefaultMetadata[property]; },

    }, 
    { /* Class Methods */
        //Persona Data
        contractPersona: {
            abi: require('contracts/abi/PERSONA.json'),
            "0x4": { address: '0x9E91a8dDF365622771312bD859A2B0063097ad34', },  //Rinkeby
        },
        //Get ABI
        getABI(){ return this.contractPersona.abi; },
        //Contract Data
        getContractData(chain){ return (chain) ? this.contractPersona[chain] : this.contractPersona; },
        //Get Contract Address
        getContractAddress(chain){ return (this.contractPersona?.[chain]?.address) ? this.contractPersona[chain].address : null; },
        //Default Metadata
        getDefaultMetadata(){ return personaDefaultMetadata; },
    }
);     //Personas


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