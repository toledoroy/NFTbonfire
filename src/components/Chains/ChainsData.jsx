import React from 'react';
import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from "./Logos";


export const ChainsData = {
  "0x1":{
    key: "0x1",
    name: "Ethereum",
    icon: <ETHLogo />,
    native: 'ETH',
    nId:'ND-2H0ETHMainNet',
    live: true,
    supported: false,
  },
  // {
  //   key: "0x539",
  //   name: "Local Chain",
  //   icon: <ETHLogo />,
  //   native: 'ETH',
  // live: false,
  // supported: false,
  // },
  "0x3":{
    key: "0x3",
    name: "Ropsten Testnet",
    icon: <ETHLogo />,
    native: 'ETH',
    nId:'',
    live: false,
    supported: false,
  },
  "0x4":{
    key: "0x4",
    name: "Rinkeby Testnet",
    icon: <ETHLogo />,
    native: 'ETH',
    nId:'',
    live: false,
    supported: true,
  },
  "0x2a":{
    key: "0x2a",
    name: "Kovan Testnet",
    icon: <ETHLogo />,
    native: 'ETH',
    nId:'',
    live: false,
    supported: false,
  },
  "0x5":{
    key: "0x5",
    name: "Goerli Testnet",
    icon: <ETHLogo />,
    native: 'ETH',
    nId:'',
    live: false,
    supported: false,
  },
  "0x38":{
    key: "0x38",
    name: "Binance",
    icon: <BSCLogo />,
    native: 'BNB',
    nId:'ND-2H0BSCMainNet',
    live: true,
    supported: false,
  },
  "0x61":{
    key: "0x61",
    name: "Smart Chain Testnet",
    icon: <BSCLogo />,
    native: 'BNB',
    nId:'ND-2H0BSCTestNet',
    live: false,
    supported: false,
  },
  "0x89":{
    key: "0x89",
    name: "Polygon",
    icon: <PolygonLogo />,
    native: 'MATIC',
    nId:'ND-2H0MaticMainNet',
    live: true,
    supported: false,
  },
  "0x13881":{
    key: "0x13881",
    name: "Mumbai",
    icon: <PolygonLogo />,
    native: 'MATIC',
    nId:'',
    live: false,
    supported: false,
  },
  "0xa86a":{
    key: "0xa86a",
    name: "Avalanche",
    icon: <AvaxLogo />,
    native: 'AVAX',
    nId:'',
    live: true,
    supported: false,
  },
  "0xa869":{
    key: "0xa869",
    name: "Avalanche Testnet",
    icon: <AvaxLogo />,
    nId:'',
    live: false,
    supported: true,
  },
}

export default ChainsData;