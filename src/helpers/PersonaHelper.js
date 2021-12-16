// import Blockie from "components/Blockie";

// export const userImage = (hash) => ();   //?
export const PersonaHelper = {

    userImage: (hash) => {
        console.log("PersonaHelper.userImage() Get User Image for UserId: " + hash);
        if (hash) {
            return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`;
        } else {
            return `https://www.gravatar.com/avatar/?s=200&d=identicon`;
        }
    },

    /**
     * Get main image from metadata
     * @param object metadata 
     * @returns string      Image URL
     */
    getImage: (metadata) => {
        let url = metadata?.image ? metadata.image : "https://joeschmoe.io/api/v1/random";
        return url;
    },
    /**
     * Get Cover Image from Metadata
     * @param {*} metadata 
     * @returns 
     */
    getCover: (metadata) => {
        let url = metadata?.cover ? metadata.cover : "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";
        return url;
    },
};//personaHelper{}

export default PersonaHelper;