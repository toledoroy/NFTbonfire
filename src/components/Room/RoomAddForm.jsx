import React, { useContext, useEffect } from "react";
import { Skeleton, Image,  Form, Input, Button, Comment, Avatar } from 'antd';
import { FireTwoTone } from '@ant-design/icons';
import { useMoralis } from "react-moralis";
import { useHistory } from 'react-router-dom';
// import { Room } from "objects/objects";
import { Post } from "objects/objects";
import { PersonaHelper } from "helpers/PersonaHelper";
import { PersonaContext } from "common/context";


/**
 * Component: Add New Post
 */
 function RoomAddForm({parent, parentId, title}) {
    const { Moralis, account, chainId, user } = useMoralis();
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
      //Additions
      values.parentId = parentId;
      values.account = account;
      values.chain = chainId;
      values.userId = user?.id;
      values.persona = PersonaHelper.getGUID(persona);
      try{

        //Create New Post
        // const newPost = await Moralis.Cloud.run("post", values);
            
        const post = new Post(values);
        // post.set('parent', parent);   //TESTING   
        // post.set("userId", request.user?.id);
        // console.warn("[TEST] post() User: ", Moralis.User.current());

        //ACL - Own + Public Read     //!! This should probably all be on the server... + Validate Access to Parent
        const acl = new Moralis.ACL(Moralis.User.current());
        acl.setPublicReadAccess(true);
        acl.setRoleWriteAccess("admins", true);
        if(parentId.substr(0,2) === '0x') acl.setRoleWriteAccess(parentId, true);
        else console.error("RoomAddForm() Parent is not a Hash", {parentId});
        // acl.setRoleReadAccess("opensea", true);   //TEST
        // acl.setWriteAccess(request.user?.id, true);
        post.setACL(acl);
        //Log
        console.warn("[TEST] post() ACL: "+JSON.stringify(acl), post);
        //Save
        return post.save();

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
          // avatar={<Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />}
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