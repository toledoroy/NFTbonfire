import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import NFTHelper from "helpers/NFTHelper";

/** [WIP]
 * Check if User is Allowed to Access a Collection 
 */
export const useIsAllowed = (props) => {
    const { hash, chain } = props;
    const [isAllowed, setIsAllowed] = useState(false);
    const { Moralis, isWeb3Enabled, chainId, account, user } = useMoralis();

    // useEffect(() =>{

    // }, [isWeb3Enabled, hash]);
    //  return { isAllowed };
 
    
  useEffect(() => { /* Check if Account Owns Any of These Assets */
    if(hash && isWeb3Enabled) {
      //Fetch Balance
      NFTHelper.getBalance(Moralis, account, hash, chain).then(balance => {
        //Log
        console.log("useIsAllowed() Account's Balance for this Contract:"+balance, {balance, account, hash}); 
        //Set Permissions
        setIsAllowed(balance > 0);
      // }, [hash, account]);
      });
      
      /* ServerSide Validation  - use Hook */
    //   let params = {userId:user.id, hash:hash, chainId, account};
      let params = { hash, chain };
      Moralis.Cloud.run("isAllowed", params).then(res => {
          console.warn("isAllowed() is User Allowed:"+res, {user, params, account });
      })
      .catch(err => {
          console.error("isAllowed() is User Allowed -- matchUserNFT Failed:", {user, err, params, account });
      });
      
    }else{
      //Nothing Selected -- Allow to all
      setIsAllowed(true);
      return;
    }
  }, [hash, isWeb3Enabled, chain, account]);

  return { isAllowed };
}//useIsAllowed()