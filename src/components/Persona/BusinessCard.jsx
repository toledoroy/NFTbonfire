import React, { useContext } from "react";
// import { useHistory } from 'react-router-dom';
// import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { PersonaContext } from "common/context";

// import { Link } from "react-router-dom";
// import { Button, Image, Form, Input, Select, InputNumber } from 'antd';
import { Avatar } from 'antd';
// import { Row, Col } from 'antd';
// import { LoadingOutlined, PlusOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
// import { Space, Cascader } from 'antd';
import { PersonaHelper } from "helpers/PersonaHelper";
// import { Link } from "react-router-dom";
// import { IPFS } from "helpers/IPFS";

/**
 * Component: Persoan Edit Form
 */
 function BusinessCard(props) {
    // const { contract, tokenId } = props;
    const { persona, metadata:receivedMeta } = props;
    const { setPersona } = useContext(PersonaContext);
    // const [ metadata, setMetadata ] = useState(props?.metadata);
    // const { Moralis, setUserData, userError, isUserUpdating, user } = useMoralis();
    const metadata = receivedMeta ? receivedMeta : persona.get('metadata');
    // const history = useHistory();

    
    let image = PersonaHelper.getImage(persona);
    // let coverImage = PersonaHelper.getCover(persona);
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
    // console.warn("BusinessCard() MEtadata", {metadata});

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
    //style={{background:"url("+coverImage+")"}}
    //Render
    return (
        <>
        {/* <a key="link" href={link} className="inner flex"> */}
        {/* <div className={className} onClick={() => {console.log(link); history.push(link)}}> No Dice - Uses stale props */}
        <div className={className}>
            <div className="top">
                
                <div className="image">
                    <Avatar size={60} src={image} />
                </div>
                <div className="text">
                    <p key="name" className="name">
                        {metadata?.name && metadata.name}
                        {metadata?.role && <span className="role"> the {metadata.role}</span>}
                    </p>
                    {metadata?.description && <q key="desc" className="description">{metadata.description}</q>}
                    {(props.actions!==false) && <div className="actions flex">
                        {/* <Button className="button lightUp" style={{zIndex:100}} onClick={(event) => { setPersona(persona);}}>use</Button> */}
                        <a key="aUse" onClick={(event) => { event.preventDefault(); setPersona(persona); return false;}} className="inner flex">use</a>
                        <a key="aView" href={link} className="inner flex">
                            {/* <Button className="button" icon={<i className="bi bi-box-arrow-up-right btn-no"></i>}></Button> */}
                            <i className="bi bi-box-arrow-up-right btn-no"></i>
                        </a>
                        {/* event.stopPropagation();  */}
                    </div>}
                </div>
            </div>
            {/* <div className="bottom"></div> */}
        </div>
        {/* </a> */}
        </>
    );
}//BusinessCard()


export default BusinessCard;
