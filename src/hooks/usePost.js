// import { getWrappedNative } from "helpers/networks";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Room, Comment as CommentObj } from "objects/objects";  //These Run in the Wrong Context

export const usePost = ({ hash, limit }) => {
    const { Moralis, isAuthenticated } = useMoralis();
    const [rooms, setRooms] = useState([]);

    /**
     * Fetch Rooms for Current Space
     */
    useEffect(() => {
        loadRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, limit, isAuthenticated]);

    const loadRooms = (postId) => {
        if (isAuthenticated && hash) {    //TODO: Check if User is Allowed to View this Space
            //Log
            // console.log("[TEST] Chat() RUNNUING W/Hash:"+hash);
            //Get Rooms for Space (by Space's hash)
            const RoomQuery = new Moralis.Query(Room);
            RoomQuery.equalTo("parentId", hash);  //By Hash
            const PersonaQuery = new Moralis.Query('Persona');
            RoomQuery.matchesKeyInQuery("persona", "objectId", PersonaQuery);
            RoomQuery
                .addDescending("score")    //Best First
                .addDescending("updatedAt") //Latest Activity
                .limit(limit);
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
    return { rooms, loadRooms };
}