// import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { IPFS } from "helpers/IPFS";
import { Persona } from "objects/Persona";


/**
 * Check if User is Allowed to Access a Collection 
 */
export const usePersona = () => {
    const { Moralis, chainId } = useMoralis();
    const contractProcessor = useWeb3ExecuteFunction();

    //-- Private Functions

    /**
     * Refresh Persona's Metadata
     * @param {string} personaId
     */
    async function _metadataRefresh(personaId) {
        //Fetch Metadata (& Update Server if Needed)
        let newMetadata = await Moralis.Cloud.run("personaUpdate", { personaId });
        //Return
        return newMetadata;
    }//_metadataRefresh()

    //-- Public Functions

    /**
     * Load Metadata from Chain
     * @ret object / null       Metadata or Default Metadata (or null)
     */
    async function loadMetadata(parseObj) {
        // if(parseObj.get('token_id') !== undefined) return await updateToken(parseObj);
        if (parseObj.get('token_id') !== undefined) {
            let metadata = await updateToken(parseObj);
            // console.warn("[TEST] usePersona.loadMetadata() Return Extracted Metadata:", {metadata})    //V
            return metadata;
        }
        else {
            // console.error("[TEST] usePersona.loadMetadata() Missing Token ID:"+parseObj.get('token_id'), {parseObj});
            // return null;
            //New Persona
            console.warn("[TEST] usePersona.loadMetadata() No Token ID", { parseObj });
            return parseObj.get('metadata');
        }
    }//loadMetadata()

    /** TODO: Try to just Make use of that Same (Generic) Function in useContract() 
     * Wrapper for Contract Calls via Moralis 
     * @param string funcName 
     * @param object params 
     * @param {*} chain             [Optional] Default to current chain
     * @param array abi             [Optional]
     */
    async function contractCall(funcName, params, chain, abi) {
        if (!abi) abi = Persona.getABI(chain);   //Default ABI
        //Validate ABI
        if (!abi) throw new Error("No Default ABI Found for Chain:" + chain);
        if (chain === undefined || chain === chainId) {//Current Chain
            let options = {
                contractAddress: Persona.getContractAddress(chain),
                abi,
                params,
                functionName: funcName,
            };
            return Moralis.executeFunction(options);   //From Wallet - Only Current Chain 
        }
        else {//Other Chains
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



    /** UNUSED
     * Fetch Token's Owner Account
     * @param {*} parseObj 
     */
    async function getOwner(parseObj) {
        if (!parseObj.get('owner')) {
            //Token's Chain ID
            let chain = parseObj.get("chain") || parseObj.get("chainId");
            //Fetch Token Owner
            try {
                //Fetch Token Owner
                let owner = await this.contractCall('ownerOf', { tokenId: parseObj.get('token_id') }, chain);
                //Validate Response
                if (owner) {
                    //Compare & Update if Needed
                    if (parseObj.get('owner') !== owner) {
                        //Log
                        console.log("[TEST] usePersona.getOwner() Updating Token Owner", { before: parseObj.get('owner'), after: owner, parseObj })
                        //Update Token
                        parseObj.set('owner', owner);
                        //Save
                        parseObj.save().catch(error => {
                            console.error("usePersona.getOwner() Failed to Save Token to DB:", { error, parseObj });
                        });
                        //Return
                        return owner;
                    }//Different Owner
                    else {
                        //Log
                        console.log("[TEST] usePersona.getOwner() Owner Up to Date", { parseObj });
                        //Same URI - No Change
                        return parseObj.get('owner');
                    }
                }
                else console.error("usePersona.getOwner() Failed to Fetch Token Owner", { owner, parseObj })
            }
            catch (error) {
                //Log
                console.error("[TEST] usePersona.getOwner() Error", { parseObj, error });
            }
        }
    }//getOwner()

    /**
     * Update Token 
     *  Fetch from Chain & URI & Metadata (if Needed)
     * @var ParseObject parseObj
     * @returns object metadata
     */
    async function updateToken(parseObj) {
        try {
            //Fetch Token URI
            let uri = await contractCall('tokenURI', { tokenId: parseObj.get('token_id') }, parseObj.get("chain"));
            //Validate Response
            if (uri) {
                //Compare & Update Metadata if Needed
                if (uri && parseObj.get('token_uri') !== uri) {
                    //Refresh Persona (on DB)
                    return await _metadataRefresh(parseObj.id);
                }//Different URI
                else {
                    //Log
                    // console.log("[TEST] usePersona.updateToken() Metadata URI is Up to Date -- Return Saved Metadata", {parseObj});  //V
                    //Same URI - No Change
                    return parseObj.get('metadata');
                }
            }
            else console.error("usePersona.updateToken() Failed to Fetch URI", { uri, parseObj })
        }
        catch (error) {
            //Log
            console.error("[TEST] usePersona.updateToken() Error", { parseObj, error, id: parseObj?.id, objId: parseObj?.objectId, getId: parseObj?.get('id'), getObjId: parseObj?.get('objectId') });
        }
    }//updateToken()

    /**
     * Extract Metadata from NFT, 
     *  Fallback: Fetch from URI
     * @returns object metadata
     */
    async function fetchMetadata(token_uri) {
        //Validate URI
        if (!token_uri || !token_uri.includes('://')) {
            console.error('usePersona.fetchMetadata() Invalid URI', { URI: token_uri });
            return;
        }
        //Get Metadata
        let uri = IPFS.resolveLink(token_uri);
        //Log
        // console.log('usePersona.fetchMetadata() Running With ', {token_uri, uri});
        try {
            let metadata = await fetch(uri).then(res => res.json());
            if (!metadata) console.error("usePersona.fetchMetadata() No Metadata found on URI:", { uri });
            //Handle Setbacks
            else if (metadata?.detail && metadata.detail.includes("Request was throttled")) {
                //Log
                console.warn("usePersona.fetchMetadata() Bad Result for:" + uri + "  Will retry later", { metadata });
                //Retry That Again after 1s
                // setTimeout(function() { fetchMetadata(uri); }, 1000);
                await new Promise(resolve => setTimeout(resolve, 1000));        //WAIT 1s
                //Run Again
                return await fetchMetadata(uri);
            }//Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
            else {//No Errors
                //Log
                console.log("usePersona.fetchMetadata() New Metadata From" + uri, { metadata });
                //Return Metadata
                return metadata;
            }//Valid Result
        }
        catch (error) {
            //Log
            console.error("[CAUGHT] usePersona.updateToken() Error", { error, token_uri });
        }
    }//fetchMetadata()

    /**
     * Mint New NFT
     * @param string uri 
     */
    async function mint(persona, uri) {
        //Validate
        if (!persona || !persona.get) throw new Error("usePersona.update() Persona Missing", { persona });
        if (persona.get('token_id')) throw new Error("Can't Mint New Persona -- Persona Already Has TokenId:'" + persona.get('token_id') + "'");
        if (!validateChain(chainId)) throw new Error("Can't Mint New Persona -- Chain:'" + chainId + "' Not Supported");
        const options = {
            // contractAddress: contractPersona.address,
            contractAddress: persona.get('address'),
            abi: Persona.getABI(),  //contractPersona.abi,
            functionName: 'mint',
            params: { tokenURI: uri },
        };

        // console.warn("[TEST] usePersona.mint() Will Register New Token", {options, uri, persona});

        //Mint New NFT
        await contractProcessor.fetch({
            params: options,
            onSuccess: (data) => {  //TX Data
                //Token Data
                let tokenData = {
                    chain: chainId,     //Current Chain
                    contract: persona.get('address'),
                    token_id: data?.events?.Transfer?.returnValues?.tokenId,
                };
                //Log                
                console.log("usePersona.mint() Success -- Trigger New Token Register for:" + tokenData.token_id, { tokenData, data, uri, persona, options });
                //Validate & Trigger Server Update
                if (tokenData.token_id) Moralis.Cloud.run("personaRegisterHandle", tokenData);
                else console.error("usePersona.mint() Success, but Failed to Extract Token ID", {
                    data,
                    events: data?.events,
                    transfer: data?.events?.Transfer,
                    retValues: data?.events?.Transfer?.returnValues,
                    tokenId: data?.events?.Transfer?.returnValues?.tokenId,
                });
                //Trigger Metadata Update on Moralis
                callMoralisMetadataUpdate(options.contractAddress, data?.events?.Transfer?.returnValues?.tokenId, chainId);
                //Return Transaction Data
                return data;
            },
            onError: (error) => {
                if (error.code === 4001) console.warn("usePersona.mint() Failed -- User Rejection", { error, uri, options })
                else console.error("usePersona.mint() Failed", { error, uri, persona, options });
                throw new Error("usePersona.mint() Failed  " + error);
            },
        });
    }//mint()

    /**
     * Update NFT URI (From Contract)
     * @param string uri 
     */
    async function update(persona, uri) {
        //Validate Persona
        if (!persona || !persona.get) throw new Error("usePersona.update() Persona Missing", { persona });
        //Validate Chain
        if (persona?.get('chain') !== chainId) throw new Error("usePersona.update() Failed - Current Chain:'" + chainId + "' Change to:'" + persona?.get('chain') + "'");
        const options = {
            // contractAddress: contractPersona.address,
            contractAddress: persona.get('address'),
            abi: Persona.getABI(chainId),   //contractPersona.abi,
            functionName: 'update',
            params: { tokenId: persona.get('token_id'), uri },
        };
        //Call Contract Method
        return await contractProcessor.fetch({
            params: options,
            onSuccess: (data) => {
                try {
                    //Log
                    console.log("usePersona.update() Success Updating Persona:" + persona.id, { data, uri });

                    //Call a Server Update for Persona's Metadata (& URI)
                    // Moralis.Cloud.run("personaUpdate", { personaId: persona.id });   //Wait to reduce server load
                    _metadataRefresh(persona.id);

                    //Trigger Metadata Update on Moralis
                    callMoralisMetadataUpdate(options.contractAddress, options?.params?.tokenId, chainId);

                    //Return Transaction Data
                    return data;
                }
                catch (error) {
                    console.error("usePersona.update() Error Updating Persona:" + persona.id, { error, persona, options });
                }
            },
            onError: (error) => {
                if (error.code === 4001) console.warn("usePersona.update() Failed -- User Rejection", { error, uri, options })
                else console.error("usePersona.update() Failed", { error, uri, persona, options });
                throw new Error("usePersona.update() Failed  " + error);
            },
        });
    }//update()

    /** [TEST]
     * Burn a Persona
     */
    async function burn(persona) {
        //Validate Persona
        if (!persona || !persona.get) throw new Error("usePersona.burn() Persona Missing", { persona });

        const options = {
            contractAddress: persona.get('address'),
            abi: Persona.getABI(),  //contractPersona.abi,
            functionName: 'burn',
            params: { tokenId: persona.get('token_id') },
        };
        console.warn("[TEST] usePersona.burn() Will Register New Token", { options, persona });

        //burn New NFT
        await contractProcessor.fetch({
            params: options,
            onSuccess: (data) => {  //TX Data
                try {
                    console.log("usePersona.burn() Success Burning Persona:" + persona.id, { data });
                    //Call a Server Update for Persona
                    Moralis.Cloud.run("personaUpdate", { personaId: persona.id });
                    //Trigger Metadata Update on Moralis
                    callMoralisMetadataUpdate(options.contractAddress, options?.params?.tokenId);
                    //Return Transaction Data
                    return data;
                }
                catch (error) {
                    console.error("usePersona.burn() Error While Burning Persona:" + persona.id, { error, persona, options });
                }
            },
            onError: (error) => {
                if (error.code === 4001) console.warn("usePersona.burn() Failed -- User Rejection", { error, options })
                else console.error("usePersona.burn() Failed", { error, persona, options });
                throw new Error("usePersona.burn() Failed  " + error);
            },
        });
    }//burn()

    /**
     * Check if chain is Supported (Has a Persona Contract)
     * @param {*} chainId 
     * @returns 
     */
    function validateChain(chainId) {
        return (Persona.getContractAddress(chainId));
    }//validateChain()

    /**
     * Trigger Moralis Metadata Update When Needed
     */
    async function callMoralisMetadataUpdate(hash, tokenId, chain = chainId) {
        /* TODO: Use SDK
        try{
            Moralis.Web3API.token.reSyncMetadata(options);
        }
        catch(error){

        }
        */
        let apiKey = process?.env?.REACT_APP_MORALIS_API_KEY;
        if (apiKey) {
            if (hash && tokenId && chain) {
                let uri = `https://deep-index.moralis.io/api/v2/nft/${hash}/${tokenId}/metadata/resync?chain=${chain}&flag=uri`;
                // let headers = {'x-api-key': "17Hehy28h5JsgsBVOtUccIDWj012R2mby6uvbsvyFL6PTPUnq9HCPlzrXnV95Uwo"};
                let headers = { 'x-api-key': apiKey };
                try {
                    return fetch(uri, { headers }).then(response => console.warn("Moralis API Response:", response));
                }
                catch (error) {
                    console.error("[CAUGHT] usePersona.callMoralisMetadataUpdate() Error", { error, uri, params: { hash, tokenId, chain } });
                }
            }
            else console.error("usePersona.callMoralisMetadataUpdate() Missing Parameters", { hash, tokenId, chain });
        }
        else console.error("usePersona.callMoralisMetadataUpdate() Can't Run. API Key Missing in ENV");
    }//callMoralisMetadataUpdate()

    return {
        validateChain, loadMetadata, updateToken, fetchMetadata,
        mint, update, burn,
        callMoralisMetadataUpdate,
    };

}//usePersona()