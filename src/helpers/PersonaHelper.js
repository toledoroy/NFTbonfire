// import { IPFS } from "helpers/IPFS";
// import Blockie from "components/Blockie";
// import { Persona } from "objects/Persona";

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

    /**
     * Link to Persona
     */
    getLink(persona){
        let handle = persona.get('handle');
        let pathname = handle ? "/"+handle : "/personatoken/"+persona.get('chain')+"/"+persona.get('address')+"/"+persona.get('token_id');
        console.warn("PersonaHelper.getLink() Pathname: ", {handle, persona, pathname});
        return pathname;
    },

    isNew(persona){ return (!persona.get('token_id'))},

};//personaHelper{}

export default PersonaHelper;