//Export General Helper
export const __ = {
    sanitize: (str) => {
        try{
          return str.toString().replace(/_/g, ' '); 
        }
        catch(err){
          console.error("__.sanitize() Error sanitizing metadata field:", {str, err});
          return str;
        }
    }//sanitize()
};

export default __;