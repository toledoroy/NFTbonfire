import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import NFTCollections from "components/NFTCollections";
import { PersonaHelper } from "helpers/PersonaHelper";
import { ChainHelper } from "helpers/ChainHelper";
import { Skeleton, Row, Col, Button } from 'antd';
// import { Button, Tabs, Card, Image } from "antd";
// import { PlusOutlined } from '@ant-design/icons';
// import { PersonaContext } from "common/context";
import CarvedHeading from "components/common/CarvedHeading";
import __ from "helpers/__";
//Components
import Address from "components/Address/Address";
// import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
import NFTDisplayCollection from "components/NFT/NFTDisplayCollection";
import PageAuthenticate from "components/PageAuthenticate";
import ERC20Balance from "components/ERC20Balance";

import { useChain } from "react-moralis";
import { AvaxLogo } from "components/Chains/Logos";

// const { TabPane } = Tabs;


/**
 * Component: Home Page
 */
 function Homepage(props) {
    const { account, isWeb3Enabled, chainId } = useMoralis();     //, Moralis, user, isUserUpdating
    // const { persona, contract } = props;
    // const { persona, contract } = props;
    const { switchNetwork } = useChain();   //chain
    
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
                // name: PersonaHelper.getName(persona),
                name: persona.get('metadata')?.role,   //Used as Title
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

    // console.warn("[TEST] Homepage() Persona NFTs Collection:", {personaCollection, style:__.stackContainerStyle(personaCollection?.items.length)} );
    // console.warn("[TEST] Homepage() Persona NFTs Collection:", {user, account, } );
    
    if(isWeb3Enabled && !account) return (
        <Row>
            <PageAuthenticate />
        </Row>
    );
    return (
        <div className="framed home">
            
            <Row className="welcom_message container" style={{margin:'10px 0 30px 0'}}>
                <Col xs={24} className="framed welcom_message">
                <div className="inner">
                {chainId == "0xa869" 
                ?   <>
                    <CarvedHeading text="Welcome to NFT Bonfire" />
                    <p className="" style={{padding:'10px 0', fontSize:'1.3rem', fontWeight:'500', lineHeight:'2rem', color:'var(--color)'}}>
                        You are a brave astronout and one of the first people to land in this exciting new space.
                        <br />
                        At this stage we are running on the Avalanch Testnet. 
                        <br />
                        To interact with our services you'd need some Test-AVAX in your wallet.
                        <br />
                        If you don't have any, you can get some from the <a href="https://faucet.avax-test.network/" target="_blank" rel="noopener noreferrer">AVAX Fuji Testnet Faucet</a>. 
                        <br />
                        Just type in your wallet address and click the resquest button.
                        Then, you'd be able to mint your new social persona. For free! and use it to interact with the community.

                    </p>
                    </>
                :   <>

                        <div className="title">
                            <CarvedHeading text="Please Change Network" />
                        </div>
                        <div className="chain_change">
                            <h2>We currently Support </h2>
                            <p style={{ fontSize:'1.3rem', fontWeight:'500', lineHeight:'2rem', color:'var(--color)'}}>
                                
                                {/* Switch to Avalanche */}
                                <button className="pointer btn-no" title="Avalanche Testnet" onClick={() => switchNetwork('0xa869')}>
                                    <svg width="120" height="120" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 10C0 4.47715 4.47715 0 10 0H20C25.5228 0 30 4.47715 30 10V20C30 25.5228 25.5228 30 20 30H10C4.47715 30 0 25.5228 0 20V10Z" fill="#E84142" />
                                        <path d="M20.2914 15.3898C20.8111 14.4921 21.6497 14.4921 22.1693 15.3898L25.4056 21.0709C25.9252 21.9685 25.5 22.7008 24.4607 22.7008H17.941C16.9134 22.7008 16.4882 21.9685 16.9961 21.0709L20.2914 15.3898ZM14.0315 4.45277C14.5512 3.55513 15.378 3.55513 15.8977 4.45277L16.6182 5.75198L18.3189 8.74017C18.7323 9.59056 18.7323 10.5945 18.3189 11.4449L12.6142 21.3307C12.0945 22.1339 11.2323 22.6417 10.2756 22.7008H5.53942C4.50005 22.7008 4.07485 21.9803 4.59454 21.0709L14.0315 4.45277Z" fill="white" />
                                    </svg>
                                    <br />
                                    Avalanche Testnet
                                </button>

                                {/* Switch to Rinkeby
                                <button className="pointer btn-no" title="Rinkeby Testnet" onClick={() => switchNetwork('0x4')}>
                                        <svg width="120" height="120" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 10C0 4.47715 4.47715 0 10 0H20C25.5228 0 30 4.47715 30 10V20C30 25.5228 25.5228 30 20 30H10C4.47715 30 0 25.5228 0 20V10Z" fill="#627EEA" />
                                            <path d="M15.0294 3.75V12.0656L22.0578 15.2062L15.0294 3.75Z" fill="white" fillOpacity="0.602" />
                                            <path d="M15.0294 3.75L8 15.2062L15.0294 12.0656V3.75Z" fill="white" />
                                            <path d="M15.0294 20.595V26.2453L22.0625 16.515L15.0294 20.595Z" fill="white" fillOpacity="0.602" />
                                            <path d="M15.0294 26.2453V20.594L8 16.515L15.0294 26.2453Z" fill="white" />
                                            <path d="M15.0294 19.2872L22.0578 15.2063L15.0294 12.0675V19.2872Z" fill="white" fillOpacity="0.2" />
                                            <path d="M8 15.2063L15.0294 19.2872V12.0675L8 15.2063Z" fill="white" fillOpacity="0.602" />
                                        </svg>
                                    <br />
                                    Rinkeby Testnet
                                </button>
                                */}
                            </p>
                        </div>
                        </>
                }   
                </div>
                </Col>
            </Row>

            {/*
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
                    {/* <div className="row"> */}
                    <div className="title">
                        <CarvedHeading text="Account" />
                    </div>
                    {account && <>
                        <h2>Current Account:</h2>
                        <Address avatar="left" copyable address={account} size={9} />
                        {/* TODO: Add Current Chain */}
                        {/* icon={<i className="bi bi-explicit"></i>} */}
                        <div className="row">
                            <h2>Fungible Assets</h2>
                            <ERC20Balance />
                        </div>
                    </>}
                    {/* </div> */}
                </Col>
                <Col xs={24} md={12} className="personas stack">
                    <div className="title">
                        <h1 className="carved" title="Personas">Personas</h1>
                    </div>
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
                <div className="assets">
                    <div className="">
                        {/* <h1 className="carved" title="Non-Fungible Assets">Non-Fungible Assets</h1> */}
                        <CarvedHeading text="Non-Fungible Assets" />
                    </div>
                    <Skeleton loading={!isWeb3Enabled}>
                    {ChainHelper.allChainsData()
                        .filter((chainData) => (chainData.key === chainId || chainData.supported || chainData.live))
                        .map(chainData => (
                        <div key={chainData.key} className={"chain_"+chainData.key}>
                            <h3>{chainData.name}</h3>
                            <div className="NFTs">
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
                </div>
            </Row>
        </div>
    );
}//Homepage()


export default Homepage;