import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
// import { useNFTCollections } from "hooks/useNFTCollections";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";
// import { Link } from "react-router-dom";
import { Avatar } from 'antd';
// import { Space, Cascader } from 'antd';
import { Button, Skeleton } from "antd";
import PersonaEdit from "components/Persona/PersonaEdit";
import Address from "components/Address/Address";
import { PersonaHelper } from "helpers/PersonaHelper";
import { Collapse } from 'antd';
import NFTCollections from "components/NFTCollections";
import { Tabs } from 'antd';
const { TabPane } = Tabs;
const { Panel } = Collapse;


// import { FireTwoTone } from '@ant-design/icons';
// import Post from "components/Room/Post"
// import VotePane from "components/Room/VotePane"
// import AddPost from "components/Room/AddPost"
// import Blockie from "components/Blockie";
// import Address from "components/Address/Address";

// import {useRoute} from '@react-navigation/native';

//Persona Contract ABI
// import personaABI from "contracts/abi/PERSONA.json";
const personaABI = require('contracts/abi/PERSONA.json');

//Persona Fields Mapping
const personaFields = require('schema/PersonaData.json');

// console.log("PagePersona() personaABI:", personaABI);


const personaContract = {
    address: '0x9E91a8dDF365622771312bD859A2B0063097ad34', 
    chain:4,
    abi: personaABI,
};

// function Room({handle, collection}) {
function PagePersona(props) {
    const { handle } = props.match.params;
    // const { Moralis, isWeb3Enabled } = useMoralis();
    const { Moralis, setUserData, userError, isUserUpdating, user } = useMoralis();
    // const { account } = useMoralisWeb3Api();
    // const { walletAddress } = useMoralisDapp();
    // const { NFTCollections } = useNFTCollections();
    // const [ collection, setCollection ] = useState(null);
    const [ isEditMode, setIsEditMore ] = useState(false);

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


    // const route = useRoute();
    // console.log("Route Name:", route.name);

    
    useEffect(() => {
        /*
        Moralis.Cloud.run("getPersonas", {})
        .then(persona => {
            //Log
            console.error("getPersonas() Return:", persona);
        })
        .catch(function(error) { console.error("[CAUGHT] getPersonas() Error on Cloud Fucntion Call:", {error}); });
        */
        
        /* Did Nothing...
        //[DEV] Schema Stuff        https://parseplatform.org/Parse-SDK-JS/api/2.9.0/Parse.Schema.html
        const schema = new Moralis.Schema('Post');
        console.warn("[DEV] Moralis Schema:", schema);
        const options = { required: true, defaultValue: 'hello world' };
        schema.addString('TestField', options);
        schema.addIndex('index_name', { 'TestField': 1 });
        schema.save();
        */
    },[]);
    


    const currentuser = Moralis.User.current();
    //Log
    console.log("[DEV] PagePersona() ", {handle, user, currentuser});

    //Example Metadata Object
    let metadata = {
        // username: handle,   //Internal User Handle (Slug)           //This Should Be Somewhere Else... 
        name: "Roy",
        image: "https://images.unsplash.com/photo-1636716642701-01754aef1066?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
        cover: "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
        description: "A hardworking builder, I am",
        // email: "toledoroy@gmail.com",        //Don't 
        location: {
            name:"Seattle, WA",
            latitude: 47.60275857601884,
            longitude: -122.33726455335282,
        },
        social: {
            twitter: "toledoroy",
            facebook: "toledoroy",
            github: "toledoroy",
            linkedin: "toledoroy",
            instagram: "toledoroy",
            youtube: "RoyToledo",
            medium: "toledoroy",
        },
        links: [
            {
                type: "blog",
                title: "BayonEI",
                url: "http://bayonei.com",
            },
            {
                type: "website",
                title: "Virtual Brick",
                url: "http://virtual-brick.com",
            },
            {
                type: "website",
                title: "Google",
                url: "http://google.com",
            },
        ],
        "attributes": [	//OpenSea		https://docs.opensea.io/docs/metadata-standards
            {
                "trait_type": "Base", 
                "value": "Starfish",
            },
            {
                "trait_type": "Strength", 
                "value": "5",
            },
            {
                "trait_type": "Aqua Power", 
                "value": 40,

                "display_type": "boost_number",     //"number", "boost_number", "boost_percentage"
            },
        ],
        accounts: [
            {
                "address": "0x874a6E7F5e9537C4F934Fa0d6cea906e24fc287D",
                "chain": "ethereum",
            },
            {
                "address": "0x8b08BDA46eB904B18E8385F1423a135167647cA3",
                "chain": "ethereum",
            },
        ],
            
    };


    
    //Multiple Personas
    // let personas = [metadata];

    //[DEV] - Test Func.
    // const updatUserData = () => {
    function updatUserData(data){
        //[TEST] Set User Data
        let persona = { 
            chainId:4, 
            address:personaContract.address, 
            id:'1' 
        };
        setUserData({metadata, persona});        //Try This (As a Metadata Object)
        // setUserData(metadata);
        
        // setUserData({persona:{metadata, chainId:4, address:'0x000000000000000000000000000000000000000', id:'1' }});        //Too Much...?
        // getPersonas
        setUserData({handle:'RandomNewHandle'});

    }
    //Profile Image
    // let image = metadata?.image ? metadata.image : "https://joeschmoe.io/api/v1/random";
    // let coverImage = metadata?.cover ? metadata.cover : "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";
    let image = PersonaHelper.getImage(metadata);
    let coverImage = PersonaHelper.getCover(metadata);
    return (
        <div className="persona">
            
            <div className="header">
                <div className="cover" style={{background:"url("+coverImage+")"}}>
                    {/* <img src={coverImage}/> */}
                </div>
            </div>
            
            <div className="main">
            {/* <div className="persona-body"> */}
                <div className="secondary framed">

                    <div className="social">
                        <Collapse accordion>
                        {metadata?.social && Object.keys(metadata.social).map((network) => {
                            let handle = metadata.social[network];
                            if(handle){
                                //Label (Icon/Name)
                                let label = personaFields.social.network[network].label ? personaFields.social.network[network].label : (<i className={"bi bi-"+network}></i>);    //Default Label (Icon)
                                let link = personaFields.social.network[network].url + handle;
                                // let label = (<i className={"bi bi-"+network}></i>);    //Default Label (Icon)
                                let headerContent = (
                                    <>
                                    <a href={link} target="_blank" rel="noopener noreferrer" key={network} className="social-handle">
                                        {label} 
                                        <span className="textSwitch">
                                        <span className="network">{network}</span>
                                        <span className="handle">{handle}</span>
                                        </span>
                                    </a>
                                    </>
                                    );
                                    //collapsible="disabled" showArrow={false}
                                return (
                                    <Panel header={headerContent} key={network} collapsible="disabled" showArrow={false} className="item">
                                        <p>[Content]</p>
                                    </Panel>
                                );
                            }
                            else return null;
                        })}
                        </Collapse>
                    </div>
                
                    
                    <div className="links">
                        <Collapse accordion>
                        {metadata?.links?.map((link, index) => (   
                            <Panel header={
                                <>
                                    {/* {link.type} */}
                                     <a href={link.url} key={index}>
                                        <i className="bi bi-link"></i>
                                        {link.title}
                                    </a>
                                </>
                            } key={index} collapsible="disabled" showArrow={false}  className="item">
                            </Panel>
                        ))}
                        </Collapse>
                    </div>
                </div>
                <div className="primary framed">
                    
                    <div className="details framed">
                        <div className="image">
                            <Avatar size={200} src={image} />
                        </div>
                        <div className="info framed">
                            <h1 className="name">{metadata?.name}</h1>
                            {/* <div className="handle">@{metadata?.username}</div> */}
                            <q className="description">{metadata?.description}</q>
                            <div className="flex">
                                <div className="location">
                                    <i className="bi bi-geo-alt"></i>
                                    {metadata?.location?.name}
                                </div>
                            </div>
                        </div>
                        <div className="actions">
                            <div className="button">
                                <Button variant="contained" color="primary" onClick={()=>updatUserData()}>Edit</Button>
                            </div>
                        </div>
                    </div>
                    <div className="accounts framed">

                    
                        <Tabs       //https://ant.design/components/tabs/
                            type="editable-card"
                            // onChange={this.onChange}
                            // activeKey={activeKey}
                            // onEdit={this.onEdit}
                            hideAdd={!isEditMode}
                            >
                            {metadata?.accounts?.map((account, index) => (
                                <TabPane tab={(<Address copyable address={account.address} size={5} />)} key={account.address+account.chain} closable={isEditMode}>
                                    <div className="item framed" key={index}>
                                        {/* TODO: Add Network Icon */}

                                        <div className="flex">
                                            <div className="chain">
                                                <i className="bi bi-ethereum"></i>
                                                Chain: {account.chain}
                                            </div>
                                        </div>

                                        <Address copyable address={account.address} size={5} />

                                        <div className="NFTs">
                                            <NFTCollections match={{params:{accountHash:account.address}}} />
                                        </div>

                                    </div>
                                </TabPane>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </div>

            <div className="persona-footer">
            
            </div>
            
            {userError && <p>{userError.message}</p>}
            
            <PersonaEdit metadata={metadata} contract={personaContract} tokenId={"1"}/>

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
            <button onClick={updatUserData} disabled={isUserUpdating}>[DEV] Update User Details</button>
            */}
            
                
        </div>
    );
}//PagePersona()

export default PagePersona;
