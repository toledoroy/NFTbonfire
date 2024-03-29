import React, { useEffect, useState, useContext } from "react";

import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

import { useMoralis } from "react-moralis";
import RoomAddForm from "components/Room/RoomAddForm";
import { FireTwoTone, ArrowLeftOutlined, Expand } from '@ant-design/icons';
// import { Image, Form, Input, Button, Checkbox } from "antd";
import { List, Radio, Skeleton, Collapse, Badge, Avatar, Comment, Tooltip, Button } from 'antd';
import { useMoralisQuery } from "react-moralis";
import VotePane from "components/Room/VotePane";
// import PersonaChanger from "components/Persona/PersonaChanger";
import PersonaHelper from "helpers/PersonaHelper";
import { PersonaContext } from "common/context";
import { usePost } from "hooks/usePost";
// import { CollectionContext } from "common/context";
import __ from "helpers/__";
import moment from 'moment';
import { Room, Comment as CommentObj } from "objects/objects";  //These Run in the Wrong Context
import { Persona } from "objects/Persona";
// import { ChainHelper } from "helpers/ChainHelper";
//Components
import Address from "components/Address/Address";
import PageAuthenticate from "components/PageAuthenticate";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";
import CollectionSelection from "./CollectionSelection";
import Chains from "components/Chains";

import "./Chat.scss";

/**
 * Component: Chat (W/Chat Room)
 * 
 * Inspiration: 
 *  - Github Discussions
 *  - Stack Overflow
 *  - FB Messenger
 *  - Discord
 */
function Chat(props) {
    let { chain, hash: selectedHash, roomId } = props.match.params;

    const { Moralis, isWeb3Enabled, isInitialized, isAuthenticated, user, account, chainId } = useMoralis();
    //Init Options
    let options = {
        // chain:"0x4", 
        // address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1'
        address: account,
        // chain,
    };
    // options.address = accountHash ? accountHash : account;    //Who's NFTs
    // if(props?.match?.params?.chain) options.chain = props.match.params.chain;
    options.chain = chain ? chain : chainId;

    const { NFTCollections, NFTpersonas, isLoading } = useNFTCollections(options);

    const collection = selectedHash ? NFTCollections[selectedHash] : null;
    // const collection = selectedHash ? NFTCollections[selectedHash] : Object.keys(NFTCollections).length > 0 ? NFTCollections[Object.keys(NFTCollections)[0]] : null; //Default to first collection

    const [space, setSpace] = useState({});
    // const [rooms, setRooms] = useState([]);
    const [curRoomId, setCurRoomId] = useState();
    const [curRoom, setCurRoom] = useState();
    const [isAllowed, setIsAllowed] = useState(null);
    const [selectedLeft, setSelectedLeft] = useState(1);
    const [displayAdd, setDisaplyAdd] = useState(false);    //Display Room Add Form
    // const { isAllowed } = useIsAllowed({selectedHash, chain,});
    const { persona, setPersona } = useContext(PersonaContext);
    // const chain = collection.chain;
    const history = useHistory();

    const [limit, setLimit] = useState(12);
    const [order, setOrder] = useState('best'); //[old, new, best]  //updatedAt, score
    const { rooms, loadRooms } = usePost({ hash: selectedHash, limit, order });

    React.useEffect(() => {
        const room = rooms.find(room => (room.id === roomId));
        setCurRoom(room);
        setDisaplyAdd(!room);
    }, [roomId, rooms]);

    // React.useEffect(() => {
    //     setIsAllowed((collection.owned));
    //     //Log
    //     console.log("(i) Chat() Check if Allowed on Collection:" + collection.owned, collection);
    //     //Check if Allowed
    // }, [collection]);
    React.useEffect(() => {
        if (!collection && Object.keys(NFTCollections).length > 0) {
            //Default to First Collection
            let first = NFTCollections[Object.keys(NFTCollections)[0]];
            // if (first.chain == chainId) {    //Validate Same Chain (Running on Change Swap)
            const link = `/chat/${first.chain}/${first.hash}`;
            // console.warn("[TEST] Chat() Set Default Collection (Redirect) ", { first, NFTCollections, collection, link });   //V
            history.push(link);
            // }
            // else console.warn("[TEST] Chat() Not Same Chain " + first.chain + " & Current" + chainId, { first, NFTCollections, collection, chainId });
        }
    }, [NFTCollections]);


    // React.useEffect(() => {
    //     if (!selectedHash) setIsAllowed(true);
    //     else if (isWeb3Enabled && selectedHash && !NFTCollections[selectedHash]) setIsAllowed(false);
    //     else {
    //         //Log
    //         // console.log("(i) NFTCollections() Check if Allowed on Collection:"+selectedHash, NFTCollections, NFTCollections[selectedHash]?.owned, (NFTCollections[selectedHash]?.owned));
    //         setIsAllowed((NFTCollections[selectedHash]?.owned));
    //     }
    // }, [selectedHash, NFTCollections, isWeb3Enabled]);


    function getCollectionIcon(collection) {
        const image = collection?.image ? collection.image : collection?.items[0]?.image;
        // return <img src={image} />;
        return <img src={image} style={{ maxHeight: '38px' }} />;
    }

    // console.warn("[TEST] Chat() Room:" + roomId, { chain, selectedHash, roomId, props, NFTCollections, collection });

    if (!isWeb3Enabled) return <PageAuthenticate />;   //Moralis getNFT Func only runs in Web3 is Enabled
    // if (Object.keys(NFTCollections).length === 0) return <div className="chat framed">No Collections Found</div>;

    return (
        <Skeleton loading={isLoading}>
            <div className="chat framed">
                <div className="left">

                    <div key="header" className="header container">
                        {/* <div className="container flex"> */}
                        <Chains showName={false} showArrow={false} onChange={(chainId) => { if (chainId) history.push(`/chat/${chainId}`); }} />
                        <CollectionSelection collections={NFTCollections} collection={collection} />
                        {/* </div> */}
                    </div>

                    <div key="main" className="main">

                        {rooms.length > 0 &&
                            <div className="rooms_top_bar">
                                <div className="rooms_info">
                                    {rooms.length} rooms
                                </div>
                                <div className="rooms_order">
                                    <Radio.Group value={order} size="small" onChange={(e) => {
                                        console.log('Chat() Rooms Order Canged to:' + e.target.value, e);
                                        setOrder(e.target.value);
                                    }}>
                                        <Radio.Button value="new">Latest</Radio.Button>
                                        <Radio.Button value="best">Greatest</Radio.Button>
                                    </Radio.Group>
                                </div>
                            </div>
                        }

                        <div class="actions">
                            <Button type="primary" shape="round" icon={<FireTwoTone twoToneColor="red" />} onClick={() => setDisaplyAdd(true)}
                                style={{ width: '100%' }}>
                                Start a new Bonfire
                            </Button>
                        </div>

                        {!!collection && <ShowRooms rooms={rooms} collection={collection} curRoomId={setCurRoomId} />}
                    </div>

                    <div className="footer">

                    </div>

                </div>
                <div className="middle">
                    {!isAuthenticated ? <div className="container"><PageAuthenticate /></div>
                        : <>
                            {collection &&
                                <div className="inner container">
                                    <div className="room-header">
                                        <h3>
                                            {/* {curRoom ? 'Bonfire in ' + collection.name : 'New Bonfire in ' + collection.name} */}
                                            {displayAdd && <>New Bonfire in <span className="collection-name" style={{ textDecoration: 'underline' }}>{collection.name}</span> Collection</>}
                                        </h3>
                                    </div>

                                    <div className="room-container">
                                        {console.warn("[TEST] Chat() Room:" + roomId, { options, selectedHash, NFTCollections, collection, rooms })}

                                        {displayAdd
                                            ?
                                            <div className="RoomMainAdd framed">
                                                {/* <div>Loading Rooms...</div> */}
                                                {rooms.length === 0 && <div className="texts">
                                                    <h4 key="R1">Welcome, cryptonout! You're the first person in this Space</h4>
                                                    {collection && <p key="R2">Why don't you go ahead and light up a new bonfire for your {__.sanitize(collection.name)} NFT buddies</p>}
                                                </div>}
                                                {collection && <RoomAddForm parentId={collection?.hash} chain={collection.chain} collection={collection} onSuccess={(post) => { loadRooms(post.id) }} />}
                                            </div>
                                            : <>
                                                {curRoom &&
                                                    <RoomMain
                                                        room={curRoom}
                                                        selectedHash={selectedHash}
                                                        collection={collection}
                                                        chain={collection.chain}
                                                    />
                                                }
                                            </>}
                                    </div>
                                    <div className="room-footer">

                                    </div>
                                </div>
                            }
                        </>}
                </div>

                <div className="right">

                    <div className="room-data">
                        <div className="room-data-header">
                            <h3>Room Data</h3>
                        </div>
                        {curRoomId &&
                            <div className="room-data-container">
                                <dl>
                                    <dt>(i) Total Tokens</dt>
                                    <dt>(i) Total Owners</dt>
                                    <dt>(i) Files Shared</dt>
                                    <dt>...</dt>
                                </dl>
                                <Collapse ghost expandIconPosition="right" expandIcon={() => (
                                    <span>Members</span>
                                )}>
                                    <Collapse.Panel header={<span>&nbsp;</span>} key="1">
                                        <ul>
                                            {curRoom?.get('members').map((member) => (
                                                <li></li>
                                            ))}
                                        </ul>
                                    </Collapse.Panel>
                                </Collapse>

                                <ul className="members">

                                </ul>

                            </div>
                        }
                    </div>

                </div>
            </div>
        </Skeleton >
    );

    //Log
    // console.log("Chat() For collection:", { collection, rooms });
    // console.warn("[DEV] Room list Collapse", curRoomId);user

}//Chat()

export default Chat;

/** UNUSED
 * Component: Empty Space
 */
function SpaceEmpty({ collection }) {
    return (
        <div className="SpaceEmpty framed">
            {/* <div>Loading Rooms...</div> */}
            <h4 key="R1">Welcome, cryptonout! You're the first person in this Space</h4>
            {collection && <p key="R2">Why don't you go ahead and light up a new bonfire for your {__.sanitize(collection.name)} NFT buddies</p>}
            {collection && <RoomAddForm parentId={collection.hash} chain={collection.chain} collection={collection} />}
        </div>
    );
}//SpaceEmpty()

/**
 * Component: Link To Room
 * @param {Object} props
 *  @param {Object} props.room
 *  @param {Bool} props.selected
 *  @param {String} props.link  [Optional]
 */
function RoomEntrance(props) {
    const { room, selected: isSelected, link } = props;  //hash, collection, 
    const [persona, setPersona] = useState(room?.get('persona'));
    const { Moralis } = useMoralis();
    const history = useHistory();

    /**
     * Load Post's Persona When Needed
     */
    useEffect(() => {
        if (Object.keys(persona.attributes).length === 0) {
            // console.warn("[TEST] RoomEntrance() Loading Missing Persona for Room:"+room.id, room);
            loadItsPersona(room);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room, persona]);

    const loadItsPersona = async (parseObj) => {
        // let personaFull = await parseObj.relation('persona').query().find();   //Called relation() on non-relation field persona
        const PersonaQuery = new Moralis.Query(Persona);
        let personaId = parseObj?.get('persona').id;
        let personaFull = await PersonaQuery?.get(personaId);
        // console.warn("Chat() Persona", personaFull?.attributes,  personaFull);
        setPersona(personaFull);
    }

    if (room?.get('members')) console.warn("[TEST] RoomEntrance() For:" + room.id, { room, members: room?.get('members') });

    //Validate
    if (!room) {
        console.error("RoomEntrance() Room Missing", { room });
        return <div>ERROR - Room Missing</div>;
    }

    // let image = PersonaHelper.getImage(room?.get('persona'));
    let image = PersonaHelper.getImage(persona);
    let purpose = room?.get('persona')?.get('metadata')?.purpose;
    let role = room?.get('persona')?.get('metadata')?.role;
    let className = "room_entrance";
    if (isSelected) className += " selected";

    /**
     * Redirect to Room
     */
    function handleClick(event) {
        // event.preventDefault();
        // props.onClick(room);
        // console.warn("[TEST] RoomEntrance.handleClick() Link:" + props.link, { event, props });
        // return <Redirect to="/posts/" />;
        if (props?.link) history.push(props.link);
        else console.error("RoomEntrance.handleClick() Link Missing", { props });
    }//handleClick()

    return (
        <div className="room_single container"
            onClick={handleClick}>

            <div className={className} id={room.id}>
                <div className="image pointer">
                    <Avatar src={image} shape="circle" style={{ height: 'var(--avatarSM)', width: 'var(--avatarSM)' }}>
                        {/* Fallback */}
                        <img
                            src={image}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                            alt=""
                            // style={{ height: "var(--cardHeight)", width: "var(--cardWidth)" }}
                            className="avatar"
                        />
                    </Avatar>
                </div>
                <div className="content pointer">
                    {/* {isSelected && <div key="back" className="back link" style={{position:'absolute', right:'15px'}}><ArrowLeftOutlined />Back</div>} */}
                    <div key="user_info" className="user_info">
                        <span className="updated">{moment(room?.get('updatedAt')).fromNow()}</span>
                        {isSelected
                            ? <>
                                <p>
                                    {PersonaHelper.getNameFull(room?.get('persona'))}
                                    {role && ", " + role}
                                </p>
                                {/* {purpose && <p key="purp" className="purpose" dangerouslySetInnerHTML={{ __html: __.nl2br(__.stripHTML(purpose)) }}></p>} */}
                            </>
                            : <>
                                <p>
                                    {PersonaHelper.getName(room?.get('persona'))}
                                    {role && ", " + role}
                                </p>
                            </>
                        }
                    </div>
                    <h5 className="title">
                        {/* <Link key="link" to={{ pathname: "/room/"+room.id, }} className="btn"><FireTwoTone twoToneColor="red" />{room?.get('name')}</Link> */}
                        {/* <a className="btn"><FireTwoTone twoToneColor="red" />{room?.get('name')}</a> */}
                        <FireTwoTone twoToneColor="red" />
                        {room?.get('name')}
                    </h5>

                    <div className="info">
                        {/* <span key="id">ID: {room.id}</span> */}
                        {/* <p key="">Total Items: {room.total_items}</p> */}
                        {/* <p key="created">Created: {moment(room?.get('createdAt')).format('YYYY-MM-DD HH:mm:ss')}</p> */}
                        <dl style={{ display: 'flex' }}>
                            <dd key="comments" className="comments">{room?.get('childCount') || 0} {`${room?.get('childCount') == 1 ? 'comment' : 'comments'}`}</dd>
                            <dd key="members" className="members">{room?.get('members')?.length} subs</dd>
                        </dl>
                        <div className="actions debug">
                            {(1)
                                ? <Button variant="contained" size="small" color="primary" onClick={() => { console.warn("CLICKED JOIN") }} title="Join the group">Join</Button>
                                : <Button variant="contained" size="small" onClick={() => { console.warn("CLICKED LEAVE") }} style={{ background: 'none', border: 'none' }} title="Leave the group">Leave</Button>
                            }
                        </div>
                    </div>

                </div>
                <div className="vote" onClick={(evt) => evt.stopPropagation()}>
                    <VotePane post={room} />
                </div>
            </div>

        </div >
    );
}//RoomEntrance()


/**
 * Component: Room's Main Post
 */
function RoomHead(props) {
    const { room, selected: isSelected } = props;  //hash, collection, 
    const [persona, setPersona] = useState(room?.get('persona'));

    // let image = PersonaHelper.getImage(room?.get('persona'));
    let image = PersonaHelper.getImage(persona);
    // console.warn("[TEST] RoomHead() Room (Persona) Image:"+image, props);
    let className = "room_head";
    if (isSelected) className += " selected";

    /**
     * Load Post's Persona When Needed
     */
    const { Moralis } = useMoralis();
    useEffect(() => {
        if (persona && Object.keys(persona.attributes).length === 0) {
            // console.warn("[TEST] RoomHead() Loading Missing Persona for Room:"+room.id, room);
            loadItsPersona(room);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room, persona]);

    const loadItsPersona = async (parseObj) => {
        // let personaFull = await parseObj.relation('persona').query().find();   //Called relation() on non-relation field persona
        const PersonaQuery = new Moralis.Query(Persona);
        let personaId = parseObj?.get('persona').id;
        let personaFull = await PersonaQuery?.get(personaId);
        // console.warn("Chat() Persona", personaFull?.attributes,  personaFull);
        setPersona(personaFull);
    }

    if (room?.get('members')) console.warn("[TEST] RoomHead() For:" + room.id, { room, members: room?.get('members') });

    //Validate
    if (!room) {
        console.error("RoomHead() Room Missing", { room });
        return <div>ERROR - Room Missing</div>;
    }
    let purpose = room?.get('persona')?.get('metadata')?.purpose;
    let role = room?.get('persona')?.get('metadata')?.role;
    return (
        <div className={className} id={room.id}>
            <div className="inner ">

                <Badge.Ribbon placement="start"
                    title={room?.get('persona')?.get('owner')}
                    text={<Address address={room?.get('persona')?.get('owner')} size={6} size2={2} />}
                // onHover={console.warn("[TEST] HOVERING ABOVE THE RIBBON")}
                >
                    <div className="image">
                        <Avatar src={image} shape="square" style={{ height: 'var(--avatarMD)', width: 'var(--avatarMD)' }}>
                            {/* Fallback */}
                            <img
                                src={image}
                                fallback="data:image/png;base64,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"
                                alt=""
                                // style={{ height: "var(--cardHeight)", width: "var(--cardWidth)" }}
                                className="avatar"
                            />
                        </Avatar>
                    </div>
                </Badge.Ribbon>
                <div className="content">
                    {/* {isSelected && <div key="back" className="back link" style={{position:'absolute', right:'15px'}}><ArrowLeftOutlined />Back</div>} */}
                    <h2>
                        {/* <Link key="link" to={{ pathname: "/room/"+room.id, }} className="btn"><FireTwoTone twoToneColor="red" />{room?.get('name')}</Link> */}
                        {/* <a className="btn"><FireTwoTone twoToneColor="red" />{room?.get('name')}</a> */}
                        {/* <FireTwoTone twoToneColor="red" /> */}
                        {room?.get('name')}
                    </h2>

                    <div key="user_info" className="user_info">
                        {isSelected
                            ? <>
                                <p>
                                    {PersonaHelper.getNameFull(room?.get('persona'))}
                                    {role && ", " + role}
                                </p>
                                {purpose && <p key="purp" className="purpose" dangerouslySetInnerHTML={{ __html: __.nl2br(__.stripHTML(purpose)) }}></p>}
                            </>
                            : <>
                                <p>
                                    {PersonaHelper.getName(room?.get('persona'))}
                                    {role && ", " + role}
                                </p>
                            </>
                        }
                    </div>

                    <div className="info">
                        {/* <span key="id">ID: {room.id}</span> */}
                        {/* {isSelected && <p key="desc">{room?.get('text')}</p>} */}
                        {/* <p key="created">Created: {room?.createdAt}</p> */}
                        {/* <p key="updated">Last Updated: {room?.updatedAt}</p> */}
                        {/* <p key="">Total Items: {room.total_items}</p> */}
                        {/* <p key="members" className="members">Users: {room.members}</p> */}
                        <p key="comments">{room?.get('childCount') || 0} Comments</p>
                        <div className="actions debug">
                            {(1)
                                ? <Button variant="contained" size="small" color="primary" onClick={() => { console.warn("CLICKED JOIN") }} title="Join the group">Join</Button>
                                : <Button variant="contained" size="small" onClick={() => { console.warn("CLICKED LEAVE") }} style={{ background: 'none', border: 'none' }} title="Leave the group">Leave</Button>
                            }
                        </div>
                    </div>

                </div>
                <div className="vote" onClick={(evt) => { evt.stopPropagation() }}>
                    <VotePane post={room} />
                </div>
            </div>
            <p className="text" dangerouslySetInnerHTML={{ __html: __.nl2br(__.stripHTML(room?.get('text'))) }}></p>
        </div>
    );
}//RoomHead()


/**
 * Component - Show More Button
 */
function RoomMain(props) {
    const { room, collection, chain } = props;
    // const curRoomId = room?.get('id');
    const curRoomId = room?.id;
    const { isWeb3Enabled, user } = useMoralis();
    // const [isAllowed, setIsAllowed] = useState(null);
    const [isAllowed, setIsAllowed] = useState(true);

    console.warn("[DEV] RoomMain() Room " + curRoomId, { props, room, collection, curRoomId });
    if (!collection || !room) return 'Loading...';
    return (
        <div className="room-main">
            <Skeleton active loading={!isWeb3Enabled && !collection}>
                {/* <h1> Private Space for {collection.name}</h1> */}
                {/* <h1 className="carved" title="Private Space">Private Space</h1> */}
                {/* <h4>[Addr:{collection.hash}]</h4> */}
                {/* <span key="typs">Type: {collection.contract_type}</span> */}
                {/* <span key="symbol">Symbol: {collection.symbol}</span> */}
                {/* TODO: Add Field: Creator, Total No. of Items, */}
                {/* TODO: 1155 - Add Field: Total No. of Items, */}
                {/* {console.log("[DEV] Chat() in REACT_APP_ENV:"+process?.env?.REACT_APP_ENV)} */}

                {(isAllowed/* || process?.env?.REACT_APP_ENV==='development'*/) ? <>
                    <div className={(curRoomId) ? 'room_container single' : 'room_container'}>
                        {(!isAllowed && process?.env?.REACT_APP_ENV === 'development') && <span className="debug" style={{ float: 'right' }}>[NOT ALLOWED (S)]</span>}
                        <div className="allowed">

                            <div className={'room_single container framed'}>
                                <RoomHead key={room.id} hash={collection?.hash} collection={collection} room={room} selected={(curRoomId === room.id)} />
                                <ShowComments room={room} />
                                <ShowMore />
                                {/* <RoomAddForm parent={room} parentId={room.id} type='comment' /> */}
                                {/* {console.warn("[DEV] RoomEntrance() Room "+room.id+" Selected:"+(curRoomId===room.id), curRoomId)} */}
                                {/* {curRoomId && <RoomAddForm parentId={curRoomId} type='comment' chain={chain} />} */}
                            </div>
                        </div>
                    </div>
                </>
                    : <div className="disallowed">
                        {/* <h2>Private Space</h2> */}
                        {/* <h2 style={{fontSize:'2em'}}>Stop!</h2> */}
                        <h3>This space is only open for {__.sanitize(collection.name)} NFT holders.</h3>
                        {/* <img src="/images/access_denied.png" alt="Access Denied" style={{margin:'25px ​69px 10px'}}/> */}
                        {/* <img src="/images/doorman2.png" alt="Access Denied" style={{margin:'25px ​69px 10px'}}/> */}

                        {user
                            ? <p>To Enter this space you need to own an NFT from this collection</p>
                            : <p>To Enter this space please <span style={{ textDecoration: 'underline' }}>sign-in</span> with an account that owns an NFT from this collection</p>
                        }
                        <img src="/images/doorman1.png" alt="Access Denied" style={{ marginTop: '20px', maxHeight: '60vh' }} />
                    </div>
                }
                <div className="clearfloat"></div>
            </Skeleton>

            {curRoomId && <RoomAddForm parentId={curRoomId} type='comment' chain={chain} />}
        </div>
    );
}//RoomMain()


/**
 * Component - Show More Button
 */
function ShowMore() {
    return (
        <div className="show_more flex">
            <div className="inner">
                <p className="debug">
                    [Load More]
                </p>
            </div>
        </div>
    );
}//ShowMore()

/**
 * Component: Show Comments
 */
function ShowRooms({ curRoomId, collection, rooms }) {
    // const { isAuthenticated } = useMoralis();

    // const [limit, setLimit] = useState(100);
    // const [order, setOrder] = useState('best'); //[olde, new, best]  //updatedAt, score

    /*
    // const { data:comments, error, isLoading } = useMoralisQuery(CommentObj, query =>
    const { data: comments } = useMoralisQuery(CommentObj, query =>
        query.equalTo("parentId", room.id)
            // .greaterThanOrEqualTo("score", 100)
            .descending("updatedAt").descending("score")    //Best First
        // .limit(limit),
        , [room, limit, isAuthenticated, order]
        , { live: true }   //Seems like it's not really live...
    );
    */

    // console.warn("[DEBUG] ShowRooms() Loaded "+comments.length+" Comments for Room:"+room.id, {comments});

    //Render
    return (
        <div key="rooms" className={"rooms " + collection?.hash}>
            {/* <h3> */}
            {/* {rooms.length} Bonfires */}
            {/* <span className="">&nbsp; for {collection.name}</span> */}
            {/* <span className="chain_icon debug" style={{ marginRight: '15px' }} title={ChainHelper.get(collection.chain, 'name')}>{ChainHelper.get(collection.chain, 'icon')}</span> */}
            {/* </h3> */}
            {/* <Skeleton loading={!rooms}> */}
            {rooms.map((room) => {
                const link = `/chat/${collection.chain}/${collection.hash}/${room.id}`;
                return (
                    <RoomEntrance key={room.id}
                        room={room}
                        selected={(curRoomId === room.id)}
                        link={link}
                    />
                );
            })}
            {/* </Skeleton> */}
        </div>
    );
}//ShowRooms()

/**
 * Component: Show Comments
 */
function ShowComments({ room }) {
    const { isAuthenticated } = useMoralis();
    // const [ comments, setComments ] = useState([]);
    const [limit, setLimit] = useState(100);
    const [order, setOrder] = useState('best'); //[olde, new, best]  //updatedAt, score

    // const { data:comments, error, isLoading } = useMoralisQuery(CommentObj, query =>
    const { data: comments } = useMoralisQuery(CommentObj, query =>
        query.equalTo("parentId", room.id)
            // .greaterThanOrEqualTo("score", 100)
            .descending("updatedAt").descending("score")    //Best First
        // .limit(limit),
        , [room, limit, isAuthenticated, order]
        , { live: true }   //Seems like it's not really live...
    );

    // console.warn("[DEBUG] ShowComments() Loaded "+comments.length+" Comments for Room:"+room.id, {comments});

    //Render
    return (
        <div className="comments_wrapper">
            {/* UNUSED
            <div className="comments_top_bar">
                <div className="comments_info">
                {comments.length} Comments
                </div>
                <div className="comments_order">
                <Radio.Group value={order} size="medium" onChange={(e) => {console.log('ShowComments() Order Canged to:'+e.target.value, e)}}>
                    <Radio.Button value="new">Newest</Radio.Button>
                    <Radio.Button value="old">Oldest</Radio.Button>
                    <Radio.Button value="best">Best</Radio.Button>
                </Radio.Group>
                </div>
            </div>
            */}
            <div className="comment_list">
                <div className="inner">
                    {/* <p>[...COMMENTS for Room:{room.id}]</p> */}
                    {comments && comments.map((comment) => (
                        <div className="comment" key={comment.id}>
                            <Comment
                                // actions={[<span key="comment-nested-reply-to">Reply</span>]}
                                // author={<a>Han Solo</a>}
                                author={comment?.get('persona')?.get('metadata')?.name}
                                avatar={
                                    <Link to={{ pathname: PersonaHelper.getLink(comment?.get('persona')) }}>
                                        <Avatar src={PersonaHelper.getImage(comment?.get('persona'))} alt={PersonaHelper.getName(comment?.get('persona'))} />
                                    </Link>
                                }
                                content={
                                    <div className="inner">
                                        <div className="content">
                                            <h3>{comment?.get('name')}</h3>
                                            <p>{comment?.get('text')}</p>
                                        </div>
                                        <div className="vote" onClick={(evt) => { evt.stopPropagation() }}>
                                            <VotePane post={comment} />
                                        </div>
                                    </div>
                                }
                                datetime={
                                    <Tooltip title={moment(comment?.get('updatedAt')).format('YYYY-MM-DD HH:mm:ss')}>
                                        <span>{moment(comment?.get('updatedAt')).fromNow()}</span>
                                    </Tooltip>
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}//ShowComments()