import { useEffect, useState, useContext } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import Blockie from "../Blockie";
import { Button, Modal, Menu, Dropdown, message } from "antd";
import Address from "../Address/Address";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import BusinessCard from "components/Persona/BusinessCard";
// import { Persona } from "objects/Persona";
import { PersonaHelper } from "helpers/PersonaHelper";
import __ from "helpers/__";
// import { IPFS } from "helpers/IPFS";
// import { Link } from "react-router-dom";
import { PersonaContext } from "common/context";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";

import Text from "antd/lib/typography/Text";
import { connectors } from "./config";
import Avatar from "antd/lib/avatar/avatar";

const styles = {
  account: {
    height: "42px",
    padding: "0 15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
    borderRadius: "12px",
    backgroundColor: "rgb(244, 244, 244)",
    cursor: "pointer",
  },
  text: {
    color: "#21BF96",
  },
  connector: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "auto",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    padding: "20px 5px",
    cursor: "pointer",
  },
  icon: {
    alignSelf: "center",
    fill: "rgb(40, 13, 95)",
    flexShrink: "0",
    marginBottom: "8px",
    height: "30px",
  },
};

/**
 * Component: Account & Account Management
 */
function Account() {
  const { Moralis, authenticate, isAuthenticated, account, user, chainId, logout } = useMoralis();
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [lastAccount, setLastAccount] = useState(account);  //Remember Last Account
  const { persona:curPersona, setPersona} = useContext(PersonaContext);
  const { NFTpersonas } = useNFTCollections();    // NFTCollections

  //Fetch Personas -- Live Query (This isn't actually live the way you'd expect. DB changes aren't being detected)
  const { data : personas } = useMoralisQuery('Persona', query => query.equalTo("owner", String(account).toLowerCase()), [account], { 
    live: true,
    /* For Some Mysterious Reason This Query is only Reflect DB Changes if these arguments are (and are wrong, playerName does not exist...)  */    //Maybe onLiveCreate
    onCreate: data => console.warn(`${data.attributes.playerName} was just Created`),
    onDelete: data => console.warn(`${data.attributes.playerName} was just Deleted`),
    onUpdate: data => console.warn(`${data.attributes.playerName} was just Updated`),
    // onLiveCreate: data => console.warn(`${data.attributes.token_id} was just Created`),  //Nope
    // onLiveDelete: data => console.warn(`${data.attributes.token_id} was just Deleted`),  //Nope
    // onLiveUpdate: data => console.warn(`${data.attributes.token_id} was just Updated`),  //Nope
  });

  /**
   * Update Persona
   *  Match Persona DB to Chain
   */
  const updatePersonas = async () => {
    //-- Validate
    console.warn("[DEBUG] Account() Match NFT Personas", {NFTpersonas, personas});

    //Match Personas
    for(let persona of NFTpersonas){
      let exist = false;
      for(let DBpersona of personas){
        //Match Perona (chain, token_address, token_id)
        if(DBpersona.get('chain') === persona.chain && DBpersona.get('address') === persona.token_address && DBpersona.get('token_id') === persona.token_id){//Same Persona
          //Check if Up-To-Date (token_uri, owner)    //(Moralis is usually not up to date...)
          if(!__.matchAddr(persona.owner_of, DBpersona?.get('owner')) 
            || !__.matchURI(DBpersona.get('token_uri'), persona.token_uri)
            ){
            //Mismatch - Might need an update
            console.error("[FYI] Account() Data Mismatch -- NFT Needs an Update:"+DBpersona.id+"", {
              DBpersona, persona,
              DBOwner:DBpersona.get('owner'), owner: persona.owner_of, 
              DBURI: DBpersona.get('token_uri') , tokenURI: persona.token_uri,
              matchURI:__.matchURI(DBpersona.get('token_uri'), persona.token_uri)
            });
            let params = {personaId:DBpersona.id};
            // const result = 
            await Moralis.Cloud.run("personaUpdate", params)  //Update
              .catch(error => { 
                if(error.code === 141){
                  console.error("[CAUGHT] Account() Moralis Rate Limit Hit While Calling Cloud.personaRegister()", {error, params}); 
                  //User Message
                  message.error("Woah, slow down. Our moralis hosting plan is overflowing! Please wait a bit and try again", 30);    
                }
                else console.error("[CAUGHT] Account() Cloud.personaRegister() Error:", {error, params}); 
              });
            // console.log("[TEST] Account() personaUpdate Update Result:", {result, params});
          }//Needs Update

          // else console.warn("[TEST] Account() Personas Match:", {DBpersona, persona});

          exist = true;
          break;
        }//Matched Persona
      }//Loop DB Personas
      if(!exist){
        //Set Params
        let params = {
          chain: persona.chain,
          contract: persona.token_address,
          token_id: persona.token_id,
        };
        //Register New Persona
        const result = await Moralis.Cloud.run("personaRegister", params)  //Add
          .catch(error => { console.error("[TEST] Account() personaRegister Error:", {params, error}); });
        console.log("[TEST] Account() personaRegister Result:", {result, params});
      }//Register New Persona
    }//Each Persona
  };//updatePersonas()

  useEffect(() => {
    // console.warn("[TEST] Account() personas:", NFTpersonas, personas);
    //Sync Personas
    if(NFTpersonas.length > 0) updatePersonas();
    //Check if has Any Usable Personas in DB
    if(personas.length > 0){  //All Networks...
      //Recoup Selected Persona
      if(!curPersona){
        // let curPersonaId = user.get('curPersona');
        let curPersonaId = user?.get('last_persona')?.global;
        //Recuperate Last Persona
        if(curPersonaId){
          for(let personaObj of personas){
            if(personaObj.id === curPersonaId){
              setPersona(personaObj);
              // console.log("Account() Setting Last Selected Persona:"+curPersonaId);  //V
              break;
            } 
          }
        }
        else{
          // console.warn("Account() Default to first Persona:"+personas[0].id);  //V
          //Default to First Persona
          setPersona(personas[0]);
        }
      } 
    }//Has Personas 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NFTpersonas, personas, curPersona, user]);  //,curPersona NOT! 

  useEffect(() => { 
    /* Make sure to change User when account changes */
    if(account !== lastAccount){
      setLastAccount(account);
      //Clear Persona
      setPersona(null);

      if(lastAccount!==null){
        // console.log("Account() Account Changed -- Auto Log Out", {account, lastAccount});
        //Log Out
        logout();
      }//Different Account

      /* Alternativly, could link the accounts
      //Another Option is to Link Accounts  //https://docs.moralis.io/moralis-server/web3/web3#linking
      Moralis.link(account, { signingMessage: "Sign this to link your accounts"} );
      console.log("Account() Account Changed -- Account:"+account, Moralis.User.current());
      */
    }//Account Changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  if (!isAuthenticated || !account) {
    return (
      <>
        <div id="account" className="out lightUp" onClick={() => authenticate({ signingMessage: "Sign in [Free]" })}>
          <span className="text">Authenticate</span>
        </div>
        <Modal
          visible={isAuthModalVisible}
          footer={null}
          onCancel={() => setIsAuthModalVisible(false)}
          bodyStyle={{
            padding: "15px",
            fontSize: "17px",
            fontWeight: "500",
          }}
          style={{ fontSize: "16px", fontWeight: "500" }}
          width="340px7"
          >
          <div className="connect" style={{ padding: "10px", display: "flex", justifyContent: "center", fontWeight: "700", fontSize: "20px" }}>
            Connect Wallet
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {connectors.map(({ title, icon, connectorId }, key) => (
              <div
                style={styles.connector}
                key={key}
                onClick={async () => {
                  try {
                    await authenticate({ provider: connectorId });
                    window.localStorage.setItem("connectorId", connectorId);
                    setIsAuthModalVisible(false);
                  } catch (error) { console.error(error); }
                }}
                >
                <img src={icon} alt={title} style={styles.icon} />
                <Text style={{ fontSize: "14px" }}>{title}</Text>
              </div>
            ))}
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
    <Dropdown trigger={['click']} overlay={(
      <Menu className="corner_menu" style={{padding: "10px", borderRadius: "1rem",}}>
        
        <Menu.Item key="title1" className="title">Account</Menu.Item>

        <Menu.Item key="address" style={{padding: '10px'}}>
          <Address avatar="left" size={6} copyable style={{ fontSize: "20px" }} />
        </Menu.Item>

        <Menu.Item key="explorer"> 
          <div style={{ padding: " 10px 0" }}>
            <a href={`${getExplorer(chainId)}/address/${account}`} target="_blank" rel="noreferrer">
              <SelectOutlined style={{ marginRight: "5px" }} />
              View on Explorer
            </a>
          </div>
        </Menu.Item>
        <Menu.Item key="logout" style={{padding: '10px'}}>
          <Button type="primary" size="large" className="main_button button_full" onClick={()=>{logout()}}>
            Disconnect
          </Button>
        </Menu.Item>

        <Menu.Item key="title2" className="title hr">{personas.length===0 ? <span>No Personas</span> : <span>My Personas</span>}</Menu.Item>

        {/* TODO: Add Custom Scroll */}
        {personas.map((persona, index) => (
          <Menu.Item key={"pers"+index} className="persona_select" onClick={(evt) => {}}>
            {/* setPersona(persona) */}
            <BusinessCard key={index} persona={persona} className="item"/> 
          </Menu.Item>
        ))}
        
        <Menu.Item key="persona_add">
          <a href="/persona">
            <Button type="primary" size="large" className="main_button button_full">
              Mint New Persona
            </Button>
          </a>
        </Menu.Item>
       
      </Menu>
      )} placement="bottomRight">
      {/* <a href="#" className="ant-dropdown-link" onClick={e => e.preventDefault()}> */}
        <div id="account" className="account in lightUp" onClick={e => e.preventDefault()}>
          <span className="hash">{getEllipsisTxt(account, 4)}</span>
          {/* <Blockie currentWallet scale={3} /> */}
          <Avatar className='image' src={
            PersonaHelper.getImage(curPersona, <Blockie currentWallet scale={3} size={32} />)
          }  />
        </div>
      {/* </a> */}
    </Dropdown>
    </>
  );
}

export default Account;
