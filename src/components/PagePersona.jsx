import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
// import { useNFTCollections } from "hooks/useNFTCollections";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";
import { Link } from "react-router-dom";
import { Image, Avatar,  Form, Input, Button } from 'antd';

// import { FireTwoTone } from '@ant-design/icons';
// import Post from "components/Room/Post"
// import VotePane from "components/Room/VotePane"
// import AddPost from "components/Room/AddPost"
// import Blockie from "components/Blockie";
// import Address from "components/Address/Address";

// function Room({handle, collection}) {
function PagePersona(props) {
    const { handle } = props.match.params;
    // const { Moralis, isWeb3Enabled } = useMoralis();
    const { Moralis, setUserData, userError, isUserUpdating, user } = useMoralis();
    // const { account } = useMoralisWeb3Api();
    // const { walletAddress } = useMoralisDapp();
    // const [ room, setRoom ] = useState({});
    // const [ posts, setPosts ] = useState([]);
    // const { NFTCollections } = useNFTCollections();
    // const [ collection, setCollection ] = useState(null);

    //https://github.com/MoralisWeb3/react-moralis#usemoralisweb3api
    // const { data, error, isLoading } = useMoralisQuery("GameScore"); //Query All
    // const { data, error, isLoading } = useMoralisQuery("GameScore", query => query.greaterThanOrEqualTo("score", 100).descending("score").limit(limit),);    //Query Some
    // const { fetch, data, error, isLoading } = useMoralisQuery("GameScore", query => query.greaterThanOrEqualTo("score", 100).descending("score").limit(limit), [], { autoFetch: false },);  //Query Without Auto-Update
    // const { data, error, isLoading } = useMoralisQuery("GameScore", query => query.greaterThanOrEqualTo("score", 100).descending("score").limit(limit), [limit], { live: true, },);  //Live Query - Update on limit Change
    //Cloud Functions
    // const { data, error, isLoading } = useMoralisCloudFunction("topScores", { limit, });
    // const { fetch, data, error, isLoading } = useMoralisCloudFunction("topScores", {limit}, { autoFetch: false } );  //Trigger Manually (via fetch func.)
      
    //Objects
    // const Room = Moralis.Object.extend("Rooms", { });

    //Example Metadata Object
    let metadata = {
        username: handle,   //Internal User Handle (Slug)
        name: "Roy",
        image: "https://avatars0.githubusercontent.com/u/1234?s=460&v=4",
        cover: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
        
        description: "I am a cool person",
        email: "toledoroy@gmail.com",
        location: {
            name:"Seattle, WA",
        },
        social: {
            twitter: "toledoroy",
            facebook: "toledoroy",
            github: "toledoroy",
            linkedin: "toledoroy",
            telegram: "",
            instagram: "toledoroy",
            youtube: "toledoroy",
            twitch: "",
            reddit: "",
            medium: "toledoroy",
            discord: "",
            bitcointalk: "",
            google: "toledoroy",
        },
        // website: "",
        links: [
            {
                type: "blog",
                title: "BayonEI",
                url: "http://bayonei.com",
            },
            {
                tyoe: "website",
                title: "Virtual Brick",
                url: "http://virtual-brick.com",
            },
        ],
    };

    //Log
    console.log("[DEV] PagePersona() ", {handle, user,});
    // const updatUserData = () => {
    function updatUserData(){
        //[TEST] Set User Data
        setUserData(metadata);
    }
    
    /**
     * Form Submit Function
     */
     const onFinish = async (values) => {
        //Additions
        // values.parentId = hash;
        //Create
        // const newPost = await Moralis.Cloud.run("post", values);
        //Log
        console.log("Save Persona:", values);
    
        //Redirect -- Enter New Room      //https://stackoverflow.com/questions/34735580/how-to-do-a-redirect-to-another-route-with-react-router
        // history.push('/room/'+newPost.id);
    
        //Return
        // return newPost;
    };//onFinish()
    
    let personas = [metadata];
    return (
        <div className="persona">
            <h1>[WIP] Persona Page</h1>
            {userError && <p>{userError.message}</p>}
            <Avatar size={128} src="https://joeschmoe.io/api/v1/random" />
            {/* <h2>{room.get('name')} <FireTwoTone /> (For NFT Collection: {collection?.name})</h2> */}
            {/* {room.get('description') && <h3>{room.get('description')}</h3>} */}
            {/* <p key="addr">Addr:{collection?.token_address}</p> */}
            {/* <p key="type">Type: {collection?.contract_type}</p> */}
            {/* <p key="symbol">Symbol: {collection?.symbol}</p> */}
            {/* TODO: Add Field: Creator, Total No. of Items, */}
            {/* 
                onClick={() => setUserData({
                    username: "Batman",
                    email: "batman@marvel.com",
                    numberOfCats: 1,
                    handle: 'toledoroy',
                })}
            */}
            <button onClick={updatUserData} disabled={isUserUpdating}>[DEV] Update User Details</button>

            <Form name="postAdd" 
                onFinish={onFinish}
                // onFinish={console.log}
                onFinishFailed={console.error}
                labelCol={{ span: 6, }}
                wrapperCol={{ span: 16, }}
                initialValues={{ remember: true, }}
                // autoComplete="off"
                >

                {/* <input type="text" name="name" placeholder="Topic" /> */}
                <Form.Item label="Topic" name="name" rules={[{ required: true, message: 'You forgot to fill in a Topic'}]}>
                    <Input />
                </Form.Item>
        
                {/* <input type="text" name="text" placeholder="Description" /> */}
                <Form.Item label="Description" name="text" rules={[{ required: true, message: "You'd need to enter some text as well..."}]}>
                    <Input />
                </Form.Item>
                
                {/* <button type="submit">Light Up</button> */}
                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
        
            </Form>
                
        </div>
    );
}//PagePersona()

export default PagePersona;