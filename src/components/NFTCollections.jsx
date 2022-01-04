import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
//import { Card, Image, Tooltip, Modal, Input } from "antd";
import { Breadcrumb, Skeleton, Button, Dropdown, Avatar } from "antd";
import { useMoralis, useNFTBalances } from "react-moralis";
// import { useNFTBalance } from "hooks/useNFTBalance";
import NFTDisplayCollection from "components/NFT/NFTDisplayCollection";
import PersonaChanger from "components/Persona/PersonaChanger";
import Address from "components/Address/Address";
// import { useNFTCollections } from "hooks/useNFTCollections";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";
import { Post, Room } from "objects/objects";
import Space from "components/NFTSingle/Space";
import { CollectionContext } from "common/context";
import { NFTHelper } from "helpers/NFTHelper";
import __ from "helpers/__";
// import { getChainName, getChainLogo } from "helpers/networks";
    
/**
 * Component: Display a Single NFT
 * 
    nft:{
        contract_type: "ERC1155"

        //Collection Data
        hash: "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656"   //Collection
        name: "OpenSea Collections"
        symbol: "OPENSTORE"

        //Unique
        token_id: "62886929592743516099400483946210518088519633430112237408489058185285174558721"     //Within The Collection
        token_uri: "https://testnets-api.opensea.io/api/v1/metadata/0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656/0x8b08bda46eb904b18e8385f1423a135167647ca3000000000000030000000001"      //Metadata URI
        image: "https://lh3.googleusercontent.com/6KdfGMFC2ucrayOUEX7xRmo2bngSp0GWW_MK_fhFwhcjiHS6_a2YLjqt-xW1zaHNSEQWJIxTAK7z5Rdi-lpdejS_feIEEVudY6n6Vw"
        owner_of: "0x874a6e7f5e9537c4f934fa0d6cea906e24fc287d"
        metadata: {name: 'SuperCat', description: null, external_link: null, image: 'https://lh3.googleusercontent.com/6KdfGMFC2ucrayOU…jqt-xW1zaHNSEQWJIxTAK7z5Rdi-lpdejS_feIEEVudY6n6Vw', animation_url: null}
        amount: "1"

        block_number: "9655885"
        block_number_minted: "9655885"
        synced_at: "2021-11-17T03:54:32.340Z"
    }
*/
/**
 * Component
 * @param {*} props 
 */
function NFTCollections(props) {
 
  //Extract Props
  // const { accountHash } = props.match.params;
  let { accountHash, collectionHash } = props.match.params;

  const { Moralis, isWeb3Enabled , chainId, user, account  } = useMoralis();
  const [ isAllowed, setIsAllowed ] = useState(false);

  useEffect(() => { /* Check if Account Owns Any of These Assets */
    //Default to Current Account
    if(!accountHash) console.error("NFTCollections() Set Default Account", {accountHash, account});
    if(!accountHash) accountHash = account; 
    


    if(collectionHash && isWeb3Enabled) {
      let chain = props?.match?.params?.chain || chainId;
      //Fetch Balance
      NFTHelper.getBalance(Moralis, account, collectionHash, chain).then(balance => {
        //Log
        console.log("NFTCollections() Account's Balance for this Contract:"+balance, {balance, account, collectionHash}); 
        //Set Permissions
        setIsAllowed(balance > 0);
      // }, [collectionHash, account]);
      });
      
      /* ServerSide Validation  - use Hook
      let params = {userId:user.id, hash:collectionHash, chainId, account};
      Moralis.Cloud.run("isAllowed", params).then(res => {
          console.warn("isAllowed() is User Allowed:"+res, {user, params, account });
      })
      .catch(err => {
          console.error("isAllowed() is User Allowed -- matchUserNFT Failed:", {user, err, params, account });
      });
      */
    }else{
      //Nothing Selected -- Allow to all
      setIsAllowed(true);
      return;
    }
  }, [accountHash, collectionHash, isWeb3Enabled, chainId, account]);

  //Init Options
  let options = {
    // chain:"0x4", 
    // address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1'
  };
  // if (accountHash) options.address = accountHash;    //No Dice... :(
  options.address = accountHash ? accountHash : account;    //No Dice... :(
  if(props?.match?.params?.chain) options.chain = props.match.params.chain;
  const { NFTCollections, NFTpersonas } = useNFTCollections(options);

  //Log
  console.log("(i) NFTCollections() for Collections: ", {NFTCollections, collectionHash, accountHash, options, params:props.match.params });
  
  async function testFunc() {
    try {
      if(isWeb3Enabled) {
        //Cloud Functions
        const msg = await Moralis.Cloud.run("sayHi");
        const posts = await Moralis.Cloud.run("getPosts");
        const rooms = await Moralis.Cloud.run("getRooms");
        console.warn("Moralis Cloud Func:", {msg, posts, rooms});

        //Objects
        // const Post = Moralis.Object.extend("Post");
        
        /* Create a new instance of that class. */
        const post1 = new Post();
        post1.set("text", "My Second post");
        post1.set("id", 'POST1');
        post1.set("roomId", 'ROOM1');
        // post1.set("user", Moralis.currentUser.get("objectId"));    //TODO: Get Current User ObjectID, This isn't Really It...
        // await post1.save(); //Save to DB
        console.warn("Moralis Objects: New Post:", post1);
        
        //Object Queries
        const queryPosts = new Moralis.Query(Post); //Query the Object
        // query.equalTo("roomId", "?"); //Filter      
        queryPosts.limit(20); 
        // query.skip(10); 
        // query.withCount(); //Add Count
        const allPosts = await queryPosts.find();
        // const object = await query.first();
        console.warn("Moralis Object Queries:", {allPosts});
      }//Web3Enabled
      // else console.warn("NFTCollection() WAIT for Moralis Cloud");  
    }
    catch (error) {
      //Log
      console.log("[CAUGHT] NFTCollection() Exception", {error});
    }//SANDBOX
  }//testFunc()
  // testFunc();

 
  

  //style={styles.NFTs}
  return (
    <Skeleton loading={!isWeb3Enabled}>
      
      {!isAllowed && <p className="debug" style={{float:'right'}}>NOT ALLOWED</p>}

      <div key="collections" className="collections framed">
          <div key="header" className="header">
            {(props?.match?.params?.showBreadcrumbs !== false) && 
              <>
              <Breadcrumb separator=">">
                {/* <Breadcrumb.Item key="1">Home</Breadcrumb.Item> */}
                {accountHash && <Breadcrumb.Item key="2">
                  <Link key={'Link'} to={{pathname:"/nftCollections/"+accountHash}}>
                    {accountHash == account ? "My Collections" : "NFT Collections"}
                    {/* for <Address icon={getChainLogo(options.chain)} copyable address={accountHash} size={6} /> */}
                  </Link>
                </Breadcrumb.Item>}
                {collectionHash && <Breadcrumb.Item key="3"><Link key={'Link'} to={{pathname:"/nftCollections/"+accountHash+'/'+collectionHash}}>Space for {NFTCollections[collectionHash]?.name}</Link></Breadcrumb.Item>}
                {/* <Breadcrumb.Item key="4"><Link key={'Link'} to={{pathname:"/nftCollections/"+accountHash}}>SELECT</Link></Breadcrumb.Item> */}
                {/* <Breadcrumb.Item key="4">Post</Breadcrumb.Item> */}
              </Breadcrumb>
              <h2>

              {accountHash ? 
                <>
                  {accountHash}'s NFTs
                  {/* <Address icon={getChainLogo(options.chain)} copyable address={accountHash} size={6} /> */}
                </>
                : 
                <>
                {collectionHash 
                ? <>Private Space for {NFTCollections[collectionHash].name}</>
                : <>My NFTs</>
                }
                </>}
              </h2>
              </>
            }
            {!collectionHash && <h4 className="subheading">{Object.keys(NFTCollections).length} Collections</h4>}
          </div>

          {NFTCollections && Object.values(NFTCollections).map((collection, index) => {
            if(!collectionHash || collectionHash === collection.hash) {
              //Link Destination (Single Collection)
              let dest = {
                  // pathname: "/nftSingle/"+collection.hash,
                  // pathname: collectionHash ? `${accountHash ? "/nftCollections/"+accountHash : '/nftCollections/'}` : `${accountHash ? accountHash+"/"+collection.hash : '/nftSingle/'+collection.hash}`,
                  pathname: collectionHash ? "/nftCollections/"+options.address : '/nftCollections/'+options.address+'/'+collection.hash,
                  // search: "?sort=name",
                  // hash: "#the-hash",
                  // state: { fromDashboard: true }
                };
                
                return (
                  <CollectionContext.Provider key={collection.hash+'Prov'} value={collection}>
                    {/* <p>{collection.owned ? 'Owned' : 'Not Owned'}</p> */}
                    <div key={collection.hash+'cards'} className={`collection ${collectionHash ? "stack" : ""}`}> 
                      <h2 className="title">
                        <span className="debug">{collection.contract_type}</span> 
                        <Link key={collection.hash+'Link'} to={dest}>
                           Collection: {__.sanitize(collection.name)} ({collection.symbol})
                        </Link> 
                      </h2>
                      <div className="middle">
                        <div key="cards" className="cards">
                          <NFTDisplayCollection key={collection.hash+'Collection'} collection={collection} dest={dest} />
                        </div>
                        {collectionHash && 
                        <div key="space" className="space_container">
                          <Space hash={collectionHash} collection={collection} NFTpersonas={NFTpersonas}/>
                        </div>
                        }
                      </div>
                    </div>
                  </CollectionContext.Provider>
                );
              } else return '';
          })}
      </div>
    </Skeleton>
  );
}//NFTCollections()

export default NFTCollections;

