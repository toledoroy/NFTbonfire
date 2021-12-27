import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";

// import { Link } from "react-router-dom";
// import { Form, Input, Button, Select, InputNumber } from 'antd';
import { Image, Avatar } from 'antd';
// import { Row, Col } from 'antd';
// import { LoadingOutlined, PlusOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
// import { Space, Cascader } from 'antd';
// import { IPFS } from "helpers/IPFS";
import { PersonaHelper } from "helpers/PersonaHelper";
import { Link } from "react-router-dom";
import { IPFS } from "helpers/IPFS";

/**
 * Component: Persoan Edit Form
 */
 function BusinessCard(props) {
    // const { contract, tokenId } = props;
    const { persona, metadata:receivedMeta } = props;
    // const [ metadata, setMetadata ] = useState(props?.metadata);
    // const { Moralis, setUserData, userError, isUserUpdating, user } = useMoralis();
    const metadata = receivedMeta ? receivedMeta : persona.get('metadata');
    // const image = PersonaHelper.getImage(metadata);
    // const coverImage = PersonaHelper.getCover(metadata);
    // const image = metadata?.image;
    // const coverImage = metadata?.cover;
    // const image = persona.getFallback('image');
    // const coverImage = persona.getFallback('cover');
    let image = metadata?.image ? IPFS.resolveLink(metadata.image) : "https://joeschmoe.io/api/v1/random";
    let coverImage = metadata?.cover ? IPFS.resolveLink(metadata.cover) : "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";
    let link = PersonaHelper.getLink(persona);
    /*
    //Initial Metadata State
    useEffect(() => {
        if(props?.metadata){
            setMetadata(props.metadata);
            console.warn("BusinessCard() Received MEtadata", {env:process.env, metadata, orig:props.metadata});
        } 
        else console.error('BusinessCard() No metadata provided');
    }, [props]);
    */
    console.warn("BusinessCard() MEtadata", {metadata});

    /**
     * Render
     * 
     * Format:
     *  ____
     * |    | {Role} {Name_First}      Developer Roy
     * |____| {desc}                   Write Code, I do
     * 
     */
    //Class
    let className = "BusinessCard";
    if(props.className) className += ' '+props.className;
    //Render
    return (
        <div className={className}>
            <div className="top"  >
                <div className="image" style={{background:"url("+coverImage+")"}}>
                    <Avatar size={60} src={image} />
                </div>
                <div className="text">
                    <p key="name" className="name">Mr. {metadata?.name}</p>
                    <q key="desc" className="description">{metadata?.description}</q>
                </div>
            </div>
            <div className="bottom">
                {(props.actions!==false) && <div className="actions flex">
                    <Link key="link" to={{ pathname:link }} className="inner flex">View</Link>
                    <button className="button">Select</button>
                </div>}
            </div>
        </div>
    );
}//BusinessCard()


export default BusinessCard;

