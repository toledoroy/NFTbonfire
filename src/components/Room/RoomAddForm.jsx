import React, { useEffect, useState } from "react";
import { Skeleton, Image,  Form, Input, Button } from 'antd';
import { FireTwoTone } from '@ant-design/icons';
import { useMoralis } from "react-moralis";
import { useHistory } from 'react-router-dom';


/**
 * Component: Add New Post
 */
 function RoomAddForm({hash}) {
    const { Moralis } = useMoralis();
    //Objects
    // const Room = Moralis.Object.extend("Post"); //Use Posts as Rooms
    // const { isSaving, error, save:savePost } = useNewMoralisObject('post');
    const history = useHistory();
    
    /**
     * Form Submit Function
     */
    const onFinish = async (values) => {
      //Additions
      values.parentId = hash;
      //Create
      const newPost = await Moralis.Cloud.run("post", values);
      //Log
      console.log("Created new Post:", newPost);
  
      //Redirect -- Enter New Room      //https://stackoverflow.com/questions/34735580/how-to-do-a-redirect-to-another-route-with-react-router
      history.push('/room/'+newPost.id);
  
      //Return
      return newPost;
    };//onFinish()
  
    return(
      <div className="room_add">  
        <h3>Start a new bonfire</h3>
        {/* <p>Add a new Room to this Space!</p> */}
  
        <Form name="postAdd" 
          onFinish={onFinish}
          // onFinish={console.log}
          onFinishFailed={console.error}
          labelCol={{ span: 6, }}
          wrapperCol={{ span: 16, }}
          initialValues={{ remember: true, }}
          // autoComplete="off"
          >

          {/* <input type="text" name="name" placeholder="Topic" /> */}
          <Form.Item label="Topic" name="name" rules={[{ required: true, message: 'You forgot to fill in a Topic'}]}>
            <Input />
          </Form.Item>
  
          {/* <input type="text" name="text" placeholder="Description" /> */}
          <Form.Item label="Description" name="text" rules={[{ required: true, message: "You'd need to enter some text as well..."}]}>
            <Input />
          </Form.Item>
          
          {/* <button type="submit">Light Up</button> */}
          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type="primary" htmlType="submit"><FireTwoTone twoToneColor="red" />Light Up</Button>
          </Form.Item>
  
        </Form>
  
      </div>
    );
  }//RoomAddForm()

  
export default RoomAddForm;