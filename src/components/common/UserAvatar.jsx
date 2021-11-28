import { Image, Avatar } from "antd";
import Blockie from "components/Blockie";

function UserAvatar (props) {
    if(props.image) return (<Avatar src={props.image} style={{ height:'var(--avatarMD)', width:'var(--avatarMD)', marginLeft:'-60px'}}></Avatar>);
    //Default image for current user
    return (
        <>
        {/* <Avatar src={convo.get('image')} style={{ height:'var(--avatarMD)', width:'var(--avatarMD)', marginLeft:'-60px'}}></Avatar> */}
        </>
    );
}//UserAvatar()

export default UserAvatar;