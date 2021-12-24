// import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { IPFS } from "helpers/IPFS";
import { Persona } from "objects/Persona";


/**
 * Check if User is Allowed to Access a Collection 
 */
export const useNFT = () => {
     const { Moralis, chainId } = useMoralis();

     /**
     * Load Metadata from Chain
     * @ret object / null       Metadata or Default Metadata (or null)
     */
     async function loadMetadata(parseObj, returnDefault=true){
        // if(parseObj.get('token_id') !== undefined) return await updateToken(parseObj);
        if(parseObj.get('token_id') !== undefined){
            let metadata = await updateToken(parseObj);
            console.warn("[TEST] useNFT.loadMetadata() Return Extracted Metadata:", metadata)
            return metadata;
        }
        else{

            //-- New Persona, Not yet on Chain
            /* DISABLED
            //Random 
            if(returnDefault){
                let defaultMetadata = Persona.getDefaultMetadata(); //return personaDefaultMetadata[Math.floor(Math.random()*personaDefaultMetadata.length)];
                console.warn("[TEST] useNFT.loadMetadata() Return Default Metadata:", defaultMetadata)
                return defaultMetadata;
            }
            */

            return null;
        }
    }//loadMetadata()
    
    /**
     * Update Token 
     *  Fetch from Chain & URI & Metadata (if Needed)
     * @var ParseObject parseObj
     * @returns object metadata
     */
     async function updateToken(parseObj){
         //Token's Chain ID
        let chain = parseObj.get("chain") || parseObj.get("chainId");
        // console.log("[TEST] useNFT.updateToken()  Address:", parseObj.get('address'), Persona.getContractAddress(chain), chain, this);
        
        //Validate Current Chain Matches Contract's Chain
        // if(chain != chainId) throw "Wrong Chain. Current:"+chainId+" needed:"+chain;

        //Fetch ABI
        // const abi = Persona.getABI(chain);
        //Validate
        // if(!abi) throw "No ABI Found for Chain:"+chain;
        const abi = [{
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
        // let options = {
        //     contractAddress: Persona.getContractAddress(chain),
        //     abi,
        //     params: { tokenId:parseObj.get('token_id') },
        //     functionName: "tokenURI",
        // };
        let options2 = {
            address: Persona.getContractAddress(chain),
            abi,
            params: { tokenId: parseObj.get('token_id') },
            function_name: "tokenURI",
            chain,
        };
        try{
            //Fetch Token URI
            // let uri = await Moralis.executeFunction(options);   //From Wallet - Only Current Chain 
            let uri = await Moralis.Web3API.native.runContractFunction(options2);
            // console.error("useNFT.updateToken()  Token Data:", {...parseObj.attributes});


            //Validate Response
            if(uri){
                //Compare & Update Metadata if Needed
                if(parseObj.get('token_uri') !== uri) {
                // if(1 || parseObj.get('token_uri') !== uri || !parseObj.get('metadata')) {    //Always Load New Metadata
                    //Log
                    console.log("[TEST] useNFT.updateToken() Updating Token URI", {before:parseObj.get('token_uri'), after:uri, parseObj})
                    //Update Token
                    parseObj.set('token_uri', uri);
                    //Update Metadata
                    let newMetadata = await fetchMetadata(uri);
                    //Update Token
                    parseObj.set('metadata', newMetadata);
                    //Save
                    parseObj.save()
                    .catch(error => {
                        console.error("useNFT.updateToken() Failed to Save Token to DB:", {error, parseObj});
                    });
                    //Return
                    return newMetadata;
                }//Different URI
                else{
                    //Log
                    console.log("[TEST] useNFT.updateToken() Metadata URI is Up to Date -- Return Saved Metadata", {parseObj});
                    //Same URI - No Change
                    return parseObj.get('metadata');
                } 
            }
            else console.error("useNFT.updateToken() Failed to Fetch URI", {uri, parseObj}) 
        }
        catch(error){
            //Log
            console.error("[TEST] useNFT.updateToken() Error", {options:options2, error});
        }
    }//updateToken()

    /**
     * Extract Metadata from NFT, 
     *  Fallback: Fetch from URI
     * @returns object metadata
     */
     async function fetchMetadata(token_uri) {
        //Validate URI
        if(!token_uri || !token_uri.includes('://')){
            console.log('useNFT.fetchMetadata() Invalid URI', {URI: token_uri});
            return;
        }
        //Get Metadata
        let uri = IPFS.resolveLink(token_uri);
        //Log
        // console.log('useNFT.fetchMetadata() Running With ', {token_uri, uri});
        try{
            let metadata = await fetch(uri).then(res => res.json());
            if(!metadata) console.error("useNFT.fetchMetadata() No Metadata found on URI:", {uri});
            //Handle Setbacks
            else if(metadata?.detail  && metadata.detail.includes("Request was throttled")){
                //Log
                console.warn("useNFT.fetchMetadata() Bad Result for:"+uri+"  Will retry later", {metadata});
                //Retry That Again after 1s
                // setTimeout(function() { fetchMetadata(uri); }, 1000);
                await new Promise(resolve => setTimeout(resolve, 1000));        //WAIT 1s
                //Run Again
                return await fetchMetadata(uri);
            }//Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
            else{//No Errors
                //Log
                console.log("useNFT.fetchMetadata() New Metadata From"+uri, {metadata});
                //Return Metadata
                return metadata;
            }//Valid Result
        }
        catch(error){
            //Log
            console.error("[CAUGHT] useNFT.updateToken() Error", {error, token_uri});
        }
    }//fetchMetadata()

    return { loadMetadata, updateToken, fetchMetadata };
 
}//useNFT()