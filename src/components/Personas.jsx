import { useMoralis } from "react-moralis";
// import { ChainHelper } from "helpers/ChainHelper";
import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
import { useContractTokens } from "hooks/useContractTokens";
// import PageAuthenticate from "components/PageAuthenticate";
import { Skeleton } from 'antd';

/**
 * Component: NFTs from All (Supported) Chains
 * @param {*} props 
 * @returns 
 */
 function Personas(props){
    const { account, isWeb3Enabled, isAuthenticated, chainId } = useMoralis();

    const params = {
            address: '0x9E91a8dDF365622771312bD859A2B0063097ad34',
            chain: '0x4',
        };
    const { tokens, isLoading } = useContractTokens(params);
    console.error("Personas:", tokens);

    // if(!isWeb3Enabled || !isAuthenticated) return <PageAuthenticate />;
    return (
    <div className="framed">
        <Skeleton loading={!isWeb3Enabled || !isAuthenticated || isLoading}>

            <div key={params.hash+'items'} className="NFTitems" id={"NFTitems"+params.hash} style={props.style}> 
                {tokens.map((nft, index) => (
                    <NFTDisplaySingle key={nft.token_address+':'+nft.token_id} nft={nft} />
                ))}
            </div>
        </Skeleton>
    </div>
    );
}

export default Personas;