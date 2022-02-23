import { useEffect, useState } from "react";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { ChainHelper } from "helpers/ChainHelper";
import { useChain } from "react-moralis";
// import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from "./Logos";
// import { getChainLogo } from "helpers/networks";    //Usage: getChainLogo("0x1")

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
};

const allChains = ChainHelper.allChainsData();

/**
 * Component: Chain Changer
 */
function Chains(props) {
  const { switchNetwork, chainId } = useChain();   //chain
  const [selected, setSelected] = useState({});
  //Filter
  // const menuItems = allChains.filter((chainData) => (chainData.key == chainId || chainData.supported && (chainData.live || process?.env?.REACT_APP_ENV==='development')));
  const menuItems = allChains.filter((chainData) => (chainData.key == chainId || chainData.supported || (chainData.live || process?.env?.REACT_APP_ENV === 'development')));  //Current, Supported, Live or in Dev mode
  // const menuItems = allChains.filter((chainData) => (chainData.key === chainId || chainData.supported));   //This Allows Test Networks on Production
  // const menuItems = allChains.filter((chainData) => (chainData.key === chainId || chainData.key === '0xa869'));   //Avax Testnet Only
  const showName = (props?.showName !== false);
  const showIcon = (props?.showIcon !== false);
  const showArrow = (props?.showArrow !== false);
  // console.log("chain", chain);

  useEffect(() => {
    if (!chainId) return null;
    const newSelected = menuItems.find((item) => item.key === chainId);
    setSelected(newSelected);
    // console.log("current chainId: ", chainId);
  }, [chainId, menuItems]);

  const handleMenuClick = (e) => {
    console.log("switch to: ", e.key);
    switchNetwork(e.key);
    //Run Custom Function
    if (props.onChange) props.onChange(e.key);
  };

  const menu = menuItems.length < 2 ? '' : (
    <Menu onClick={handleMenuClick}>
      {menuItems.map((item) => {
        return (
          <Menu.Item key={item.key} icon={item.icon} style={styles.item} className="item">
            <span style={{ marginLeft: "5px" }}>{item.name}</span>
          </Menu.Item>
        )
      })}
    </Menu>
  );

  let className = menuItems.length > 1 ? "chainSelect lightUp" : "chainSelect";
  return (
    <div>
      <Dropdown overlay={menu} trigger={["click"]}>
        {/* <Button className="chainSelect" key={selected?.key} icon={selected?.icon} style={{ ...styles.button, ...styles.item }}> */}
        <Button className={className} key={selected?.key}
          icon={showIcon ? selected?.icon : ''}
          title={showName ? 'Change Chain' : selected?.name}
        >
          {showName && <span style={{ marginLeft: "5px" }}>{selected?.name}</span>}
          {(showArrow && menuItems.length > 1) && <DownOutlined />}
        </Button>
      </Dropdown>
    </div>
  );
}

export default Chains;
