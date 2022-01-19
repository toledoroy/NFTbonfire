import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import NFTCollections from "components/NFTCollections";
import { PersonaHelper } from "helpers/PersonaHelper";
import { ChainHelper } from "helpers/ChainHelper";
import { Skeleton, Tabs, Row, Col } from 'antd';
// import { Button } from 'antd';
// import { Card, Image } from "antd";
// import { PlusOutlined } from '@ant-design/icons';

// import { PersonaContext } from "common/context";
import __ from "helpers/__";
//Components
import Address from "components/Address/Address";
// import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
import NFTDisplayCollection from "components/NFT/NFTDisplayCollection";
import PageAuthenticate from "components/PageAuthenticate";
import ERC20Balance from "components/ERC20Balance";

// const { TabPane } = Tabs;


/**
 * Component: Home Page
 */
 function Homepage(props) {
    const { Moralis, user, chainId, account, isWeb3Enabled } = useMoralis();     //isUserUpdating
    // const { persona, contract } = props;
    // const { persona, contract } = props;
      
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
        console.warn("[TEST] Homepage() Persona NFTs Collection:", {collection, items} );
        setPersonaCollection(collection);
    }, [personas]);

    console.warn("[TEST] Homepage() Persona NFTs Collection:", {personaCollection, style:__.stackContainerStyle(personaCollection?.items.length)} );
    // console.warn("[TEST] Homepage() Persona NFTs Collection:", {user, account, } );
    
    if(!account) return (
        <Row>
            <PageAuthenticate />
        </Row>
    );
    return (

        <div className="framed home">
            {/* <h1>Home</h1>    * /}

            {(!account) && <Row>
                <PageAuthenticate />
            </Row> */}

            {/* 
            {NFTpersonas && 
            <div className="personas">
            <PersonaChanger persona={NFTpersonas[0]} personas={NFTpersonas}/>
            </div>
            } 
            */}
            
            <Row className="flex">
                <Col xs={24} md={12} className="account">
                    <div className="row">
                    <h1>Account</h1>
                    {account && <>
                        <h3>Current Account:</h3>
                        <Address avatar="left" copyable address={account} size={9} />
                        {/* icon={<i className="bi bi-explicit"></i>} */}
                        <div className="row">
                            <h2>Fungible Assets</h2>
                            <ERC20Balance />
                        </div>
                    </>}
                    </div>
                </Col>
                <Col xs={24} md={12} className="personas stack">
                    <h1>Personas</h1>
                    {!personaCollection?.hash && <div className="cards">
                        <div className="mintNewPersona NFT">
                            <h2>Why Don't You Mint Yourself a New Persona</h2>
                            <a href="/persona"><i className="bi bi-plus"></i></a>
                        </div>
                    </div>}
                    {personaCollection?.hash && 
                    <div className="cards">
                        <NFTDisplayCollection key={personaCollection.hash+'Collection'} collection={personaCollection} flip style={__.stackContainerStyle(personaCollection?.items.length)} />
                    </div>}
                </Col>
            </Row>
            
            <Row className="flex">
                {/* {console.log("[TEST] Homepage() ChainHelper.allChains:", ChainHelper.allChains())} */}
                <div className="assets">
                    <h1>Non-Fungible Assets (Bonfires)</h1>
                    <Skeleton loading={!isWeb3Enabled}>
                    {ChainHelper.allChains().map(chain => (
                        <div key={chain} className={"chain_"+chain}>
                            <h3>{ChainHelper.get(chain, 'name')}</h3>
                            <div className="NFTs">
                                <NFTCollections match={{params:{accountHash:account, chain:chain, showBreadcrumbs:false}}} />
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
                </div>
            </Row>
        </div>
    );
}//Homepage()


export default Homepage;