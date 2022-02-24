import React, { useState } from "react";
import { Link } from "react-router-dom";
//import { Card, Image, Tooltip, Modal, Input, Button, Dropdown, Avatar } from "antd";
import { Breadcrumb, Skeleton, Button } from "antd";
import { useMoralis } from "react-moralis";
// import { useNFTBalance } from "hooks/useNFTBalance";
import NFTDisplayCollection from "components/NFT/NFTDisplayCollection";
// import PersonaChanger from "components/Persona/PersonaChanger";
// import Address from "components/Address/Address";
// import { useNFTCollections } from "hooks/useNFTCollections";
import { useNFTCollections } from "hooks/useNFTCollectionsNew";
// import { useIsAllowed } from "hooks/useIsAllowed";
// import { Post } from "objects/objects";
import Space from "components/NFTSingle/Space";
import { CollectionContext } from "common/context";
// import { NFTHelper } from "helpers/NFTHelper";
import { ChainHelper } from "helpers/ChainHelper";
import CarvedHeading from "components/common/CarvedHeading";
import PageAuthenticate from "components/PageAuthenticate";
import __ from "helpers/__";
// import { getChainName, getChainLogo } from "helpers/networks";

/**
 * Component: Display a Single NFT
 * 
    nft:{
        contract_type: "ERC1155"

        //Collection Data
        hash: "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656"   //Collection
        name: "OpenSea Collections"
        symbol: "OPENSTORE"

        //Unique
        token_id: "62886929592743516099400483946210518088519633430112237408489058185285174558721"     //Within The Collection
        token_uri: "https://testnets-api.opensea.io/api/v1/metadata/0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656/0x8b08bda46eb904b18e8385f1423a135167647ca3000000000000030000000001"      //Metadata URI
        image: "https://lh3.googleusercontent.com/6KdfGMFC2ucrayOUEX7xRmo2bngSp0GWW_MK_fhFwhcjiHS6_a2YLjqt-xW1zaHNSEQWJIxTAK7z5Rdi-lpdejS_feIEEVudY6n6Vw"
        owner_of: "0x874a6e7f5e9537c4f934fa0d6cea906e24fc287d"
        metadata: {name: 'SuperCat', description: null, external_link: null, image: 'https://lh3.googleusercontent.com/6KdfGMFC2ucrayOU…jqt-xW1zaHNSEQWJIxTAK7z5Rdi-lpdejS_feIEEVudY6n6Vw', animation_url: null}
        amount: "1"

        block_number: "9655885"
        block_number_minted: "9655885"
        synced_at: "2021-11-17T03:54:32.340Z"
    }
*/
/**
 * Component
 * @param {*} props 
 */
function NFTCollections(props) {
  //Extract Props
  let { accountHash, collectionHash } = props.match.params;
  const { isWeb3Enabled, chainId, account, isInitialized } = useMoralis();
  const [isAllowed, setIsAllowed] = useState(null);
  // const { isAllowed } = useIsAllowed({hash:collectionHash, chain:props?.match?.params?.chain || chainId});
  // console.warn("[TEST] NFTCollections() Ran useIsAllowed:"+isAllowed, {hash:collectionHash, chain:props?.match?.params?.chain || chainId, props});

  //Init Options
  let options = {
    // chain:"0x4", 
    // address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1'
  };
  options.address = accountHash ? accountHash : account;    //Who's NFTs
  // if(props?.match?.params?.chain) options.chain = props.match.params.chain;
  options.chain = (props?.match?.params?.chain) ? props.match.params.chain : chainId;
  const { NFTCollections, NFTpersonas } = useNFTCollections(options);

  React.useEffect(() => {
    if (!collectionHash) setIsAllowed(true);
    else if (isWeb3Enabled && collectionHash && !NFTCollections[collectionHash]) setIsAllowed(false);
    else {
      //Log
      // console.log("(i) NFTCollections() Check if Allowed on Collection:"+collectionHash, NFTCollections, NFTCollections[collectionHash]?.owned, (NFTCollections[collectionHash]?.owned));
      setIsAllowed((NFTCollections[collectionHash]?.owned));
    }

    // console.warn("[TEST] NFTCollections() Selected Collection:" + collectionHash, { NFTCollections, options, isInitialized });

  }, [collectionHash, NFTCollections, isWeb3Enabled]);

  // React.useEffect(() => {
  //   //Log
  //   console.log("(i) NFTCollections() Loading Collections: "+isInitialized, {NFTCollections, collectionHash, accountHash, options, params:props.match.params });
  // },[]);

  // console.warn("[TEST] AUTH", {isWeb3Enabled, isAuthenticated});
  // if(!isWeb3Enabled || !isAuthenticated) return <PageAuthenticate />;  //Authentication Not Really Required
  // if(!options.address && isInitialized) return <PageAuthenticate />; //Ideally...
  // if (!isWeb3Enabled) return <PageAuthenticate />;   //Moralis getNFT Func only runs if Web3 is Enabled
  return (
    <Skeleton loading={!isInitialized}>

      {(!isAllowed && process?.env?.REACT_APP_ENV === 'development') && <p className="debug" style={{ float: 'right' }}>[NOT ALLOWED (C)]</p>}

      <div key="collections" className={"collections framed count_" + Object.keys(NFTCollections).length}>

        <div key="header" className="header">
          {(props?.match?.params?.showBreadcrumbs === true) &&
            <Breadcrumb separator=">">
              {/* <Breadcrumb.Item key="1">Home</Breadcrumb.Item> */}
              {accountHash && <Breadcrumb.Item key="2">
                <Link key={'Link'} to={{ pathname: "/nftCollections/" + accountHash }}>
                  {accountHash === account ? "My Collections" : "NFT Collections"}
                  {/* {console.warn("[TEST] Account Hash", {account, accountHash, user})} */}
                  {/* for <Address icon={getChainLogo(options.chain)} copyable address={accountHash} size={6} /> */}
                </Link>
              </Breadcrumb.Item>}
              {collectionHash && <Breadcrumb.Item key="3"><Link key={'Link'} to={{ pathname: "/nftCollections/" + accountHash + '/' + collectionHash }}>Space for {NFTCollections[collectionHash]?.name}</Link></Breadcrumb.Item>}
              {/* <Breadcrumb.Item key="4"><Link key={'Link'} to={{pathname:"/nftCollections/"+accountHash}}>SELECT</Link></Breadcrumb.Item> */}
              {/* <Breadcrumb.Item key="4">Post</Breadcrumb.Item> */}
            </Breadcrumb>
          }
          {(false && !collectionHash) &&
            <>
              {accountHash
                ? <>
                  <CarvedHeading heading={2} text={accountHash + "'s NFTs"} />
                  {/* {accountHash}'s NFTs */}
                  {/* <Address icon={getChainLogo(options.chain)} copyable address={accountHash} size={6} /> */}
                </>
                : <>
                  {collectionHash
                    ? <CarvedHeading heading={2} text={"Private Space for " + NFTCollections[collectionHash].name} />
                    : <CarvedHeading heading={1} text={"My NFTs"} />
                  }
                </>}
            </>
          }


          {(false && !collectionHash) &&
            <h2>
              {accountHash
                ? <>
                  {accountHash}'s NFTs
                  {/* <Address icon={getChainLogo(options.chain)} copyable address={accountHash} size={6} /> */}
                </>
                : <>
                  {collectionHash
                    ? <> Private Space for {NFTCollections[collectionHash].name}</>
                    : <>  {ChainHelper.get(options.chain, 'name')}
                      {/* <span>{ChainHelper.get(options.chain,'icon')}</span> */}
                    </>
                  }
                </>}
            </h2>
          }

          {/* {!collectionHash && <h4 className="subheading">{Object.keys(NFTCollections).length} Collections</h4>} */}
        </div>

        {NFTCollections && Object.values(NFTCollections).map((collection, index) => {
          if (!collectionHash || collectionHash === collection.hash) {
            //Link Destination (Single Collection)
            let dest = {
              // pathname: "/nftSingle/"+collection.hash,
              // pathname: collectionHash ? `${accountHash ? "/nftCollections/"+accountHash : '/nftCollections/'}` : `${accountHash ? accountHash+"/"+collection.hash : '/nftSingle/'+collection.hash}`,
              // pathname: collectionHash ? "/nftCollections/"+options.address : '/nftCollections/'+options.address+'/'+collection.hash,
              pathname: collectionHash
                ? `${accountHash ? "/nftCollections/" + accountHash : '/nftCollections/'}`  //Collections Page
                // : `${(accountHash && !__.matchAddr(accountHash,account)) ? "/nftCollections/"+accountHash+"/"+collection.hash : '/space/'+options.chain+'/'+collection.hash}`, //Single (Room)
                : `${(accountHash && !__.matchAddr(accountHash, account)) ? "/nftCollections/" + accountHash + "/" + collection.hash : '/chat/' + options.chain + '/' + collection.hash}`, //Chat Page
              // pathname: '/space/'+options.chain+'/'+collection.hash,  //This is this page///
              // search: "?sort=name",
              // hash: "#the-hash",
              // state: { fromDashboard: true }
            };
            let style = collectionHash ? __.stackContainerStyle(collection.items.length) : {};
            let title = collectionHash ? "Go Back" : "Pick '" + __.sanitize(collection.name) + "' Collection";
            return (
              <CollectionContext.Provider key={collection.hash + ':ctx'} value={collection}>
                <div className="center_wrapper">
                  {/* <p>{collection.owned ? 'Owned' : 'Not Owned'}</p> */}
                  <div key={collection.hash + ':cards'} className={`collection ${collectionHash ? "stack" : ""}`}>
                    {!collectionHash &&
                      <h2 className="">
                        <Link key={collection.hash + 'Link'} to={dest}>
                          {collection.contract_type && <span className=""
                            title={`${collection.contract_type} is a ${collection.contract_type === 'ERC721' ? 'Non-Fungible Token Contract. There can be only a single owner for each item.' : collection.contract_type === 'ERC1155' ? ' Semi-Fungible Token Contract. There can be many owners for each item.' : ''}`}>
                            {collection.contract_type}:
                          </span>}
                          {/* Collection:  */}
                          &nbsp;
                          {__.sanitize(collection.name)}
                          &nbsp;
                          {collection.symbol && <small className="small">(${collection.symbol})</small>}

                          {/* <span className="debug">[{collection.contract_type}]</span> */}

                          <Button variant="contained" color="primary" className="link arrow"
                            style={{ marginLeft: '1rem' }}
                            // icon={<i className="bi bi-arrow-left"></i>}
                            title="Enter Private Space"
                          >
                            {/* Enter Private Space for  */}
                            {/* '{__.sanitize(collection.name)}' Collection */}
                            <i className="bi bi-arrow-right"></i>
                          </Button>

                        </Link>
                      </h2>
                    }
                    {collectionHash && <>

                      <div className="flex itemsCenter">

                        {/* <CarvedHeading heading={2} text={"Collection: "+__.sanitize(collection.name)+" ("+collection.symbol+")"} /> */}

                        <Link key={collection.hash + 'Link'} to={dest}>
                          <Button variant="contained" color="primary" className="backstep link arrow"
                            style={{ marginRight: '1rem' }}
                            // icon={<i className="bi bi-arrow-left"></i>}
                            // icon={<i className="bi bi-arrow-left-circle-fill"></i>}
                            title="Back To Collections Page"
                          >
                            <i className="bi bi-arrow-left"></i>
                          </Button>
                        </Link>

                        {/* <CarvedHeading heading={1} text={'$'+collection.symbol} /> */}
                        <h2 className="title" title={'$' + collection.symbol}>
                          <span className="">{collection.contract_type}:</span>
                          {/* Collection:  */}
                          &nbsp;
                          {__.sanitize(collection.name)}

                          {/* &nbsp; on  <span title={ChainHelper.get(options.chain,'name')}>{ChainHelper.get(options.chain,'icon')}</span> */}
                        </h2>
                      </div>
                    </>
                    }

                    <div className="middle">
                      <div key="cards" className="cards" title={title}>
                        {/* <Link key={collection.hash+'Link'} to={dest}>
                          <NFTDisplayCollection key={collection.hash+'Collection'} collection={collection} style={style}/>
                        </Link> */}
                        <NFTDisplayCollection key={collection.hash + 'Collection'} collection={collection} dest={dest} />
                      </div>
                      {/* {collectionHash && 
                      <div key="space" className="space_container">
                        <Space hash={collectionHash} collection={collection} NFTpersonas={NFTpersonas}/>
                      </div>
                      } */}
                    </div>

                  </div>

                  {collectionHash &&
                    <div key="space" className="space_container">
                      <Space hash={collectionHash} chain={options.chain} collection={collection} NFTpersonas={NFTpersonas} />
                    </div>
                  }

                </div>
              </CollectionContext.Provider>
            );
          } else return '';
        })}
      </div>
    </Skeleton>
  );
}//NFTCollections()

export default NFTCollections;
