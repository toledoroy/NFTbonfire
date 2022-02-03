import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

/** TODO: DELETE FILE
 * Component: Convo Page
 */
function Convo(props) {
    const { Moralis, isWeb3Enabled } = useMoralis();
    // const [ room, setRoom ] = useState({});
    const [ convo, setConvo ] = useState({});
    const [ posts, setPosts ] = useState([]);

    //Extract ID from props
    const { id } = props.match.params;

    //Objects
    const Convo = Moralis.Object.extend("Convo");
    const Post = Moralis.Object.extend("Post");
    
    //Test Convo
    let testConvo = new Convo({
        text: "I have a question to you all... ", 
        iamge: 'https://lh3.googleusercontent.com/l8aMpUg6aRR1JPVuTcHIfyJm553Bayas90pis0kr6oQIwWdcMHVOxVb6rugeai_pfzezgqm5wUvWskyRIFe4FJNgZhFyGHuhGeUw_rE',
        account: '0x8b08BDA46eB904B18E8385F1423a135167647cA3',
        tags: ['party', 'fun', 'friends'],
    });


    useEffect(() => {
        if(isWeb3Enabled) {
            //Load Current Room's Data
             const query = new Moralis.Query(Convo);
             query.get(id).then(function(current) {
                 //Log
                 console.log("Moralis Query Object for Current Convo: ", {id, current});
                 //Set State
                 setConvo(current);
                 return current;
             }).then(function(current) {
                //Get Current Convo's Posts
                const PostQuery = new Moralis.Query(Post); //Query the Object
                PostQuery.equalTo("convo", current).find().then(function(items) {
                    //Log
                    console.log("Moralis Query for Current Convo's Posts: ", {id, items});
                    //Set State
                    setPosts(items);
                    return items;
                });
            })
            .catch(function(error) {    
                console.error("[CAUGHT] Error on Room Load:", {id, error});
            });

            /*
            query.find().then(result => {
            query.get(id).then(function(current) {
                current.sayHi();
                //Log
                console.log("Moralis Query Object for Current Room: ", {id, current});
                //Set State
                setRoom(current);
                return current;
            }).then(function(current) {

                //Get Current Room's Posts
                const PostQuery = new Moralis.Query(Post); //Query the Object
                PostQuery.equalTo("room", current).find().then(function(items) {
                    //Log
                    console.log("Moralis Query Object for Current Room's Posts: ", {id, items});
                    //Set State
                    setPosts(items);
                    return items;
                });

            })
            .catch(function(error) {    
                console.error("[CAUGHT] Error: ", error);
            });
            */
        }//Web3 Enabled
    }, [id, isWeb3Enabled]);


    //Validate
    // if(collection.contract_type!=="ERC1155"){
    //     return <div>Unsupported Collection Type:'{collection.contract_type}'</div>;
    // }
    // if(!room) return <div>Room Data Missing...</div>;
    return (
        <div className="convo">
            <h2>CONVO: {id}</h2>
            {/* <h2>CONVO: {convo.text} For Collection: {collection.name}</h2> */}
            {/* <h3>NFT:{collection.token_address}</h3> */}
            {/* <p>Type: {collection.contract_type}</p> */}
            {/* <p>Symbol: {collection.symbol}</p> */}
            {/* TODO: Add Field: Creator, Total No. of Items, */}
            <div className="posts">
                {posts && posts.map((item, index) => (
                    <PostSingle item={item} />
                ))}
            </div>
        </div>
    );

}//Convo()

export default Convo;




/**
 * Component: Post - Single
 */
 function PostSingle({ item }){
    return(
      <div className="post_d1">
        {/* <h3>Room: {room?.get('name')}</h3> */}
        {/* <p>ID: {room.id}</p>
        <p>Hash: {room?.get('hash')}</p>
        <p>Description: {room.get('description')}</p>
        <p>Created: {room?.created}</p>
        <p>Last Updated: {room?.updated}</p> */}
        {/* <p>Total Items: {room.total_items}</p> */}
        {/* <p>Total Users: {room.total_users}</p> */}
      </div>
    );
  }//PostSingle()