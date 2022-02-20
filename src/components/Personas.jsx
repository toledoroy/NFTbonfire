import { useMoralis } from "react-moralis";
// import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
import NFTDisplaySingle from "components/Persona/DisplaySinglePersona";
import { useContractTokens } from "hooks/useContractTokens";
import { Skeleton } from 'antd';
import { Persona } from "objects/Persona";
// import { ChainHelper } from "helpers/ChainHelper";
// import { PersonaHelper } from "helpers/PersonaHelper";
// import { Link } from "react-router-dom";

/**
 * Component: NFTs from All (Supported) Chains
 * @param {*} props 
 * @returns 
 */
function Personas(props) {
    const { isWeb3Enabled, isAuthenticated } = useMoralis();

    //Personas
    const params1 = { address: Persona.getContractAddress('0x4'), chain: '0x4', };
    const params2 = { address: Persona.getContractAddress('0xa869'), chain: '0xa869', };
    const { tokens: tokens1, isLoading: isLoading1 } = useContractTokens(params1);
    const { tokens: tokens2, isLoading: isLoading2 } = useContractTokens(params2);
    // console.error("Personas:", {tokens1, tokens2});

    // if(!isWeb3Enabled || !isAuthenticated) return <PageAuthenticate />;
    // <Link key={nft.token_address+'L'+nft.token_id} to={{pathname:"/personatoken/"+nft.chain+"/"+nft.token_address+"/"+nft.token_id}}> 
    return (
        <div className="framed">

            <Skeleton loading={!isWeb3Enabled || !isAuthenticated || isLoading1 || isLoading2}>
                <div key={params1.hash + 'items'} className="NFTitems" id={"NFTitems" + params1.hash} style={props.style}>
                    {tokens1.map((nft) => (
                        <NFTDisplaySingle key={nft.token_address + ':' + nft.token_id} nft={nft} />
                    ))}
                    {tokens2.map((nft) => (
                        <NFTDisplaySingle key={nft.token_address + ':' + nft.token_id} nft={nft} />
                    ))}
                </div>
            </Skeleton>

        </div>
    );
}

export default Personas;