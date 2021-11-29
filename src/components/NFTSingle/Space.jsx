import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMoralis } from "react-moralis";
// import RoomPage from "components/Pages/RoomPage";
import { FireTwoTone } from '@ant-design/icons';
import { Skeleton, Image } from "antd";
import { useMoralisQuery } from "react-moralis";

import PersonaHelper from "helpers/PersonaHelper"

function Space({hash, collection}) {
  const { Moralis, isWeb3Enabled } = useMoralis();
  const [ space, setSpace ] = useState({});
  const [ rooms, setRooms ] = useState([]);

  //Objects
  const Space = Moralis.Object.extend("Space");
  // const Room = Moralis.Object.extend("Rooms");
  const Room = Moralis.Object.extend("Post"); //Use Posts as Rooms

  
  /* isLoading turns false before the data is actually loaded :( 
  const res = useMoralisQuery("Post",
    (query) => query.equalTo("parentId", hash),
    [hash],
    { live: true }
  );
  const { data:rooms, isLoading, error} = res;
  useEffect(() => {
    if(!isLoading && !error) {
      //Validate
      if(rooms.length === 0) {
        //Log
        console.error("[TODO] Space() No Rooms Found -- Should Run Init", {isLoading, rooms, error, res:{...res}});
      }
    }
  }, [isLoading, rooms]);
  //Log
  console.log("[TEST] Space's' Rooms Query:", {isLoading, rooms,});
  */


  function initRooms(hash){

    let roomsInit = [
      new Room().set("name", 'Introduction').set("text", 'Say Hi! and introduce yourself'),
      new Room().set("name", 'News').set("text", 'Things people like you should know about'),
      new Room().set("name", 'Events').set("text", 'Virtual Meta-Events or IRL, all private NFT events can be posete here'),
      new Room({test:1}).set("name", 'Chat').set("text", 'Just talk about whatever'),
    ];
    for(let room of roomsInit){ 
      // room.set("space", space.id);    //Seems Unecessary. Spaces are 1-1 with Contract Hashes
      room.set("parentId", hash);       //Link Directly to Space (By Hash)
      room.save().then(result => {
        console.log("[TEST] Created Room for:"+hash, result);
      });
    }//Insert Each Room
    //Return
    return roomsInit;
  }//initRooms()
  
  /**
   * Fetch Current Space
   */
  useEffect(() => {
    if (isWeb3Enabled) {
      const query = new Moralis.Query(Space);
      query.equalTo("hash", hash);
      query.first().then(result => {
        if(result) {
          setSpace(result);
          //Log
          // console.log("[TEST] Got Space for Hash:'"+hash+"'", result); 
        }//Existing Space
        else{
          //Create a new Space
          const newSpace = new Space();
          newSpace.set("hash", hash);
          newSpace.set("name", "New Space"); //No Need
          newSpace.set("text", "This is a new space");  //No Need
          // newSpace.set("first_user", Moralis.currentUser.get("objectId"));   //TODO: Get Current User ObjectID, This isn't Really It...
          // newSpace.set("rooms", []); //Other Way...
          newSpace.save().then(result => {
            console.log("Created new Space:", result);
            setSpace(result);
          });
        }//New Space
      });
    }//Web3 Enabled
    else console.log("Space() Waiting for Web3...");
  }, [isWeb3Enabled, hash]);

  /**
   * Fetch Rooms for Current Space
   */
  useEffect(() => {
    //Log
    console.log("[TEST] Space() RUNNUING EFFECT:"+hash);
        
    //Get Rooms for Space (by Space's hash)
    const RoomQuery = new Moralis.Query(Room);
    RoomQuery.equalTo("parentId", hash);  //By Hash
    //Log
    console.log("Get Rooms for Space:"+hash);
    RoomQuery.find().then(result => {
      if(!result || result.length === 0) {
        let roomsInit = initRooms(hash);
        //Log
        console.log("[TEST] Space() No Rooms Found for Space:"+hash+" --> Init Rooms");
        
        //Set Rooms
        // setRooms(roomsInit); //Try Without... Also Use Live Query

      }//No Rooms
      else{
        //Log
        console.log("[TEST] Space() Got Rooms for Space:"+hash, result);
        //Set Rooms
        setRooms(result);
      }//Found Rooms
    });
    //Log
    // console.log("Moralis Query Object for Current Room: ", {hash, curRoom});
  }, [hash]);
 
  //Log
  console.log("Space() For collection:", {collection, rooms});
  
  //Validate  
  // if(collection.contract_type!=="ERC1155") return <div>Unsupported Collection Type:'{collection.contract_type}'</div>;   //It's a mess out there, ERC721 0xcc14dd8e6673fee203366115d3f9240b079a4930 Contains Multiple NFTs (All Have amount=1)
  // if(!space) return <div className="loading">...LOADING SPACE...</div>;    //Enable
  return (
    <Skeleton active loading={!space}>
    <div className="space">
        <h2> Private Space for {collection.name}</h2>
        <h3>NFT:{collection.token_address}</h3>
        <p key="typs">Type: {collection.contract_type}</p>
        <p key="symbol">Symbol: {collection.symbol}</p>
        {/* TODO: Add Field: Creator, Total No. of Items, */}
        <div className="room_list">
          {/* Chat Rooms */}
          {/* <RoomPage hash collection /> */}
          {/* <RoomEntrance hash collection /> */}
          {/* {roomsTest && roomsTest.map((room, index) => (<RoomEntrance hash collection room key={collection.token_address} />))} */}
          {rooms ? rooms.map((room, index) => (<RoomEntrance hash={hash} collection={collection} room={room} />)) : <div>Loading Rooms...</div>}
        </div>
        <RoomAdd hash={hash} collection={collection} />
        <div className="clearfloat"></div>
    </div>
    </Skeleton>
  );
}//Space()

export default Space;


/**
 * Link To Room
 */
function RoomEntrance({hash, collection, room}) {

  console.log("[TEST] RoomEntrance ", room, PersonaHelper.userImage(room.get('userId')));

  return(
    <div className="room_entrance">
      <img
        src={PersonaHelper.userImage(room.get('userId'))}
        fallback="data:image/png;base64,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"
        alt=""
        // style={{ height: "var(--cardHeight)", width: "var(--cardWidth)" }}
        className="avatar"
    />
    
      <h3><FireTwoTone twoToneColor="red" />{room?.get('name')}</h3>
      <p key="id">ID: {room.id}</p>
      <p key="desc">text: {room.get('text')}</p>
      {/* <p key="created">Created: {room?.createdAt}</p> */}
      {/* <p key="updated">Last Updated: {room?.updatedAt}</p> */}
      {/* <p key="">Total Items: {room.total_items}</p> */}
      {/* <p key="">Total Users: {room.total_users}</p> */}
      <Link  key="link" to={{ pathname: "/room/"+room.id, }} className="btn">Go!</Link>
     
      
     
    <div className="clearfloat"></div>
    </div>
  );
}//RoomEntrance()

function RoomAdd({hash}) {
  const { Moralis } = useMoralis();
  //Objects
  const Room = Moralis.Object.extend("Post"); //Use Posts as Rooms
  
  return(
    <div className="room_add">  
      <h3>Start a new bonfire</h3>
      <p>Add a new Room to this Space</p>
      <form onSubmit={(event) => {
          event.preventDefault();
          
          //https://stackoverflow.com/questions/23427384/get-form-data-in-reactjs
          console.log("[TEST] Form Values:", {name2:event.target.name.value, name:event.target.elements.name.value, text:event.target.elements.text.value}) // from elements property
        
        // const newRoom = new Room();
        // newRoom.set("name", "New Room");
        // newRoom.set("text", "This is a new room");
        // newRoom.set("parentId", hash);
        // newRoom.save().then(result => {
        //   console.log("Created new Room:", result);
        // });

        }}>
        <input type="text" name="name" placeholder="Topic" />
        <input type="text" name="text" placeholder="Description" />
        <button type="submit">Light Up</button>
      </form>
    </div>
  );
}//RoomAdd()