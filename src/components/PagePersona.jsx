import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
// import { useNFTCollections } from "hooks/useNFTCollections";
// import { useNFTCollections } from "hooks/useNFTCollectionsNew";
// import { Link } from "react-router-dom";
// import PersonaEdit from "components/Persona/PersonaEdit";
import { PersonaHelper } from "helpers/PersonaHelper";
import { getChainName, getChainLogo } from "helpers/networks";
import { Persona } from "objects/Persona";
import { IPFS } from "helpers/IPFS";
import { usePersona } from "hooks/usePersona";
//Components
import Address from "components/Address/Address";
import NFTCollections from "components/NFTCollections";
import AddressInput from "components/AddressInput";
import ChainsData from "components/Chains/ChainsData";
import Page404 from "components/Page404";

//Ant Design
import { LoadingOutlined, CameraFilled, PlusOutlined, PlusCircleOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Avatar, Modal, Skeleton, Collapse, Tabs } from 'antd';
import { Form, Input, Select } from 'antd';
// import { Form, Space, Cascader } from 'antd';
// import { Row, Col } from 'antd';
import { Card, Dropdown, Menu, Upload, message } from 'antd';
import { Popconfirm, Spin, Row, Col } from 'antd';

const { TabPane } = Tabs;
const { Panel } = Collapse;
// const { Option } = Select;

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

    /**
     * Set Persona Wrapper Function
     */
    function setPersona(persona){
       setPersonaActual(persona);
       setIsOwned(String(persona.get('owner')).toLowerCase() === account.toLowerCase());
       persona.get('metadata') && updateMetadata( persona.get('metadata') );
    //    console.warn("[TEST] PagePersona() Persona Owner:"+persona.get('owner')+" User ID:"+account, {persona:persona, att:persona.attributes, owned:isOwned, isOwned:(persona.get('owner') == account)});    //V
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
    
    useEffect(() => async () => {
        console.warn("[TEST] PagePersona() Reloading");
    });

    useEffect(() => {
        //When Entering Edit More - Reload Persona from Contract
        if(isEditMode){
            if(persona && persona.get('token_id') !== undefined) reloadmetadata();
            else updateMetadata( freshMetadata() );
        }
    },[isEditMode]);

    useEffect(() => async () => {
        //Disable EditMode on Logout
        if(isEditMode && !account) setIsEditMode(false);
    }, [account]);

    useEffect(() => async () => {
        //Start Loading
        setIsLoading(true);
        if(!isWeb3Enabled){ /*console.error("Waiting for W3");*/ }
        else if(params.chain && params.contract && params.token_id) {//By Token Address
            let personaData = {
                chainId: chain,
                address: contract,
                tokenId: token_id,
            };
            //Fetch Token (from DB or Chain)
            let result = await Moralis.Cloud.run("getPersona", params);
            console.warn("[TEST] PagePersona() Manually Fetch Persona:", {personaData, props, params, perosna:result});
            //Set
            setPersona(result);
            setIsLoading(false);
        }//Requested: Specific Token
        else if(params.handle){ //By Registered Handle
            console.warn("[DEBUG] PagePersona() Get persona By Handle:'"+handle+"'", { params, isWeb3Enabled } ); 
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
                            //Override metadata
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
            //Validate Authenticated User
            if(isAuthenticated){
                //Log
                console.warn("PagePersona() New Persona -- Init in Edit Mode", {params}); 
                initNewPersona();
                setIsEditMode(true);
                setIsLoading(false);    //Seems Necessary...
            }
            else{
                console.error("PagePersona() Can't Create New Persona -- User Not Authenticated");
                //Request for Authentication
                message.error('To mint yourself a new persona, please first authenticate using your Web3 wallet.');
            }
            //Ready
            setIsLoading(false);
        }//New Persona

        persona && console.log("PagePersona() persona:",  {persona, isWeb3Enabled, user, metadata, personaTokenId: persona?.get('token_id'), params});
    },[params, isWeb3Enabled]);

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
            // updateMetadata( loadDefaultMetadata() ); //Default Metadata
            // console.log("PagePersona.initNewPersona() New Persona w/Default Metadata",  {persona, user, metadata, params, props});
            updateMetadata( freshMetadata() );          //Empty Metadata
            console.log("PagePersona.initNewPersona() New Persona w/Empty Metadata",  {persona, user, metadata, params, props});
        }
        catch(error){
            console.error("PagePersona.initNewPersona() Failed Initiating w/New Persona ", {error, params});
        }
    };//initNewPersona
    
    /** DEPRECATE ? 
     * 
     * @returns Load Default Metadata
     */
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
     * Create a Fresh (Empty) Metadata Object
     */
    const freshMetadata = () => {
        let metadata = {social:{}, accounts:[], links:[],};
        //Default Accounts (Current User Accounts)
        for(let address of user.get('accounts')) metadata.accounts.push({address, chain:chainId});
        return metadata;
    }//freshMetadata()

    /**
     * Reload Persona Metadata from Chain
     */
    const reloadmetadata = async () => {
        //Start Loading
        setIsLoading(true);
        try{
            //Load Metadata from Chain
            let metadata = await loadMetadata(persona);
            //Log
            console.warn("PagePersona() Freshly Loaded Metadata:", {metadata, persona});
            //Set Metadata to State
            updateMetadata(metadata);
        }catch(error){
            console.error("[CAUGHT] PagePersona() Error Loading Metadata:", error);
        }
    }//reloadmetadata()
   
    /** REMOVED - MADE EXPLICIT
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
    let image = PersonaHelper.getImage(persona);
    let coverImage = PersonaHelper.getCover(persona);
    let size = 200; //Avater Circumference
    if(!isLoading && metadata===null){
        //Log
        console.warn("Persona Handle Not Found :"+persona.id, {handle, persona, isLoading, metadata});
        //404 - Persona Not Found
        return (<Page404 />);
    }
    // console.warn("Persona ID:"+persona.id, {persona, isLoading, metadata});
    return (
        <div className="persona framed">
            {/* <Skeleton loading={!isWeb3Enabled}></Skeleton> */}
            <div className="header">
                {coverImage 
                ? <div className="cover" style={{background:"url("+coverImage+")"}}></div>
                : <div className="cover"></div>
                }
            </div>
            <div className="main" style={{marginTop:0}}>
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
                                                //Validate
                                                if(change.includes("://")){
                                                    console.error("[TODO] Extract Handle from Link", {value:change, name:e.target.name});
                                                }
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
                                <h2>
                                    {/* <i className="bi bi-link"></i>  */}
                                    Custom Links
                                </h2>
                                <div className="items">
                                    
                                    <Skeleton loading={isLoading} active>
                                        {metadata?.links?.map((link, index) => {
                                            // E.G. {type: 'blog', title: 'BayonEI', url: 'http://bayonei.com'}
                                            // console.log("[DEV] link to:"+link.type+" Title:'"+link.title+"'", link.url);
                                            return (
                                            // <Col xs={24} lg={12} key={link.title+index}>
                                                <Input.Group key={index+link.url} compact className="item" style={{display: 'flex', }} >
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
                                    {/* Add Item */ }
                                    <Button type="primary" shape="circle" style={{float:'right'}} icon={<PlusCircleOutlined />} onClick={() => {
                                        console.log("[TEST] Metadtaa Links", metadata, metadata.links); 
                                        let links = metadata.links ? [...metadata.links] : [];    //Clone
                                        // links.splice(index, 1);
                                        links.push({type:'website', title:'', url:''});
                                        setMetadata({...metadata, links});
                                    }}/>
                                    <div className="clearfloat"></div>
                                </div>
                            </div>

                        </div>
                        }
                    </div>
                </div>
                <div className="primary framed">
                    
                    <div className="details">
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
                                {metadata?.name && <h1 className="name">{metadata.name}</h1>}
                                {!PersonaHelper.isNew(persona) && <Handle persona={persona} isEditMode={isEditMode} />}
                                {/* <div className="handle">@{metadata?.username}</div> */}
                                {metadata?.description && <q className="description">{metadata.description}</q>}
                                {metadata?.location?.name &&
                                <div className="flex" style={{marginTop:5}}>
                                    <div className="location">
                                        <i className="bi bi-geo-alt"></i>
                                        {metadata.location.name}
                                    </div>
                                </div>
                                }
                            </Skeleton>
                            }
                        </div>
                    
                        <div className="actions">
                            {isLoading ? <Skeleton.Button active />
                            :
                            <>{isOwned &&
                            <div className="button">
                                {/* {isEditMode && <Button className="debug" onClick={()=>{ console.warn("[TODO] PagePersona() Save Changes"); }} >[Save]</Button>} */}
                                {!isEditMode && 
                                    <Button variant="contained" color="primary" onClick={()=>{setIsEditMode(isEditMode===false);}}
                                        icon={<i className="bi bi-pencil-fill"></i>}>Edit
                                    </Button>}
                                    
                                {(isEditMode && !PersonaHelper.isNew(persona)) && <Button variant="contained" color="primary" onClick={()=>{ reloadmetadata(); setIsEditMode(isEditMode===false);}}
                                    style={{fontSize: '1.6em', lineHeight: '1em', borderRadius:22}}
                                    icon={<i className="bi bi-arrow-left"></i>}
                                    // icon={<i className="bi bi-arrow-left-circle-fill"></i>}
                                    >
                                    {/* Cancel */}
                                </Button>}
                            </div>}
                            {!isOwned &&
                            <Button variant="contained" color="primary" onClick={()=>{ console.warn("SEND BUTTON PRESSED");}}
                                style={{fontSize: '1.6em', lineHeight: '1em', borderRadius:22}}
                                icon={<i className="bi bi-send"></i>}
                                // icon={<i className="bi bi-arrow-left-circle-fill"></i>}
                                >
                                Send
                            </Button>
                            }
                            </>
                            }
                        </div>
                    </div>

                    {isEditMode && 
                    <div className="edit">
                        
                        
                        {/* TODO: Move Form Stuff over Here! */}


                        <PersonaEdit persona={persona} metadata={metadata} isLoading={isLoading} />
                    </div>
                    }

                    <div className="accounts">
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
            {/*
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
            */} 
            
        </div>
    );
}//PagePersona()

export default PagePersona;

/**
 * Component: Account Add Modal
 */
 function AccountAddModal(props){
    const { chainId } = useMoralis();
    const { visible:isModalVisible, setVisible:setIsModalVisible } = props;
    const { metadata, setMetadata } = props;
    // const [isModalVisible, setIsModalVisible] = useState(props.visible===true);
    const [chain, setChain] = useState(chainId);
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

            //TODO: Reset Modal (Maybe?)

        }
        else{
            message.error('Please make sure to fill in both chain and address.');
            console.error("AccountAddModal() Missing Parameters", {chain, address});
        } 
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
                    <Button className="chainSelect" key={ChainsData[chain]?.key} icon={ChainsData[chain]?.icon}>
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
                        <div className="explanation">Uploading to IPFS</div>
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



/**
 * Component: Handle 
 */
 function Handle(props){
    // const { visible:isModalVisible, setVisible:setIsModalVisible } = props;
    // const { persona, isEditMode } = props;
    const { Moralis, user } = useMoralis();     //isUserUpdating
    const { persona } = props;
    const [isEditMode, setIsEditMode] = useState(false);
    const [status, setStatus] = useState(null);
    const [newHandle, setNewHandle] = useState(persona.get('handle'));
    const isNew = () => (!persona.get("handle"));
    /**
     * Check For Handle Vacancy
     * @param {*} handle 
     * @returns 
     * /
    const isHandleFree = async (handle) => {
        // return Moralis.Cloud.run("isHandleFree", {handle});
        
        try{
            let ret = await Moralis.Cloud.run("isHandleFree", {handle});
            console.warn("isHandleFree()", {handle, ret});
            // if(ret) return true;
            return ret;
        }catch(error) {
            console.error("[CAUGHT] isHandleFree()", error);
            return false;
        }
    }//addAccount()
    */
    const validator = async (rule, handle) => { 
        if(handle===undefined || handle===null || handle==='' || handle === persona.get("handle")) return true;
        // let ret = await isHandleFree(value);
        let ret = await Moralis.Cloud.run("isHandleFree", {handle});
        if(!ret) throw new Error("Handle Already Taken");
    }//validator()

    /**
     * Save Handle
     * @param {*} handle 
     */
    const saveHandle = (handle) => {
        if(handle === persona.get('handle')){
            console.log("Handle() Nothing to Change (From:'"+persona.get('handle')+"' To:'"+handle+"')");
            setIsEditMode(false);
        }else{
            console.log("Handle() Change Handle From:'"+persona.get('handle')+"' To:'"+handle+"'");
            setStatus('saving');

            //Handle Register Handle
            let params = {personaId: persona.id, handle};
            Moralis.Cloud.run("personaRegisterById", params).then(result => {
                    console.log("[TEST] Handle() personaRegister Result:", result);
                    setStatus('success');
                    //Pre-Apply Change
                    persona.set('handle', handle);
                    //User Message
                    message.success("Handle Saved Successfully");
                    //Done with Edit Mode
                    setIsEditMode(false);
                    //TODO: Redirect to New URL ?
                }).catch(error => {
                    console.error("Handle() personaRegister Error:", {error, params, user}); 
                    setStatus('failure');
                    //User Message
                    message.error("Failed to Save Handle");
                })
                // .then(() => { setIsSaving(false); });
        }
    }//saveHandle()
    //is Current User Owner of Persona
    const isOwned = (user && user.get('accounts').includes(persona.get('owner').toLowerCase()));
    return (
        <div className="handle">
            {(!isEditMode) && <>
                {persona.get('handle') && <span> @ {persona.get('handle')}</span>}
                {isOwned && <Button variant="contained" size="small" color="primary" onClick={()=>{setIsEditMode(true)}}>{isNew() ? 'Set Handle' : 'Change'}</Button>}
            </>}
            {(isOwned && isEditMode) && <>
            <Form name="handleChange" className="flex" onFinish={(values) => saveHandle(values.handle)} size="small">
                <Form.Item
                    hasFeedback
                    name="handle"
                    // label="Handle"
                    rules={[
                        { validator, message: 'Sorry, handle is already Taken',},
                        // {required: true, message: "Oops, You forgot to enter a handle",},    //[X] Allow Empty
                        { validator: (rule, value) => (value.match(/^[0-9a-zA-Z]+$/) !== null), message: 'Only english letters and numbers are supported',},
                        { validator: (rule, value) => (value.length >= 5), message: 'Handles must be at least 5 characters long',},
                    ]}
                    >
                    <Input prefix="@" placeholder="handle" name="handle" defaultValue={persona.get('handle')}
                        onChange={(event)=>{setNewHandle(event.target.value)}}
                        // onSearch={(handle) => {saveHandle(handle)}}
                    />
                </Form.Item>
                <Button type="primary" color="primary" onClick={()=>{saveHandle(newHandle)}}>Save</Button>

                {/* Cancel */}
                <Button onClick={()=>{setIsEditMode(false);}}>Cancel</Button>

                {/* Remove (Just Leave Empty) */}

            </Form>
                
            {isNew() &&
            <div className="instrtuctions">
                <ul>
                    <li>Register your persona to the network by specifing a handle</li>
                    <li>This handle will also be a part of your own personal link</li>
                </ul>
                
            </div>
            }
            
            </>}
        </div>
    );
}//Handle()




/**
 * Component: Persoan Edit Form
 * 
 *  TODO! Move PersonaEdit to PersonaPage
 * 
 */
 function PersonaEdit(props) {
    // const { persona, contract } = props;
    const { persona, contract } = props;
    // const tokenId = persona.get('token_id');

    const [ isSaving, setIsSaving ] = useState(false);
    const [ stage, setStage ] = useState(null);
    // const [ formSocial, setFormSocial ] = useState({});
    // const [ metadata, setMetadata ] = useState(props?.metadata);
    // const [ metadata, setMetadata ] = useState(persona.get('metadata'));
    // const [ metadata, setMetadata ] = useState({});    //Start Empty     //Now Sharing Metadata with Container
    const [ metadata, setMetadata ] = useState(props.metadata);    //From Parent
    const { mint, update } = usePersona(); 

    //File Upload
    // const [ imageUrl, setImageUrl ] = useState(persona.getFallback('image'));
    const [ imageUrl, setImageUrl ] = useState(metadata?.image);
    const [ imageLoading, setImageLoading ] = useState(false);
    const { isLoading } = props;
    // const { verifyMetadata, updateToken } = useVerifyMetadata();

    const { Moralis, setUserData, userError, isUserUpdating, user, isAuthenticated, account, chainId } = useMoralis();
    const contractProcessor = useWeb3ExecuteFunction();
    //Contract Data
    const contractPersona = Persona.getContractData();
    // const [form] = Form.useForm();

    /* All Tokens 
    Moralis.Web3API.token.getAllTokenIds(contractPersona).then(ids => {
        console.warn("PersonaEdit() Persona Token IDs", ids);
    });
    */
   /* All Tokens W/Owners
    Moralis.Web3API.token.getNFTOwners(contractPersona).then(ids => {
        console.warn("PersonaEdit() Persona Owners", ids);
    });
    */

    //Log
    console.warn("PersonaEdit() MEtadata", {chainId, env:process.env, metadata, imageUrl, contract, persona});

    useEffect(() => { 
        //Refresh Metadata on Every Load! (After Updating Chain, This Component's metadata doesn't match the updated parent)
        console.log("PersonaEdit() Reloading Metadata", props.metadata);
        setMetadata(props.metadata); 
        setImageUrl(props.metadata?.image);
    }, [props.metadata]);
    
    useEffect(() => { 
        console.log("PersonaEdit() Stage:"+stage);
    }, [stage]);

    /**
     * Sanitize Metadata Before Save
     */
     const metadataSanitize = (metadata) =>{
        for(let i=metadata.accounts.length-1; i>=0; i--){
            // console.warn("[TEST] metadataSanitize() Action:'"+action+"' Account:"+i, {accounts:metadata.accounts, account:metadata.accounts[i], i});
            if(!metadata.accounts[i].address || !metadata.accounts[i].chain){
                //Log
                console.warn("[TEST] metadataSanitize() Removing Invalid Account ", {account:metadata.accounts[i]});   
                metadata.accounts.splice(i, 1);
                break;
            }
        }
        return metadata;
    }//metadataSanitize
    
    /**
     * 
     */
    function savePersona(metadata){
        //Sanitize
        metadata = metadataSanitize(metadata);
        //Update Metadata
        // setMetadata({...metadata, ...values});
        setMetadata(metadata);

        //Update Persona (local)
        persona.set('metadata', metadata);

        //Log
        console.warn("[TEST] PersonaEdit.saveMetadata() Updated Values to Metadata", {persona, metadata});

        //TODO: Trimming any whitespace
        // .trim();

        setIsSaving(true);
        setStage('SavingToIPFS');
        //Save Metadata to IPFS
        // saveJSONToIPFS(metadata).then(uri => {
        // IPFS.saveJSONToIPFS(Moralis, metadata).then(async uri => {
        IPFS.saveJSONToIPFS(Moralis, metadata).then(async uri => {
            //Log
            console.warn("PersonaEdit.saveMetadata() Saving Persoa to Contract:", {metadata, uri});
            if(persona.get('token_id')){
                setStage('UpdateToken');
                //Update Contract
                // let res = await updateNFT(uri);   //Promise
                let res = await update(persona, uri);   //Promise
                //Log
                console.warn("[TEST] PersonaEdit.saveMetadata() After Update:", {res, metadata, uri});
            }else{
                setStage('MintToken')
                //Mint New NFT
                // let res = await mintNFT(uri);
                let res = await mint(persona, uri);
                //Log
                console.warn("[TEST] PersonaEdit.saveMetadata() After Mint:", {res, metadata, uri});
            }
            //Done Saving
            setIsSaving(false);
            setStage("SUCCESS");
        })
        .catch(function(error) {
            message.error('Failed to save file to IPFS. '+error);
            console.error("[CAUGHT] PersonaEdit.saveMetadata() IPFS Call Failed:", {error, metadata, isAuthenticated, user, persona}); 
            //Done Saving
            setIsSaving(false);
            setStage("FAILED");
        });
    }//saveMetadata()

    /**
     * Save Procedure (Form Submit Function)
     * @var object values       Additional Metadata Values
     * @ret void
     */
     const onFinish = async (values) => {
        //Create
        // const newPost = await Moralis.Cloud.run("post", values);
        //Log
        // console.warn("[TEST] PersonaEdit.onFinish() Updated Values ", {values});

        //Update Metadata
        let newMetadata = {...metadata, ...values};
        //Save Persona (to Contract)
        savePersona(newMetadata);

        //Redirect
        // history.push('/room/'+newPost.id);
    
        //Return
        // return newPost;
    };//onFinish()
    
    /**
     * Reset Metadata (Form)
     */
    function formReset(){
        setMetadata(props?.metadata); 
        //Log
        console.log("(i) PersonaEdit() Metadata Form Reset", props?.metadata)
    }

    let size = 200; //Avater Circumference
    return (
        <Col className="personaEdit">
        {/* <Col xs={24} lg={{ span: 20, offset: 2 }} className="personaEdit"> */}
        <Skeleton active loading={isLoading}>
            <Form name="personaForm" 
                id="personaEditForm"
                onFinish={onFinish}
                onFinishFailed={console.error}
                labelCol={{ span: 6, }}
                wrapperCol={{ span: 18, }}
                initialValues={metadata}
                // initialValues={{ remember: true, }}
                // initialValues={{name: "name",}}  //V
                autoComplete="off"
                >
                {Object.values(personaFields).map((field) => { if(field.element) return field.element; else{
                    //Extract Placeholder
                    let placeholder = Array.isArray(field.placeholder) ? field.placeholder[Math.floor(Math.random()*field.placeholder.length)] : field.placeholder;
                    if(field.name === 'links'){
                        return null;    //MOVED
                        return( 
                        <div className="links_wrapper">
                            <h2><i className="bi bi-link"></i> Links</h2>
                            <div key="items" className="items">
                            <Row>
                                {metadata?.links?.map((link, index) => {
                                    // E.G. {type: 'blog', title: 'BayonEI', url: 'http://bayonei.com'}
                                    // console.log("[DEV] link to:"+link.type+" Title:'"+link.title+"'", link.url);
                                    return (
                                    <Col xs={24} lg={12} key={link.title+index}>
                                        <Input.Group compact className="item" style={{display: 'flex', width:'100%', paddingRight:'10px'}} >
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
                                                links.splice(index, 1);
                                                setMetadata({...metadata, links});
                                            }}/>
                                        </Input.Group>
                                    </Col>
                                    );
                                })//Each Link
                                }
                                <div key="clear1" className="clearfloat"></div>
                                {/* Add Item */ }
                                <Button type="primary" shape="circle" icon={<PlusCircleOutlined />} onClick={() => {
                                    let links = [...metadata.links];    //Clone
                                    // links.splice(index, 1);
                                    links.push({type:'', title:'', url:''});
                                    setMetadata({...metadata, links});
                                }}/>
                                    
                            </Row>
                            </div>
                        </div>
                        );
                    }//Links
                    else if(field.type === 'object'){
                        console.log("[UNHANDLED] PersonaEdit() object field:", {field, fieldData:metadata?.[field.name]});
                    }//object
                    else if(field.type === 'items'){
                        //Log
                        if(field.name !== 'accounts') console.log("[UNHANDLED] PersonaEdit() items field:", {field, fieldData:metadata?.[field.name]});
                    }//Object Array
                    else if(field.type === 'array'){    //Tags
                        console.log("[TEST] PersonaEdit() array field:"+field.name, {type:field.type, field, metadata, fieldData:metadata[field.name]});
                        return (
                            <Select key={field.name} mode="tags" style={{ width: '100%' }} label={field.label} name={field.name} placeholder={placeholder}>
                                {metadata[field.name] && metadata[field.name].map((item, index) => {
                                    return <Select.Option key={index}>{item}</Select.Option>
                                })}
                            </Select>
                        );
                    }//Array (Tags)
                    else if(field.type === 'textarea'){    
                        //Long Text
                        return (
                            <Form.Item key={field.name} name={field.name} label={field.label} rules={field.rules}>
                                <Input.TextArea  
                                    autoSize={{ minRows: 3, maxRows: 5 }}
                                    placeholder={placeholder} 
                                    onChange={(evt) => {
                                    // console.log("Changed", field.name, evt.target.value, metadata); 
                                    setMetadata({...metadata, [field.name]: evt.target.value });
                                }}/>
                            </Form.Item>
                        );
                    }//Textarea (Long Text)
                    else{
                        //Default (Single String Input)
                        return (
                            <Form.Item key={field.name} name={field.name} label={field.label} rules={field.rules}>
                                <Input placeholder={placeholder} onChange={(evt) => {
                                    // console.log("Changed", field.name, evt.target.value, metadata); 
                                    setMetadata({...metadata, [field.name]: evt.target.value });
                                }}/>
                            </Form.Item>
                        );
                    }
                }//Each Field
                })}
                
                <div className="buttons">
                    {(stage==='SavingToIPFS') && <div className="saving">
                        <span>Please wait while saving Metadata to IPFS</span>
                        <Spin style={{display:'block'}} />
                    </div>}
                    {(stage==='MintToken') && <div className="saving">
                        <span>Please confirm minting request on your web3 wallet</span>
                        <Spin style={{display:'block'}} />
                    </div>}
                    {(stage==='UpdateToken') && <div className="saving">
                        <span>Please confirm update request on your web3 wallet</span>
                        <Spin style={{display:'block'}} />
                    </div>}
                    {(stage===null) && <Form.Item 
                            wrapperCol={{ offset: 6, span: 6 }}
                            // wrapperCol={{ offset: 1, span: 10 }}
                            >
                            {PersonaHelper.isNew(persona) 
                            ?   <Popconfirm
                                    title={
                                        <div className="tooltip">
                                            <ul>
                                                <li>When saving data on the blockchain you will be charged a network fee (gas).</li>
                                                <li>You own your data and you can take it with you to other websites, if you want.</li>
                                                <li>Keep in mind that everything you save on the blockchain will always be accessible in some way.</li>
                                            </ul>
                                        </div>
                                    }
                                    onConfirm={() => onFinish({}) }
                                    icon=""
                                    //   onVisibleChange={() => console.log('visible change')}
                                    >
                                    <Button type="primary">Mint New Persona</Button>
                                </Popconfirm>
                            : <Button type="primary" htmlType="submit">Save</Button>
                            }
                            {/* <Button onClick={formReset} style={{marginLeft:'20px' }}>Reset</Button> REMOVED */}
                            {/* <Button variant="contained" color="primary" onClick={()=>{ reloadmetadata(); setIsEditMode(false)}}>Cancel</Button> */} {/*TODO: THIS BUTTON SHOULD BE HERE (But on PagePersona)*/}
                        </Form.Item>
                    }
                </div>
            </Form>
        </Skeleton>
        </Col>
    );
}//PersonaEdit()