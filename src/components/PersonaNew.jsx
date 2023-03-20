import React from "react";
import { useMoralis } from "react-moralis";
import PagePersona from "components/PagePersona";
import { Skeleton } from 'antd';

/**
 * Component - New Persona Controller (for Validation)
 */
function PersonaNew(props) {
    const { isWeb3Enabled, isAuthenticated } = useMoralis();

    if(!isWeb3Enabled) return (<Skeleton active loading={true}></Skeleton>)
    if(isAuthenticated) return <PagePersona {...props} />;
    else{
        return (
            <div className="framed auth_req"> 
                <h2>To mint yourself a new persona, please first authenticate using your Web3 wallet.</h2>
                {/* <PageAuthenticate /> */}
                <h3>Please login using the "Authenticate" button on the top right corner to log in via your web3 wallet</h3>
            </div>
        );
    }
}

export default PersonaNew;
