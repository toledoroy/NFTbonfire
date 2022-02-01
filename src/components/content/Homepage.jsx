import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { PersonaHelper } from "helpers/PersonaHelper";
// import { ChainHelper } from "helpers/ChainHelper";
import { Row, Col } from 'antd';
// import { Button, Tabs, Card, Image } from "antd";
// import { PlusOutlined } from '@ant-design/icons';
// import { PersonaContext } from "common/context";
import CarvedHeading from "components/common/CarvedHeading";
import ChainChange from "components/Chains/ChainChange";
import __ from "helpers/__";
//Components
import Address from "components/Address/Address";
// import NFTDisplaySingle from "components/NFTCollections/NFTDisplaySingle";
// import NFTCollections from "components/NFTCollections";
import NFTDisplayCollection from "components/NFT/NFTDisplayCollection";
import NFTDisplayAllChains from "components/NFT/NFTDisplayAllChains";
import PageAuthenticate from "components/PageAuthenticate";
import ERC20Balance from "components/ERC20Balance";
import FullscreenMessage from "components/common/FullscreenMessage";

// const { TabPane } = Tabs;


/**
 * Component: Home Page
 */
 function Homepage(props) {
    const { account, isWeb3Enabled, isAuthenticated, chainId } = useMoralis();     //, Moralis, user, isUserUpdating
    // const { persona, contract } = props;
    // const { persona, contract } = props;
    
    const [ personaCollection, setPersonaCollection ] = useState();

    //Fetch Personas -- Live Query (This isn't actually live the way you'd expect. DB changes aren't being detected)
    const { data : personas } = useMoralisQuery('Persona', query => query.equalTo("owner", String(account).toLowerCase()), [account], { 
        live: true,
        /* For Some Mysterious Reason This Query is only Reflect DB Changes if these arguments are (and are wrong, playerName does not exist...)  */    //Maybe onLiveCreate
        // onCreate: data => console.warn(`${data.attributes.playerName} was just Created`),
        // onDelete: data => console.warn(`${data.attributes.playerName} was just Deleted`),
        // onUpdate: data => console.warn(`${data.attributes.playerName} was just Updated`),
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
    // FullscreenMessage

    // if(isWeb3Enabled && (!isAuthenticated || !account)) return (
    // // if(!isAuthenticated || !account) return (
    //     <Row>
    //         <PageAuthenticate />
    //     </Row>
    // );
    // else console.warn("[TEST] Homepage() isAuthenticated:", {isAuthenticated, account ,isWeb3Enabled} );
    return (
        <div className="framed home">

            {!isAuthenticated && <FullscreenMessage><PageAuthenticate /></FullscreenMessage>}

            <Row className="welcom_message container" style={{margin:'10px 0 30px 0'}}>
                <Col xs={24} className="framed welcom_message">
                <div className="inner">
                {chainId === "0xa869" 
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
                        <ChainChange />
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
                <div className="assets" style={{flex:'1 1'}}>
                    <div className="">
                        {/* <h1 className="carved" title="Non-Fungible Assets">Non-Fungible Assets</h1> */}
                        <CarvedHeading text="Non-Fungible Assets" />
                    </div>
                    <NFTDisplayAllChains />
                </div>
            </Row>
        </div>
    );
}//Homepage()


export default Homepage;