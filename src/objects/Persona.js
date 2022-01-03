const Moralis = require("moralis/node");

/**
 * Object: Persona
 */ 
export const Persona = Moralis.Object.extend("Persona", 
    { /* Instance Methods */
        /**
         * Get Requested Property from Metadata & Fallback to Defaults if Not Found
         * @returns 
         */
        // getFallback(property){ return this.get('metadata')?.[property] || personaDefaultMetadata[property]; },
        getFallback(property){ return this.get('metadata')?.[property] || Persona.getDefaultMetadata()?.[property]; },
        /**
         * Link to Persona
         */
        getLink(){
            let handle = this.get('handle');
            let pathname = handle ? "/"+handle : "/persona/"+this.get('chain')+"/"+this.get('token_address')+"/"+this.get('token_id');
            return pathname;
        }
    }, 
    { /* Class Methods */
        //Persona Data
        contractPersona: {
            abi: require('contracts/abi/PERSONA.json'),     //Default ABI
            "0x4": { address: '0x9E91a8dDF365622771312bD859A2B0063097ad34', },  //Rinkeby
        },
        //Contract Data
        getContractData(chain){ return (chain) ? this.contractPersona[chain] : this.contractPersona; },
        //Get ABI
        getABI(chain){ return (this.contractPersona[chain]?.abi) ? this.contractPersona[chain].abi : this.contractPersona.abi; },
        //Get Contract Address
        getContractAddress(chain){ return (this.contractPersona[chain]?.address) ? this.contractPersona[chain].address : null; },
        //Default Metadata (Random)
        getDefaultMetadata(){  return personaDefaultMetadatas[Math.floor(Math.random()*personaDefaultMetadatas.length)]; },
    }
); //Personas

//-- ASSETS

//Default Persona Details
const personaDefaultMetadatas = [
    /* Satoshi
    {
        // username: handle,   //Internal User Handle (Slug)           //This Should Be Somewhere Else... 
        // name: "Satoshi",
        "firstname": "Satoshi",
        "lastname": "Nakamoto",
        "role": "Inventor",
        "image": "https://images.unsplash.com/photo-1636716642701-01754aef1066?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
        "cover": "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
        "description": "I'm a rather cryptic fellow",
        "location": {
            "name":"Seattle, WA",
            "latitude": 47.60275857601884,
            "longitude": -122.33726455335282,
        },
        "social": {
            // twitter: "toledoroy",
            // facebook: "toledoroy",
            // github: "toledoroy",
        },
        "links": [
            {
                "type": "website",
                "title": "My Block Explorer",
                "url": "https://www.blockchain.com/explorer?view=btc",
            },
        ],
        "attributes": [	//OpenSea		https://docs.opensea.io/docs/metadata-standards
            {
                "trait_type": "Passion", 
                "value": "Cryptography",
            },
            {
                "trait_type": "Love", 
                "value": "Dogs",
            },
            {
                "trait_type": "Aqua Power", 
                "value": 40,
    
                "display_type": "boost_number",     //"number", "boost_number", "boost_percentage"
            },
        ],
        accounts: [
            {
                "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                "chain": "bitcoin",
            },
        ],
    },
    */
    /* Anonymous */
    {
        // username: handle,   //Internal User Handle (Slug)           //This Should Be Somewhere Else... 
        "name": "Anonymous",
        "role": "Hacker",
        // "image": "https://images.unsplash.com/photo-1636716642701-01754aef1066?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",  //Random Dark Lady
        "image": "https://ipfs.moralis.io:2053/ipfs/QmZ2oHHLUUARUTz3Jx2wSWYTtALUtEhQtT1hpxb7Fbvr5y",   //Anon in hood
        // "image": "https://ipfs.moralis.io:2053/ipfs/QmWyKVFkUCfwUFQZyKjJ9ifqyWatUFStMi8B3MtT3CkhyP",      //Anon logo
        "cover": "https://images.unsplash.com/photo-1625425423233-51f40e90da78?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
        "description": "We are legion",
        "location": "World Wide",
        // "location": {
            // "name":"World Wide", latitude: 0, longitude: 0,
            // name:"Seattle, WA", latitude: 47.60275857601884, longitude: -122.33726455335282,
        // },
        "social": {
            // "twitter": "toledoroy",
            // "facebook": "toledoroy",
            // "github": "toledoroy",
            // "linkedin": "toledoroy",
            // "instagram": "toledoroy",
            "youtube": "AnonymousWorldvoce",
            // "medium": "toledoroy",
            "twitter": "YourAnonNews",
            // "twitter": "YourAnonCentral",           //TODO: Should Probably Allow Multiple
        },
        "links": [
            {
                type: "page",
                title: "Wikipedia",
                url: "https://en.wikipedia.org/wiki/Anonymous_(hacker_group)",
            },
            {
                type: "media",
                title: "News: donate $75M in Bitcoin",
                url: "https://thenextweb.com/news/anonymous-supposedly-resurfaces-to-donate-75m-in-bitcoin-to-privacy-tech",
            },
        ],
        "attributes": [	//OpenSea		https://docs.opensea.io/docs/metadata-standards
            {
                "trait_type": "Base", 
                "value": "Everywhere",
            },
            {
                "trait_type": "Power", 
                "value": "10",
            },
            {
                "trait_type": "Size", 
                "value": 100,
    
                "display_type": "boost_percentage",     //"number", "boost_number", "boost_percentage"
            },
        ],
        "accounts": [
        //     {
        //         "address": "0x874a6E7F5e9537C4F934Fa0d6cea906e24fc287D",
        //         "chain": "0x4",
        //     },
        //     {
        //         "address": "0x874a6E7F5e9537C4F934Fa0d6cea906e24fc287D",
        //         "chain": "0x1",
        //     },
        //     {
        //         "address": "0x8b08BDA46eB904B18E8385F1423a135167647cA3",
        //         "chain": "0x1",
        //     },
        ],
    }
];