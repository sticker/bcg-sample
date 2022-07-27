// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract Characters is ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIds;

    uint256 public mintPrice;

    struct Character {
        uint256 id;
        string tokenURI;
    }

    Character[] private tokens;

    event NewCharacter(Character indexed character, address indexed minter);

    function initialize (uint256 _mintPrice) public initializer {
        __ERC721_init("Characters", "CHARA");
        __Ownable_init_unchained();

        mintPrice = _mintPrice;
    }

    function mint(address player, string memory _tokenURI) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintPrice, "insufficient funds");
        uint256 newItemId = _tokenIds.current();
        Character memory character = Character(newItemId, _tokenURI);
        tokens.push(character);
        _mint(player, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        _tokenIds.increment();
        emit NewCharacter(character, player);
        return newItemId;
    }

    function withdrawAll() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdraw(uint256 amount) public onlyOwner {
        payable(msg.sender).transfer(amount);
    }

    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }

    function getMyCharacters() public view returns(Character[] memory) {
        Character[] memory myCharacters = new Character[](balanceOf(msg.sender));
        for(uint256 i = 0; i < myCharacters.length; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
            myCharacters[i] = tokens[tokenId];
        }
        return myCharacters;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
