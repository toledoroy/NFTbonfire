import { IPFS } from "helpers/IPFS";
// import Blockie from "components/Blockie";

/**
 * Helper: Common Persona Functions
 */
export const PersonaHelper = {

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
     * Persona's Main Image
     * @var ParseObject persona 
     * @var any defaultValue
     */
    getImage(persona, defaultValue){
        if(!defaultValue) defaultValue = 
            // "https://joeschmoe.io/api/v1/random";
            "https://images.unsplash.com/photo-1636716642701-01754aef1066?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80";  //Random Dark Lady
            // "https://ipfs.moralis.io:2053/ipfs/QmZ2oHHLUUARUTz3Jx2wSWYTtALUtEhQtT1hpxb7Fbvr5y";   //Anon in hood
            // "https://ipfs.moralis.io:2053/ipfs/QmWyKVFkUCfwUFQZyKjJ9ifqyWatUFStMi8B3MtT3CkhyP";   //Anon logo
            // "https://ipfs.moralis.io:2053/ipfs/Qmb815LdiYx28rQkXnNKoNyscxejuUsJ1RYkHesftpM5g5";      //Anon Circle
            // "https://cloudflare-ipfs.com/ipfs/Qmb815LdiYx28rQkXnNKoNyscxejuUsJ1RYkHesftpM5g5";    //Anon Badge
            // <Blockie scale={8} avatar currentWallet style />
        return IPFS.resolveLink(persona?.get('metadata')?.image) || defaultValue;
    },

    getName(persona){
        return persona?.get('metadata')?.name_first ? persona.get('metadata').name_first : persona?.get('metadata')?.name ;
    },
    getNameFull(persona){
        return persona?.get('metadata')?.name;
    },
    /**
     * Persona's Cover Image
     * @var ParseObject persona 
     * @var any defaultValue
     */
    getCover(persona, defaultValue){
        return IPFS.resolveLink(persona?.get('metadata')?.cover) || defaultValue;
    },

    isNew(persona){ return (!persona?.get('token_id'))},

};//personaHelper{}

export default PersonaHelper;