import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect } from "react-router-dom";
import Account from "components/Account";
import Chains from "components/Chains";
// import TokenPrice from "components/TokenPrice";
import ERC20Balance from "components/ERC20Balance";
// import ERC20Transfers from "components/ERC20Transfers";
// import InchDex from "components/InchDex";
import NFTBalance from "components/NFTBalance";
import Wallet from "components/Wallet";
// import { Menu, Layout, Button, Skeleton } from "antd";
import { Menu, Layout, Skeleton } from "antd";
import "antd/dist/antd.css";
import NativeBalance from "components/NativeBalance";
import "./style.css";
// import QuickStart from "components/QuickStart";
import Contract from "components/Contract/Contract";
import Text from "antd/lib/typography/Text";
import Ramper from "components/Ramper";
//Pages
// import NFTSingle from "components/NFTSingle";
import NFTCollections from "components/NFTCollections";
import RoomPage from "components/RoomPage";
import PagePersona from "components/PagePersona";
import Page404 from "components/Page404";

const { Header, Footer } = Layout;
const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",
    marginTop: "130px",
    padding: "10px",
  },
  header: {
    position: "fixed",
    zIndex: 100,
    width: "100%",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};
const App = ({ isServerInfo }) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

//quickstart
  return (
    <Layout style={{ height: "100vh", overflow: "auto" }}>
      {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" /> */}
      {/* <script src="https://kit.fontawesome.com/62e94cb93f.js" crossorigin="anonymous"></script> */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />
      <Router>
        <Header style={styles.header}>
        <div style={{ display: "flex" }}><Logo /></div>
          <Menu
            theme="light"
            mode="horizontal"
            style={{
              display: "flex",
              fontSize: "17px",
              fontWeight: "500",
              width: "100%",
              justifyContent: "center",
            }}
            // defaultSelectedKeys={["quickstart"]}
          >
            {/* <Menu.Item key="quickstart"><NavLink to="/quickstart">? Quick Start</NavLink></Menu.Item> */}
            <Menu.Item key="wallet"><NavLink to="/wallet">? Wallet</NavLink></Menu.Item>
            {/* <Menu.Item key="onramp"><NavLink to="/onramp">? Fiat</NavLink></Menu.Item> */}
            {/* <Menu.Item key="dex"><NavLink to="/1inch">? Dex</NavLink></Menu.Item> */}
            <Menu.Item key="balances"><NavLink to="/erc20balance">? Balances</NavLink></Menu.Item>
            {/* <Menu.Item key="transfers"><NavLink to="/erc20transfers">? Transfers</NavLink></Menu.Item> */}
            
            <Menu.Item key="nftCollections"><NavLink to="/nftCollections">NFTs</NavLink></Menu.Item>
            <Menu.Item key="nftCollections2"><NavLink to="/nftCollections/0x9e87f6bd0964300d2bde778b0a6444217d09f3c1">NFTs 2</NavLink></Menu.Item>
            <Menu.Item key="nftSingle"><NavLink to="/nftSingle/0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656/">nftSingle</NavLink></Menu.Item>
            <Menu.Item key="room"><NavLink to="/room/bgqJwFMexah0ZqkI3Vu9OW5I/">Room</NavLink></Menu.Item>
            <Menu.Item key="persona"><NavLink to="/toledoroy/">Persona</NavLink></Menu.Item>
            
            <Menu.Item key="nfts"><NavLink to="/nftBalance">? NFTs</NavLink></Menu.Item>
            <Menu.Item key="contract"><NavLink to="/contract">? Contract</NavLink></Menu.Item>
          </Menu>
          <div style={styles.headerRight}>
            <Chains />

            {/* <TokenPrice
              address="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
              chain="eth"
              image="https://cloudflare-ipfs.com/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg/"
              size="40px"
            /> */}
            <NativeBalance />
            <Account />
          </div>
        </Header>
        <div className="mainContent">
          <Skeleton active loading={!isWeb3Enabled}>
            <Switch>
              <Route
                exact
                path="/"
                render={() => {
                    return (<Redirect to="/nftCollections" />)
                }}
              />
              {/* <Route path="/quickstart"><QuickStart isServerInfo={isServerInfo} /></Route> */}
              {/*
              <Route path="/1inch">
                <Tabs defaultActiveKey="1" style={{ alignItems: "center" }}>
                  <Tabs.TabPane tab={<span>Ethereum</span>} key="1">
                    <InchDex chain="eth" />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={<span>Binance Smart Chain</span>} key="2">
                    <InchDex chain="bsc" />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={<span>Polygon</span>} key="3">
                    <InchDex chain="polygon" />
                  </Tabs.TabPane>
                </Tabs>
              </Route>
              */}
              <Route path="/wallet"><Wallet /></Route>
              <Route path="/erc20balance"><ERC20Balance /></Route>
              <Route path="/onramp"><Ramper /></Route>
              {/*<Route path="/erc20transfers"><ERC20Transfers /></Route>*/}
              {/*<Route path="/nftBalance/:id" component={NFTBalance} />*/} {/* Breaks Things... */}
              <Route path="/nftBalance"><NFTBalance /></Route>
              <Route path="/nftCollections/:accountHash/:collectionHash/:roomId/:postId" component={NFTCollections} />
              <Route path="/nftCollections/:accountHash/:collectionHash/:roomId" component={NFTCollections} />
              <Route path="/nftCollections/:accountHash/:collectionHash" component={NFTCollections} />
              <Route path="/nftCollections/:accountHash" component={NFTCollections} />
              <Route path="/nftCollections" component={NFTCollections} />
              <Route path="/nftSingle/:selected" component={NFTCollections} />
              
              {/* <Route path="/nftSingle/:hash" component={NFTSingle} /> */}
              <Route path="/room/:id" component={RoomPage} />
              
              <Route path="/contract"><Contract /></Route>
              <Route path="/nonauthenticated"><>Please login using the "Authenticate" button</></Route>
              <Route exact path="/:handle/" component={PagePersona} />
              <Route path="*"><Page404 /></Route>
            </Switch>
          </Skeleton>
          {/*<Redirect to="/quickstart" />*/}
          
            
        </div>
      </Router>
      
      <div className="clearfloat"></div>
      <Footer style={{ textAlign: "center" }}>
        <Text style={{ display: "block" }}>
          🙋 You have questions? Ask them on the {""}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://forum.moralis.io/t/ethereum-boilerplate-questions/3951/29"
          >
            Moralis forum
          </a>
        </Text>
        <Text style={{ display: "block" }}>
          Built with <a target="_blank" rel="noopener noreferrer" href="https://moralis.io?utm_source=boilerplatehosted&utm_medium=todo&utm_campaign=ethereum-boilerplat">Moralis <Logo /></a>
        </Text>
      </Footer>
    </Layout>
  );
};

export const Logo = () => (
  // 
    <svg width="60" height="38" viewBox="0 0 50 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.6871 32.3986C43.5973 32.4884 43.53 32.5782 43.4402 32.6905C43.53 32.6007 43.5973 32.5109 43.6871 32.3986Z" fill="black" />
      <path d="M49.7037 14.3715C49.5241 6.2447 42.7891 -0.17592 34.6624 0.00367768C31.0031 0.0934765 27.4784 1.53026 24.8294 4.06708C22.113 1.46291 18.4986 0.00367768 14.727 0.00367768C6.71246 0.00367768 0.202047 6.49164 0 14.5511V14.6633C0 20.8146 2.24497 26.2698 4.26545 30.0189C5.11853 31.5904 6.08387 33.117 7.13901 34.5762C7.5431 35.115 7.8574 35.564 8.10435 35.8559L8.39619 36.2151L8.48599 36.3273L8.50844 36.3498L8.53089 36.3722C10.2146 38.3253 13.1555 38.5498 15.1087 36.8886C15.1311 36.8661 15.1536 36.8437 15.176 36.8212C17.1291 35.0701 17.3312 32.0843 15.625 30.1087L15.6026 30.0638L15.423 29.8618C15.2658 29.6597 15.0189 29.3455 14.727 28.9414C13.9188 27.8189 13.178 26.6515 12.5269 25.4392C10.8881 22.4309 9.42888 18.6145 9.42888 14.7531C9.49623 11.8347 11.9432 9.52236 14.8617 9.58971C17.7128 9.65705 19.9802 11.9694 20.0251 14.8205C20.0476 15.5389 20.2272 16.2348 20.5415 16.8859C21.4844 19.3104 24.2232 20.5227 26.6478 19.5798C28.4438 18.8839 29.6336 17.1553 29.6561 15.2246V14.596C29.7683 11.6775 32.2153 9.38766 35.1562 9.47746C37.94 9.56726 40.1625 11.8122 40.2748 14.596C40.2523 17.6941 39.2645 20.7472 38.1421 23.1718C37.6931 24.1371 37.1992 25.08 36.6379 25.978C36.4359 26.3147 36.2787 26.5617 36.1665 26.6964C36.1216 26.7862 36.0767 26.8311 36.0542 26.8535L36.0318 26.876L35.9869 26.9433C37.6033 24.9004 40.5442 24.5412 42.5871 26.1576C44.4953 27.6617 44.9443 30.3781 43.6198 32.4211L43.6422 32.4435V32.3986L43.6647 32.3762L43.732 32.2864C43.7769 32.1966 43.8667 32.1068 43.9565 31.9721C44.1361 31.7027 44.3606 31.3435 44.6525 30.8945C45.3933 29.6822 46.0668 28.4026 46.673 27.1229C48.1097 24.0249 49.6812 19.5349 49.6812 14.5286L49.7037 14.3715Z" fill="#041836" />
      <path d="M39.7135 25.1249C37.1094 25.1025 34.9991 27.2127 34.9766 29.8169C34.9542 32.4211 37.0645 34.5313 39.6686 34.5538C41.1503 34.5538 42.5647 33.8578 43.4626 32.6905C43.53 32.6007 43.5973 32.4884 43.6871 32.3986C45.1015 30.221 44.4729 27.3025 42.2953 25.9107C41.532 25.3943 40.634 25.1249 39.7135 25.1249Z" fill="#B7E803" />
    </svg>
  // </div>
);

export default App;

