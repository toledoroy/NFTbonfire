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

    stackContainerStyle: (length) => {
      let style = {};
      if(length && length > 1){
        let len = (length < 4) ? length : 4;  //Max of 4 in a stack
        style.transform = "rotate(-"+5*(len-1)+"deg)";
      } 
      return style;
    }

};

export default __;