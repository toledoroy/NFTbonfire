import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import PagePersona from "components/PagePersona";
// import PageAuthenticate from "components/PageAuthenticate";

// const { TabPane } = Tabs;
// const { Panel } = Collapse;

//Persona Fields Mapping
// const personaFields = require('schema/PersonaData.json');

//Persona Contract ABI
// import personaABI from "contracts/abi/PERSONA.json";
// const personaABI = require('contracts/abi/PERSONA.json');
// console.log("PersonaNew() personaABI:", personaABI);
// const contractPersona = Persona.getContractData();

/**
 * Component - New Persona Controller (for Validation)
 */
function PersonaNew(props) {
    // const { handle, chain, contract, token_id } = params;
    const { Moralis, isWeb3Enabled, isAuthenticated, setUserData, userError, user, chainId, account } = useMoralis();     //isUserUpdating
    // const [ collection, setCollection ] = useState(null);
    // const [ isEditMode, setIsEditMode ] = useState(false);
    // const [ metadata, setMetadata ] = useState(null);
    //File Upload
    // const [ imageUrl, setImageUrl ] = useState(metadata?.image);
    // const [ imageLoading, setImageLoading ] = useState(false);

    if(isAuthenticated) return PagePersona(props);
    else{
        return (
            <div className="framed"> 
                <h2>To mint yourself a new persona, please first authenticate using your Web3 wallet.</h2>
                {/* <PageAuthenticate /> */}
                <h3>Please login using the "Authenticate" button on the top right corner to log in via your web3 wallet</h3>
            </div>
        );
    }
}//PersonaNew()

export default PersonaNew;
