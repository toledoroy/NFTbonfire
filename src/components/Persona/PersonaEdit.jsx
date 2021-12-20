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
import { Persona } from "common/objects";

import ImgCrop from 'antd-img-crop';

// import { useVerifyMetadata } from "hooks/useVerifyMetadata";

const { Option } = Select;

//Persona Fields Mapping
const personaFields = require('schema/PersonaData.json');
console.warn("PersonaEdit() Persona Template:", personaFields);
// console.warn("[TEST] Pesona:", Persona);
// console.warn("[TEST] Pesona:", Persona.update());

/**
 * Component: Persoan Edit Form
 * 
 *  TODO!! Load Metadata From W3
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
    const {isLoading } = props;
    // const { verifyMetadata, updateToken } = useVerifyMetadata();

    const { Moralis, setUserData, userError, isUserUpdating, user, isAuthenticated, account, chainId } = useMoralis();
    const contractProcessor = useWeb3ExecuteFunction();
    
    //Contract Data
    const contractPersona = Persona.getContractData();
    

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

/** NOW SHARING METADATA W/Container
     * Reload Persona Metadata from Chain
     * /
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
    //Load Metadata on Persona Change
    useEffect(() => { loadmetadata(); }, [persona]);
*/

    useEffect(() => { 
        //Refresh Metadata on Every Load! (After Updating Chain, This Component's metadata doesn't match the updated parent)
        console.log("PersonaEdit() Reloading Metadata", props.metadata);
        setMetadata(props.metadata); 
    }, [props.metadata]);

    /**
     * Form Validation
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
                saveImageToIPFS(info.file).then(result => {
                    console.log("[TEST] File Upload handleChangeFile() IPFS Hash:", result);
                    // setImageUrl(result.hash());
                    // setImageUrl(result.ipfs());
                    setImage(result);
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
    
    /**
     * Save JSON File to IPFS
     * @var object jsonObject
     * @ret string URL
     */
     async function saveJSONToIPFS(jsonObject){
        //Save Metadata to IPFS
        const file = new Moralis.File("file.json", {base64 : btoa(JSON.stringify(jsonObject))});
        return file.saveIPFS().then(result => {
            //Return IPFS URL
            // return result.ipfs();    //Moralis URL
            return "ipfs://" + result.hash();   //General IPFS Conventional URL
        });
        // .catch(function(error) { console.error("[CAUGHT] PersonaEdit() IPFS Call Failed:", {error, user }); });
    }//saveJSONToIPFS()

    /**
     * Save Image file to IPFS
     * @var object image
     * @ret string imageFile
     * @ret string URL
     */
     async function saveImageToIPFS(image, fileName="image.png"){
        // const data = fileInput.files[0]
        // const file = new Moralis.File(data.name, data)
        const file = new Moralis.File(fileName, image);

        //Save File to Object
        // const jobApplication = new Moralis.Object('Applications')
        // jobApplication.set('resume', file)

        //Save Image to IPFS
        return await file.saveIPFS();
    }//saveImageToIPFS()
    
    /**
     * on Social Account Update
     */
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
    /**
     * Image Change
     */
    function setImage(file){
        //Image URL
        // let url = file.ipfs();
        let url = "ipfs://" + file.hash();   //General IPFS Conventional URL
        setImageUrl(url);
        //Set to Metadata
        // setMetadata({...metadata, image:file.hash()});
        setMetadata({...metadata, image:url});
    }

    /**
     * Update NFT URI
     * @param string uri 
     */
    // async function updateNFT(uri, tokenId=1){
    async function updateNFT(uri){
        const options = {
            // contractAddress: contractPersona.address,
            contractAddress: persona.get('address'),
            abi: contractPersona.abi,
            functionName: 'update',
            params: { tokenId: persona.get('token_id'), uri },
        };
        //Update Contract
        await contractProcessor.fetch({
            params: options,
            onSuccess: (data) => console.log("PersonaEdit.updateNFT() Success", {data, uri, persona, options}),
            onError: (error) => console.error("PersonaEdit.updateNFT() Failed", {error, uri, persona, options}),
        });
    }
    
    /**
     * Form Submit Function
     */
     const onFinish = async (values) => {
        //Additions
        // values.parentId = hash;
        //Create
        // const newPost = await Moralis.Cloud.run("post", values);
        
        //Update Metadata
        setMetadata({...metadata, ...values});
        //Log
        // console.error("[TEST] Persona() Updated Values to Metadata", {values, metadata});

        //TODO: Trimming any whitespace
        // .trim();

        //Save Metadata to IPFS
        saveJSONToIPFS(metadata).then(uri => {
        // IPFS.saveJSONToIPFS(metadata).then(uri => {  //Failed
            console.warn("[TODO] PersonaEdit() Should Now Save Persoa Contract:", {metadata, uri});
            //Update Contract
            updateNFT(uri);
        })
        .catch(function(error) { console.error("[CAUGHT] PersonaEdit() IPFS Call Failed:", {error, isAuthenticated, user }); });

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

    let size = 200;
    return (
    <>
    <Skeleton active loading={isLoading}>


    {/* <Col xs={24} lg={{ span: 20, offset: 2 }} className="personaEdit"> */}
    <Col className="personaEdit">
        {/* <input type="file" id="fileInput" onChange={handleChangeFileEvent}/> */}
        <div style={{width:size, height:size, borderRadius:"50%", overflow:'hidden'}}>
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
            >
            {imageLoading ? <LoadingOutlined /> 
                // : imageUrl ? <img src={IPFS.resolveLink(imageUrl)} alt="avatar" style={{ width: '100%' }} /> 
                : imageUrl ? <Avatar size={size} src={IPFS.resolveLink(imageUrl)} />
                // : imageUrl ? <Avatar size={220} src={imageUrl} />
                    // : uploadButton
                    : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
            }
        </Upload>
        
        {/* </ImgCrop> */}
        </div>

        <Form name="personaForm" 
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
                else if(field.name === 'links'){
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
                    console.log("[UNHANDLED] PersonaEdit() object field:", {field, fieldData:metadata[field.name]});
                }//object
                else if(field.type === 'items'){
                    //Log
                    console.log("[UNHANDLED] PersonaEdit() items field:", {field, fieldData:metadata[field.name]});
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
    </Col>
    </Skeleton>
    </>
    );
}//PersonaEdit()


export default PersonaEdit;

