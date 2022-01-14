import { useState } from "react";
import { useIPFS } from "./useIPFS";
import { useMoralis } from "react-moralis";
import { Exception } from "sass";

/**
 * This is a hook that loads the NFT metadata in case it doesn't alreay exist
 * If metadata is missing, the object is replaced with a reactive object that updatees when the data becomes available
 * The hook will retry until request is successful (with OpenSea, for now)
 */ 
export const useVerifyMetadata = () => {
    const { resolveLink } = useIPFS();
    const [results, setResults] = useState({});
    const { Moralis, chainId, isWeb3Enabled } = useMoralis();

    /**
     * Moralis sometimes gives the wrong token_uri
     * Use this to feth Manually
     * @param object NFT 
     */
    function updateToken(NFT){
        //Validate
        if(NFT.chain && NFT.chain !== chainId){
            throw new Exception ("useVerifyMetadata.updateToken() '"+chainId+"' is the Wrong Chain. Token is from:'"+NFT.chain+"'")
        }
        let abi = [{
            "name": "tokenURI",
            "stateMutability": "view",
            "type": "function",
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
            ]
        }];
        //W3 - Fetch Token URI
        let options = {
            contractAddress: NFT.token_address,
            functionName: "tokenURI",
            params: { tokenId:NFT.token_id },
            abi,
        };
        Moralis.executeFunction(options).then((uri) => {
            //Compare & Update Metadata if Needed
            if(!matchURI(NFT.token_uri, uri)) {
                //Log
                // console.log("[TEST] useVerifyMetadata.updateToken() Toekn of:'"+NFT.name+"' Has Different URI on Chain -- Run Update", {NFT, options, uri, token_uri:NFT.token_uri});    //V
                //Update NFT
                NFT.token_uri = uri;
                //Update Metadata
                getMetadata(NFT);
            }//Wrong URI
        })
        .catch((err) => {
            //Log
            console.error("useVerifyMetadata.updateToken() Error Caught", {err, NFT, isWeb3Enabled, options});
        });
        //Return Hooked NFT Object
        return results?.[NFT.token_uri] ? results?.[NFT.token_uri] : NFT ;
    }//updateToken()

    /**
     * Match URI Function
     * Try to ignore similar IPFS URLs
     * @param string uri1 
     * @param string uri2 
     * @returns 
     */    
    function matchURI(uri1, uri2){
        if(String(uri1).toLowerCase().includes('ipfs')){
            //Try to ignore this if URLs have the same IPFS ID
            let uri1Adjusted = uri1.replace('https://ipfs.moralis.io:2053/ipfs/', '').replace('ipfs://', '');
            let uri2Adjusted = uri2.replace('https://ipfs.moralis.io:2053/ipfs/', '').replace('ipfs://', '');

            // if(uri1Adjusted !== uri2Adjusted) console.warn("[TEST] Different IPFS IDs", {uri1, uri2, uri1Adjusted, uri2Adjusted});   //V

            return (uri1Adjusted == uri2Adjusted);
        }
        return (uri1==uri2);
    }

    /**
     * Fetch Metadata  from NFT and Cache Results
     * @param {object} NFT 
     * @returns NFT
     */
    function verifyMetadata(NFT){
        //Pass Through if Metadata already present
        if(NFT.metadata) return NFT;
        //Get the Metadata
        getMetadata(NFT);
        //Return Hooked NFT Object
        return results?.[NFT.token_uri] ? results?.[NFT.token_uri] : NFT ;
    }//verifyMetadata()

    /**
     * Extract Metadata from NFT, 
     *  Fallback: Fetch from URI
     * @param {object} NFT 
     * @returns void
     */
    async function getMetadata(NFT){
        //Validate URI
        if(!NFT.token_uri || !NFT.token_uri.includes('://')){
            console.error('getMetadata() Invalid URI', {URI: NFT.token_uri, NFT});
            return;
        }
        //Get Metadata
        let uri = resolveLink(NFT.token_uri);
        fetch(uri)
            .then(res => res.json())
            .then(metadata => {
                if(!metadata){
                    //Log
                    console.error("useVerifyMetadata.getMetadata() No Metadata found on URI:", {uri, NFT});
                }
                //Handle Setbacks
                else if(metadata?.detail && metadata.detail.includes("Request was throttled")){
                    //Log
                    console.warn("useVerifyMetadata.getMetadata() Bad Result for:"+NFT.token_uri+"  Will retry later", {results, metadata});
                    //Retry That Again after 1s
                    setTimeout(function() { getMetadata(NFT); }, 1000);
                }//Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
                else{//No Errors
                    //Set
                    setMetadata(NFT, metadata);
                    //Log
                    // console.log("getMetadata() Late-load for NFT Metadata "+NFT.token_uri, {NFT, metadata});
                }//Valid Result
            })
            .catch(err => {
                console.error("useVerifyMetadata.getMetadata() Error Caught:", {err, NFT, uri});
            });
    }//getMetadata()

    /**
     * Update NFT Object
     * @param {object} NFT 
     * @param {object} metadata 
     */
    function setMetadata(NFT, metadata){
        //Add Metadata
        NFT.metadata = metadata;
        //Set Image
        // if(metadata?.image) NFT.image = resolveLink(metadata.image); //IPFS Moved Outside
        if(metadata?.image) NFT.image = metadata.image; //Moved Outside
        //Set to State
        if(metadata && !results[NFT.token_uri]) setResults({...results, [NFT.token_uri]: NFT});
    }//setMetadata()
    
    return { verifyMetadata, updateToken };

}//useVerifyMetadata()