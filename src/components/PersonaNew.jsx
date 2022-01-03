import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import PagePersona from "components/PagePersona";
// import PageAuthenticate from "components/PageAuthenticate";

/**
 * Component - New Persona Controller (for Validation)
 */
function PersonaNew(props) {
    const { isAuthenticated } = useMoralis();

    if(isAuthenticated) return <PagePersona {...props} />;
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
