import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
// import { LoadingOutlined, CameraFilled, PlusOutlined, PlusCircleOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';

/**
 * Component - Page:Authenticate 
 */
function PageAuthenticate(props) {
    const { params } = props.match;
    // const { handle, chain, contract, token_id } = params;
    // const { Moralis, setUserData, userError, user, chainId } = useMoralis();     //isWeb3Enabled, isUserUpdating
    const { isWeb3Enabled, enableWeb3, isInitialized, isAuthenticated, isWeb3EnableLoading } = useMoralis();

    if(isAuthenticated){
        
    }
    return (
        <div className="framed">
            <h1>Unauthenticated</h1>
            <p>This page requires you to connect your web3 wallet</p>
            <h2>Please login using the "Authenticate" button on the top right corner to log in via your web3 wallet</h2>
        </div>
    );
}//PageAuthenticate()

export default PageAuthenticate;
