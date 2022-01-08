import { IPFS } from "helpers/IPFS";
// import Blockie from "components/Blockie";
// import { Persona } from "objects/Persona";

export const PersonaHelper = {
    /** 
     * 
     * @param {*} hash 
     * @returns 
     */
    userImage: (hash) => {
        console.warn("[DEPRECATED] PersonaHelper.userImage() Get User Image for UserId: " + hash);
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
        // console.warn("PersonaHelper.getLink() Pathname: ", {handle, persona, pathname});
        return pathname;
    },

    /**
     * Link to Persona
     */
    getGUID(persona){
        return persona ? 
            persona.get('chain') + ':' + 
            persona.get('address') + ':' + 
            persona.get('token_id')
            : null;
    },

    /**
     * Link to Persona
     */
    getLink(persona){
        let handle = persona.get('handle');
        let pathname = handle ? "/"+handle : "/personatoken/"+persona.get('chain')+"/"+persona.get('address')+"/"+persona.get('token_id');
        // console.warn("PersonaHelper.getLink() Pathname: ", {handle, persona, pathname});
        return pathname;
    },
    
    /**
     * Persona's Main Image
     * @var ParseObject persona 
     * @var any defaultValue
     */
    getImage(persona, defaultValue){
        if(!defaultValue) defaultValue = 
            // "https://joeschmoe.io/api/v1/random";
            "https://images.unsplash.com/photo-1636716642701-01754aef1066?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80";  //Random Dark Lady
            // "https://ipfs.moralis.io:2053/ipfs/QmZ2oHHLUUARUTz3Jx2wSWYTtALUtEhQtT1hpxb7Fbvr5y";   //Anon in hood
            // "https://ipfs.moralis.io:2053/ipfs/QmWyKVFkUCfwUFQZyKjJ9ifqyWatUFStMi8B3MtT3CkhyP";      //Anon logo
        return IPFS.resolveLink(persona?.get('metadata')?.image) || defaultValue;
    },

    isNew(persona){ return (!persona.get('token_id'))},

};//personaHelper{}

export default PersonaHelper;