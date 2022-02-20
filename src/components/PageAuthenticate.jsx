import React from "react";
import { useMoralis } from "react-moralis";
import CarvedHeading from "components/common/CarvedHeading";

/**
 * Component - Page:Authentication Request 
 */
function PageAuthenticate(props) {
    // const { params } = props?.match;
    // const { handle, chain, contract, token_id } = params;
    const { isWeb3Enabled, isAuthenticated, authenticate } = useMoralis();

    if (isAuthenticated) {
        console.error("[DEV] PageAuthenticate() Should Not Be Here -- Authenticated:" + isAuthenticated);
    }
    return (
        // <div className="framed">
        <div className="authenticate framed flex_col itemsCenter">
            {/* <h1>Welcome to Web3</h1> */}
            <CarvedHeading heading={1} text="Welcome to Web3" />
            <br /><br />
            {/* <h3>This page requires you to connect your web3 wallet</h3> */}
            {/* <h2>Please Connect your web3 wallet using the "<span style={{color:'var(--colorAccent2)'}}>Authenticate</span>" button on the top right corner</h2> */}
            <div style={{ textAlign: 'center' }}>
                {isWeb3Enabled
                    ? <h2>To access this website's full functionality please connect your web3 wallet and <span style={{ color: 'var(--colorAccent2)' }} className="link" onClick={() => authenticate({ signingMessage: "Sign in to NFT Bonfire [Free]" })}>Authenticate</span></h2>
                    : <h2>
                        To access this website's full functionality you'd need a web3 wallet such as
                        <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" alt="Metamask"><img src="/images/metamask-logo.svg" style={{ margin: '14px auto 0 ' }} /></a>
                    </h2>
                }
            </div>
        </div>
    );
}//PageAuthenticate()

export default PageAuthenticate;
