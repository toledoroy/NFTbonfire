// const Moralis = require("moralis/node");
// Moralis.start();

//import { IPFS } from "helpers/IPFS";

//Export NFT Helper
export const NFTHelper = {

    /**
     * Use Contract's balanceOf() Function
     * @param {*} Moralis
     * @param {*} account 
     * @param {*} contractAddress 
     * @param {*} chainId 
     * @returns 
     */
    async getBalance (Moralis, account, contractAddress, chain) {
        //Parameters
        let options = { 
            // chain: '0x4', 
            chain, 
            address: account, 
            token_address: contractAddress,
        };
        return Moralis.Web3API.account.getNFTsForContract(options).then(res => res.total);
        /* DEBUG
        // const balance = await Moralis.Web3API.account.getNFTs(options);
        let balance = await Moralis.Web3API.account.getNFTsForContract(options).then(res => res.total);
        //Log
        console.warn("[NFTHelper] getBalance()", {balance, options}); 
        //Return
        return balance;
        */
    },//getBalance()

};

export default NFTHelper;