// import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

function MenuItems() {
  // const { pathname } = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      // defaultSelectedKeys={["quickstart"]}
      >
      <Menu.Item key="home"><NavLink to="/">Home</NavLink></Menu.Item>
      {/* <Menu.Item key="nftCollections"><NavLink to="/nftCollections">Private Spaces</NavLink></Menu.Item> */}
      <Menu.Item key="personas"><NavLink to="/personas">Users</NavLink></Menu.Item>
      <Menu.Item key="nftCollections"><NavLink to="/nftAll">Private Groups</NavLink></Menu.Item>
      {process?.env?.REACT_APP_ENV==='development' && <Menu.Item key="Collections2"><NavLink to="/collections/0x9e87f6bd0964300d2bde778b0a6444217d09f3c1/0x4">NFTs (T)</NavLink></Menu.Item>}
      {process?.env?.REACT_APP_ENV==='development' && <Menu.Item key="nftSingle"><NavLink to="/nftSingle/0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656/">nftSingle</NavLink></Menu.Item>}
      {/* <Menu.Item key="room"><NavLink to="/room/bgqJwFMexah0ZqkI3Vu9OW5I/">Room</NavLink></Menu.Item> */}
      {process?.env?.REACT_APP_ENV==='development' && <Menu.Item key="persona"><NavLink to="/toledoroy/">Persona (T)</NavLink></Menu.Item>}
      {/* <Menu.Item key="quickstart"><NavLink to="/quickstart">Quick Start</NavLink></Menu.Item> */}
      {/* <Menu.Item key="wallet"><NavLink to="/wallet">Wallet</NavLink></Menu.Item> */}
      {/* <Menu.Item key="onramp"><NavLink to="/onramp">Fiat</NavLink></Menu.Item> */}
      {/* <Menu.Item key="dex"><NavLink to="/1inch">Dex</NavLink></Menu.Item> */}
      {/* {process?.env?.REACT_APP_ENV==='development' && <Menu.Item key="balances"><NavLink to="/erc20balance">Balances</NavLink></Menu.Item>} */}
      {/* <Menu.Item key="transfers"><NavLink to="/erc20transfers">Transfers</NavLink></Menu.Item> */}
      {/* <Menu.Item key="nfts"><NavLink to="/nftBalance">My NFTs</NavLink></Menu.Item> */}
      {process?.env?.REACT_APP_ENV==='development' && <Menu.Item key="contract"><NavLink to="/contract">Contract</NavLink></Menu.Item>}
    </Menu>
  );
}

export default MenuItems;
