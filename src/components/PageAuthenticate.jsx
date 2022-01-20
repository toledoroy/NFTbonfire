import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
// import { LoadingOutlined, CameraFilled, PlusOutlined, PlusCircleOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';

/** UNUSED
 * Component - Page:Authentication Request 
 */
function PageAuthenticate(props) {
    // const { params } = props?.match;
    // const { handle, chain, contract, token_id } = params;
    // const { Moralis, setUserData, userError, user, chainId } = useMoralis();     //isWeb3Enabled, isUserUpdating
    const { isAuthenticated } = useMoralis();

    if(isAuthenticated){
        console.error("[DEV] PageAuthenticate() Should Not Be Here -- Authenticated:"+isAuthenticated);
    }
    return (
        // <div className="framed">
        <div className="authenticate framed">
            {/* <h1>Unauthenticated</h1> */}
            <p>This page requires you to connect your web3 wallet</p>
            <h2>Please login using the "Authenticate" button on the top right corner to log in via your web3 wallet</h2>
        </div>
    );
}//PageAuthenticate()

export default PageAuthenticate;
