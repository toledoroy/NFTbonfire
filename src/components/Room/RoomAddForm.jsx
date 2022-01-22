import React, { useContext } from "react";
// import { Skeleton, Image} from 'antd';
import { Form, Input, Button, Comment, Avatar, message } from 'antd';
import { FireTwoTone } from '@ant-design/icons';
import { useMoralis } from "react-moralis";
// import { useHistory } from 'react-router-dom';
// import { Room } from "objects/objects";
// import { Post } from "objects/objects";  //This is in the wrong Context...
import { PersonaHelper } from "helpers/PersonaHelper";
import { PersonaContext } from "common/context";



/**
 * Component: Add New Post
 */
 function RoomAddForm(props) {
   const { parentId, type } = props;  //, title
    const { Moralis, account, chainId, user, isWeb3Enabled } = useMoralis();
    const { persona } = useContext(PersonaContext);
    const [form] = Form.useForm();
    // const type = title ? 'comment' : 'post';
  
    /**
     * Submit on Enter
     * @param {*} evt 
     */
    const onEnterPress = (evt) => {
        // console.warn("[TEST] RoomAddForm() Key Press", evt.keyCode);
        if(evt.keyCode === 13 && evt.shiftKey === false) {
            evt.preventDefault();
            form.submit();
            return false;
        }
    }
    

    //Objects
    // const Room = Moralis.Object.extend("Post"); //Use Posts as Rooms
    // const { isSaving, error, save:savePost } = useNewMoralisObject('post');
    // const history = useHistory();
    
    //Validate
    if(!parentId) throw new Error("RoomAddForm() Missing Parent");

    // React.useEffect(() => {
    //   console.error("[TEST] RoomAddForm() Using Persona:", {persona});
    // }, [persona]);
  
    /**
     * Form Submit Function
     */
    const onFinish = async (values) => {
      //Validate
      if(!persona){
        message.error("To post, you must first mint yourself a persona");
        // throw new Error("RoomAddForm() No Persona Selected");
        return;
      }
      try{
        //Additions
        values.parentId = parentId;
        values.account = account;
        // values.chain = chainId;     //THIS IS WRONG...
        values.chain = props.chain || chainId;
        values.userId = user?.id;
        // values.user = user;

        values.personaId = PersonaHelper.getGUID(persona);
        values.persona = persona;
        // values.personaRel = persona;  // schema mismatch for
        
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
        let newPost = await post.save(values);
        // console.log("RoomAddForm() Created new Post:", {values, newPost});

        //Reset Form
        form.resetFields();
          
       //Run Success Callback
       if(props.onSuccess && typeof props.onSuccess === 'function'){
         console.warn("[TEST] RoomAddForm() onFinish() Has a Success Callback Func", props.onSuccess);
         //Run
         props.onSuccess(newPost);
       }

        /*
        //Redirect -- Enter New Room      //https://stackoverflow.com/questions/34735580/how-to-do-a-redirect-to-another-route-with-react-router
        // history.push('/room/'+newPost.id);
        */
       
      }
      catch(err){
        console.error("RoomAddForm() Failed to Create a new Post:", {values, props, err});
        message.error("Ooops! I didn't manage to save this post. Maybe try again later...");
      }
    };//onFinish()

    //Validate
    if(!persona){
      console.error("RoomAddForm() No Persona Selected");
      return (<div className="personaMissing">
        <h2>To post, you must first <a href="/persona">mint yourself a persona</a></h2>
      </div>);
    }
    else if(type==='comment'){
      const className = props.className ? "comment_add "+props.className : "comment_add";
      return (
        <div className={className}>  
        {/* <h3>{(type==='comment') ? 'Add Comment' : 'Start a new bonfire'}</h3> */}
        {/* <h3>Add Comment</h3> */}
        {/* <p>Add a new Room to this Space!</p> */}
        <Comment
          avatar={<Avatar src={PersonaHelper.getImage(persona)} alt={persona?.get('metadata').name} />}
          content={
            <Form name="postAdd" 
              onFinish={onFinish}
              onFinishFailed={console.error}
              // labelCol={{ span: 6, }}
              // wrapperCol={{ span: 16, }}
              initialValues={{ remember: false, text:''}}
              autoComplete="off"
              form={form} 
              >
              
              <Form.Item name="text" rules={[{ required: true, message: "You'd need to enter some text as well..."}]}>
                <Input.TextArea 
                // showCount 
                autoSize={{ minRows: 1, maxRows: 6 }}
                onKeyUp={onEnterPress}
                />
              </Form.Item>

              {persona &&
                <Button type="primary" htmlType="submit" className="send" icon={<i className="bi bi-send"></i>}></Button>
              }

              {/*persona &&
               <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                <Button type="primary" htmlType="submit" icon={<i className="bi bi-send"></i>}></Button>
              </Form.Item>
              */}
              {!persona && <p style={{textAlign:'center'}}>
                To post content, you'd first need to mint yourself a persona.
                <a href="/persona">
                  <Button type="primary" size="large" className="main_button"
                    style={{ width: "100%", borderRadius: "0.5rem", fontSize: "16px", fontWeight: "400", }}>
                    Mint New Persona
                  </Button>
                </a>
              </p>}

            </Form>
          }
        />
      </div>
      );
    }
    else{
      let image = PersonaHelper.getImage(persona);
      return(
        <div className={(props.className) ? 'room_add '+props.className : 'room_add'}>  
          <h3>[+] Light a new bonfire</h3>
          <div className="inner room_entrance">
            <div className="image">
              <Avatar src={image} shape="square" style={{ height:'var(--avatarMD)', width:'var(--avatarMD)'}}>
                {/* Fallback */}
                <img
                  src={image}
                  fallback="data:image/png;base64,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"
                  alt=""
                  className="avatar"
                />
              </Avatar>
            </div>
            <div className="content">
              {/* <p>Add a new Room to this Space!</p> */}
              <Comment
                // avatar={<Avatar src={PersonaHelper.getImage(persona)} alt={persona?.get('metadata').name} />}
                content={
                  <Form name="postAdd" 
                    onFinish={onFinish}
                    onFinishFailed={console.error}
                    // labelCol={{ span: 6, }}
                    // wrapperCol={{ span: 16, }}
                    initialValues={{ remember: true, }}
                    autoComplete="off"
                    form={form} 
                    >
                    <Form.Item name="name" rules={[{ required: true, message: 'The topic is actually kind of a big deal here...'}]}>
                      <Input placeholder="Topic" maxLength={250} />
                    </Form.Item>
                    <Form.Item name="text" rules={[{ required: true, message: "You'd need to enter some text as well."}]}>
                      <Input.TextArea 
                        placeholder="Text" 
                        // onKeyUp={onEnterPress}
                      />
                    </Form.Item>
                    {persona && <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                      <Button type="primary" htmlType="submit"><FireTwoTone twoToneColor="red" />Light Up</Button>
                    </Form.Item>
                    }
                    {!persona && <p style={{textAlign:'center'}}>
                      To post content, you'd first need to mint yourself a persona.
                      <a href="/persona">
                        <Button type="primary" size="large" className="main_button"
                          style={{ width: "100%", borderRadius: "0.5rem", fontSize: "16px", fontWeight: "400", }}>
                          Mint New Persona
                        </Button>
                      </a>
                    </p>}

                  </Form>
                }
              />
              </div>
            </div>
        </div>
      );
    }
  }//RoomAddForm()

  
export default RoomAddForm;