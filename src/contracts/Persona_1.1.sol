// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";		//https://eips.ethereum.org/EIPS/eip-721
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";  //Individual Metadata URI Storage Functions
// import "@openzeppelin/contracts/access/Ownable.sol";         //Overkill


/**
 * Persona NFT V1.1 [2022-01-25]
 *  - Contract is open and free for everyone to mint.
 *  - Minter is Owner    
 *  - Minted Tokens are updatable (by Token owner only)
 *  - Assets are non-transferavle (By default at least)
 *  - Contract is Updatable (May be replaced by a better, similar, contract)
 *  - Contract owner holds no special privileges (other than upgrading the contract and changing one's mind regarding transferability)
 */
contract PersonaV1 is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private _owner;

    /**
	 * Check if caller is Contract Owner
	 */
    modifier isOwner() {
        require(msg.sender == _owner, "Caller is not owner");
        _;
    }
    /**
	 * Check if Contract is Valid (Hasn't Been Updated & Retired)
	 */
    modifier isContractValid() {
     require(_retired == address(0), "Contract is out of date. Please call the retired function to get the new contract address.");
        _;
    }   

    /**
	 * Expose Contract Owner
	 */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
	 * Constructor
	 */
    constructor() ERC721("Persona", "PERSONA") payable {
        //Remember Deployer
        _owner = msg.sender;
    }

    /* Token Controls */
	/**
	 * URI Change Event
	 */
    // event URI(string value, uint256 indexed id);    //Copied from ERC1155
    event URI(string value, uint256 id); //Cheeper Gas...

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
    function setAllowTransfer(bool _allowTransfer) external isOwner {
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
    function retire(address newContractAddr) isOwner public {
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