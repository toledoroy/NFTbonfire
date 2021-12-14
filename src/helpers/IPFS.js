//Export IPFS Helper
export const IPFS = {
    /*
    sanitize: (str) => {
        try{
          return str.toString().replace(/_/g, ' '); 
        }
        catch(err){
          console.error("IPFS.sanitize() Error sanitizing metadata field:", {str, err});
          return str;
        }
    }//sanitize()
    */

    
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
    }


};

export default IPFS;