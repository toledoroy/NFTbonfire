import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import NFTCollections from "components/NFTCollections";
import { PersonaHelper } from "helpers/PersonaHelper";
import { ChainHelper } from "helpers/ChainHelper";
import { Skeleton, Tabs, Row, Col } from 'antd';
// import { PersonaContext } from "common/context";
//Components
import Address from "components/Address/Address";
import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
import NFTDisplayCollection from "components/NFT/NFTDisplayCollection";

const { TabPane } = Tabs;


/**
 * Component: Home Page
 */
 function Homepage(props) {
    const { Moralis, user, chainId, account, isWeb3Enabled } = useMoralis();     //isUserUpdating
    // const { persona, contract } = props;
    const { persona, contract } = props;
      
    const [ personaCollection, setPersonaCollection ] = useState();

    //Fetch Personas -- Live Query (This isn't actually live the way you'd expect. DB changes aren't being detected)
    const { data : personas } = useMoralisQuery('Persona', query => query.equalTo("owner", String(account).toLowerCase()), [account], { 
        live: true,
        /* For Some Mysterious Reason This Query is only Reflect DB Changes if these arguments are (and are wrong, playerName does not exist...)  */    //Maybe onLiveCreate
        onCreate: data => console.warn(`${data.attributes.playerName} was just Created`),
        onDelete: data => console.warn(`${data.attributes.playerName} was just Deleted`),
        onUpdate: data => console.warn(`${data.attributes.playerName} was just Updated`),
        // onLiveCreate: data => console.warn(`${data.attributes.token_id} was just Created`),  //Nope
        // onLiveDelete: data => console.warn(`${data.attributes.token_id} was just Deleted`),  //Nope
        // onLiveUpdate: data => console.warn(`${data.attributes.token_id} was just Updated`),  //Nope
    });

    //Create a Faux NFT Collection from Personas Data
    useEffect(() => {
        let items = personas.map(persona => {
            //Make it look like a NFT Object
            return {
                image: PersonaHelper.getImage(persona),
                name: PersonaHelper.getName(persona),
                token_address: persona.get('address'),
                token_id: persona.get('token_id'),
                metadata: persona.get('metadata'),
            };
        });
        const collection = {
            hash: items[0]?.token_address,
            name: 'Persona',
            symbol: 'PERSONA',
            items,
        }
        console.warn("[TEST] Persona NFTs Collection:", {collection, items} );
        setPersonaCollection(collection);
    }, [personas]);

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
                <div className="personas stack">
                    <h2>Personas</h2>
            

                    <div className="cards">
                        {personaCollection && 
                        <NFTDisplayCollection key={personaCollection.hash+'Collection'} collection={personaCollection} flip />}

                        {/* 
                        <div key={'persons'} className="NFTitems" id={"NFTitems"+personas[0]?.get('address')}> 
                            {personas.map(persona => {
                                //Make it look like a NFT Object
                                let nft = {
                                    image: PersonaHelper.getImage(persona),
                                    name: PersonaHelper.getName(persona),
                                    // name: 'Persona',
                                    token_address: persona.get('address'),
                                    token_id: persona.get('token_id'),
                                    metadata: persona.get('metadata'),
                                };
                                console.warn("[DEV] Persona:", {persona, nft});
                                
                                return (<NFTDisplaySingle key={nft.token_address+nft.token_id} nft={nft} />);
                            })}
                        </div> */}

                    </div>
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

