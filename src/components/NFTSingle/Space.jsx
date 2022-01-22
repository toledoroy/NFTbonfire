import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMoralis } from "react-moralis";
import RoomAddForm from "components/Room/RoomAddForm";
import { FireTwoTone, ArrowLeftOutlined } from '@ant-design/icons';
// import { Image, Form, Input, Button, Checkbox } from "antd";
import { Skeleton, Collapse, Badge, Avatar, Comment, Tooltip, Button } from 'antd';
import { useMoralisQuery } from "react-moralis";
import VotePane from "components/Room/VotePane";
// import PersonaChanger from "components/Persona/PersonaChanger";
import PersonaHelper from "helpers/PersonaHelper";
// import { PersonaContext } from "common/context";
// import { useIsAllowed } from "hooks/useIsAllowed";
import { CollectionContext } from "common/context";
import __ from "helpers/__";
import moment from 'moment';
import { Space, Room, Comment as CommentObj } from "objects/objects";
import { Persona } from "objects/Persona";
//Components
import Address from "components/Address/Address";
import PageAuthenticate from "components/PageAuthenticate";

/**
 * Component: SpaceView (W/Chat Room)
 * 
 * Inspiration: 
 *  - https://github.com/gunnarmorling/discussions.morling.dev/discussions/291?sort=top
 *  - Stack Overflow
 *  - FB Messenger
 */
function SpaceView({hash, collection, NFTpersonas}) {
  const { Moralis, isWeb3Enabled, isAuthenticated, user } = useMoralis();
  const [ space, setSpace ] = useState({});
  const [ rooms, setRooms ] = useState([]);
  const [ curRoomId, setCurRoomId ] = useState();
  const [ limit, setLimit ] = useState(24);
  const [isAllowed, setIsAllowed] = useState(null);
  // const { isAllowed } = useIsAllowed({hash, chain,});
  // const { persona, setPersona} = useContext(PersonaContext);
  const chain = collection.chain;
  
  React.useEffect(() => {  
    setIsAllowed((collection.owned));
    //Log
    console.log("(i) Space() Check if Allowed on Collection:"+collection.owned, collection);

  },[collection]);

  /**
   * [DEV] Insert Rooms
   */
  function initRooms(hash){
    let roomsInit = [
      new Room().set("name", 'Introduction').set("text", 'Say Hi! and introduce yourself'),
      new Room().set("name", 'News').set("text", 'Things people like you should know about'),
      new Room().set("name", 'Events').set("text", 'Virtual Meta-Events or IRL, all private NFT events can be posete here'),
      new Room({test:1}).set("name", 'Chat').set("text", 'Just talk about whatever'),
    ];
    for(let room of roomsInit){ 
      // room.set("space", space.id);    //Seems Unecessary. Spaces are 1-1 with Contract Hashes
      room.set("parentId", hash);       //Link Directly to Space (By Hash)
      room.save().then(result => {
        console.log("[TEST] Created Room for:"+hash, result);
      });
    }//Insert Each Room
    //Return
    return roomsInit;
  }//initRooms()
  
  /**
   * Fetch Current Space
   */
  useEffect(() => {
    if (isWeb3Enabled && isAuthenticated) {
      //Unset Space
      setSpace(null);
      const query = new Moralis.Query(Space);
      query.equalTo("hash", hash);
      query.first().then(result => {
        if(result) {
          setSpace(result);
          //Log
          // console.log("[TEST] Got Space for Hash:'"+hash+"'", result); 
        }//Existing Space
        else{
          //Create a new Space
          const newSpace = new Space();
          newSpace.set("hash", hash);
          newSpace.set("name", "New Space"); //No Need
          newSpace.set("text", "This is a new space");  //No Need
          // newSpace.set("first_user", Moralis.currentUser.get("objectId"));   //TODO: Get Current User ObjectID, This isn't Really It...
          // newSpace.set("rooms", []); //Other Way...
          newSpace.save().then(result => {
            //Log
            console.log("(i) Automatically Created new Space for:"+hash);
            //Set
            setSpace(result);
          });
        }//New Space
      });
    }//Web3 Enabled
    else console.log("SpaceView() Waiting for Web3...");
  }, [isWeb3Enabled, isAuthenticated, hash, Moralis.Query]);

  
  const loadRooms = (postId) => {
    if(isAuthenticated){ 
      //Log
      // console.log("[TEST] SpaceView() RUNNUING W/Hash:"+hash);
      //Get Rooms for Space (by Space's hash)
      const RoomQuery = new Moralis.Query(Room);
      RoomQuery.equalTo("parentId", hash);  //By Hash
      const PersonaQuery = new Moralis.Query('Persona');
      RoomQuery.matchesKeyInQuery("persona", "objectId", PersonaQuery);
      
      RoomQuery
        .addDescending("score")    //Best First
        .addDescending("updatedAt") //Latest Activity
        .limit(limit);
      RoomQuery.find().then(results => {
        //Log
        console.log("Spcae() Got "+results.length+" Rooms for Space:"+hash);
        if(results && results.length > 0) {
          //Log
          console.log("[DEBUG] SpaceView() Got "+results.length+" Rooms for Space:"+hash, results); 
          //Set Rooms
          setRooms(results);
          //Option to Set Current Room
          if(postId){
            //Verify
            if(results.find(post => (post.id === postId))){
              // console.warn("[TEST] SpaceView() Setting Current Room to:"+postId, results);
              setCurRoomId(postId);
            } 
            //Log
            else{
              console.error("[DEV] SpaceView() Can't Set Set New Room -- Room:"+postId+" not in list");
              //TODO: Maybe Redirect to Single Room Page ?
            } 
          } 
        }//Found Rooms
        /* Cancelled - Allow for No Rooms
        else {
          //Init Rooms
          let roomsInit = initRooms(hash); 
          //Set Rooms
          // setRooms(roomsInit); //Try Without... Also Use Live Query
          //Log
          // console.log("[TEST] SpaceView() No Rooms Found for Space:"+hash+" --> Init Rooms", roomsInit);
        }//No Rooms
        */
      });
      //Log
      // console.log("Moralis Query Object for Current Room: ", {hash, curRoomId});
    }//Authenticated
    else setRooms([]);
  }

  const loadRoomsAsync = async () => {
    if(isAuthenticated){ 
      try{
        //Log
        // console.log("[TEST] SpaceView() RUNNUING W/Hash:"+hash);
        //Get Rooms for Space (by Space's hash)
        const RoomQuery = new Moralis.Query(Room);
        RoomQuery.equalTo("parentId", hash);  //By Hash
        const PersonaQuery = new Moralis.Query('Persona');
        RoomQuery.matchesKeyInQuery("persona", "objectId", PersonaQuery);
        
        const results = await RoomQuery
          // .addDescending("updatedAt")
          .addDescending("score")    //Best First
          .limit(limit)
          .find();
        //Log
        console.log("Spcae() Got "+results.length+" Rooms for Space:"+hash);
        if(results && results.length > 0) {
          //Log
          console.log("[DEBUG] SpaceView() Got "+results.length+" Rooms for Space:"+hash, results); 
          //Set Rooms
          setRooms(results);
        }//Found Rooms
        /* Cancelled - Allow for No Rooms
        else {
          //Init Rooms
          let roomsInit = initRooms(hash); 
          //Set Rooms
          // setRooms(roomsInit); //Try Without... Also Use Live Query
          //Log
          // console.log("[TEST] SpaceView() No Rooms Found for Space:"+hash+" --> Init Rooms", roomsInit);
        }//No Rooms
        */
        //Log
        // console.log("Moralis Query Object for Current Room: ", {hash, curRoomId});
      }
      catch(error){
        console.error("[TEST] Error Fetching Rooms for Space:"+hash, error);
      }

    }//Authenticated
    else setRooms([]);
  }
  /**
   * Fetch Rooms for Current Space
   */
  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, limit, isAuthenticated]);
 
  //Log
  // console.log("SpaceView() For collection:", {collection, rooms});
  // console.warn("[DEV] Room list Collapse", curRoomId);

  //Validate
  // if(collection.contract_type!=="ERC1155") return <div>Unsupported Collection Type:'{collection.contract_type}'</div>;   //It's a mess out there, ERC721 0xcc14dd8e6673fee203366115d3f9240b079a4930 Contains Multiple NFTs (All Have amount=1)
  // if(!space) return <div className="loading">...LOADING SPACE...</div>;    //Enable
  
  /* Consumer -- Fail   //Unhandled Rejection (TypeError): render is not a function
  console.log("SpaceView() For CollectionContext:", {CollectionContext});
  // <CollectionContext.Consumer>
  //  {collection => {console.warn("[TEST] SpaceView() CollectionContext: ", {collection})}} 
  //  </CollectionContext.Consumer> 
    */
  if(!isAuthenticated) return <PageAuthenticate />;
  return (
    <CollectionContext.Consumer>
    {collection => (
      <>
      <div className="space">
        <Skeleton active loading={!space || !isWeb3Enabled}>
          <h1> Private Space for {collection.name}</h1>
          {/* <h4>[Addr:{collection.hash}]</h4> */}
          {/* <span key="typs">Type: {collection.contract_type}</span> */}
          {/* <span key="symbol">Symbol: {collection.symbol}</span> */}
          {/* TODO: Add Field: Creator, Total No. of Items, */}
          {/* {console.log("[DEV] SpaceView() in NODE_ENV:"+process?.env?.NODE_ENV)} */}

          {(isAllowed || process?.env?.NODE_ENV==='development') ? <>
            <div className={(curRoomId) ? 'room_container single' : 'room_container'}>
              {(!isAllowed && process?.env?.NODE_ENV==='development') && <span className="debug" style={{float:'right'}}>[NOT ALLOWED (S)]</span>}
            {(rooms && rooms.length>0) ? 
              <div className="allowed">
              
                {!curRoomId && <RoomAddForm parentId={collection.hash} chain={collection.chain} collection={collection} onSuccess={(post) => {loadRooms(post.id)}}/>} 

                <div className={'room_list container'}>
                <Collapse accordion bordered={false} onChange={(selected) => setCurRoomId(selected)} activeKey={curRoomId} > 
                  {/* collapsible="disabled" */}
                  {rooms.map((room, index) => (
                    <Collapse.Panel header={
                        <RoomEntrance key={room.id} hash={hash} collection={collection} room={room} />
                      } key={room.id} showArrow={false} className={(curRoomId===room.id) ? 'item selected' : 'item'}>

                      <ShowComments room={room} />
                      <ShowMore />
                      {/* <RoomAddForm parent={room} parentId={room.id} type='comment' /> */}
                      {/* {console.warn("[DEV] RoomEntrance() Room "+room.id+" Selected:"+(curRoomId===room.id), curRoomId)} */}
                    </Collapse.Panel>
                  ))}
                </Collapse>
                {!curRoomId &&  <ShowMore /> }
                {/* {curRoomId && <RoomAddForm parentId={curRoomId} type='comment' chain={chain} />} */}
                </div>
              </div>
              :
              <SpaceEmpty collection={collection} />
              } 
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
              : <p>To Enter this space please <span style={{textDecoration:'underline'}}>sign-in</span> with an account that owns an NFT from this collection</p>
              }
              <img src="/images/doorman1.png" alt="Access Denied" style={{marginTop: '20px', maxHeight: '60vh'}}/>
            </div>
          }
          <div className="clearfloat"></div>
          </Skeleton>
      </div>
      {curRoomId && <RoomAddForm parentId={curRoomId} type='comment' chain={chain} />}
    </>
    )}
    </CollectionContext.Consumer> 
  );
}//SpaceView()

export default SpaceView;

/**
 * Component: Empty Space
 */
 function SpaceEmpty({collection}) {
  return(
    <div className="SpaceEmpty">
      {/* <div>Loading Rooms...</div> */}
      <p key="R1">Congratulations! You're the first person in this Space</p>
      <p key="R2">Why don't you go ahead and light up a new bonfire for your {__.sanitize(collection.name)} NFT buddies</p>
      <RoomAddForm parentId={collection.hash} chain={collection.chain} collection={collection} />
    </div>
  );
 }//SpaceEmpty()

/**
 * Component: Link To Room
 */
function RoomEntrance(props) {
  const { room, selected:isSelected } = props;  //hash, collection, 
  const [ persona, setPersona ] = useState(room.get('persona'));

  // let image = PersonaHelper.getImage(room.get('persona'));
  let image = PersonaHelper.getImage(persona);
  // console.warn("[TEST] RoomEntrance() Room (Persona) Image:"+image, props);
  let className = "room_entrance";
  if(isSelected) className += " selected";



  /**
   * Load Post's Persona When Needed
   */
  const { Moralis } = useMoralis();
  useEffect(() => {
    if(Object.keys(persona.attributes).length===0){

      console.warn("[TEST] RoomEntrance() Loading Missing Persona for Room:"+room.id, room);
      loadItsPersona(room);
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[room, persona]);

  const loadItsPersona = async (parseObj) => {
    // let personaFull = await parseObj.relation('persona').query().find();   //Called relation() on non-relation field persona
    const PersonaQuery = new Moralis.Query(Persona);
    let personaId = parseObj.get('persona').id;
    let personaFull = await PersonaQuery.get(personaId);
    // console.warn("Space() Persona", personaFull?.attributes,  personaFull);
    setPersona(personaFull);
  }

  /* DEPRECATED - No Longer Using the Window.
  useEffect(() => {
    // Scroll to Selected/Unselected Element
    // console.warn("[DEV] RoomEntrance() Room "+room.id+" Selected:"+isSelected, {room, elTop:document.getElementById(room.id).offsetTop});
    let options = {top: document.getElementById(room.id).offsetTop + 40 ,  behavior: 'smooth'};
    // if(isSelected) options.behaviour = 'auto';
    window.scrollTo(options);
  },[isSelected]);
  */

  /*
  console.warn("[TEST] RoomEntrance() For:"+room.id, {
    started:moment(room.get('createdAt')).format('YYYY-MM-DD HH:mm:ss'),
  letInteraction: moment(room.get('updatedAt')).format('YYYY-MM-DD HH:mm:ss'),
  });
  */
 
  let purpose = room.get('persona').get('metadata')?.purpose;
  let role = room.get('persona').get('metadata')?.role;
  return (
    <div className="room_single">
    <div className={className} id={room.id}>
      <Badge.Ribbon placement="start" 
        // text={room.get('persona').get('owner')} 
        text={<Address address={room.get('persona')?.get('owner')} size={6} size2={2} />} 
        // onHover={console.warn("[TEST] HOVERING ABOVE THE RIBBON")}
        title="Owner"
        >
        <div className="image">
          <Avatar src={image} shape="square" style={{ height:'var(--avatarMD)', width:'var(--avatarMD)'}}>
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
        {isSelected && <div key="back" className="back link" style={{position:'absolute', right:'15px'}}><ArrowLeftOutlined />Back</div>}
        <h1>
          {/* <Link key="link" to={{ pathname: "/room/"+room.id, }} className="btn"><FireTwoTone twoToneColor="red" />{room?.get('name')}</Link> */}
          {/* <a className="btn"><FireTwoTone twoToneColor="red" />{room?.get('name')}</a> */}
          {/* <FireTwoTone twoToneColor="red" /> */}
          {room?.get('name')}
        </h1>
        
        {isSelected && <div key="user_info">
          <p>
            {PersonaHelper.getNameFull(room.get('persona'))}
            {role && ", "+role}
          </p>
          {purpose && <p key="purp" className="purpose" dangerouslySetInnerHTML={{__html:__.nl2br(__.stripHTML(purpose))}}></p>}
        </div>}
        <div className="info">
          {/* <span key="id">ID: {room.id}</span> */}
          {/* {isSelected && <p key="desc">{room.get('text')}</p>} */}
          {/* <p key="created">Created: {room?.createdAt}</p> */}
          {/* <p key="updated">Last Updated: {room?.updatedAt}</p> */}
          {/* <p key="">Total Items: {room.total_items}</p> */}
          {/* <p key="">Total Users: {room.total_users}</p> */}
          <p key="commentes">{room.get('childCount') || 0} Comments</p>
          {/* Single Room Link is Currently Broken...   //TODO: Single Room Needs its own URL
          <Link  key="link" to={{ pathname: "/room/"+room.id, }} className="btn">Go!</Link> 
          */}
        </div>
        <div className="actions debug">
          {(1) 
            ? <Button variant="contained" size="small" color="primary" onClick={()=>{console.warn("CLICKED JOIN")}} title="Join the group">Join</Button>
            : <Button variant="contained" size="small" onClick={()=>{console.warn("CLICKED LEAVE")}} style={{background: 'none', border:'none'}} title="Leave the group">Leave</Button>
          }  
        </div>
      </div> 
      <div className="vote framed" onClick={(evt) => {evt.stopPropagation()}}>
        <VotePane post={room}/>
      </div>
    </div>
    {isSelected &&
      <p className="text" dangerouslySetInnerHTML={{__html:__.nl2br(__.stripHTML(room.get('text')))}}></p>
    }
    </div>
  );
}//RoomEntrance()

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
function ShowComments({room}) {
  const { isAuthenticated } = useMoralis();
  // const [ comments, setComments ] = useState([]);
  const [ limit, setLimit ] = useState(100);
  const [ order, setOrder ] = useState('best'); //[olde, new, best]  //updatedAt, score
  

  // const { data:comments, error, isLoading } = useMoralisQuery(CommentObj, query =>
  const { data:comments } = useMoralisQuery(CommentObj, query =>
    query.equalTo("parentId", room.id)
      // .greaterThanOrEqualTo("score", 100)
      .descending("updatedAt").descending("score")    //Best First
      // .limit(limit),
      ,[room, limit, isAuthenticated, order]
      ,{ live: true }   //Seems like it's not really live...
    );

  console.warn("[DEBUG] ShowComments() Loaded "+comments.length+" Comments for Room:"+room.id, {comments});

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
                  author={comment.get('persona')?.get('metadata')?.name}
                  avatar={
                    <Link to={{pathname: PersonaHelper.getLink(comment.get('persona'))}}>
                      <Avatar src={PersonaHelper.getImage(comment.get('persona'))} alt={PersonaHelper.getName(comment.get('persona'))} />
                    </Link> 
                  }
                  content={
                    <div className="inner">
                      <div className="content">
                        <h3>{comment.get('name')}</h3>
                        <p>{comment.get('text')}</p>
                      </div>
                      <div className="vote" onClick={(evt) => {evt.stopPropagation()}}>
                        <VotePane post={comment}/>
                      </div>
                    </div>
                  }
                  datetime={
                    <Tooltip title={moment(comment.get('updatedAt')).format('YYYY-MM-DD HH:mm:ss')}>
                      <span>{moment(comment.get('updatedAt')).fromNow()}</span>
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