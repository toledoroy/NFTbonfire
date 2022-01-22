import React from "react";
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
            <h1>Welcome to Web3</h1>
            {/* <h3>This page requires you to connect your web3 wallet</h3> */}
            <h2>Please Connect your web3 wallet using the "Authenticate" button on the top right corner</h2>
        </div>
    );
}//PageAuthenticate()

export default PageAuthenticate;
