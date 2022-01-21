// import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

/**
 * Run Contract Functions
 */
export const useContract = () => {
    const { Moralis, chainId } = useMoralis();

    /**
     * Wrapper for Contract Calls via Moralis 
     * @param string contractAddress
     * @param string functionName 
     * @param object params 
     * @param {*} chain             [Optional] Default to current chain
     * @param array abi             [Optional]
     */
    // async function contractCall(contractAddress, functionName, params, chain, abi){
    async function contractCall(options, debug=false){
        const { contractAddress, functionName, params, chain, abi } = options;
        //Validate ABI
        if(!abi) throw new Error("No Default ABI Found for Chain:"+chain);
        if(chain === undefined || chain === chainId){//Current Chain
            //Log
            debug && console.warn("(D) contractCall() Running Via Wallet", {chain, chainId});
            let options = {
                contractAddress: contractAddress,
                abi,
                params,
                functionName: functionName,
            };
            return Moralis.executeFunction(options);   //From Wallet - Only Current Chain 
        }
        else{//Other Chains
            //Log
            debug && console.warn("(D) contractCall() Running Via Server", {chain, chainId});
            let options = {
                address: contractAddress,
                abi,
                params,
                function_name: functionName,
                chain,
            };
            return Moralis.Web3API.native.runContractFunction(options);   //Through Server (All Chains)
        }
    }//contractCall()

    return { contractCall };
 
}//useContract()