import { useMoralis } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { useEffect, useState, createElement } from "react";
import { Comment, Tooltip, Avatar, message, Divider, Skeleton } from "antd";
import { DislikeOutlined, LikeOutlined, DislikeFilled, LikeFilled } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import Blockie from "components/Blockie";
// import glStyles from "components/gstyles";
import Votes from "./Votes"

const VotePane = (props) => {
    const { post } = props;
    const { Moralis, user } = useMoralis();
    const [voteStatus, setVoteStatus] = useState();

    //Live Query - Current Relation
    const { data : relations } = useMoralisQuery("Relation", 
        query => query.select('opinion').equalTo("user", user).equalTo("entity", post.id).limit(1), [],  {live: true,});
    useEffect(() => {
        //Current Opinon of Entity
        let opinion = relations?.[0]?.get('opinion')
        // console.log("[DEV] VotePane() Current relation to:"+post.id+" is "+opinion, {relations});
        setVoteStatus(opinion);
    }, [relations]);
  
    /**
     * Example of Contract Calls W/Moralis-React
     * @var num vote    [0/1/-1]
     */
    async function vote(vote){
        //Validate
        if(user.get('accounts').includes(String(post.get('account')).toLowerCase())) return message.error("C'mon, this is your post");
        //Log
        console.log("[DEV] VotePane() Running Moralis Cloud Func 'postVote':", {postId:post.id, vote, voteStatus});
        if(vote === voteStatus) vote = 0;   //Undo Current Vote (Neutral)
        //Vote
        Moralis.Cloud.run("postVote", {postId:post.id, vote}).catch(error => {
            console.error("Post() Error while Saving Vote", {error, postId:post.id, vote});
            message.error("Sorry, Something went wrong and your vote did not save");
        });
    }//vote()

    return (
        <div className="side_pane">
            <Tooltip key="comment-basic-like" title="Great!" placement="right">
                <span onClick={(evt) => vote(1)}>
                    {createElement(voteStatus === 1 ? LikeFilled : LikeOutlined)}
                </span>
            </Tooltip>
            <div className="vote_count">
                <VoteCount postId={post.id}/> 
                {/* {post.get('votes') || '0'}  */}
            </div>
            <Tooltip key="comment-basic-dislike" title="I Don't Like This" placement="right">
                <span onClick={(evt) => vote(-1)}>
                    {createElement(voteStatus === -1 ? DislikeFilled : DislikeOutlined)}
                </span>
            </Tooltip>
        </div>
    );//return

}//VotePane()

export default VotePane;




/**
 * Component: Display Vote Count
 * @param {*} param0 
 * @returns 
 */
const VoteCount = ({postId}) => {
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

    //Live Query
    // const { data : votes } = useMoralisQuery("Relations", (query) => query.equalTo("postId", postId), [], { live: true });
    const { data : posts } = useMoralisQuery("Post", 
        // query => query.select('votes').equalTo("objectId", sId).limit(1), [],  { live: true,
        query => query.select('score').equalTo("objectId", postId).limit(1), [],  { live: true,
        // onLiveUpdate: (entity, all) => all.map(e => (e.id === entity.id ? entity : e))
    });
    // const { data : votes } = useMoralisQuery("Post", query => query.get(postId), [], { live: true,});       //Breaks the Moralis Subscription
    // const { data, error, isLoading } = useMoralisQuery("Post", query => query.descending("score") );//Works

    // let votes = 0;
    let votes = posts.length > 0 ? posts[0].get('score') ? posts[0].get('score') : 0 : 0;

    console.warn("[TEST] VoteCount() Score:"+votes+" for Post ID:"+posts[0]?.id, {votes, posts});
    // console.log("Votes() Vote Count for PostId:"+postId, {posts} );  //BUG: Returns all the Fields
    // return ( <> {postVotes} </> );
    return ( <> {votes} </> );
}//VoteCount()

