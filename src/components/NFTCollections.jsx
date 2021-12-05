import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
//import { Card, Image, Tooltip, Modal, Input } from "antd";
import { Skeleton, Button } from "antd";
import { useMoralis, useNFTBalances } from "react-moralis";

// import { useNFTBalance } from "hooks/useNFTBalance";
import NFTDisplayCollection from "components/Wallet/NFTDisplayCollection";
// import Space from "components/NFTSingle/Space";

// import Address from "components/Address/Address";

// import { useNFTCollections } from "hooks/useNFTCollections";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";
// import { useNFTBalance } from "hooks/useNFTBalance";
import Space from "components/NFTSingle/Space";

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
function NFTCollections(props) {

  //Extract Props
  // const { hash } = props.match.params;
  const { hash, selected } = props.match.params;
  //Init Options
  let options = {
    // chain:"0x4", 
    // address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1'
  };
  if (hash) options.address = hash;    //No Dice... :(
  // let guestOptions = {chain:"0x4", address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1'};
  
  // const { NFTBalance, getNFTBalance } = useNFTBalance();   //Using Colleciton Instead
  const { Moralis, isWeb3Enabled } = useMoralis();
  const { NFTCollections } = useNFTCollections(options);

  // const { NFTBalances } = useNFTBalances(guestOptions);
  // const { data: NFTBalances, isLoading, error } = useNFTBalances(options);   //Get NFTs for Account
  // console.log("[TEST] NFTCollections() NFTBalance", NFTBalances);
  console.warn("[TEST] NFTCollection() NFTCollections: ", {NFTCollections, selected, options, params:props.match.params });
  
  try {
  
    //Example
    //const { runContractFunction, contractResponse, error, isLoading } = useAPIContract({
    //   abi: usdcEthPoolAbi,
    //   address: usdcEthPoolAddress,
    //   functionName: "observe",
    //   params: {secondsAgos: [0, 10],},
    // });

    async function testFunc() {
      if(isWeb3Enabled) {
        //Cloud Functions
        const msg = await Moralis.Cloud.run("sayHi");
        const posts = await Moralis.Cloud.run("getPosts");
        const rooms = await Moralis.Cloud.run("getRooms");
        console.warn("Moralis Cloud Func:", {msg, posts, rooms});

        //Objects
        const Post = Moralis.Object.extend("Post");
        const Room = Moralis.Object.extend("Rooms", { 
          sayHi: function() { console.log("Hi! I'm Room "+this.id); },
        });
        
        
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
        // query.equalTo("roomId", "?"); //Filter           //TODO: Get Current Room ID
        // query.notEqualTo("ownerName", "Daenerys");
        // query.greaterThan("ownerAge", 18);
        queryPosts.limit(20); 
        // query.skip(10); 
        // query.withCount(); //Add Count
        //Sorting
        // query.ascending("strength");
        // query.descending("strength");
        // query.containedIn("ownerName", ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]);
        // query.exists("strength");
        // query.exclude("ownerName");  //Fields That Aren't This
        const allPosts = await queryPosts.find();
        // const object = await query.first();
        console.warn("Moralis Object Queries:", {allPosts});

        /* Queries of Queries 
        // const Team = Moralis.Object.extend("Team");
        const RoomQuery = new Moralis.Query(Room);
        // teamQuery.greaterThan("winPct", 0.5);
        // const userQuery = new Moralis.Query(Moralis.User);
        const postQuery = new Moralis.Query(Post);
        postQuery.matchesKeyInQuery("objectId", "roomId", RoomQuery);    //TEST THIS -- Need to Create Some Rooms & Match them to Posts
        // results has the list of users with a hometown team with a winning record
        const postsInRoom = await postQuery.find();
        //Log
        console.warn("Moralis Object Queries 2", {postsInRoom});
        */

      }//Web3Enabled
      // else console.warn("NFTCollection() WAIT for Moralis Cloud");  
    }//testFunc()
    // testFunc();
  }
  catch (error) {
    console.log("[CAUGHT] NFTCollection() Exception", {error});
  }//SANDBOX

  

  //style={styles.NFTs}
  return (
    <Skeleton loading={!isWeb3Enabled}>
      <div className="collections">
          <div className="header">
            {hash ? <h2>{hash}'s NFTs</h2> : <h2>My NFTs</h2>}
            <h4 className="subheading">{Object.keys(NFTCollections).length} Collections</h4>
          </div>
          {NFTCollections && Object.values(NFTCollections).map((collection, index) => {
            if(!selected || selected === collection.hash) {
              //Link Destination (Single Collection)
              let dest = {
                  // pathname: "/nftSingle/"+collection.hash,
                  pathname: selected ? `${hash ? "/nftCollections/"+hash : '/nftCollections/'}` : `${hash ? hash+"/"+collection.hash : '/nftSingle/'+collection.hash}`,
                  // search: "?sort=name",
                  // hash: "#the-hash",
                  // state: { fromDashboard: true }
                };
                return (
                  <>
                    <Link key={collection.hash+'Link'} to={dest}>SELECT</Link>

                      <div key={collection.hash+'cards'} className={`collection ${selected ? "stack" : ""}`}> 
                        <h2 className="title">{collection.contract_type} Collection: {collection.name} ({collection.symbol})</h2>
                        <div className="middle">
                          <div className="cards">
                            <NFTDisplayCollection key={collection.hash+'Collection'} collection={collection} dest={dest} />
                          </div>
                          {selected && <div className="space_container"><Space hash={selected} collection={collection} /></div>}
                        </div>
                      </div>
                  </>
                );
              } else return '';
          })}
      </div>

      {/* NFTs (Singles)
        <div style={styles.NFTs}>
          {NFTBalance &&
            NFTBalance.map((nft, index) => (
              <NFTDisplaySingle key={nft.token_id} nft={nft} />
            ))}
        </div>
      */}  
    </Skeleton>
  );
}//NFTCollections()

export default NFTCollections;
