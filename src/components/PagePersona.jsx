import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
// import { useNFTCollections } from "hooks/useNFTCollections";
// import { useNFTCollections } from "hooks/useNFTCollectionsNew";
// import { Link } from "react-router-dom";
import { Button, Avatar, Modal, Skeleton } from 'antd';
import { Collapse, Tabs, Input, Select } from 'antd';
// import { Form, Space, Cascader } from 'antd';
// import { Row, Col } from 'antd';
import { Card, Dropdown, Menu, Upload, message } from 'antd';
import PersonaEdit from "components/Persona/PersonaEdit";
import Address from "components/Address/Address";
import { PersonaHelper } from "helpers/PersonaHelper";
import NFTCollections from "components/NFTCollections";
import { getChainName, getChainLogo } from "helpers/networks";
import { Persona } from "objects/Persona";
import { IPFS } from "helpers/IPFS";
import { usePersona } from "hooks/usePersona";

import { LoadingOutlined, CameraFilled, PlusOutlined, PlusCircleOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';

import AddressInput from "components/AddressInput";
import ChainsData from "components/Chains/ChainsData";
import Page404 from "components/Page404";

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
    const { Moralis, isWeb3Enabled, isAuthenticated, setUserData, userError, user, chainId, account } = useMoralis();     //isUserUpdating
    // const [ collection, setCollection ] = useState(null);
    const [ isEditMode, setIsEditMode ] = useState(false);
    // const [ metadata, setMetadata ] = useState(defaultMetadata);    //Start Empty
    // const [ metadata, setMetadata ] = useState(Persona.getDefaultMetadata());
    const [ metadata, setMetadata ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isOwned, setIsOwned ] = useState(false);
    const [ persona, setPersonaActual ] = useState( new Persona() );
    const [ isAddAccModalVisible, setIsAddAccModalVisible ] = useState(false);
    const { fetchMetadata, loadMetadata } = usePersona(); 
    //File Upload
    const [ imageUrl, setImageUrl ] = useState(metadata?.image);
    const [ imageLoading, setImageLoading ] = useState(false);

    //https://github.com/MoralisWeb3/react-moralis#usemoralisweb3api
    
    //Cloud Functions
    // const { data, error, isLoading } = useMoralisCloudFunction("topScores", { limit, });
    // const { fetch, data, error, isLoading } = useMoralisCloudFunction("topScores", {limit}, { autoFetch: false } );  //Trigger Manually (via fetch func.)
      
    // const [form] = Form.useForm();

    /* DEBUG
    useEffect(() => {
        async function fetchPersonaTEST() {
            /* Register Persona
            let params = {
                chain:'0x4',
                contract:'0x9E91a8dDF365622771312bD859A2B0063097ad34',
                token_id: 2, handle:'toledoroy2',
                // token_id: 1, handle:'toledoroy',
            };
            try{
                const result = Moralis.Cloud.run("personaRegister", params);
                console.log("[TEST] personaRegister Result:", result);
            }catch(e){ console.error("[TEST] personaRegister Error:", {e, params}); }
            * /
            
            let res = await Moralis.Cloud.run("personaMetadata", {personaId:"Zl5V5ezSBadHTnBRRvLOLm7G"})
                .catch(e => console.error("[DEBUG] PagePersona() FAILED to Manually Ran personaMetadata", e))
            console.warn("!!!![DEBUG] PagePersona() Manually Ran personaMetadata", res);
        }
        if(isWeb3Enabled){  //DEBUGGING
            fetchPersonaTEST();
        }
    }, [isWeb3Enabled]);
    */

   /**
    * Set Persona Wrapper Function
    */
   function setPersona(persona){
       setPersonaActual(persona);
       setIsOwned(String(persona.get('owner')).toLowerCase() == account.toLowerCase());
       persona.get('metadata') && updateMetadata( persona.get('metadata') );
       console.warn("[TEST] PagePersona() Persona Owner:"+persona.get('owner')+" User ID:"+account, {persona:persona, owned:isOwned, isOwned:(persona.get('owner') == account)});    //V
    }
   
    /**
     * Full Metadata Update Procedure
     * @param {*} metadata 
     */
    function updateMetadata(metadata){
        setMetadata(metadata);
        setImageUrl(metadata?.image);
        //Done Loading
        setIsLoading(false);
    }//updateMetadata()

    useEffect(() => {
        if(!isWeb3Enabled){ console.log("Waiting for W3"); }
        else if(params.chain && params.contract) {//By (Full) Token Address
            if(params.token_id) {
                let personaData = {
                    chainId: chain,
                    address: contract,
                    tokenId: token_id,
                };
                console.warn("[TEST] PagePersona() Manually Set personaData From URL:", {personaData});
            }
            else{
                console.warn("[TODO] PagePersona() This is a Request for New Persona Token", {params});
            }
        }//Requested: Specific Token
        else if(params.handle){ //By Registered Handle
            // console.warn("[TEST] PagePersona() Get persona By Handle:'"+handle+"'", { params, isWeb3Enabled } ); 
            //Start Loading
            setIsLoading(true);
            //Query
            const query = new Moralis.Query(Persona);
            query.equalTo("handle", handle).limit(1).find().then((results) => {
            // query.get({handle}).then((results) => {
                if(results.length > 0){
                    //Override by handle
                    let persona = results[0];

                    //Reload Metadata
                    if(persona.get('metadata')){
                        setPersona(persona);
                        // updateMetadata( persona.get('metadata') );
                    }
                    else{
                        console.warn("[DEV] PagePersona() Reload Metadata for Handle:"+params.handle, {persona:persona});    //V
                        //Load Fresh Metadata
                        loadMetadata(persona).then((freshMetadata) => {
                            console.warn("[TEST] PagePersona() Loaded Fresh Metadata For:'"+params.handle+"'", {freshMetadata, persona:persona});    
                            setPersona(persona);
                            updateMetadata(freshMetadata);
                        });
                    }//No Metadata
                }//Known Handle
                else{//No Such Persona for Handle (404)
                    //Log
                    console.error("PagePersona() No Results for Handle:"+params.handle, {results, metadata} ); 
                    //Done Loading
                    setIsLoading(false);
                }//Unknown Handle
            });
        }//Requsted: Handle
        else{//New Persona
            //Log
            // console.warn("PagePersona() New Persona:", {params}); 
            //Validate Authenticated User
            isAuthenticated && initNewPersona();
            //Ready
            setIsLoading(false);
        }//New Persona

        persona && console.log("PagePersona() persona:",  {user, metadata, personaTokenId: persona?.get('token_id'), params});
    },[params, isWeb3Enabled]);

    useEffect(()  =>  {
        //When Entering Edit More - Reload Persona from Contract
        if(isEditMode){
            if(persona){
                if(persona.get('token_id') !== undefined) loadmetadata();
                else{
                    let metadata = {social:{}, accounts:[]};
                    //Default Accounts (Current User Accounts)
                    for(let address of user.get('accounts')) metadata.accounts.push({address, chain:chainId});
                    updateMetadata( metadata );
                }
            } 
            else console.error("PagePersona() No Persona", persona);
        } 
    },[isEditMode]);

    const loadDefaultMetadata = () => {
        console.warn("[TEST] PagePersona.loadDefaultMetadata() Add Default Accounts:", {user, persona, metadata});

        let defaultMetadata = Persona.getDefaultMetadata();
        if(!defaultMetadata.accounts) defaultMetadata.accounts = [];    //Init
        if(defaultMetadata.accounts.length===0){
            //Default Accounts (Current User Accounts)
            for(let address of user.get('accounts')) defaultMetadata.accounts.push({address, chain:chainId});
            console.warn("[TEST] PagePersona.loadDefaultMetadata() Added Default Accounts:", {user, persona, metadata});
        }
        //Set
        updateMetadata(defaultMetadata);
        console.log("PagePersona.loadDefaultMetadata() Loaded Default Metadata",  {defaultMetadata, metadata, params});
        return defaultMetadata;
    };

    /**
     * Init New Persona
     */
    const initNewPersona = async () => {
        try{
            const contractAddr = Persona.getContractAddress(chainId);
            //Validate
            if(!contractAddr) throw "No Persona Contract on Chain:"+chainId+"";

            //[DEV] Default Persona Data  
            let personaData = { 
                // chain:'0x4', 
                // address:Persona.getContractAddress('0x4'), 
                // token_id:'1',
                // metadata: Persona.getDefaultMetadata(),
                chain: chainId, 
                address: contractAddr,
                owner: account,
                debug:"Default Persona Object",
            };
            //Init Placehodler Persona
            const persona = new Persona(personaData);
            setPersona(persona);

            //Load Default Metadata
            updateMetadata( loadDefaultMetadata() );
            
            console.log("PagePersona.initNewPersona() New Persona w/Default Metadata",  {persona, user, metadata, params});
        }
        catch(error){
            console.error("PagePersona.initNewPersona() Failed Initiating w/New Persona ", {error, params});
        }
    };//initNewPersona
    /**
     * Reload Persona Metadata from Chain
     */
    const loadmetadata = async () => {
        
        //Validate
        // if(!persona.get('token_id')) throw {msg:"[DEV] persna Missing Token ID", persona};

        //Start Loading
        setIsLoading(true);
        try{
            
            //Load Metadata from Chain
            let metadata = await loadMetadata(persona);
            //Log
            console.warn("PagePersona() Freshly Loaded Metadata:", {metadata, persona});
            //Set Metadata to State
            updateMetadata( metadata );

        }catch(error){
            console.error("[CAUGHT] PagePersona() Error Loading Metadata:", error);
        }
        
    }//loadmetadata()
   

    useEffect(() => {
        //Get & Set Metadata

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
    
    /**
     * Tab Close/Add (Add/Remove Account)
     * @param string targetKey 
     * @param string action 
     */
    function handleTabEdit(targetKey, action){
        if(action === 'add'){
            //Show AccountAddModal
            setIsAddAccModalVisible(true);
        }//Add
        else if(action === 'remove'){
            const data = targetKey.split(":");
            console.warn("[TEST] handleTabEdit() Action:'"+action+"'", {targetKey, action, data, metadata});
            //Update Metadata
            let accounts = metadata.accounts;
            for(let i=accounts.length-1; i>=0; i--){
                console.warn("[TEST] handleTabEdit() Action:'"+action+"' Account:"+i, {accounts:accounts, account:accounts[i], i});
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
    }//handleTabEdit()

    //Profile Image
    let image = metadata?.image ? IPFS.resolveLink(metadata.image) : "https://joeschmoe.io/api/v1/random";
    let coverImage = metadata?.cover ? IPFS.resolveLink(metadata.cover) : "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";
    // let image = persona.getFallback('image');        //Don't work when Loading ParseObjeect from DB
    // let coverImage = persona.getFallback('cover');
    let size = 200; //Avater Circumference
    // if(0 && !isLoading && !persona.chain){
    if(!isLoading && metadata===null){
        //Log
        console.warn("Persona Handle Not Found :"+persona.id, {handle, persona, isLoading, metadata});
        //404 - Persona Not Found
        return (<Page404 />);
    }
    // console.warn("Persona ID:"+persona.id, {persona, isLoading, metadata});
    return (
        <div className="persona">
            {/* <Skeleton loading={!isWeb3Enabled}></Skeleton> */}
            <div className="header">
                <div className="cover" style={{background:"url("+coverImage+")"}}>
                    {/* <img src={IPFS.resolveLink(coverImage)}/> */}
                </div>
            </div>
            
            <div className="main framed">
            {/* <div className="persona-body"> */}
                <div className="secondary framed">
                    <div className="view" style={{display:!isEditMode?'block':'none'}}>
                        <div className="social">

                            {isLoading && <Skeleton.Input style={{ width: '100%' }} active size={'100%'} />}

                            <Skeleton loading={isLoading} active style={{minWidth:'160px'}}>
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
                            </Skeleton>
                        </div>
                        
                        <div className="links">
                            <Skeleton loading={isLoading} active>
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
                            </Skeleton>
                        </div>
                    </div>
                    <div className="edit" style={{display:isEditMode?'block':'none'}}>
                        <div className="social">    
                            <div className="social_wrapper">
                                <h2>
                                    {/* <i className="bi bi-emoji-sunglasses"></i>  */}
                                    Social Accounts
                                </h2>
                                <div className="items">
                                <Skeleton loading={isLoading} active>
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
                                </Skeleton>
                                </div>
                            </div>
                        </div>

                        {true && 
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
                                <Skeleton loading={isLoading} active>
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
                                    </Skeleton>
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
                            {isLoading ? <Skeleton.Avatar active size={size} shape='circle' />
                            : isEditMode 
                            ? <AvatarChangable metadata={metadata} setMetadata={updateMetadata} imageUrl={imageUrl} size={size} />
                            : <Avatar size={size} src={IPFS.resolveLink(image)} />
                            }
                        </div>
                        
                        <div className="info">
                            {!isEditMode && 
                            <Skeleton loading={isLoading} active >
                                <h1 className="name">{metadata?.name || metadata?.firstname+' '+metadata?.lastname}</h1>
                                {/* <div className="handle">@{metadata?.username}</div> */}
                                <q className="description">{metadata?.description}</q>
                                <div className="flex" style={{marginTop:5}}>
                                    <div className="location">
                                        <i className="bi bi-geo-alt"></i>
                                        {metadata?.location?.name}
                                    </div>
                                </div>
                            </Skeleton>
                            }
                        </div>
                    
                        <div className="actions">
                            {isLoading ? <Skeleton.Button active />
                            :
                            <>{isOwned &&
                            <div className="button">
                                {isEditMode && <Button className="debug" onClick={()=>{ /*form.submit();*/ console.warn("[TODO] PagePersona() Save Changes"); }} >[Save]</Button>}
                                {!isEditMode && <Button variant="contained" color="primary" onClick={()=>{setIsEditMode(isEditMode===false);}}>Edit</Button>}
                                {isEditMode && <Button variant="contained" color="primary" onClick={()=>{ loadmetadata(); setIsEditMode(isEditMode===false);}}>Cancel</Button>}
                            </div>}
                            </>
                            }          
                        </div>
                    </div>

                    {isEditMode && 
                    <div className="edit">
                        {/* TODO: Move Form Stuff over Here! */}
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
                                        {console.log("[DEV] PagePersona() View Account", account)}
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
                        <AccountAddModal visible={isAddAccModalVisible} setVisible={setIsAddAccModalVisible} metadata={metadata} setMetadata={setMetadata} />
                    </div>
                </div>
            </div>

            <div className="persona-footer">
            
            </div>
            
            {userError && <p>{userError.message}</p>}
            
            {/* 
                onClick={() => setUserData({
                    username: "Batman",
                    email: "batman@marvel.com",
                    numberOfCats: 1,
                    handle: 'toledoroy',
                })}
            <button onClick={() => { setUserData({handle:'RandomNewHandle'}); }} disabled={isUserUpdating}>[DEV] Update User Details</button>
            */}
                
            <button onClick={ async () => {
                let params = {
                    chain:'0x4',
                    contract:'0x9E91a8dDF365622771312bD859A2B0063097ad34',
                    token_id: 2,
                    handle:'toledoroy2',
                };
                try{
                    const result = await Moralis.Cloud.run("personaRegister", params);
                    console.log("[TEST] personaRegister Result:", result);
                }catch(e){ console.error("[TEST] personaRegister Error:", e); }

            }}>[TEST] personaRegister</button>

            
        </div>
    );
}//PagePersona()

export default PagePersona;

/**
 * Component: Account Add Modal
 */
 function AccountAddModal(props){
    const { visible:isModalVisible, setVisible:setIsModalVisible } = props;
    const { metadata, setMetadata } = props;
    // const [isModalVisible, setIsModalVisible] = useState(props.visible===true);
    const [chain, setChain] = useState(null);
    const [address, setAddress] = useState(null);

    // useEffect(() => { 
    //     setIsModalVisible(props.visible===true);
    //     console.log("Change Modal Visibility:"+props.visible)
    // }, [props]);
    /* CANCELLED
    useEffect(() => { 
        if(isModalVisible) console.warn("AccountAddModal() Modal Became Visible:"+isModalVisible+" Should Reset");
    }, [isModalVisible]);
    */

    //Handle Account Add
    const addAccount = () => {
        //Validate
        if(chain && address){
            //Update Metadata
            let newAccount = { chain, address };
            if(metadata?.accounts) setMetadata({...metadata, accounts:[ ...metadata.accounts, newAccount ]});
            else setMetadata({...metadata, accounts:[ newAccount ]});   //First Account

            //Close Modal
            setIsModalVisible(false);

            //TODO: Reset Modal

        }
        else console.error("AccountAddModal() Missing Parameters", {chain, address});
    }//addAccount()

    return (
        <Modal
            visible={isModalVisible}
            footer={null}
            onCancel={() => setIsModalVisible(false)}
            bodyStyle={{
            padding: "15px",
            fontSize: "17px",
            fontWeight: "500",
            }}
            style={{ fontSize: "16px", fontWeight: "500" }}
            width="400px"
            >
            <>
            Add Account
            <Card style={{marginTop: "10px", borderRadius: "1rem",}} bodyStyle={{ padding: "15px" }} >
                Address:
                <AddressInput autoFocus placeholder="Receiver" onChange={setAddress} />
                
                Chain:
                <Dropdown overlay={
                    <Menu onClick={(chain) => setChain(chain.key)}>
                    {Object.values(ChainsData).map((item) => (
                        //if(item.live)
                        <Menu.Item key={item.key} icon={item.icon}>
                            <span style={{ marginLeft: "5px" }}>{item.name}</span>
                        </Menu.Item>
                    ))}
                    </Menu>
                    } 
                    trigger={["click"]}>

                    {/* { console.warn("[TEST] AccountAddModal() CUrrently Selected Chain", {chain, selected:ChainsData[chain]}) } */}
                    <Button key={ChainsData[chain]?.key} icon={ChainsData[chain]?.icon}>
                        {/* {console.warn("AccountAddModal() Selected Chain"+chain, {chain, ChainsData})} */}
                        <span style={{ marginLeft: "5px" }}>{ChainsData[chain]?.name}</span>
                        <DownOutlined />
                    </Button>
                </Dropdown>
            </Card>

            <Button size="large" type="primary" onClick={() => { addAccount(); }}
                style={{ width: "100%", marginTop: "10px", borderRadius: "0.5rem", fontSize: "16px", fontWeight: "500", }}>
                Add
            </Button>
            </>
        </Modal>
    )
}//AccountAddModal()


/**
 * Component: Avatar Changable Upload
 */
 function AvatarChangable(props){
    const { Moralis } = useMoralis();
    const [ imageLoading, setImageLoading ] = useState(false);
    const { metadata, setMetadata, imageUrl, size } = props;
    const updateMetadata = setMetadata;

    /**
     * File Upload Validation
     */
     function beforeUpload(file) {
        //Validations
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/svg+xml';
        if (!isJpgOrPng) message.error('Sorry, only JPG/PNG/GIF files are currently supported');
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) message.error('Image must smaller than 2MB!');
        // return isJpgOrPng && isLt2M;
        //Set Loading
        setImageLoading(true);
        //Always False - Manual Upload Via handleChangeFile()
        return false;   
    }

    /**
     * File Upload
     */
     const handleChangeFile = info => {
        // console.log("[TEST] File Upload handleChangeFile() Status:"+info?.file?.status, info);
        try{
            if (info.file.status === undefined) {
                // saveImageToIPFS(info.file).then(result => {
                // IPFS.saveImageToIPFS(Moralis, info.file).then(result => {
                IPFS.saveImageToIPFS(Moralis, info.file).then(url => {
                    console.log("[TEST] File Upload handleChangeFile() IPFS Hash:", url);
                    //Set New Image URL
                    // setImageUrl(url);
                    //Set to Metadata
                    // setMetadata({...metadata, image:url});
                    updateMetadata({...metadata, image:url});
                    //Done Loading
                    setImageLoading(false);
                });
            }//Manual Upload
            else if (info.file.status === 'error') {
                console.error("handleChangeFile() File Upload Error:", info.file.error, info);
            }   
            else console.error("handleChangeFile() File Upload Error -- Unhandled Status:"+info.file.status, info);
        }catch(error) {
            //log
            console.error("[CAUGHT] handleChangeFile() File Upload Error:", error, info);
        }
    }//handleChangeFile()

    return (
        <div className="upload_container" style={{height:size, width:size}}>
            {/* <ImgCrop rotate> TODO (It doesn't save Crop ) */}
            <Upload
                name="avatar"
                // listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"    //Disabled
                multiple={false}
                beforeUpload={beforeUpload}
                onChange={handleChangeFile}
                style={{position:'relative'}}
                >
                {imageLoading ? <div style={{textAlign:'center'}}>
                        <LoadingOutlined /> 
                        <br/>
                        <div className="details">Uploading to IPFS</div>
                    </div>
                    : imageUrl ? <Avatar size={size} src={IPFS.resolveLink(imageUrl)} />: '' }
                <div className="upload_icons">
                    <CameraFilled />
                </div>
            </Upload>
                {/* </ImgCrop> */}
            
            {/* <div className="clearfloat"></div> */}
        </div>
    );
}//AvatarChangable()
