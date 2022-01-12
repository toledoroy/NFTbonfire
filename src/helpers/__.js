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
    },//sanitize()

    nl2br: (str) => { return !str ? str : str.replace(/(?:\r\n|\r|\n)/g, '<br/>')},

    stripHTML: (str) => {return !str ? str : str.replace(/<[^>]*>?/gm, '')},

};

export default __;