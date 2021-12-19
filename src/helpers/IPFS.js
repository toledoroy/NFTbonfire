// const Moralis = require("moralis/node");
// Moralis.enableWeb3();


//Export IPFS Helper
export const IPFS = {
    
    resolveLink(url){
        if (!url || !url.includes("ipfs://")) return url;
        return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
    },
    

    /** ...Needs Moralis...
     * Save JSON File to IPFS
     * /
     saveJSONToIPFS: async (jsonObject) => {
        //Save Metadata to IPFS
        const file = new Moralis.File("file.json", {base64 : btoa(JSON.stringify(jsonObject))});
        file.saveIPFS().then(result => {
            console.log("[DEV] PersonaEdit() IPFS Hash for Metadata:", {
                // result, 
                hash:result.hash(), 
                hash2:file.hash(), 
                // jsonObject,
            });
        })
        .catch(function(error) { console.error("[CAUGHT] PersonaEdit() IPFS Call Failed:", {error, user, user2:Moralis.User.current() }); });
    }
    */

    
    /**
     * Fetch File From IPFS by Hash (Works with JSON Filed)
     * @param string ipfsHash 
     * @returns object
     */
    fetchJSONFromIPFS: async (ipfsHash) => {
        const url = `https://ipfs.moralis.io:2053/ipfs/${ipfsHash}`;
        const response = await fetch(url);
        return await response.json();
    },

    /** Doesn't Work Here...
     * Save JSON File to IPFS
     * @var object jsonObject
     * @ret string URL
     * /
    saveJSONToIPFS:  async (jsonObject) => {
        //Save Metadata to IPFS
        const file = new Moralis.File("file.json", {base64 : btoa(JSON.stringify(jsonObject))});
        return file.saveIPFS().then(result => {
            //Return IPFS URL
            // return result.ipfs();    //Moralis URL
            return "ipfs://" + result.hash();   //General IPFS Conventional URL
        });
        // .catch(function(error) { console.error("[CAUGHT] PersonaEdit() IPFS Call Failed:", {error, user }); });
    },
    */


};

export default IPFS;