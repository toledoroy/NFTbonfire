import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
// import { useNFTCollections } from "hooks/useNFTCollections";
// import { Link } from "react-router-dom";
import { Form, Input, Button, Select, InputNumber } from 'antd';
import { Image, Avatar, Skeleton } from 'antd';
import { Row, Col } from 'antd';
import { LoadingOutlined, PlusOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
// import { Space, Cascader } from 'antd';
import { Upload, message } from 'antd';
import { IPFS } from "helpers/IPFS";
import { Persona } from "objects/Persona";

import ImgCrop from 'antd-img-crop';
import { Exception } from "sass";

// import { useVerifyMetadata } from "hooks/useVerifyMetadata";

const { Option } = Select;

//Persona Fields Mapping
const personaFields = require('schema/PersonaData.json');
// console.warn("PersonaEdit() Persona Template:", personaFields);
// console.warn("[TEST] Pesona:", Persona);
// console.warn("[TEST] Pesona:", Persona.update());

/**
 * Component: Persoan Edit Form
 * 
 *  TODO! Move File Upload to PagePersona
 */
 function PersonaEdit(props) {
    // const { persona, contract } = props;
    const { persona, contract } = props;
    // const tokenId = persona.get('token_id');

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
    console.warn("PersonaEdit() MEtadata", {chainId, env:process.env, metadata, imageUrl, contract, persona, contractPersona});

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
                    console.log("PersonaEdit.updateNFT() Success", {data, uri, persona, options});
                    //Update Persona's Metadata (& URI)
                    Moralis.Cloud.run("personaMetadata", persona.id);
                    /* THIS SHOULD GO THROUGH THE SERVER
                    //Save Persona to DB
                    // persona.save();       //Error: TypeError: (intermediate value).save is not a function
                    // TESTING
                    //Register Persona to DB
                    let compId = {
                        contract: persona.get('address'),
                        token_id: persona.get('token_id'),
                        chain: chainId,     //Current Chain
                    };
                    console.warn("[TEST] PersonaEdit.updateNFT() Register Persona to DB", compId);
                    //Update Persona
                    // Moralis.Cloud.run("personaRegister", compId);
                    //Return Transaction...
                    return data;
                    */
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
        //Mint New NFT
        await contractProcessor.fetch({
            params: options,
            onSuccess: (data) => {  //TX Data

                //Token Data
                let tokenData = {
                    // contract: persona.get('address'),
                    // token_id: persona.get('token_id'),
                    // chain: chainId,     //Current Chain
                };
                console.warn("[TODO] PersonaEdit.mintNFT() Success -- Should Register New Token", {tokenData, data, uri, persona, options});
                //Update Persona
                Moralis.Cloud.run("personaRegister", tokenData);

                //Return Transaction...
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
     * Save Procedure (Form Submit Function)
     * @var object values       Additional Metadata Values
     * @ret void
     */
     const onFinish = async (values) => {
        //Additions
        // values.parentId = hash;
        //Create
        // const newPost = await Moralis.Cloud.run("post", values);

        let newMetadata = {...metadata, ...values}
        //Sanitize
        newMetadata = metadataSanitize(newMetadata);
        //Update Metadata
        // setMetadata({...metadata, ...values});
        setMetadata(newMetadata);
        //Update Persona
        persona.set('metadata', newMetadata);

        //Log
        console.warn("[TEST] PersonaEdit.onFinish() Updated Values to Metadata", {persona, values, metadata});

        //TODO: Trimming any whitespace
        // .trim();

        //Save Metadata to IPFS
        // saveJSONToIPFS(metadata).then(uri => {
        // IPFS.saveJSONToIPFS(Moralis, metadata).then(async uri => {
        IPFS.saveJSONToIPFS(Moralis, newMetadata).then(async uri => {
            //Log
            console.warn("PersonaEdit.onFinish() Saving Persoa to Contract:", {newMetadata, uri});
            if(persona.get('token_id')){
                //Update Contract
                let res = await updateNFT(uri);   //Promise
                //Log
                console.warn("PersonaEdit.onFinish() After Update:", {res, newMetadata, uri});
            }else{
                //Mint New NFT
                mintNFT(uri);
            }
        })
        .catch(function(error) { 
            console.error("[CAUGHT] PersonaEdit.onFinish() IPFS Call Failed:", {error, newMetadata, isAuthenticated, user, persona}); 
        });

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
            {/* <input type="file" id="fileInput" onChange={handleChangeFileEvent}/> */}
            {/*
            <div style={{width:size, height:size, borderRadius:"50%", overflow:'hidden'}}>
            <Upload
                name="avatar"
                // listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"    //Disabled
                multiple={false}
                beforeUpload={beforeUpload}
                onChange={handleChangeFile}
                >
                {imageLoading ? <LoadingOutlined /> 
                    // : imageUrl ? <img src={IPFS.resolveLink(imageUrl)} alt="avatar" style={{ width: '100%' }} /> 
                    : imageUrl ? <Avatar size={size} src={IPFS.resolveLink(imageUrl)} />
                    // : imageUrl ? <Avatar size={220} src={imageUrl} />
                        // : uploadButton
                        : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                }
            </Upload>
            </div>
            */}

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
                // autoComplete="off"
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
                    /* MOVED to PagePersona
                    if(field.name === 'social'){    //Social Accounts     
                        return (
                        <div className="social_wrapper">
                            <h2><i className="bi bi-emoji-sunglasses"></i> Social Accounts</h2>
                            <div className="items">
                            {Object.values(field.network).map((network) => { 
                                let label = network.label ? network.label : (<i className={"bi bi-"+network.name}></i>);    //Default Label (Icon)
                                return ( 
                                    <Input 
                                        key={network.name} 
                                        className="item" 
                                        onChange={formSocialOnChange} 
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
                        );
                    }//Social
                    else */
                    if(field.name === 'links'){
                        return( 
                        <div className="links_wrapper">
                            <h2><i className="bi bi-link"></i> Links</h2>
                            <div className="items">
                            <Row>
                                {metadata?.links?.map((link, index) => {
                                    // E.G. {type: 'blog', title: 'BayonEI', url: 'http://bayonei.com'}
                                    // console.log("[DEV] link to:"+link.type+" Title:'"+link.title+"'", link.url);
                                    return (
                                    <>
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
                                    </>
                                    );
                                })//Each Link
                                }
                                <div className="clearfloat"></div>
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
                        console.log("[UNHANDLED] PersonaEdit() items field:", {field, fieldData:metadata?.[field.name]});
                    }//Object Array
                    else if(field.type === 'array'){    //Tags
                        // const children = [];
                        // for (let i = 10; i < 36; i++) { children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>); }
                        // function handleChange(value) { console.log(`selected ${value}`); }
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
                                <Input placeholder={field.placeholder}/>
                            </Form.Item>
                        );
                    }
                }//Each Field
                })}
                
                <Form.Item wrapperCol={{ offset: 6, span: 6 }}>
                    <Button type="primary" htmlType="submit">Save</Button>
                    <Button onClick={formReset} style={{marginLeft:'20px' }}> Reset</Button>
                </Form.Item>
            </Form>
        </Skeleton>
        </Col>
    );
}//PersonaEdit()


export default PersonaEdit;

