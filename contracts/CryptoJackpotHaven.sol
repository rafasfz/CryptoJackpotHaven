// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CryptoJackpotHaven {
    mapping (address => uint) balance;

    function withdrawBalance() public {
        require(balance[msg.sender] > 0, "You have no balance to withdraw");

        payable(msg.sender).transfer(balance[msg.sender]);
        balance[msg.sender] = 0;
    }

    function getBalance() public view returns (uint) {
        return balance[msg.sender];
    }

    enum RouleteChoices{ GREEN, RED, BLACK }

    function roulete(RouleteChoices choice) payable public returns (bool) {
        uint betValue = msg.value;
        require(betValue > 0, "You need to bet something");

        uint[1] memory greenNumbers = [uint(0)];

        uint[18] memory redNumbers = [
            uint(1), uint(3), uint(5), uint(7), uint(9), uint(12), uint(14), uint(16), uint(18), uint(19), uint(21), uint(23), uint(25), uint(27), uint(30), uint(32), uint(34), uint(36)
        ];

        uint[18] memory blackNumbers = [
            uint(2), uint(4), uint(6), uint(8), uint(10), uint(11), uint(13), uint(15), uint(17), uint(20), uint(22), uint(24), uint(26), uint(28), uint(29), uint(31), uint(33), uint(35)
        ];

        uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 37;

        if (choice == RouleteChoices.GREEN) {
            if (random == greenNumbers[0]) {
                balance[msg.sender] += betValue * 14;
                return true;
            }
        } else if (choice == RouleteChoices.RED) {
            for (uint i = 0; i < redNumbers.length; i++) {
                if (random == redNumbers[i]) {
                    balance[msg.sender] += betValue * 2;
                    return true;
                }
            }
        } else if (choice == RouleteChoices.BLACK) {
            for (uint i = 0; i < blackNumbers.length; i++) {
                if (random == blackNumbers[i]) {
                    balance[msg.sender] += betValue * 2;
                    return true;
                }
            }
        }

        return false;
    }

}
