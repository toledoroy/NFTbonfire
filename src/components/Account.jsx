import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import Blockie from "./Blockie";
import { Button, Card, Modal } from "antd";
import { Menu, Dropdown } from "antd";
import { useState } from "react";
import Address from "./Address/Address";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
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
};

function Account() {
  const { authenticate, isAuthenticated, logout, account, chainId } = useMoralis();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!isAuthenticated) {
    return (
      <div style={styles.account} onClick={() => authenticate({ signingMessage: "Sign in" })}>
        <p style={styles.text}>Authenticate</p>
      </div>
    );
  }

  return (
    <>
    <Dropdown trigger={['click']} overlay={(
      <Menu style={{padding: "10px", borderRadius: "1rem",}}>
        
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
          <Button size="large" type="primary"
            style={{ width: "100%", borderRadius: "0.5rem", fontSize: "16px", fontWeight: "500", }}
            onClick={() => {logout()}}>
            Disconnect
          </Button>
        </Menu.Item>
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
