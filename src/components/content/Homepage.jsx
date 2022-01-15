import React from "react";
import { useMoralis } from "react-moralis";
import NFTCollections from "components/NFTCollections";
import { ChainHelper } from "helpers/ChainHelper";
import { Skeleton, Tabs } from 'antd';
// import { PersonaContext } from "common/context";
//Components
import Address from "components/Address/Address";

const { TabPane } = Tabs;

/**
 * Component: Home Page
 */
 function Homepage(props) {
    const { Moralis, user, chainId, account, isWeb3Enabled } = useMoralis();     //isUserUpdating
    // const { persona, contract } = props;
    const { persona, contract } = props;

    return (
        <div className="framed home">
            <h1>Home</h1>   

            {/* 
            {NFTpersonas && 
            <div className="personas">
            <PersonaChanger persona={NFTpersonas[0]} personas={NFTpersonas}/>
            </div>
            } 
            */}

            <div className="row flex">
                <div className="account">
                    [Account]
                </div>
                <div className="personas">
                    [Persona]
                </div>
            </div>
            <div className="row flex">
                {/* {console.log("[TEST] Homepage() ChainHelper.allChains:", ChainHelper.allChains())} */}
                <div className="assets">
                    <h2>My NFTs</h2>
                <Skeleton loading={!isWeb3Enabled}>
                    {ChainHelper.allChains().map(chain => (
                        <div key={chain} className={"chain_"+chain}>
                            <h3>{ChainHelper.get(chain, 'name')}</h3>
                            <div className="NFTs">
                                <NFTCollections match={{params:{accountHash:account, chain:chain, showBreadcrumbs:false}}} />
                            </div>
                        </div>
                    ))}
                    {/* 
                    <div className="accounts">
                        <Tabs      //https://ant.design/components/tabs/
                            type="card"
                            // onChange={this.onChange}
                            // activeKey={activeKey}
                            // onEdit={handleTabEdit}
                            hideAdd={true}
                            >
                            {ChainHelper.allChains().map(chain => (
                                <TabPane tab={(
                                    <span title={ChainHelper.get(chain, 'name')}>
                                        {ChainHelper.get(chain, 'icon')}
                                        {ChainHelper.get(chain, 'name')}
                                    </span>
                                    )} key={chain+':'+account}   closable={false}  >
                                    <div className="item framed" key={chain}>
                                        <div className="flex">
                                            <div className="chain">
                                            </div>
                                        </div>
                                        <div className="NFTs">
                                            <NFTCollections match={{params:{accountHash:account, chain:chain, showBreadcrumbs:false}}} />
                                        </div>
                                    </div>
                                </TabPane>
                            ))}
                        </Tabs>
                    </div>
                    */}
                </Skeleton>
                </div>
            </div>
        </div>
    );
}//Homepage()


export default Homepage;

