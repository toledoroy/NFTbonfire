import { useEffect, useState } from "react";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
// import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from "./Logos";
import { useChain } from "react-moralis";
// import { getChainLogo } from "helpers/networks";    //Usage: getChainLogo("0x1")
import { ChainHelper } from "helpers/ChainHelper";

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    fontWeight: "500",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    padding: "0 10px",
  },
  // button: {
  //   border: "2px solid rgb(231, 234, 243)",
  //   borderRadius: "12px",
  // },
};


const allChains = ChainHelper.allChainsData();

/**
 * Component: Chain Changer
 */
function Chains() {
  const { switchNetwork, chainId } = useChain();   //chain
  const [selected, setSelected] = useState({});
  //Filter
  // const menuItems = allChains.filter((chainData) => (chainData.key == chainId || chainData.supported && (chainData.live || process?.env?.NODE_ENV==='development')));
  const menuItems = allChains.filter((chainData) => (chainData.key === chainId || chainData.supported));   //This Allows Test Networks on Production

  // console.log("chain", chain);

  useEffect(() => {
    if (!chainId) return null;
    const newSelected = menuItems.find((item) => item.key === chainId);
    setSelected(newSelected);
    console.log("current chainId: ", chainId);
  }, [chainId]);

  const handleMenuClick = (e) => {
    console.log("switch to: ", e.key);
    switchNetwork(e.key);
  };

  const menu = menuItems.length < 2 ? '' : (
    <Menu onClick={handleMenuClick}>
      {menuItems.map((item) => { 
        return (
          <Menu.Item key={item.key} icon={item.icon} style={styles.item}>
            <span style={{ marginLeft: "5px" }}>{item.name}</span>
          </Menu.Item>
        )
      })}
    </Menu>
  );

  let className = menuItems.length > 1 ? "chainSelect lightUp" :"chainSelect"; 
  return (
    <div>
      <Dropdown overlay={menu} trigger={["click"]}>
        {/* <Button className="chainSelect" key={selected?.key} icon={selected?.icon} style={{ ...styles.button, ...styles.item }}> */}
        <Button className={className} key={selected?.key} icon={selected?.icon}>
          <span style={{ marginLeft: "5px" }}>{selected?.name}</span>
          {menuItems.length>1 && <DownOutlined />}
        </Button>
      </Dropdown>
    </div>
  );
}

export default Chains;
