import Blockie from "components/Blockie";

// export const userImage = (hash) => ();   //?
export const PersonaHelper = {
    userImage: (hash) => {
        if (hash) {
            return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`;
        } else {
            return `https://www.gravatar.com/avatar/?s=200&d=identicon`;
        }
    },
};//personaHelper{}

export default PersonaHelper;