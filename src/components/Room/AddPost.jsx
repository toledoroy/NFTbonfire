// import React, { useEffect, useState } from "react";
import React, {useState} from "react";
import {useMoralisFile} from "react-moralis";
import {useWeb3ExecuteFunction} from "react-moralis";
import {message} from "antd";
import { Image, Avatar } from "antd";
import UserAvatar from "components/common/UserAvatar"

const AddPost = () => {
    // const contractABIJson = JSON.parse(contractABI);
    const ipfsProcessor = useMoralisFile();
    const contractProcessor = useWeb3ExecuteFunction();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    
    async function addPost(post) {
        /*
        const contentUri = await processContent(post); 
        const categoryId = selectedCategory["categoryId"];
        const options = {
            contractAddress: contractAddress,
            functionName: "createPost",
            abi: contractABIJson,
            params: {
                _parentId: "0x91",
                _contentUri: contentUri,
                _categoryId: categoryId
            },
            }
        await contractProcessor.fetch({params:options,
            onSuccess: () => message.success("success"),
            onError: (error) => message.error(error),
        });
        */
       console.log("[TODO] Add New Post", post);
    }

    const processContent = async (content) => {
        const ipfsResult = await ipfsProcessor.saveFile(
            "post.json",
            { base64: btoa(JSON.stringify(content)) },
            { saveIPFS: true}
        )
        return ipfsResult._ipfs;
    }

    const validateForm = () => {
        let result = !title || !content ? false: true;
        return result
    }

   const clearForm = () =>{
        setTitle('');
        setContent('');
    }
    
    function onSubmit(event){
        event.preventDefault();
        if(!validateForm()) return message.error("Remember to add the title and the content of your post")
        addPost({title, content})
        clearForm();
    }
    
    

    return (
    <div className="row comment_add">
        {/* <Avatar src={convo.get('image')} style={{ height:'var(--avatarMD)', width:'var(--avatarMD)', marginLeft:'-60px'}}></Avatar> */}
        <UserAvatar image={'https://lh3.googleusercontent.com/l8aMpUg6aRR1JPVuTcHIfyJm553Bayas90pis0kr6oQIwWdcMHVOxVb6rugeai_pfzezgqm5wUvWskyRIFe4FJNgZhFyGHuhGeUw_rE'} />
        <form onSubmit={onSubmit}>
            <div className="form-group">
                {/*
                <input
                    type="text"
                    className="mb-2 mt-2 form-control"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                */}
                <div contentEditable="true" className="comment_text mb-2 mt-2" data-placeholder="Comment..." onInput={e => {console.log('Text inside div', e.currentTarget.textContent); setContent(e.currentTarget.textContent) } } ></div>
                 {/* https://stackoverflow.com/questions/22677931/react-js-onchange-event-for-contenteditable */}
                 {/*
                <textarea
                    type='text'
                    className="mb-2 form-control"
                    placeholder="Post away"
                    rows="1"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                */}
            </div>
            <button type="submit" className="btn btn-dark ">Submit</button>
        </form>
    </div>
    )
}

export default AddPost;


