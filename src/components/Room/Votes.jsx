// eslint-disable-next-line
import { useState, useEffect } from "react";
// import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useMoralisQuery } from "react-moralis";


const Votes = ({postId}) => {
    /*
    const {Moralis} = useMoralis();
    const [postVotes, setPostVotes] = useState("0");
    const { contractABI, contractAddress} = useMoralisDapp();
    const contractABIJson = JSON.parse(contractABI)
    const options = {
        contractAddress: contractAddress,
        functionName: "getPost",
        abi: contractABIJson,
        params: {
          _postId: postId
        }
      };
    useEffect(() => {
        async function getPostVotes() {
            await Moralis.enableWeb3;
            const result = await Moralis.executeFunction(options);
            setPostVotes(result[3]);
        }
        getPostVotes();
    }, [data]);
    */

    //Live Query        //TODO: How do I only fetch the filed I want from the object I want?
    // const { data : votes } = useMoralisQuery("Relations", (query) => query.equalTo("postId", postId), [], { live: true });
    const { data : post } = useMoralisQuery("Post", query => query.select('votes').equalTo("objectId", postId).limit(1), [], { live: true,
        // onLiveUpdate: (entity, all) => all.map(e => (e.id === entity.id ? entity : e))
    });
    // const { data : votes } = useMoralisQuery("Post", query => query.get(postId), [], { live: true,});       //Breaks the Moralis Subscription
    // const { data, error, isLoading } = useMoralisQuery("Post", query => query.descending("score") );//Works

    // let votes = 0;
    let votes = post.length > 0 ? post[0].get('votes') ? post[0].get('votes') : 0 : 0;

    // console.log("Votes() Vote Count for PostId:"+postId, {post} );  //BUG: Returns all the Fields
    // return ( <> {postVotes} </> );
    return ( <> {votes} </> );
}

export default Votes
