// import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { IPFS } from "helpers/IPFS";
import { Persona } from "objects/Persona";


/**
 * Check if User is Allowed to Access a Collection 
 */
export const usePersona = () => {
     const { Moralis, chainId } = useMoralis();

     /**
     * Load Metadata from Chain
     * @ret object / null       Metadata or Default Metadata (or null)
     */
     async function loadMetadata(parseObj){
        // if(parseObj.get('token_id') !== undefined) return await updateToken(parseObj);
        if(parseObj.get('token_id') !== undefined){
            let metadata = await updateToken(parseObj);
            console.warn("[TEST] usePersona.loadMetadata() Return Extracted Metadata:", metadata)
            return metadata;
        }
        else{
            console.error("[TEST] usePersona.loadMetadata() Missing Token ID:"+parseObj.get('token_id'), {parseObj});
            return null;
        } 
    }//loadMetadata()
    
    /** [TEST]
     * Wrapper for Contract Calls via Moralis 
     * @param string funcName 
     * @param object params 
     * @param {*} chain             [Optional] Default to current chain
     * @param array abi             [Optional]
     */
    async function contractCall(funcName, params, chain, abi){
        if(!abi) abi = Persona.getABI(chain);   //Default ABI
        //Validate ABI
        if(!abi) throw "No Default ABI Found for Chain:"+chain;
        if(chain===undefined || chain == chainId){//Current Chain
            let options = {
                contractAddress: Persona.getContractAddress(chain),
                abi,
                params,
                functionName: funcName,
            };
            return Moralis.executeFunction(options);   //From Wallet - Only Current Chain 
        }
        else{//Other Chains
            let options = {
                address: Persona.getContractAddress(chain),
                abi,
                params,
                function_name: funcName,
                chain,
            };
            return Moralis.Web3API.native.runContractFunction(options);   //Through Server (All Chains)
        }
    }//contractCall()

    /**
     * Fetch Token's Owner Account
     * @param {*} parseObj 
     */
    async function getOwner(parseObj){
        if(!parseObj.get('owner')){
            //Token's Chain ID
            let chain = parseObj.get("chain") || parseObj.get("chainId");
            //Fetch Token Owner
            try{
                //Fetch Token Owner
                let owner = await this.contractCall('ownerOf', { tokenId: parseObj.get('token_id') }, chain);
                //Validate Response
                if(owner){
                    //Compare & Update if Needed
                    if(parseObj.get('owner') !== owner) {
                        //Log
                        console.log("[TEST] usePersona.getOwner() Updating Token Owner", {before:parseObj.get('owner'), after:owner, parseObj})
                        //Update Token
                        parseObj.set('owner', owner);
                        //Save
                        parseObj.save().catch(error => {
                            console.error("usePersona.getOwner() Failed to Save Token to DB:", {error, parseObj});
                        });
                        //Return
                        return owner;
                    }//Different Owner
                    else{
                        //Log
                        console.log("[TEST] usePersona.getOwner() Owner Up to Date", {parseObj});
                        //Same URI - No Change
                        return parseObj.get('owner');
                    } 
                }
                else console.error("usePersona.getOwner() Failed to Fetch Token Owner", {owner, parseObj}) 
            }
            catch(error){
                //Log
                console.error("[TEST] usePersona.getOwner() Error", {parseObj, error});
            }
        }
    }//getOwner()

    /**
     * Update Token 
     *  Fetch from Chain & URI & Metadata (if Needed)
     * @var ParseObject parseObj
     * @returns object metadata
     */
     async function updateToken(parseObj){
        //Token's Chain ID
        let chain = parseObj.get("chain") || parseObj.get("chainId");
        //ABI
        // const abi = [{
        //     "name": "tokenURI",
        //     "stateMutability": "view",
        //     "type": "function",
        //     "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        //     "outputs": [{"internalType": "string", "name": "", "type": "string"}]
        // }];

        try{
            //Fetch Token URI
            let uri = await contractCall('tokenURI', { tokenId: parseObj.get('token_id') }, chain);       //TODO: Try to use this instead
            //Validate Response
            if(uri){
                //Compare & Update Metadata if Needed
                if(parseObj.get('token_uri') !== uri) {
                    let newMetadata = await Moralis.Cloud.run("personaMetadata", parseObj.id);
                    
                    /* MOVED ServerSide
                    //Log
                    console.log("[TEST] usePersona.updateToken() Updating Token URI", {before:parseObj.get('token_uri'), after:uri, parseObj})
                    //Update Token
                    parseObj.set('token_uri', uri);
                    //Update Metadata
                    let newMetadata = await fetchMetadata(uri);
                    //Update Token
                    parseObj.set('metadata', newMetadata);
                    //Save
                    parseObj.save().catch(error => {
                        console.error("usePersona.updateToken() Failed to Save Token to DB:", {error, parseObj});
                    });
                    */

                    //Return
                    return newMetadata;
                }//Different URI
                else{
                    //Log
                    console.log("[TEST] usePersona.updateToken() Metadata URI is Up to Date -- Return Saved Metadata", {parseObj});
                    //Same URI - No Change
                    return parseObj.get('metadata');
                } 
            }
            else console.error("usePersona.updateToken() Failed to Fetch URI", {uri, parseObj}) 
        }
        catch(error){
            //Log
            console.error("[TEST] usePersona.updateToken() Error", {parseObj, error});
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
            console.log('usePersona.fetchMetadata() Invalid URI', {URI: token_uri});
            return;
        }
        //Get Metadata
        let uri = IPFS.resolveLink(token_uri);
        //Log
        // console.log('usePersona.fetchMetadata() Running With ', {token_uri, uri});
        try{
            let metadata = await fetch(uri).then(res => res.json());
            if(!metadata) console.error("usePersona.fetchMetadata() No Metadata found on URI:", {uri});
            //Handle Setbacks
            else if(metadata?.detail  && metadata.detail.includes("Request was throttled")){
                //Log
                console.warn("usePersona.fetchMetadata() Bad Result for:"+uri+"  Will retry later", {metadata});
                //Retry That Again after 1s
                // setTimeout(function() { fetchMetadata(uri); }, 1000);
                await new Promise(resolve => setTimeout(resolve, 1000));        //WAIT 1s
                //Run Again
                return await fetchMetadata(uri);
            }//Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
            else{//No Errors
                //Log
                console.log("usePersona.fetchMetadata() New Metadata From"+uri, {metadata});
                //Return Metadata
                return metadata;
            }//Valid Result
        }
        catch(error){
            //Log
            console.error("[CAUGHT] usePersona.updateToken() Error", {error, token_uri});
        }
    }//fetchMetadata()

    return { loadMetadata, updateToken, fetchMetadata };
 
}//usePersona()