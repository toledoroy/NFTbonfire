import { useMoralis } from "react-moralis";
import { ChainHelper } from "helpers/ChainHelper";
import { Skeleton } from 'antd';
import NFTCollections from "components/NFTCollections";
// import PageAuthenticate from "components/PageAuthenticate";

/**
 * Component: NFTs from All (Supported) Chains
 * @param {*} props 
 * @returns 
 */
 function NFTDisplayAllChains(props){
    const { account, isWeb3Enabled, isAuthenticated, chainId } = useMoralis();

    // if(!isWeb3Enabled || !isAuthenticated) return <PageAuthenticate />;
    return (
        <Skeleton loading={!isWeb3Enabled || !isAuthenticated}>
            {ChainHelper.allChainsData()
                .filter((chainData) => (chainData.key === chainId || chainData.supported || chainData.live))
                .map(chainData => (
                <div key={chainData.key} className={"chain_"+chainData.key}>
                    <h3>{chainData.name}</h3>
                    <div key="NFTs" className="NFTs">
                        <NFTCollections match={{params:{accountHash:account, chain:chainData.key, showBreadcrumbs:false}}} />
                    </div>
                </div>
            ))}
            {/*  In Tabs
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
    );
}

export default NFTDisplayAllChains;

