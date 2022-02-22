import { useEffect, useState } from "react";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
const _ = require('lodash');

/**
 * Component: Chain Changer
 */
function CollectionSelection({ collections, collection }) {
    const [selected, setSelected] = useState({});
    //Filter
    const menuItems = collections;
    console.warn("[TEST] CollectionSelection() Collections:", { collections });

    const handleMenuClick = (element) => {
        console.warn("[TEST] CollectionSelection() Set Selected Collection: ", { element, collections });
        setSelected(element.key);
    };

    function getCollectionIcon(collection) {
        const image = collection?.image ? collection.image : collection?.items[0]?.image;
        return <div className="image"><img src={image} /></div>;
    }

    const menu = menuItems.length < 2 ? '' : (
        <Menu onClick={handleMenuClick} className="collection_menu collection_select container">
            {_.map(menuItems, (item, key) => {
                //Link Destination (Single Collection)
                let dest = {
                    pathname: `/chat/${item.chain}/${item.hash}`  //Select Collection
                    // search: "?sort=name",
                    // hash: "#the-hash",
                    // state: { fromDashboard: true }
                };
                return (
                    <Menu.Item key={key} icon={getCollectionIcon(item)} className="item">
                        <Link to={dest} key={item.hash}>
                            <span>{item.name}</span>
                        </Link>
                    </Menu.Item>
                )
            })}
        </Menu>
    );

    let className = menuItems.length > 1 ? "collection_select lightUp" : "collection_select";
    className += " flex count_" + Object.keys(collections)?.length;
    return (
        <Dropdown overlay={menu} trigger={["click"]}>
            {/* <Button className="collection_select" key={selected?.key} icon={selected?.icon}> */}
            <Button className={className} key={collection?.key} icon={getCollectionIcon(collection)}>
                <span style={{ marginLeft: "5px" }}>{collection?.name}</span>
                {/* <span style={{ marginLeft: "5px" }}>${collection?.symbol}</span> */}
                {/* <span title={ChainHelper.get(options.chain, 'name')}>{ChainHelper.get(options.chain, 'icon')}</span>  */}
                {menuItems.length > 1 && <DownOutlined />}
            </Button>
        </Dropdown>
    );
}

export default CollectionSelection;
