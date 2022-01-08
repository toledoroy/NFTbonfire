import React, { useContext, useEffect } from "react";
import { Skeleton, Image,  Form, Input, Button, Comment, Avatar, message } from 'antd';
import { FireTwoTone } from '@ant-design/icons';
import { useMoralis } from "react-moralis";
import { useHistory } from 'react-router-dom';
// import { Room } from "objects/objects";
// import { Post } from "objects/objects";  //This is in the wrong Context...
import { PersonaHelper } from "helpers/PersonaHelper";
import { PersonaContext } from "common/context";


/**
 * Component: Add New Post
 */
 function RoomAddForm({parent, parentId, title}) {
    const { Moralis, account, chainId, user, isWeb3Enabled } = useMoralis();
    const { persona } = useContext(PersonaContext);
    //Objects
    // const Room = Moralis.Object.extend("Post"); //Use Posts as Rooms
    // const { isSaving, error, save:savePost } = useNewMoralisObject('post');
    const history = useHistory();
    
    //Validate
    if(!parentId) throw new Error("RoomAddForm() Missing Parent");

    // useEffect(() => {
    //   console.error("[TEST]!! RoomAddForm() Using Persona:", {persona});
    // }, [persona]);
  

    /**
     * Form Submit Function
     */
    const onFinish = async (values) => {

      //Validate
      if(!persona) message.error("Please select the Persona you'd like to use");
      if(!persona) throw new Error("RoomAddForm() No Persona Selected");


      //Additions
      values.parentId = parentId;
      // values.parent = parentId;   //TEST [X]
      values.account = account;
      values.chain = chainId;
      values.userId = user?.id;
      // values.user = user;

      values.personaId = PersonaHelper.getGUID(persona);
      values.persona = persona;
      
      
      try{

        //Create New Post
        // const Post = await Moralis.Cloud.run("post", values);
        const Post = Moralis.Object.extend("Post");
        const post = new Post(values); 
        // const post = new Post();
        // post.set("userId", request.user?.id);

        // post.set('parent', parent);   //TESTING   
        // post.set("userId", request.user?.id);
        // console.warn("[TEST] post() User: ", Moralis.User.current());

        //ACL - Own + Public Read     //!! This should probably all be on the server... + Validate Access to Parent
        const acl = new Moralis.ACL(user);
        acl.setPublicReadAccess(true);
        post.setACL(acl);
        // acl.setPublicReadAccess(true);
        //Log
        console.warn("[TEST] RoomAddForm() ACL: "+JSON.stringify(acl), {isWeb3Enabled, acl, post});
        //Save
        // return post.save();
        return post.save(values);

        /*
        //Log
        console.log("RoomAddForm() Created new Post:", {values, newPost});
    
        //Redirect -- Enter New Room      //https://stackoverflow.com/questions/34735580/how-to-do-a-redirect-to-another-route-with-react-router
        // history.push('/room/'+newPost.id);
    
        //Return
        return newPost;
        */
      }
      catch(error){
        console.error("RoomAddForm() Save Post Failed", {values, error});
        return null;
      }
    };//onFinish()
  
    return(
      <div className="room_add">  
        <h3>{title ? title : 'Start a new bonfire'}</h3>
        {/* <p>Add a new Room to this Space!</p> */}
        <Comment
          avatar={<Avatar src={PersonaHelper.getImage(persona)} alt={persona?.get('metadata').name} />}
          content={
            <Form name="postAdd" 
              onFinish={onFinish}
              onFinishFailed={console.error}
              labelCol={{ span: 6, }}
              wrapperCol={{ span: 16, }}
              initialValues={{ remember: true, }}
              autoComplete="off"
              >
              <Form.Item label="Topic" name="name" rules={[{ required: true, message: 'You forgot to fill in a Topic'}]}>
                <Input />
              </Form.Item>
              <Form.Item label="Description" name="text" rules={[{ required: true, message: "You'd need to enter some text as well..."}]}>
                <Input.TextArea />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                <Button type="primary" htmlType="submit"><FireTwoTone twoToneColor="red" />Light Up</Button>
              </Form.Item>
            </Form>
          }
        />
      </div>
    );
  }//RoomAddForm()

  
export default RoomAddForm;