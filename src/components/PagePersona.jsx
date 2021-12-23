import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
// import { useNFTCollections } from "hooks/useNFTCollections";
// import { useNFTCollections } from "hooks/useNFTCollectionsNew";
// import { Link } from "react-router-dom";
import { Avatar } from 'antd';
// import { Space, Cascader } from 'antd';
import { Button, Skeleton } from "antd";
import PersonaEdit from "components/Persona/PersonaEdit";
import Address from "components/Address/Address";
// import { PersonaHelper } from "helpers/PersonaHelper";
import { Collapse } from 'antd';
import NFTCollections from "components/NFTCollections";
import { getChainName, getChainLogo } from "helpers/networks";
import { Persona } from "objects/Persona";
import { IPFS } from "helpers/IPFS";
// import { Form } from 'antd';
import { Input, Select } from 'antd';
import { Tabs } from 'antd';

import { LoadingOutlined, PlusOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';

import { Row, Col } from 'antd';
import AddressInput from "components/AddressInput";     //TODO: Use This to Input Address
   
const { TabPane } = Tabs;
const { Panel } = Collapse;

//Persona Fields Mapping
const personaFields = require('schema/PersonaData.json');

//Persona Contract ABI
// import personaABI from "contracts/abi/PERSONA.json";
// const personaABI = require('contracts/abi/PERSONA.json');
// console.log("PagePersona() personaABI:", personaABI);
// const contractPersona = Persona.getContractData();

/**
 * Component - Page:Persona 
 * @param {handle} OR {chain, contract, token_id}
 * @returns 
 */
// function Room({handle, collection}) {
function PagePersona(props) {
    const { params } = props.match;
    // const { handle } = props.match.params;
    const { handle, chain, contract, token_id } = params;
    // const { Moralis, isWeb3Enabled } = useMoralis();
    const { Moralis, setUserData, userError, isUserUpdating, user } = useMoralis();
    // const { account } = useMoralisWeb3Api();
    // const { walletAddress } = useMoralisDapp();
    // const { NFTCollections } = useNFTCollections();
    // const [ collection, setCollection ] = useState(null);
    const [ isEditMode, setIsEditMore ] = useState(false);
    // const [ metadata, setMetadata ] = useState(defaultMetadata);    //Start Empty
    const [ metadata, setMetadata ] = useState(Persona.getDefaultMetadata());    //Start Empty
    const [ isLoading, setIsLoading ] = useState(false);    //Loading Edit Mode

    //https://github.com/MoralisWeb3/react-moralis#usemoralisweb3api
    // const { data, error, isLoading } = useMoralisQuery("GameScore"); //Query All
    // const { data, error, isLoading } = useMoralisQuery("GameScore", query => query.greaterThanOrEqualTo("score", 100).descending("score").limit(limit),);    //Query Some
    // const { fetch, data, error, isLoading } = useMoralisQuery("GameScore", query => query.greaterThanOrEqualTo("score", 100).descending("score").limit(limit), [], { autoFetch: false },);  //Query Without Auto-Update
    // const { data, error, isLoading } = useMoralisQuery("GameScore", query => query.greaterThanOrEqualTo("score", 100).descending("score").limit(limit), [limit], { live: true, },);  //Live Query - Update on limit Change
    //Cloud Functions
    // const { data, error, isLoading } = useMoralisCloudFunction("topScores", { limit, });
    // const { fetch, data, error, isLoading } = useMoralisCloudFunction("topScores", {limit}, { autoFetch: false } );  //Trigger Manually (via fetch func.)
      
    // const route = useRoute();
    // console.log("Route Name:", route.name);

    // const [form] = Form.useForm();

    //Set User Data (Specific Persona)
    // let persona = { 
    //     chainId:'0x4', 
    //     address:contractPersona.address, 
    //     tokenId:'1'
    // };
    //Default Persona Data
    let personaData = { 
        chain:'0x4', 
        address:Persona.getContractAddress('0x4'), 
        token_id:'1',
        metadata
    };
    
    useEffect(() => {
            
        //Override 1
        if(params.chain && params.contract && params.token_id) {
            personaData = {
                chainId: chain,
                address: contract,
                tokenId: token_id,
            };
            console.warn("[TEST] PagePersona() personaData From URL:", personaData );    
        }
        //Override 2    
        if(params.handle){
            console.warn("[TEST] PagePersona() Override personaData By Handle:", {personaData, handle, params } );    
            const query = new Moralis.Query(Persona);
            query.equalTo("handle", handle);
            query.find().then((results) => {
                //TODO: Override by handle
                // personaData
                console.warn("[TEST] PagePersona() Found Results for Handle:", {results} );    

            });
        }

    },[params]);

    
    
    //Init Persona
    const persona = new Persona(personaData);
    
    console.log("PagePersona() persona:",  {metadata, defaultMetadata:Persona.getDefaultMetadata(), persona, personaTokenId: persona.get('token_id'), params});

    /**
     * Reload Persona Metadata from Chain
     */
    const loadmetadata = async () => {
        //Start Loading
        setIsLoading(true);
        try{
            //Load Metadata from Chain
            let metadata = await persona.loadMetadata();
            //Log
            console.warn("PersonaEdit() Freshly Loaded Metadata:", {metadata, persona});
            //Set State
            setMetadata( metadata );
        }catch(error){
            //Log
            console.error("PersonaEdit() Error Loading Metadata:", error);
        }
        //Ready
        setIsLoading(false);
    }//loadmetadata()
    useEffect(  ()  =>  {
        if(isEditMode){
            //When Entering Edit More - Reload Persona from Contract
            loadmetadata();
        }
    },[isEditMode]);

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

    // const currentuser = Moralis.User.current();
    // console.log("[DEV] PagePersona() ", {handle, user, currentuser});


    

    /** MADE EXPLICIT
     * on Social Account Update
     
     const formSocialOnChange = (e) => {
        let change = {[e.target.name]: e.target.value.trim()};
        //Log
        // console.log("[DEV] formSocialOnChange() ", {e, change});
        //Set
        setMetadata({...metadata, social:{ ...metadata.social, ...change }});
        //Log
        console.log("[DEV] formSocialOnChange() Modified Metadata ", {metadata, social:metadata.social, change});
        return true;
    }
    */
    
    //[DEV] - Test Func.
    // const updatUserData = () => {
    function updatUserData(data){
        // setUserData({metadata, persona});        //Try This (As a Metadata Object)
        // setUserData(metadata);
        // setUserData({persona:{metadata, chainId:4, address:'0x000000000000000000000000000000000000000', id:'1' }});        //Too Much...?
        // getPersonas
        setUserData({handle:'RandomNewHandle'});
    }

    /**
     * Tab Close/Add (Add/Remove Account)
     * @param {*} targetKey 
     * @param string action 
     */
    function handleTabEdit(targetKey, action){
        if(action === 'add'){
            let newAccount = {
                // "address": "0xxxx",
                // "chain": "0x1",
            };
            setMetadata({...metadata, accounts:[ ...metadata.accounts, newAccount ]});
            //Log
            console.error("[TODO] handleTabEdit() Action:'"+action+"' Add Account W/Modal!", {targetKey, action, newAccount, metadata});
        }//Add
        else if(action === 'remove'){
            const data = targetKey.split(":");
            console.warn("[TODO] handleTabEdit() Action:'"+action+"'", {targetKey, action, data, metadata});
            //Update Metadata
            let accounts = metadata.accounts;
            for(let i=accounts.length-1; i>=0; i--){
                console.warn("[TODO] handleTabEdit() Action:'"+action+"' Account:"+i, {accounts:accounts, account:accounts[i], i});
                if(accounts[i].address === data[0] && accounts[i].chain === data[1]){
                    //Log
                    console.warn("[TEST] handleTabEdit() Action:'"+action+"' Found Account to Remove", {targetKey, action, data, account:accounts[i]});   
                    accounts.splice(i, 1);
                    break;
                }
            }
            //Log
            console.warn("[TEST] handleTabEdit() Action:'"+action+"'  After Account Removal ", {metadata, data, accounts:metadata.accounts});   
            //Update Metadata
            setMetadata({...metadata, accounts});
        }//Remove
        else console.error("[ERROR] handleTabEdit() Invalid Action:'"+action+"'", {targetKey, action});
    }

    //Profile Image
    // let image = metadata?.image ? metadata.image : "https://joeschmoe.io/api/v1/random";
    // let coverImage = metadata?.cover ? metadata.cover : "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";

    let image = persona.getFallback('image');
    let coverImage = persona.getFallback('cover');
    return (
        <div className="persona">
            
            <div className="header">
                <div className="cover" style={{background:"url("+IPFS.resolveLink(coverImage)+")"}}>
                    {/* <img src={IPFS.resolveLink(coverImage)}/> */}
                </div>
            </div>
            
            <div className="main framed">
            {/* <div className="persona-body"> */}
                <div className="secondary framed">
                    <div className="view" style={{display:!isEditMode?'block':'none'}}>
                        <div className="social">
                            <Collapse accordion>
                            {metadata?.social && Object.keys(metadata.social).map((network) => {
                                let handle = metadata.social[network];
                                if(handle){
                                    //Label (Icon/Name)
                                    let label = personaFields.social.network[network].label ? personaFields.social.network[network].label : (<i className={"bi bi-"+network}></i>);    //Default Label (Icon)
                                    let link = personaFields.social.network[network].url ? personaFields.social.network[network].url + handle : '#';
                                    // let label = (<i className={"bi bi-"+network}></i>);    //Default Label (Icon)
                                    let headerContent = (
                                        <>
                                        <a href={link} target="_blank" rel="noopener noreferrer" key={network} className="social-handle" data-network={network}>
                                            {label} 
                                            <div className="textSwitch">
                                                <div className="inner">
                                                    <div className="text network">{network}</div>
                                                    <div className="text handle">{handle}</div>
                                                </div>
                                            </div>
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
                                        <a href={link.url} key={index} target="_blank"> 
                                            <i className="bi bi-link"></i>
                                            <span className="handle">{link.title}</span>
                                        </a>
                                    </>
                                } key={index} collapsible="disabled" showArrow={false}  className="item">
                                </Panel>
                            ))}
                            </Collapse>
                        </div>
                    </div>
                    <div className="edit" style={{display:isEditMode?'block':'none'}}>
                        <div className="social">    
                            <div className="social_wrapper">
                                <h2><i className="bi bi-emoji-sunglasses"></i> Social Accounts</h2>
                                <div className="items">
                                {Object.values(personaFields.social.network).map((network) => { 
                                    let label = network.label ? network.label : (<i className={"bi bi-"+network.name}></i>);    //Default Label (Icon)
                                    return ( 
                                        <Input 
                                            key={network.name} 
                                            className="item" 
                                            onChange={(e) => {
                                                let change = {[e.target.name]: e.target.value.trim()};
                                                //Set
                                                setMetadata({...metadata, social:{ ...metadata.social, ...change }});
                                                //Log
                                                console.log("[DEV] formSocialOnChange() Modified Metadata ", {metadata, social:metadata.social, change});
                                                // return true;
                                            }} 
                                            size="large"
                                            placeholder={network.name} 
                                            addonBefore={label} 
                                            // defaultValue={metadata?.social?.[network.name]}
                                            value={metadata?.social?.[network.name]}
                                            name={network.name} />
                                    );
                                })}
                                </div>
                            </div>
                        </div>
                        {false && 
                        <div className="links">
                            <div className="links_wrapper">
                                <h2><i className="bi bi-link"></i> Links
                                    {/* Add Item */ }
                                    <Button type="primary" shape="circle" style={{float:'right'}} icon={<PlusCircleOutlined />} onClick={() => {
                                        let links = [...metadata.links];    //Clone
                                        // links.splice(index, 1);
                                        links.push({type:'', title:'', url:''});
                                        setMetadata({...metadata, links});
                                    }}/>
                                </h2>
                                <div className="items">
                                    {metadata?.links?.map((link, index) => {
                                        // E.G. {type: 'blog', title: 'BayonEI', url: 'http://bayonei.com'}
                                        // console.log("[DEV] link to:"+link.type+" Title:'"+link.title+"'", link.url);
                                        return (
                                        // <Col xs={24} lg={12} key={link.title+index}>
                                            <Input.Group compact className="item" style={{display: 'flex', }} >
                                                <Input name="URL" defaultValue={link.url} placeholder="URL" 
                                                    addonBefore={<Select defaultValue={link.type} style={{minWidth:'99px'}} className="select-before">
                                                        <Select.Option value="website">Website</Select.Option>
                                                        <Select.Option value="blog">Blog</Select.Option>
                                                    </Select>}
                                                />
                                                <Input name="name" placeholder="Title" defaultValue={link.title} style={{flexShrink:'2'}}/>
                                                {/* Remove Item */ }
                                                <Button type="danger" shape="circle" icon={<DeleteOutlined />} onClick={() => {
                                                    // let links = metadata.links;
                                                    let links = [...metadata.links];    //Clone
                                                    // console.warn("[TEST] Remove Link:"+index, {links:[...links], res:links.splice(index, 1)});
                                                    //Remove Current
                                                    links.splice(index, 1);
                                                    //Update
                                                    setMetadata({...metadata, links});
                                                }}/>
                                            </Input.Group>
                                        // </Col>
                                        );
                                    })//Each Link
                                    }
                                    <div className="clearfloat"></div>
                                </div>
                            </div>

                        </div>
                        }
                    </div>
                </div>
                <div className="primary framed">
                    
                    <div className="details framed">
                        <div className="image">
                            <Avatar size={200} src={IPFS.resolveLink(image)} />
                        </div>
                        <div className="info">
                            <h1 className="name">{metadata?.name || metadata?.firstname+' '+metadata?.lastname}</h1>
                            {/* <div className="handle">@{metadata?.username}</div> */}
                            <q className="description">{metadata?.description}</q>
                            <div className="flex" style={{marginTop:5}}>
                                <div className="location">
                                    <i className="bi bi-geo-alt"></i>
                                    {metadata?.location?.name}
                                </div>
                            </div>
                        </div>
                        <div className="actions">
                            <div className="button">
                                {isEditMode && <Button className="debug" onClick={()=>{ /*form.submit();*/ console.warn("[TODO] PagePersona() Save Changes"); }} >[Save]</Button>}
                                {!isEditMode && <Button variant="contained" color="primary" onClick={()=>{setIsEditMore(isEditMode===false);}}>Edit</Button>}
                                {isEditMode && <Button variant="contained" color="primary" onClick={()=>{ loadmetadata(); setIsEditMore(isEditMode===false);}}>Cancel</Button>}
                            </div>
                        </div>
                    </div>

                    {isEditMode && 
                    <div className="edit">
                        {/* <PersonaEdit metadata={metadata} contract={Persona.getContractData()} persona={persona} /> */}
                        <PersonaEdit persona={persona} metadata={metadata} isLoading={isLoading} />
                    </div>
                    }

                    <div className="accounts framed">
                        <Tabs      //https://ant.design/components/tabs/
                            type="editable-card"
                            // onChange={this.onChange}
                            // activeKey={activeKey}
                            onEdit={handleTabEdit}
                            hideAdd={!isEditMode}
                            >
                            {metadata?.accounts?.map((account, index) => (
                                
                                <TabPane tab={(
                                    <span title={getChainName(account.chain)}>
                                        {console.warn("[TEST] Persona View Account", account)}
                                        {account.address 
                                        ? <Address icon={getChainLogo(account.chain)} copyable address={account.address} size={5} />
                                        : <span>[NO HASH]</span>
                                        }
                                    </span>
                                    )} key={account.address+':'+account.chain} closable={isEditMode}>

                                    <div className="item framed" key={index}>
                                        
                                        <div className="flex">
                                            <div className="chain">
                                                {/* Chain:  */}
                                                {/* <span className="logo" title={account.chain}>{getChainLogo(account.chain)}</span> */}
                                                {/* {getChainName(account.chain)} */}
                                            </div>
                                            {/* <Address copyable address={account.address} size={5} /> */}
                                        </div>
                                        {Object.keys(account).length > 0 ? 
                                        <div className="NFTs">
                                            <NFTCollections match={{params:{accountHash:account.address, chain:account.chain, showBreadcrumbs:false}}} />
                                        </div>
                                        :
                                        <div className="new_account">
                                            [NO ACCOUNT DATA]
                                        </div>
                                        }
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
            
            <button onClick={()=>{
                let data = {
                    chainId: '0x4',
                    address: contract,
                    tokenId: 1,
                    handle:'toledoroy',
                };
                // const Persona = Moralis.Object.extend("Persona", {}, {});
                let thisPersona = new Persona(
                    data
                );
                Persona.register(data);
                console.log("[TEST] ThisPersona:", {data, thisPersona});
                // thisPersona.save();
            }}>TEST BUTTON</button>
                
        </div>
    );
}//PagePersona()

export default PagePersona;
