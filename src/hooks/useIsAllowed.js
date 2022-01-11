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
 
    
  useEffect(() => { 
    /* Check if Account Owns Any Assets on Specified Contract */
    if(hash && isWeb3Enabled && user && account){
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
      Moralis.Cloud.run("useIsAllowed", params).then(res => {
          console.warn("useIsAllowed() is User Allowed:"+res, {user, params, account });
      })
      .catch(err => {
          console.error("useIsAllowed() is User Allowed Failed:", {user, err, params, account });
      });
      
    }
    else{
      //Nothing Selected -- Allow to all
      // setIsAllowed(true);
      // return;
      // console.warn("useIsAllowed() Can't Run:", {hash, isWeb3Enabled, chain, account, user});
      // setIsAllowed(false);
      setIsAllowed(!hash);  //True if no hash Selected
    }
  }, [hash, isWeb3Enabled, chain, account, user]);

  return { isAllowed };
}//useIsAllowed()