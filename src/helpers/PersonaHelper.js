import { IPFS } from "helpers/IPFS";
// import Blockie from "components/Blockie";
import { Persona } from "objects/Persona";

// export const userImage = (hash) => ();   //?
export const PersonaHelper = {
    /** 
     * 
     * @param {*} hash 
     * @returns 
     */
    userImage: (hash) => {
        console.log("PersonaHelper.userImage() Get User Image for UserId: " + hash);
        if (hash) {
            return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`;
        } else {
            return `https://www.gravatar.com/avatar/?s=200&d=identicon`;
        }
    },

    /**
     * Load Metadata from Chain
     * @ret object / null       Metadata or Default Metadata (or null)
     */
    async loadMetadata(Moralis, persona, returnDefault=true){
        // if(persona.get('token_id') !== undefined) return await this.updateToken(Moralis, persona);
        if(persona.get('token_id') !== undefined){
            let ret = await this.updateToken(Moralis, persona);
            console.warn("[TEST] PersonaHelper.loadMetadata() Return Extracted Metadata:", ret)
            return ret;
        } 
        else{ 
            //-- New Persona, Not yet on Chain
            //Random 
            if(returnDefault){
                let defaultMetadata = Persona.getDefaultMetadata(); //return personaDefaultMetadata[Math.floor(Math.random()*personaDefaultMetadata.length)];
                console.warn("[TEST] PersonaHelper.loadMetadata() Return Default Metadata:", defaultMetadata)
                return defaultMetadata;
            }
            return null;
            
            // return returnDefault ? personaDefaultMetadata : null;
        }
    },//loadMetadata()
    

    /**
     * Update Token (Fetch from Chain -- URI & Metadata )
     * @var object Moralis
     * @var ParseObject persona
     * @returns object metadata
     */
    async updateToken(Moralis, persona){
        let chain = persona.get("chain") || persona.get("chainId");
        // console.log("[TEST] Persona.updateToken()  Address:", persona.get('address'), Persona.getContractAddress(chain), chain, this);
        // return;
        
        //TODO: Validate Current Chain Matches Contract's Chain

        const abi = Persona.getABI(chain);
        //Validate
        if(!abi) throw "No ABI Foun for Chain:"+chain;
        //W3 - Fetch Token URI
        let options = {
            contractAddress: Persona.getContractAddress(chain),
            params: { tokenId:persona.get('token_id') },
            functionName: "tokenURI",
            abi,
        };
        
        try{
            //Fetch Token URI
            let uri = await Moralis.executeFunction(options);
            //Validate Response
            if(uri){
                //Compare & Update Metadata if Needed
                if(persona.get('token_uri') !== uri) {      //TODO: Enable
                // if(1 || persona.get('token_uri') !== uri || !persona.get('metadata')) {    //Always Load New Metadata
                    //Log
                    console.log("[TEST] PersonaHelper.updateToken() Updating Token URI", {before:persona.get('token_uri'), after:uri, persona})
                    //Update Token
                    persona.set('token_uri', uri);
                    //Update Metadata
                    let newMetadata = await this.fetchMetadata(uri);
                    //Update Token
                    persona.set('metadata', newMetadata);
                    //Save
                    persona.save();
                    //Return
                    return newMetadata;
                }//Different URI
                else{
                    //Log
                    console.log("[TEST] PersonaHelper.updateToken() Metadata URI is Up to Date -- Return Saved Metadata", {persona});
                    //Same URI - No Change
                    return persona.get('metadata');
                } 
            }
            else console.error("PersonaHelper.updateToken() Failed to Fetch URI", {uri, persona}) 
        }
        catch(error){
            //Log
            console.error("[TEST] PersonaHelper.updateToken() Error", {options, error});
        }
    },//updateToken()

    /**
     * Extract Metadata from NFT, 
     *  Fallback: Fetch from URI
     * @returns object metadata
     */
    async fetchMetadata(token_uri) {
        //Validate URI
        if(!token_uri || !token_uri.includes('://')){
            console.log('PersonaHelper.fetchMetadata() Invalid URI', {URI: token_uri});
            return;
        }
        //Get Metadata
        let uri = IPFS.resolveLink(token_uri);
        //Log
        // console.log('PersonaHelper.fetchMetadata() Running With ', {token_uri, uri});
        try{
            let metadata = await fetch(uri).then(res => res.json());
            if(!metadata){
                //Log
                console.error("PersonaHelper.fetchMetadata() No Metadata found on URI:", {uri});
            }
            //Handle Setbacks
            else if(metadata?.detail  && metadata.detail.includes("Request was throttled")){
                //Log
                console.warn("PersonaHelper.fetchMetadata() Bad Result for:"+uri+"  Will retry later", {metadata});
                //Retry That Again after 1s
                // setTimeout(function() { this.fetchMetadata(uri); }, 1000);
                await new Promise(resolve => setTimeout(resolve, 1000));        //WAIT 1s
                //Run Again
                return await this.fetchMetadata(uri);
            }//Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
            else{//No Errors
                //Set
                // persona.set('metadata', metadata);   //on Caller
                //Log
                console.log("PersonaHelper.fetchMetadata() New Metadata From"+uri, {metadata});
                //Return Metadata
                return metadata;
            }//Valid Result
        }
        catch(error){
            //Log
            console.error("[TEST] PersonaHelper.updateToken() Error", {error});
        }
    },//fetchMetadata()

};//personaHelper{}

export default PersonaHelper;