import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { useEffect, useState, createElement } from "react";
import { Comment, Tooltip, Avatar, message, Divider, Skeleton } from "antd";
import { DislikeOutlined, LikeOutlined, DislikeFilled, LikeFilled } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import Blockie from "components/Blockie";
// import glStyles from "components/gstyles";
import Votes from "./Votes"

const VotePane = ({post}) => {
    // const [postContent, setPosContent] = useState({ title: "default", content: "default" });
    // const { data } = useMoralisQuery("Contents", (query) => query.equalTo("contentId", contentId));
    const [voteStatus, setVoteStatus] = useState();
    // const { data:votes } = useMoralisQuery("Relations", (query) => query.equalTo("postId", postId), [], { live: true });
    // console.log("[DEV] Post() Votes:", votes);

    // const { walletAddress, contractABI, contractAddress} = useMoralisDapp();
    const { walletAddress} = useMoralisDapp();
    // const contractABIJson = JSON.parse(contractABI);
    // const contractProcessor = useWeb3ExecuteFunction();
    /*
    useEffect(() => {
        if (!votes?.length) return null;

        async function getPostVoteStatus() {
            const fetchedVotes = JSON.parse(JSON.stringify(votes));
            fetchedVotes.forEach(({ voter, up }) => {
            if (voter === walletAddress) setVoteStatus(up ? "liked" : "disliked");
            });
            return;
        }

        getPostVoteStatus();
    }, [votes, walletAddress]);
    */

    async function vote(direction){
        if (walletAddress.toLowerCase() === post.get('account').toLowerCase()) return message.error("C'mon, this is your post");
        // if (voteStatus) return message.error("You already voted");
        /*
        const options = {
            contractAddress: contractAddress,
            functionName: direction,
            abi: contractABIJson,
            params: {
              _postId: post["postId"],
              [direction === "voteDown" ? "_reputationTaken" : "_reputationAdded"]: 1,
            },
          };
          await contractProcessor.fetch({
            params: options,
            onSuccess: () => console.log("success"),
            onError: (error) => console.error(error),
          });
          */
    }//vote()

    //Reload
    return (
        <div className="side_pane">
            <Tooltip key="comment-basic-like" title="Vote Up">
                <span onClick={() => vote("voteUp")}>
                    {createElement(voteStatus === "liked" ? LikeFilled : LikeOutlined)}
                </span>
            </Tooltip>
            <div className="vote_count"><Votes postId={post.id}/> {post.get('votes') || '0'} </div>
            <Tooltip key="comment-basic-dislike" title="Dislike">
                <span onClick={() => vote("voteDown")}>
                    {createElement(voteStatus === "disliked" ? DislikeFilled : DislikeOutlined)}
                </span>
            </Tooltip>
        </div>
    )//return

}//VotePane()

export default VotePane;
