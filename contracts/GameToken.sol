// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract GameToken is ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable {
    function initialize () public initializer {
        __ERC20_init("Game Token", "GAMETOKEN");
        __Ownable_init_unchained();
    }

    function mint(address _to, uint256 _amount) external virtual onlyOwner {
        _mint(_to, _amount);
    }
}
