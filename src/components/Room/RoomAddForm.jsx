import React, { useEffect, useState } from "react";
import { Skeleton, Image,  Form, Input, Button, Comment, Avatar, List } from 'antd';
import { FireTwoTone } from '@ant-design/icons';
import { useMoralis } from "react-moralis";
import { useHistory } from 'react-router-dom';
import { Room } from "common/objects";
    

/**
 * Component: Add New Post
 */
 function RoomAddForm({hash, title}) {
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
      // const newPost = await Moralis.Cloud.run("post", values);
      const newPost = await Room.create(values);
      //Log
      console.log("Created new Post:", newPost);
  
      //Redirect -- Enter New Room      //https://stackoverflow.com/questions/34735580/how-to-do-a-redirect-to-another-route-with-react-router
      // history.push('/room/'+newPost.id);
  
      //Return
      return newPost;
    };//onFinish()
  
    return(
      <div className="room_add">  
        <h3>{title ? title : 'Start a new bonfire'}</h3>
        {/* <p>Add a new Room to this Space!</p> */}
        <Comment
          avatar={<Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />}
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