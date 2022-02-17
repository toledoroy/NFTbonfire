//https://ethereum.org/en/developers/tutorials/how-to-write-and-deploy-an-nft/
//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";		//https://eips.ethereum.org/EIPS/eip-721
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";  //Individual Metadata URI Storage Functions
import "@openzeppelin/contracts/access/Ownable.sol";
// Add ERC721Burnable   token/ERC721/extensions/ERC721Burnable.sol
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";    //Adds the Burn Func.    //Unnecessary


/**
 * Persona as NFT [2022-02-17]
 * Version 1.2.0
 *  - Contract is open and free for everyone to mint.
 *  - Minted Tokens are updatable (by Token holder only)
 *  - Assets are non-transferavle (by default at least)
 *  - Contract is Updatable (May be replaced by a better, similar, contract)        
 *  - Contract owner holds no special privileges (other than upgrading the contract and changing one's mind regarding transferability)
 *
 * [TODO] Implmemnt Upgradable a proxy instead of the retired func. 
 * [TODO] remove transferability functionality
 */
contract PersonaV1 is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /**
	 * Check if Contract is Valid (Hasn't Been Updated & Retired)
	 */
    modifier isContractValid() {
     require(_retired == address(0), "Contract is out of date. Please call the retired function to get the new contract address.");
        _;
    }

    /**
	 * Constructor
	 */
    constructor() ERC721("Persona", "PERSONA") {

    }

    /* Token Controls */
	/**
	 * URI Change Event
	 */
    event URI(string value, uint256 indexed id);    //Copied from ERC1155

    /**
     * Mint new Token (To Oneself)
     */
    function mint(string memory tokenURI) isContractValid public returns (uint256) {
        //Validate - Bot Protection
        require(tx.origin == msg.sender, "Bots not allowed");
        //Mint
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);       //Self Only
        //Set URI
        _setTokenURI(newItemId, tokenURI);	//This Goes for Specific Metadata Set (IPFS and Such)
        //Emit URI Event
        emit URI(tokenURI, newItemId);
        //Done
        return newItemId;
    }
	
    /**
     * Mint a Token as a Gift
     */
    function gift(address _to, string memory tokenURI) isContractValid public returns (uint256) {   
        //Validate - Bot Protection
        require(tx.origin == msg.sender, "Bots not allowed");
        //Mint
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(_to, newItemId);
        //Set URI
        _setTokenURI(newItemId, tokenURI);	//This Goes for Specific Metadata Set (IPFS and Such)
        //Emit URI Event
        emit URI(tokenURI, newItemId);
        //Done
        return newItemId;
    }

    /**
     * Update Token('s Metadata)
     */
    function update(uint256 tokenId, string memory uri) public returns (uint256) {
        //Validate Owner of Token
        require(_isApprovedOrOwner(_msgSender(), tokenId), "caller is not owner nor approved");
        _setTokenURI(tokenId, uri);	//This Goes for Specific Metadata Set (IPFS and Such)
        //Emit URI Changed Event
        emit URI(uri, tokenId);
        //Done
        return tokenId;
    }
    
    /**
     * Burn Token
     */
    function burn(uint256 tokenId) public {
        //Validate Owner of Token
        require(_isApprovedOrOwner(_msgSender(), tokenId), "caller is not owner nor approved");
        //Burn Token
        _burn(tokenId);
    }


    /* Disable Transfers */
    
    //Allow Token Transfer (Disabled by Default)
    bool public allowTransfer = false;

    /**
     *  Block Transfers 
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
        require(
            allowTransfer           //Transfers Allowed
            || from == address(0)   //Minting
            || to == address(0)     //Burning
            ,
            "Sorry, These assets are non-transferable"
        );
    }

    /**
     * Change Transfer Restriction
     */
    function setAllowTransfer(bool _allowTransfer) external onlyOwner {
        //Set
        allowTransfer = _allowTransfer;
        //Emit Event
        emit transferableUpdated(_allowTransfer);
    }

    /**
	 * Transferable Toggled Event
	 */
    event transferableUpdated(bool transferable);

    /* Upgradable */
    address private _retired = address(0);   //Set new contract ID when contract is retired

    /**
     * Retire Contract once an updated contract is available
     */
    function retire(address newContractAddr) public onlyOwner {
        //Validate Address
        require(newContractAddr == address(newContractAddr), "Invalid address.");
        //Set updated contract address
        _retired = newContractAddr;
    }
	
    /**
     * Check if Contract is Still Valid
     */
    function isRetired() public view returns (bool){
        return (_retired != address(0));
    }
	
    /**
     * Return new Contract Address if Retired
     */
    function retired() public view returns (address){
        return _retired;
    }

}