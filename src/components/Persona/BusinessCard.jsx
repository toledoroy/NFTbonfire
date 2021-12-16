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


/**
 * Component: Persoan Edit Form
 */
 function BusinessCard(props) {
    // const { contract, tokenId } = props;
    const { metadata } = props;
    // const [ metadata, setMetadata ] = useState(props?.metadata);
    // const { Moralis, setUserData, userError, isUserUpdating, user } = useMoralis();
    
    const image = PersonaHelper.getImage(metadata);
    const coverImage = PersonaHelper.getCover(metadata);

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
    return (
    <div className="BusinessCard">
        <div className="image">
            <Avatar size={60} src={image} />
            <div className="text">
                <p key="name" className="name">Mr. {metadata?.name}</p>
                <q key="desc" className="description">{metadata?.description}</q>
            </div>
        </div>
    </div>
    );
}//BusinessCard()


export default BusinessCard;

