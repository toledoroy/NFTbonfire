import { useMoralis } from "react-moralis";
import { IPFS } from "helpers/IPFS";

/**
 * Hook
 */
export const useIPFS = () => {
  const { Moralis } = useMoralis();

  /**
   * Resolve IPFS Link (if link is IPFS)
   * @param {*} url 
   * @returns string
   */
  const resolveLink = (url) => IPFS.resolveLink(url); 
  // {
  //   if (!url || !url.includes("ipfs://")) return url;
  //   return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
  // };

  /**
   * Save JSON File to IPFS
   */
  const saveJSONToIPFS = async (jsonObject, fileName="file.json") => {
      //Save Metadata to IPFS
      const file = new Moralis.File(fileName, {base64 : btoa(JSON.stringify(jsonObject))});
      return file.saveIPFS().then(result => {
          console.log("[DEV] IPFS.saveJSONToIPFS() IPFS Hash for Metadata:", {
              // result, 
              hash:result.hash(), 
              hash2:file.hash(), 
              // jsonObject,
          });
          //Return IPFS URL
          // return result.ipfs();    //Moralis URL
          return "ipfs://" + result.hash();   //General IPFS Conventional URL
      });
      // .catch(function(error) { console.error("[CAUGHT] IPFS.saveJSONToIPFS() IPFS Call Failed:", {error, user:Moralis.User.current() }); });
  };
      
  /**
   * Save Image file to IPFS
   * @var object image
   * @ret string imageFile
   * @ret string URL
   */
   const saveImageToIPFS = async (image, fileName="image.png") => {
      // const data = fileInput.files[0]
      // const file = new Moralis.File(data.name, data)
      const file = new Moralis.File(fileName, image);

      //Save File to Object
      // const jobApplication = new Moralis.Object('Applications')
      // jobApplication.set('resume', file)

      //Save Image to IPFS
      await file.saveIPFS();
      //Format as a Conventional IPFS URL
      let url = "ipfs://" + file.hash();
      //Return URL
      return url;
  };

  return { resolveLink, saveJSONToIPFS, saveImageToIPFS };

}
