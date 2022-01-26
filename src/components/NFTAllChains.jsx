import React from "react";
// import { Link } from "react-router-dom";
//import { Card, Image, Tooltip, Modal, Input, Button, Dropdown, Avatar } from "antd";
// import { Breadcrumb, Skeleton, Button } from "antd";
// import { useMoralis } from "react-moralis";
// import { useNFTBalance } from "hooks/useNFTBalance";
// import NFTDisplayCollection from "components/NFT/NFTDisplayCollection";
// import PersonaChanger from "components/Persona/PersonaChanger";
// import Address from "components/Address/Address";
// import { useNFTCollections } from "hooks/useNFTCollections";
// import { useNFTCollections } from "hooks/useNFTCollectionsNew";
// import { useIsAllowed } from "hooks/useIsAllowed";
// import { Post } from "objects/objects";
// import Space from "components/NFTSingle/Space";
// import { CollectionContext } from "common/context";
// import { NFTHelper } from "helpers/NFTHelper";
// import { ChainHelper } from "helpers/ChainHelper";
import CarvedHeading from "components/common/CarvedHeading";
import NFTDisplayAllChains from "components/NFT/NFTDisplayAllChains";
// import __ from "helpers/__";
// import { getChainName, getChainLogo } from "helpers/networks";

/**
 * ComponentL 
 * @param {*} props 
 */
function NFTAllChains(props) {

    return (
    <div className="framed">
        <CarvedHeading heading={1} text={"My NFTs"} />
        <NFTDisplayAllChains />
    </div>
    );
}//NFTAllChains()

export default NFTAllChains;