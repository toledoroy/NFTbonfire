import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import Blockie from "../Blockie";
import { Button, Card, Modal } from "antd";
import { Menu, Dropdown } from "antd";
import { useEffect, useState } from "react";
import Address from "../Address/Address";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import BusinessCard from "components/Persona/BusinessCard";
import { Persona } from "objects/Persona";
import { Link } from "react-router-dom";

import Text from "antd/lib/typography/Text";
import { connectors } from "./config";

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

function Account() {
  const { Moralis, authenticate, isAuthenticated, account, chainId, logout, web3 } = useMoralis();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [lastAccount, setLastAccount] = useState(account);  //Remember Last Account
  const [personas, setPersonas] = useState([]);

  useEffect(() => { 
    /* Make sure to change User when account changes */
    if(account !== lastAccount){
      if(lastAccount!==null) console.log("Account() Account Changed -- Auto Log Out", {account, lastAccount});
      setLastAccount(account);
      if(lastAccount!==null) logout();
      /* Alternativly, You can link the accounts
      //Another Option is to Link Accounts  //https://docs.moralis.io/moralis-server/web3/web3#linking
      Moralis.link(account, { signingMessage: "Sign this to link your accounts"} );
      console.log("Account() Account Changed -- Account:"+account, Moralis.User.current());
      */


      //Test Personas
      // const personas = [];
      const query = new Moralis.Query(Persona);
      // query.equalTo("account", handle).find().then((results) => {
      query.find().then((results) => {setPersonas(results); console.log("Personas:", results);  });
    }
  }, [account]);

  if (!isAuthenticated) {
    return (
      <>
        <div style={styles.account} 
          onClick={() => authenticate({ signingMessage: "Sign in" })}
          //onClick={() => setIsAuthModalVisible(true)}
          >
          <p style={styles.text}>Authenticate</p>
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
          width="340px"
        >
          <div style={{ padding: "10px", display: "flex", justifyContent: "center", fontWeight: "700", fontSize: "20px" }}>
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
                  } catch (e) {
                    console.error(e);
                  }
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
        <div className="title">Account</div>
        <Menu.Item style={{padding: '10px'}}>
          <Address avatar="left" size={6} copyable style={{ fontSize: "20px" }} />
        </Menu.Item>

        <Menu.Item>
          <div style={{ padding: " 10px 0" }}>
            <a href={`${getExplorer(chainId)}/address/${account}`} target="_blank" rel="noreferrer">
              <SelectOutlined style={{ marginRight: "5px" }} />
              View on Explorer
            </a>
          </div>
        </Menu.Item>
        <Menu.Item style={{padding: '10px'}}>
          <Button size="large" type="primary" onClick={()=>{logout()}}
            style={{ width: "100%", borderRadius: "0.5rem", fontSize: "16px", fontWeight: "500", }}>
            Disconnect
          </Button>
        </Menu.Item>
        
        <hr />
        {!personas ? <div className="title">No Personas</div> : <div className="title">Personas</div>}

        {personas.map((persona, index) => (
          <Menu.Item key={"pers"+index}>
            <BusinessCard key={index} persona={persona} className="item"/> 
          </Menu.Item>
        ))}
       
        <Menu.Item key="persona_add">
            <Link key="link" to={{ pathname:'/persona' }} className="inner flex">
              <Button size="large" type="primary" onClick={()=>{logout()}}
                style={{ width: "100%", borderRadius: "0.5rem", fontSize: "16px", fontWeight: "400", }}>
                Mint New Persona
              </Button>
            </Link>
        </Menu.Item>
        {/* <hr /> */}
        
      </Menu>
      )} placement="bottomRight">
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <div style={styles.account} onClick={() => setIsModalVisible(true)}>
          <p style={{ marginRight: "5px", ...styles.text }}>{getEllipsisTxt(account, 6)}</p>
          <Blockie currentWallet scale={3} />
        </div>
      </a>
    </Dropdown>
    
      {/*
      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        bodyStyle={{
          padding: "15px",
          fontSize: "17px",
          fontWeight: "500",
        }}
        style={{ fontSize: "16px", fontWeight: "500" }}
        width="400px"
      >
        Account
        <Card style={{marginTop: "10px", borderRadius: "1rem",}} bodyStyle={{ padding: "15px" }} >
          <Address avatar="left" size={6} copyable style={{ fontSize: "20px" }} />
          <div style={{ marginTop: "10px", padding: "0 10px" }}>
            <a href={`${getExplorer(chainId)}/address/${account}`} target="_blank" rel="noreferrer">
              <SelectOutlined style={{ marginRight: "5px" }} />
              View on Explorer
            </a>
          </div>
        </Card>
        <Button size="large" type="primary"
          style={{ width: "100%", marginTop: "10px", borderRadius: "0.5rem", fontSize: "16px", fontWeight: "500", }}
          onClick={() => {
            logout();
            setIsModalVisible(false);
          }}
          >
          Disconnect Wallet
        </Button>
      </Modal>
        */}
    </>
  );
}

export default Account;
