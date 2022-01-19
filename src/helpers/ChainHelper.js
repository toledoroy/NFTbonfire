import ChainsData from "components/Chains/ChainsData";

//Export NFT Helper
export const ChainHelper = {
    /**
     * Get Chain Data by Chain ID
     * @param {*} chain 
     * @param {*} key 
     * @returns 
     */
    get(chain, key){ return ChainsData[chain]?.[key]; },

    /**
     * 
     */
    allChains(){
        return Object.keys(ChainsData);
    },
    
    /**
     * 
     */
    allChainsData(){
        return Object.values(ChainsData);
    },
};

export default ChainHelper;