import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from "components/Chains/Logos";

export const getNativeByChain = (chain) => networkConfigs[chain]?.currencySymbol || "NATIVE";

export const getChainById = (chain) => networkConfigs[chain]?.chainId || null;

export const getExplorer = (chain) => networkConfigs[chain]?.blockExplorerUrl;

export const getWrappedNative = (chain) => networkConfigs[chain]?.wrapped || null;

//Get Chain's Name
export const getChainName = (chain) => networkConfigs[chain]?.name || null;
//Get Chain's Logo
export const getChainLogo = (chain) => networkConfigs[chain]?.icon || null;

export const networkConfigs = {
  "0x1": {
    name: "Ethereum Mainnet",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://etherscan.io/",
    wrapped: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    icon: <ETHLogo />,
  },
  "0x3": {
    name: "Ropsten Testnet",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://ropsten.etherscan.io/",
    icon: <ETHLogo />,
  },
  "0x4": {
    name: "Rinkeby Testnet",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://kovan.etherscan.io/",
    icon: <ETHLogo />,
  },
  "0x2a": {
    name: "Kovan Testnet",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://rinkeby.etherscan.io/",
    icon: <ETHLogo />,
  },
  "0x5": {
    name: "Goerli Testnet",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://goerli.etherscan.io/",
    icon: <ETHLogo />,
  },
  "0x539": {
    chainName: "Local Chain",
    currencyName: "ETH",
    currencySymbol: "ETH",
    rpcUrl: "http://127.0.0.1:7545",
    icon: <ETHLogo />,
  },
  "0xa86a": {
    name: "Avalanche",
    chainId: 43114,
    chainName: "Avalanche Mainnet",
    currencyName: "AVAX",
    currencySymbol: "AVAX",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorerUrl: "https://cchain.explorer.avax.network/",
    icon: <AvaxLogo />,
  },
  "0x38": {
    name: "Binance",
    chainId: 56,
    chainName: "Smart Chain",
    currencyName: "BNB",
    currencySymbol: "BNB",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorerUrl: "https://bscscan.com/",
    wrapped: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    icon: <BSCLogo />,
  },
  "0x61": {
    name: "Binance Smart Chain Testnet",
    chainId: 97,
    chainName: "Smart Chain - Testnet",
    currencyName: "BNB",
    currencySymbol: "BNB",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    blockExplorerUrl: "https://testnet.bscscan.com/",
    icon: <BSCLogo />,
  },
  "0x89": {
    name: "Polygon",
    chainId: 137,
    chainName: "Polygon Mainnet",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    rpcUrl: "https://rpc-mainnet.maticvigil.com/",
    blockExplorerUrl: "https://explorer-mainnet.maticvigil.com/",
    wrapped: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    icon: <PolygonLogo />,
  },
  "0x13881": {
    name: "Mumbai Polygon Testnet",
    chainId: 80001,
    chainName: "Mumbai",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    rpcUrl: "https://rpc-mumbai.matic.today/",
    blockExplorerUrl: "https://mumbai.polygonscan.com/",
    icon: <PolygonLogo />,
  },
};
