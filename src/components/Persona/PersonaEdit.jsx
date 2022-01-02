import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { PersonaHelper } from "helpers/PersonaHelper";
// import { useNFTCollections } from "hooks/useNFTCollections";
// import { Link } from "react-router-dom";
import { Form, Input, Button, Select, Skeleton, Popconfirm, InputNumber } from 'antd';
// import { Image, Avatar } from 'antd';
import { Row, Col } from 'antd';
import { LoadingOutlined, PlusOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
// import { Space, Cascader } from 'antd';
import { Upload, message } from 'antd';
import { IPFS } from "helpers/IPFS";
import { Persona } from "objects/Persona";
// import ImgCrop from 'antd-img-crop';
import { Spin } from 'antd';

const { Option } = Select;

//Persona Fields Mapping
const personaFields = require('schema/PersonaData.json');
// console.warn("PersonaEdit() Persona Template:", personaFields);
// console.warn("[TEST] Pesona:", Persona);

/**
 * Component: Persoan Edit Form
 * 
 *  TODO! Move File Upload to PagePersona
 */
 function PersonaEdit(props) {
    // const { persona, contract } = props;
    const { persona, contract } = props;
    // const tokenId = persona.get('token_id');

    const [ isSaving, setIsSaving ] = useState(false);
    // const [ formSocial, setFormSocial ] = useState({});
    // const [ metadata, setMetadata ] = useState(props?.metadata);
    // const [ metadata, setMetadata ] = useState(persona.get('metadata'));
    // const [ metadata, setMetadata ] = useState({});    //Start Empty     //Now Sharing Metadata with Container
    const [ metadata, setMetadata ] = useState(props.metadata);    //From Parent
    
    //File Upload
    // const [ imageUrl, setImageUrl ] = useState(persona.getFallback('image'));
    const [ imageUrl, setImageUrl ] = useState(metadata?.image);
    const [ imageLoading, setImageLoading ] = useState(false);

    // const [ isLoading, setIsLoading ] = useState(true);
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




    /**
     * Update NFT URI
     * @param string uri 
     */
    // async function updateNFT(uri, tokenId=1){
    async function updateNFT(uri){
        const options = {
            // contractAddress: contractPersona.address,
            contractAddress: persona.get('address'),
            abi: Persona.getABI(chainId),   //contractPersona.abi,
            functionName: 'update',
            params: { tokenId: persona.get('token_id'), uri },
        };
        //Update Contract
        return await contractProcessor.fetch({
        // return contractProcessor.fetch({
            params: options,
            onSuccess: (data) => {
                try{
                    console.log("PersonaEdit.updateNFT() Success Updating Persona:"+persona.id, {data, uri, persona, options});
                    //Update Persona's Metadata (& URI)
                    Moralis.Cloud.run("personaMetadata", {personaId:persona.id});
                    //Return Transaction Data
                    return data;
                }
                catch(error){
                    console.error("PersonaEdit.updateNFT() Error Updating Persona:"+persona.id, {error, persona, options});
                }
            },
            onError: (error) => {
                if(error.code === 4001) console.warn("PersonaEdit.updateNFT() Failed -- User Rejection", {error, uri, options})
                else console.error("PersonaEdit.updateNFT() Failed", {error, uri, persona, options})
            },
        });
    }//updateNFT()
    
    /**
     * Mint New NFT
     * @param string uri 
     */
    async function mintNFT(uri){
        //Validate
        if(persona.get('token_id')) throw new Error("Can't Mint New Persona -- Persona Already Has TokenId:'"+persona.get('token_id')+"'");
        const options = {
            // contractAddress: contractPersona.address,
            contractAddress: persona.get('address'),
            abi: Persona.getABI(),  //contractPersona.abi,
            functionName: 'mint',
            params: { tokenURI:uri },
        };

        console.warn("[TEST] PersonaEdit.mintNFT() Will Register New Token", {options, uri, persona});

        //Mint New NFT
        await contractProcessor.fetch({
            params: options,
            onSuccess: (data) => {  //TX Data

                //Token Data
                let tokenData = {
                    contract: persona.get('address'),
                    // token_id: persona.get('token_id'),
                    chain: chainId,     //Current Chain
                    token_id: data?.Transfer?.returnValues?.tokenId,        //TESTING
                };
                console.warn("[TODO] PersonaEdit.mintNFT() Success -- Should Register New Token:"+data?.Transfer?.returnValues?.tokenId, {tokenData, data, uri, persona, options});
                //Update Persona
                Moralis.Cloud.run("personaRegister", tokenData);

                //Return Transaction Data
                return data;
            },
            onError: (error) => {
                if(error.code === 4001) console.warn("PersonaEdit.mintNFT() Failed -- User Rejection", {error, uri, options})
                else console.error("PersonaEdit.mintNFT() Failed", {error, uri, persona, options})
            },
        });
    }//mintNFT()

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
        //Save Metadata to IPFS
        // saveJSONToIPFS(metadata).then(uri => {
        // IPFS.saveJSONToIPFS(Moralis, metadata).then(async uri => {
        IPFS.saveJSONToIPFS(Moralis, metadata).then(async uri => {
            //Log
            console.warn("PersonaEdit.saveMetadata() Saving Persoa to Contract:", {metadata, uri});
            if(persona.get('token_id')){
                //Update Contract
                let res = await updateNFT(uri);   //Promise
                //Log
                console.warn("[TEST] PersonaEdit.saveMetadata() After Update:", {res, metadata, uri});
            }else{
                //Mint New NFT
                let res = await mintNFT(uri);
                //Log
                console.warn("[TEST] PersonaEdit.saveMetadata() After Mint:", {res, metadata, uri});
            }
            //Done Saving
            setIsSaving(false);
            // setIsEditMode(false);        //TODO! This is on Parent Component...

        })
        .catch(function(error) {
            message.error('Failed to save file to IPFS. '+error);
            console.error("[CAUGHT] PersonaEdit.saveMetadata() IPFS Call Failed:", {error, metadata, isAuthenticated, user, persona}); 
            //Done Saving
            setIsSaving(false);
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
                // onFinish={console.log}
                onFinishFailed={console.error}
                labelCol={{ span: 6, }}
                wrapperCol={{ span: 16, }}
                // initialValues={{ remember: true, }}
                initialValues={metadata}
                // initialValues={{name: "name",}}  //V
                autoComplete="off"
                >

                {/* 
                <Form.Item label="Topic" name="name" rules={[{ required: true, message: 'You forgot to fill in a Topic'}]}>
                    <Input />
                </Form.Item>
                */}
                {/*
                <Form.Item label="Description" name="text" rules={[{ required: true, message: "You'd need to enter some text as well..."}]}>
                    <Input />
                </Form.Item>
                */}

                {/*fields.map((field) => (
                    <Form.Item {...field}><Input /></Form.Item>
                ))*/}
                
                {Object.values(personaFields).map((field) => { if(field.element) return field.element; else{
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
                                                    <Option value="website">Website</Option>
                                                    <Option value="blog">Blog</Option>
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
                            <Select key={field.name} mode="tags" style={{ width: '100%' }} label={field.label} name={field.name} placeholder={field.placeholder}>
                                {metadata[field.name] && metadata[field.name].map((item, index) => {
                                    return <Option key={index}>{item}</Option>
                                })}
                            </Select>
                        );
                    }//Array (Tags)
                    else{
                        //Default (Single String Input)
                        return (
                            // <Form.Item {...field}><Input /></Form.Item>
                            <Form.Item key={field.name} name={field.name} label={field.label} rules={field.rules}>
                                <Input placeholder={field.placeholder} onChange={(e) => {
                                // console.log("Changed", field.name, e.target.value, metadata); 
                                setMetadata({...metadata, [field.name]:e.target.value });
                            }}/>
                            </Form.Item>
                        );
                    }
                }//Each Field
                })}
                
                <div className="buttons">
                    {isSaving && 
                    <div className="saving">
                        <span>Saving Metadata to IPFS</span>
                        <Spin />
                    </div>}
                </div>
                <Form.Item 
                    // wrapperCol={{ offset: 6, span: 6 }}
                    wrapperCol={{ offset: 1, span: 10 }}
                    >
                    

                    {PersonaHelper.isNew(persona) 
                    ? <Popconfirm
                        title={
                            <div className="tooltip">
                                <ul>
                                    <li>When saving data on the blockchain you will be charged a network fee (gas)</li>
                                    <li>You own your data and you can take it with you to other websites, if you want</li>
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

                    {/* <Button onClick={formReset} style={{marginLeft:'20px' }}>Reset</Button> */}
                </Form.Item>

                {(false && PersonaHelper.isNew(persona)) && 
                <div className="tooltip">
                    <ul>
                        <li>When saving data on the blockchain you will be charged a network fee (gas)</li>
                        <li>You own your data and you can take it with you to other websites, if you want</li>
                        <li>Keep in mind that everything you save on the blockchain will always be accessible in some way.</li>
                    </ul>
                </div>
                }

            </Form>
        </Skeleton>
        </Col>
    );
}//PersonaEdit()


export default PersonaEdit;

