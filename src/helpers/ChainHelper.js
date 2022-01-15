import ChainsData from "components/Chains/ChainsData";

//Export NFT Helper
export const ChainHelper = {
    
    get(chain, key){ return ChainsData[chain]?.[key]; }
};

export default ChainHelper;