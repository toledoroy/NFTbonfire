import { IPFS } from "helpers/IPFS";
// import Blockie from "components/Blockie";
import { Persona } from "objects/Persona";

// export const userImage = (hash) => ();   //?
export const PersonaHelper = {
    /** 
     * 
     * @param {*} hash 
     * @returns 
     */
    userImage: (hash) => {
        console.log("PersonaHelper.userImage() Get User Image for UserId: " + hash);
        if (hash) {
            return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`;
        } else {
            return `https://www.gravatar.com/avatar/?s=200&d=identicon`;
        }
    },

};//personaHelper{}

export default PersonaHelper;