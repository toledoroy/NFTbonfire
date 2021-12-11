import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";

// import { useNFTCollections } from "hooks/useNFTCollections";
// import { Link } from "react-router-dom";
import { Form, Input, Button, Select, InputNumber } from 'antd';
import { Image, Avatar } from 'antd';
import { Row, Col } from 'antd';
import { LoadingOutlined, PlusOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
// import { Space, Cascader } from 'antd';
import { Upload, message } from 'antd';
import { IPFS } from "helpers/IPFS";

const { Option } = Select;

//Persona Fields Mapping
const personaFields = require('schema/PersonaData.json');
console.error("personaFields", personaFields);

/**
 * Component: Persoan Edit Form
 */
 function PersonaEdit(props) {
    const { contract, tokenId } = props;
    // const [ formSocial, setFormSocial ] = useState({});
    const [ metadata, setMetadata ] = useState(props?.metadata);
    //File Upload
    const [ imageUrl, setImageUrl ] = useState();
    const [ imageLoading, setImageLoading ] = useState(false);

    const { Moralis, setUserData, userError, isUserUpdating, user } = useMoralis();
    /*
    //Initial Metadata State
    useEffect(() => {
        if(props?.metadata){
            setMetadata(props.metadata);
            console.warn("PersonaEdit() Received MEtadata", {env:process.env, metadata, orig:props.metadata});
        } 
        else console.error('PersonaEdit() No metadata provided');
    }, [props]);
    */
    console.warn("PersonaEdit() MEtadata", {env:process.env, metadata, contract, tokenId, orig:props.metadata});

    
    /**
     * Fetch File From IPFS by Hash (Works with JSON Filed)
     * @param string ipfsHash 
     * @returns object
     */
     async function fetchJSONFromIPFS(ipfsHash) {
        const url = `https://ipfs.moralis.io:2053/ipfs/${ipfsHash}`;
        const response = await fetch(url);
        return await response.json();
    }

    /**
     * Save JSON File to IPFS
     * @var object jsonObject
     * @ret string URL
     */
    async function saveJSONToIPFS(jsonObject){
        //Save Metadata to IPFS
        const file = new Moralis.File("file.json", {base64 : btoa(JSON.stringify(jsonObject))});
        return file.saveIPFS().then(result => {
            //Log
            // console.log("[DEV] PersonaEdit() IPFS Hash for Metadata:", {hash:result.hash(), });
            
            //TEST - Check if file is on IPFS
            // fetchJSONFromIPFS(result.hash()).then(result => { console.log("[DEV] PersonaEdit() IPFS JSON File:", { IPFSfile:result}); });     //OK  
            //Return IPFS Hash
            // return result.hash();
            //Return IPFS URL
            return result.ipfs();
        })
        .catch(function(error) { console.error("[CAUGHT] PersonaEdit() IPFS Call Failed:", {error, user, user2:Moralis.User.current() }); });
    }
    // saveJSONToIPFS(metadata);       //TEST

    /**
     * Save Image file to IPFS
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
     * Form Validation
     */
    function beforeUpload(file) {
        // console.log("[TEST] File Upload beforeUpload()", file);

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
    /* WORKS - Regular File Upload
    const handleChangeFileEvent = event => {
        let data = event.target.files[0];
        console.log("[TEST] File Upload handleChangeFileEvent()", data);
        // saveImageToIPFS(data, data.name).then(result => {
        saveImageToIPFS(data).then(result => {
            console.log("[TEST] handleChangeFileEvent() File Upload handleChangeFile() IPFS Hash:"+result.hash(), result);
            // setImageUrl(result.hash());
        });
    }
    */
    //Option 1 - Doesn't Work, Expects an action URL
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
            
            /* UNUSED
            else if (info.file.status === 'uploading') {
                setImageLoading(true);
                return;
            }//Upload in Progress
            else if (info.file.status === 'done') {
                // Get this url from response in real world.
                getBase64(info.file.originFileObj, imageUrl => {
                    // this.setState({ imageUrl, loading: false,}),
                    setImageUrl(imageUrl);
                    setImageLoading(false);
                });
            }//Upload Complete
            */
            else if (info.file.status === 'error') {
                console.error("handleChangeFile() File Upload Error:", info.file.error, info);
            }   
            else console.error("handleChangeFile() File Upload Error -- Unhandled Status:"+info.file.status, info);
        }catch(error) {
            //log
            console.error("[CAUGHT] handleChangeFile() File Upload Error:", error, info);
        }
    };
    
    /**
     * on Social Account Update
     */
    const formSocialOnChange = (e) => {
        let change = {[e.target.name]: e.target.value.trim()};
        //Log
        console.log("[DEV] formSocialOnChange() ", {e, change});
        // setSocial(e.target.value);
        // return setSocial({ ...formData, [key]: value });
        // metadata.social[e.target.name] = e.target.value.trim();
        setMetadata({...metadata, social:{ ...metadata.social, ...change }});
        //Log
        console.log("[TEST] formSocialOnChange() Modified Metadata ", {metadata, social:metadata.social, change});
        return true;
    }
    /**
     * Image Change
     */
    function setImage(file){
        // setImageUrl(file.hash());
        setImageUrl(file.ipfs());
        //Set to Metadata
        // setMetadata({...metadata, image:file.hash()});
        setMetadata({...metadata, image:file.ipfs()});
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

        saveJSONToIPFS(metadata).then(url => {
            console.warn("[TODO] PersonaEdit() Should Now Save Persoa Contract:", {metadata, url});
            //TODO: Update Contract

        });

        //Redirect
        // history.push('/room/'+newPost.id);
    
        //Return
        // return newPost;
    };//onFinish()
    
    function formReset(){
        setMetadata(props?.metadata); 
        
        console.log("(i) PersonaEdit() Metadata Form Reset", props?.metadata)
    }

    return (
    <>
    <Col xs={24} lg={{ span: 20, offset: 2 }} className="personaEdit">
        {/* <input type="file" id="fileInput" onChange={handleChangeFileEvent}/> */}
        <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"    //Disabled
            multiple={false}
            beforeUpload={beforeUpload}
            onChange={handleChangeFile}
            >
            {imageLoading ? <LoadingOutlined /> 
                : imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> 
                // : imageUrl ? <Avatar size={220} src={imageUrl} />
                    // : uploadButton
                    : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
            }
        </Upload>

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
                            {metadata.links.map((link, index) => {
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
    </>
    );
}//PersonaEdit()


export default PersonaEdit;

