import { useMoralis } from "react-moralis";
import { useMoralisQuery } from "react-moralis";
import { useEffect, useState, createElement } from "react";
import { Tooltip, message, } from "antd";
// import { Comment, Avatar, Divider, Skeleton } from "antd";
// import { DislikeOutlined, LikeOutlined, DislikeFilled, LikeFilled } from "@ant-design/icons";
import { UpOutlined, DownOutlined, CaretUpFilled, CaretDownFilled } from "@ant-design/icons";
// import Text from "antd/lib/typography/Text";
// import Blockie from "components/Blockie";
// import glStyles from "components/gstyles";

const VotePane = (props) => {
    const { post } = props;
    const { Moralis, user } = useMoralis();
    const [voteStatus, setVoteStatus] = useState();

    //Live Query - Current Relation
    const { data : relations } = useMoralisQuery("Relation", 
        query => query.select('opinion').equalTo("user", user).equalTo("entity", post.id).limit(1), [],  {live: true,});
    //Extract Current Opinion (of Current User)
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
        // console.log("[DEV] VotePane() Running Moralis Cloud Func 'postVote':", {postId:post.id, vote, voteStatus});
        if(vote === voteStatus) vote = 0;   //Undo Current Vote (Neutral)
        //Vote
        Moralis.Cloud.run("postVote", {postId:post.id, vote}).catch(error => {
            console.error("Post() Error while Saving Vote", {error, postId:post.id, vote});
            message.error("Sorry, Something went wrong and your vote did not go through");
        });
    }//vote()

    return (
        <div className="side_pane">
            <Tooltip key="comment-basic-like" title="Great!" placement="right">
                <span onClick={(evt) => vote(1)}>
                    {/* {createElement(voteStatus === 1 ? LikeFilled : LikeOutlined)} */}
                    {createElement(voteStatus === 1 ? CaretUpFilled : UpOutlined)}
                    {/* TODO! It would probably be better to just change Color... */}
                </span>
            </Tooltip>
            <div className="vote_count">
                <VoteCount postId={post.id}/> 
                {/* {post.get('votes') || '0'}  */}
            </div>
            <Tooltip key="comment-basic-dislike" title="I Don't Like This" placement="right">
                <span onClick={(evt) => vote(-1)}>
                    {/* {createElement(voteStatus === -1 ? Disl?ikeFilled : DislikeOutlined)} */}
                    {createElement(voteStatus === -1 ? CaretDownFilled : DownOutlined)}
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
    //Live Query
    // const { data : votes } = useMoralisQuery("Relations", (query) => query.equalTo("postId", postId), [], { live: true });
    const { data : posts } = useMoralisQuery("Post", 
        // query => query.select('votes').equalTo("objectId", sId).limit(1), [],  { live: true,
        query => query.select('score').equalTo("objectId", postId).limit(1), [],  { live: true,
        // onLiveUpdate: (entity, all) => all.map(e => (e.id === entity.id ? entity : e))
    });
    let votes = posts.length > 0 ? posts[0].get('score') ? posts[0].get('score') : 0 : 0;
    //Log
    // console.warn("[TEST] VoteCount() Score:"+votes+" for Post ID:"+posts[0]?.id, {votes, posts});    //V
    return ( <> {votes} </> );
}//VoteCount()

