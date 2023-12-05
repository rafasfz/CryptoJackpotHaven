// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CryptoJackpotHaven {

    address private owner;

    constructor() {
        owner = msg.sender;
    }

    event RouletteResponse(address winner, uint256 number, uint256 value);
    event RouletteLost(address loser, uint256 number);
    event WithdrawBallance(address player);
    event SlotsResult(address player, SlotsSymbols[3] symbols, uint256 value);
    
    function withDrawProfits(uint value) public {
        require(msg.sender == owner, "You are not the owner");
        require(value <= address(this).balance, "You are trying to withdraw more than the contract has");

        payable(msg.sender).transfer(value);
        balance[msg.sender] -= value;
    }

    mapping (address => uint) balance;

    function withdrawBalance() public {
        require(balance[msg.sender] > 0, "You have no balance to withdraw");

        payable(msg.sender).transfer(balance[msg.sender]);
        balance[msg.sender] = 0;
        emit WithdrawBallance(msg.sender);
    }

    function getBalance() public view returns (uint) {
        return balance[msg.sender];
    }

    enum RouleteChoices{ GREEN, RED, BLACK }

    uint constant GREEN_ODD = 14;
    uint constant RED_ODD = 2;
    uint constant BLACK_ODD = 2;

    struct OutputsRoulete {
        uint number;
        uint256 winValue;
    }

    function roulete(RouleteChoices choice) payable public returns (OutputsRoulete memory) {
        uint256 betValue = msg.value;
        require(betValue > 0, "You need to bet something");

        uint[1] memory greenNumbers = [uint(0)];

        uint[18] memory redNumbers = [
            uint(1), uint(3), uint(5), uint(7), uint(9), uint(12), uint(14), uint(16), uint(18), uint(19), uint(21), uint(23), uint(25), uint(27), uint(30), uint(32), uint(34), uint(36)
        ];

        uint[18] memory blackNumbers = [
            uint(2), uint(4), uint(6), uint(8), uint(10), uint(11), uint(13), uint(15), uint(17), uint(20), uint(22), uint(24), uint(26), uint(28), uint(29), uint(31), uint(33), uint(35)
        ];

        uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 37;

        OutputsRoulete memory output = OutputsRoulete(random, 0);
        uint256 winValue = 0;

        if (choice == RouleteChoices.GREEN) {
            if (random == greenNumbers[0]) {
                winValue = betValue * GREEN_ODD;
            }
        } else if (choice == RouleteChoices.RED) {
            for (uint i = 0; i < redNumbers.length; i++) {
                if (random == redNumbers[i]) {
                    winValue = betValue * RED_ODD;
                }
            }
        } else if (choice == RouleteChoices.BLACK) {
            for (uint i = 0; i < blackNumbers.length; i++) {
                if (random == blackNumbers[i]) {
                    winValue = betValue * BLACK_ODD;
                }
            }
        }

        balance[msg.sender] += winValue;
        output.winValue = winValue;

        if (winValue == 0) {
            emit RouletteLost(msg.sender, random);
        } else {
            emit RouletteResponse(msg.sender, random, winValue);
        }

        
        return output;
    }

    enum SlotsSymbols{ HEART, STAR, DIAMOND, JOKER }
    uint constant HEART_ODD = 3;
    uint constant STAR_ODD = 5;
    uint constant DIAMOND_ODD = 10;
    uint constant JOKER_ODD = 50;


    function determinePayoutWithJoker(SlotsSymbols symbol1, SlotsSymbols symbol2) private pure returns (uint) {
        if (symbol1 == symbol2) {
            if (symbol1 == SlotsSymbols.HEART) {
                return HEART_ODD;
            } else if (symbol1 == SlotsSymbols.STAR) {
                return STAR_ODD;
            } else if (symbol1 == SlotsSymbols.DIAMOND) {
                return DIAMOND_ODD;
            }
            else if (symbol1 == SlotsSymbols.JOKER) {
                return JOKER_ODD;
            }
        }
        return 0;
    }

    function getPayoutBySymbol(SlotsSymbols symbol1, SlotsSymbols symbol2, SlotsSymbols symbol3) private pure returns (uint256) {
        uint256 payout = 0;

        if (symbol1 == symbol2 && symbol2 == symbol3) {
            if (symbol1 == SlotsSymbols.HEART) {
                payout = HEART_ODD;
            } else if (symbol1 == SlotsSymbols.STAR) {
                payout = STAR_ODD;
            } else if (symbol1 == SlotsSymbols.DIAMOND) {
                payout = DIAMOND_ODD;
            } else if (symbol1 == SlotsSymbols.JOKER) {
                payout = JOKER_ODD;
            }
        } else if (symbol1 == SlotsSymbols.JOKER) {
            payout = determinePayoutWithJoker(symbol2, symbol3);
        } else if (symbol2 == SlotsSymbols.JOKER) {
            payout = determinePayoutWithJoker(symbol1, symbol3);
        } else if (symbol3 == SlotsSymbols.JOKER) {
            payout = determinePayoutWithJoker(symbol1, symbol2);
        }

        return payout;
    }

    function getSymbolByRgn(uint rng) private pure returns (SlotsSymbols) {
        if (rng >= 0 && rng < 40) {
            return SlotsSymbols.HEART;
        } else if (rng >= 40 && rng < 70) {
            return SlotsSymbols.STAR;
        } else if (rng >= 70 && rng < 90) {
            return SlotsSymbols.DIAMOND;
        }

        return SlotsSymbols.JOKER;
    }

    

    struct OutputsSlotMachine {
        SlotsSymbols[3] symbols;
        uint winValue;
    }

    function slotMachine() payable public returns (OutputsSlotMachine memory) {
        uint256 betValue = msg.value;
        require(betValue > 0, "You need to bet something");

        uint firstSpin = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100;
        uint secondSpin = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) >> 3 % 100;
        uint thirdSpin = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) >> 6 % 100;

        SlotsSymbols[3] memory symbols = [ getSymbolByRgn(firstSpin), SlotsSymbols(secondSpin), SlotsSymbols(thirdSpin) ];

        uint256 winValue = betValue * getPayoutBySymbol(symbols[0], symbols[1], symbols[2]);

        OutputsSlotMachine memory output = OutputsSlotMachine(symbols, winValue);

        emit SlotsResult(msg.sender, symbols, winValue);
        return output;

    }
    
}
