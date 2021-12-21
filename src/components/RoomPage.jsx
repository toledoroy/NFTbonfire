import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
    
// import { useNFTCollections } from "hooks/useNFTCollections";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";
import { Link } from "react-router-dom";
import { Image, Avatar } from "antd";
import { FireTwoTone } from '@ant-design/icons';
// import Post from "components/Room/Post"
import VotePane from "components/Room/VotePane"
import AddPost from "components/Room/AddPost"
import Blockie from "components/Blockie";
import Address from "components/Address/Address";
import { Post, Room, Comment } from "objects/objects";


/**
 * Component Page:Room
 */
function RoomPage(props) {
    const { id } = props.match.params;
    const { Moralis, isWeb3Enabled } = useMoralis();
    const [ room, setRoom ] = useState({});
    const [ posts, setPosts ] = useState([]);
    const { NFTCollections } = useNFTCollections();
    const [ collection, setCollection ] = useState(null);

    /* Now IMPORTED
    //Objects
    // const Room = Moralis.Object.extend("Rooms", { 
    const Room = Moralis.Object.extend("Post", {});    //Container of Main Posts
    const Post = Moralis.Object.extend("Post", {        //Main Posts
        getComments: function() { 
            //Log
            console.log("[TODO] Get Comments for "+this.id); 
            return '[COMMENTS]';
        },
    });
    const Comment = Moralis.Object.extend("Post");     //Sub-Posts
    */

    const limit = 20;    //Posts per page
    // hash = '0xIUYASD&(&TEST'; //TEST Room Hash
    // id = 'r65dlvN0HDxTI3Sr41shucle';
    // console.log("START Room Page W/id:"+id);

    /* Get Current Room - Cancelled ... I think... */
    useEffect(() => {
        if(isWeb3Enabled) {
            //Get Current Room's Data
            const RoomQuery = new Moralis.Query(Room);
            RoomQuery.get(id).then(function(curRoom) {
                // curRoom.sayHi();
                //Log
                console.log("Moralis Query Object for Current Room: ", {id, curRoom});
                //Set State
                setRoom(curRoom);
                return curRoom;
            }).then(function(curRoom) {
                //Fetch Current Hash
                const hash = curRoom.get('parentId');
                console.log("Collections For Room:"+hash, {curRoom, NFTCollections});

                //Set Current Collection
                if(NFTCollections[hash]) setCollection(NFTCollections[hash]);
                else console.error("No Permissions for Collection:'"+hash+"'", NFTCollections);
                

                //Get Current Room's Convos
                const PostQuery = new Moralis.Query(Post); //Query the Object
                PostQuery.equalTo("parentId", id).limit(limit).find().then(function(curPosts) {
                    //Log
                    console.log("Moralis Query Found "+curPosts.length+" Posts in Current Room's Posts: ", {id, curRoom, curPosts});
                    if(curPosts.length === 0) {
                        //Test Post
                        let testPost = new Post({
                            title: "I'm just a question",
                            text: "I have a question to you all. What if...", 
                            image: 'https://lh3.googleusercontent.com/l8aMpUg6aRR1JPVuTcHIfyJm553Bayas90pis0kr6oQIwWdcMHVOxVb6rugeai_pfzezgqm5wUvWskyRIFe4FJNgZhFyGHuhGeUw_rE',
                            account: '0x8b08BDA46eB904B18E8385F1423a135167647cA3',
                            parentId: id,
                        }).save().then(result => {
                            console.log("Created new Test Post:", result);
                        });
                    }
                    //Set State
                    setPosts(curPosts);
                    return curPosts;
                });
                
            })
            .catch(function(error) {    
                console.error("[CAUGHT] Error on Room Load:", {id, error});
            });

        }//Web3 Enabled
    }, [id, isWeb3Enabled, NFTCollections]);
    

    //Log
    console.log("Page:Room", room);

    //Validate
    if(collection && collection.contract_type!=="ERC1155"){
        return <div>Unsupported Collection Type:'{collection.contract_type}'</div>;
    }
    if(!room ) return <div>Waiting For Room Data...</div>;
    if(!collection) return <div>Waiting For Collection Data...</div>;
    return (
        <div className="room">
            <h2>{room.get('name')} <FireTwoTone /> (For NFT Collection: {collection?.name})</h2>
            {room.get('description') && <h3>{room.get('description')}</h3>}
            <p key="addr">Addr:{collection?.token_address}</p>
            <p key="type">Type: {collection?.contract_type}</p>
            <p key="symbol">Symbol: {collection?.symbol}</p>
            {/* TODO: Add Field: Creator, Total No. of Items, */}
            
            <div className="posts">
                {posts 
                ? posts.map((post, index) => (
                    <>
                    <ConvoEntrance key={post.id} convo={post} />
                    <AddPost />
                    <ShowMore />
                    </>
                    ))
                : <div>
                    <h3>First Contact</h3>
                    <p>Congratulations! You're the first of your tribe to set foot in this space. Why don't you leave your mark?</p>
                </div> 
                }
            </div>
            
        </div>
    );
}//RoomPage()

export default RoomPage;



/**
 * Link To Convo
 */
function ConvoEntrance({convo}) {
     //Set Avatar
    // let avatar = convo.get('image') || <Blockie address={convo.get('account')} scale="4" />;
    
//     <Image
//     preview={false}
//     src={convo.get('image') || "error"}
//     fallback="data:image/png;base64,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"
//     alt=""
//     // style={{ height: "var(--cardHeight)", width: "var(--cardWidth)" }}
//     className="avatar"
// />
    return(
      <div className="post flex">
          <Link  key="link" to={{ pathname: "/convo/"+convo.id, }} className="inner flex">
            <div className="avatar">  
                <Avatar src={convo.get('image')} style={{ height:'var(--avatarMD)', width:'var(--avatarMD)'}}></Avatar>
                <Address copyable address={convo.get('account')} size={4} />
            </div>
            <div className="content">
                <h3>{convo?.get('name')}</h3>
                <p key="text">Text: {convo.get('text')}</p>
            </div>
        </Link>

        {/* <p key="created">Created: {convo?.createdAt}</p> */}
        {/* <p key="updated">Last Updated: {convo?.updatedAt}</p> */}
        {/* <p key="account"> */}
            {/* Account: */}
            {/* <Address avatar="left" copyable address={convo.get('account')} size={4} /> */}
            {/* {convo.get('account')} */}
        {/* </p> */}
        <VotePane post={convo}/>
    </div>
    );
}//ConvoEntrance()

function ShowMore() {
    return (
        <div className="showMore flex">
            <div className="inner">
                <p>Show More</p>
            </div>
        </div>
    );
}//ShowMore()