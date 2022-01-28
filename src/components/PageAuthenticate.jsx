import React from "react";
import { useMoralis } from "react-moralis";
import CarvedHeading from "components/common/CarvedHeading";

/**
 * Component - Page:Authentication Request 
 */
function PageAuthenticate(props) {
    // const { params } = props?.match;
    // const { handle, chain, contract, token_id } = params;
    const { isWeb3Enabled, authenticate } = useMoralis();
    const { isAuthenticated } = useMoralis();

    if(isAuthenticated){
        console.error("[DEV] PageAuthenticate() Should Not Be Here -- Authenticated:"+isAuthenticated);
    }
    return (
        // <div className="framed">
        <div className="authenticate framed flex_col itemsCenter">
            {/* <h1>Welcome to Web3</h1> */}
            <CarvedHeading heading={1} text="Welcome to Web3" />
            <br />
            {/* <h3>This page requires you to connect your web3 wallet</h3> */}
            {/* <h2>Please Connect your web3 wallet using the "<span style={{color:'var(--colorAccent2)'}}>Authenticate</span>" button on the top right corner</h2> */}
            <h2>
                To access thie pace, please Connect your web3 wallet and <span style={{color:'var(--colorAccent2)'}} className="link" onClick={() => authenticate({ signingMessage: "Sign in [Free]" })}>Authenticate</span>
            </h2>
        </div>
    );
}//PageAuthenticate()

export default PageAuthenticate;
