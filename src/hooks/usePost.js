// import { getWrappedNative } from "helpers/networks";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Room, Comment as CommentObj } from "objects/objects";  //These Run in the Wrong Context

export const usePost = ({ hash, limit, order }) => {
    const { Moralis, isAuthenticated } = useMoralis();
    const [rooms, setRooms] = useState([]);

    /**
     * Fetch Rooms for Current Space
     */
    useEffect(() => {
        loadRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, limit, order, isAuthenticated]);

    const loadRooms = (postId) => {
        if (isAuthenticated && hash) {    //TODO: Check if User is Allowed to View this Space
            //Log
            // console.log("[TEST] Chat() RUNNUING W/Hash:"+hash);
            //Get Rooms for Space (by Space's hash)
            const RoomQuery = new Moralis.Query(Room);
            RoomQuery.equalTo("parentId", hash);  //By Hash
            const PersonaQuery = new Moralis.Query('Persona');
            RoomQuery.matchesKeyInQuery("persona", "objectId", PersonaQuery);
            RoomQuery.limit(limit);
            //Order
            if (order == "old") {
                //Oldest First
                RoomQuery.addAscending("updatedAt");
            } else if (order == "new") {
                //Latest Activity First
                RoomQuery.addDescending("updatedAt");
            } else {
                //Best First
                RoomQuery.addDescending("score");    //Best First
                RoomQuery.addDescending("updatedAt"); //Latest Activity
            }
            RoomQuery.find().then(results => {
                //Log
                console.log("Chat() Got " + results.length + " Rooms for Space:" + hash);
                if (results && results.length > 0) {
                    //Log
                    // console.log("[DEBUG] Chat() Got "+results.length+" Rooms for Space:"+hash, results); 
                    //Set Rooms
                    setRooms(results);
                    //Option to Set Current Room
                    if (postId) {
                        //Verify
                        if (results.find(post => (post.id === postId))) {
                            // console.warn("[TEST] Chat() Setting Current Room to:"+postId, results);
                            setCurRoomId(postId);
                        }
                        //Log
                        else {
                            console.error("[DEV] Chat() Can't Set Set New Room -- Room:" + postId + " not in list");
                            //TODO: Maybe Redirect to Single Room Page ?
                        }
                    }
                }//Found Rooms
                /* Cancelled - Allow for No Rooms
                else {
                  //Init Rooms
                  let roomsInit = initRooms(hash); 
                  //Set Rooms
                  // setRooms(roomsInit); //Try Without... Also Use Live Query
                  //Log
                  // console.log("[TEST] Chat() No Rooms Found for Space:"+hash+" --> Init Rooms", roomsInit);
                }//No Rooms
                */
            });
            //Log
            // console.log("Moralis Query Object for Current Room: ", {hash, curRoomId});
        }//Authenticated
        else setRooms([]);
    }//loadRooms()

    /** DEPRECATED
     * Insert Rooms
     */
    function initRooms(hash) {
        try {
            let roomsInit = [
                new Room().set("name", 'Introduction').set("text", 'Say Hi! and introduce yourself'),
                // new Room().set("name", 'News').set("text", 'Things people like you should know about'),
                // new Room().set("name", 'Events').set("text", 'Virtual Meta-Events or IRL, all private NFT events can be posete here'),
            ];
            for (let room of roomsInit) {
                // room.set("space", space.id);    //Seems Unecessary. Spaces are 1-1 with Contract Hashes
                room.set("parentId", hash);       //Link Directly to Space (By Hash)
                room.save().then(result => {
                    console.log("initRooms() Created Default Room for:" + hash, result);
                });
            }//Insert Each Room

            //Set Rooms
            // setRooms(roomsInit); //Try Without... Also Use Live Query
            //Log
            // console.log("[TEST] SpaceView() No Rooms Found for Space:"+hash+" --> Init Rooms", roomsInit);

            //Return
            // return roomsInit;
        } catch (error) { console.error("[CAUGHT] SpaceView() Init Rooms Error", { error, hash }); }
    }//initRooms()

    return { rooms, loadRooms };
}