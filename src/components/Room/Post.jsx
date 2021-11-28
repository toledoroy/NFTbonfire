import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { useEffect, useState, createElement } from "react";
import { Comment, Tooltip, Avatar, message, Divider, Skeleton } from "antd";
import { DislikeOutlined, LikeOutlined, DislikeFilled, LikeFilled } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import Blockie from "components/Blockie";
// import glStyles from "components/gstyles";
import Votes from "./Votes"
import VotePane from "./VotePane"

const Post = ({post}) => {
    // const { contentId, postId, postOwner } = post;
    // const [postContent, setPosContent] = useState({ title: "default", content: "default" });
    // const { data } = useMoralisQuery("Contents", (query) => query.equalTo("contentId", contentId));
    const [voteStatus, setVoteStatus] = useState();
    const { data:votes } = useMoralisQuery("Relations", (query) => query.equalTo("postId", post.id), [], { live: true });
    console.log("[DEV] Post() Votes:", votes);

    const { walletAddress, contractABI, contractAddress} = useMoralisDapp();
    // const contractABIJson = JSON.parse(contractABI);
    // const contractProcessor = useWeb3ExecuteFunction();

    /*
    useEffect(() => {
      function extractUri(data) {
        const fetchedContent = JSON.parse(JSON.stringify(data, ["contentUri"]));
        const contentUri = fetchedContent[0]["contentUri"];
        return contentUri;
      }
      async function fetchIPFSDoc(ipfsHash) {
        console.log(ipfsHash);
        const url = ipfsHash;
        const response = await fetch(url);
        return await response.json();
      }
      async function processContent() {
        const content = await fetchIPFSDoc(extractUri(data));
        setPosContent(content);
      }
      if (data.length > 0) {
        processContent();
      }
    }, [data]);
    */
    /* MOVED TO VotePane
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
        if (voteStatus) return message.error("You already voted");
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

    //Set Avatar
    let avatar = post.get('image') || <Blockie address={post.get('account')} scale="4" />;
    // <Avatar src={post.get('image')} style={{ height:'66px', width:'66px' }}></Avatar>
    // actions={[<span key="comment-nested-reply-to">Reply to</span>]}
    let actions = [
      <span key="comment-nested-reply-to">Reply</span>,

     
    ];
    //Reload
    return (
      <Skeleton active loading={false}>
        
        <Comment className="comment flex"
          actions={actions}
          author={post.get('account')}
          avatar={<Avatar src={avatar} style={{ height:'66px', width:'66px' }}></Avatar>}
          content={
              <>
              <Text strong style={{ fontSize: "20px", color: "#333" }}>{post.get("name")}</Text>
              <p style={{ fontSize: "15px", color: "#111" }}>{post.get("text")}</p>
              <Divider style={{ margin: "15px 0" }} />
              </>
          }
          /*
          datetime={
            <Tooltip title={moment().format('YYYY-MM-DD HH:mm:ss')}>
              <span>{moment().fromNow()}</span>
            </Tooltip>
          }*/
        >
          <div className="side_pane">
            <Tooltip key="comment-basic-like" title="Vote Up">
                <span onClick={() => vote("voteUp")}>
                  {createElement(voteStatus === "liked" ? LikeFilled : LikeOutlined)}
                </span>
            </Tooltip>
            <div className="vote_count"><Votes postId={post.id}/></div>
            <Tooltip key="comment-basic-dislike" title="Dislike">
                <span onClick={() => vote("voteDown")}>
                  {createElement(voteStatus === "disliked" ? DislikeFilled : DislikeOutlined)}
                </span>
            </Tooltip>
          </div>
        </Comment>


      </Skeleton>
    )//return
}//Post()

export default Post
