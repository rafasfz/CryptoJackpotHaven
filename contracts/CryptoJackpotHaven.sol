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
        } else {
            if ((symbol1 == SlotsSymbols.HEART && symbol2 == SlotsSymbols.JOKER) || (symbol2 == SlotsSymbols.HEART && symbol1 == SlotsSymbols.JOKER)) {
                return HEART_ODD;
            } else if ((symbol1 == SlotsSymbols.STAR && symbol2 == SlotsSymbols.JOKER) || (symbol2 == SlotsSymbols.STAR && symbol1 == SlotsSymbols.JOKER)) {
                return STAR_ODD;
            } else if ((symbol1 == SlotsSymbols.DIAMOND && symbol2 == SlotsSymbols.JOKER) || (symbol2 == SlotsSymbols.DIAMOND && symbol1 == SlotsSymbols.JOKER)) {
                return DIAMOND_ODD;
            }
            else if ((symbol1 == SlotsSymbols.JOKER && symbol2 == SlotsSymbols.JOKER)) {
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

        uint seed = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, seed)));
        uint firstSpin = random % 100;
        seed = random;
        random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, seed)));
        uint secondSpin = random % 100;
        random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, seed)));
        uint thirdSpin = random % 100;

        SlotsSymbols[3] memory symbols = [ getSymbolByRgn(firstSpin), getSymbolByRgn(secondSpin), getSymbolByRgn(thirdSpin) ];

        uint256 winValue = betValue * getPayoutBySymbol(symbols[0], symbols[1], symbols[2]);
        balance[msg.sender] += winValue;

        OutputsSlotMachine memory output = OutputsSlotMachine(symbols, winValue);

        emit SlotsResult(msg.sender, symbols, winValue);
        return output;
    }

    struct Match {
        uint256 matchId;
        string teamA;
        string logoTeamA;
        string teamB;
        string logoTeamB;
        string date;
        string tournament;
        uint256 teamAWins;
        uint256 teamBWins;        
        uint256 draws;        
        mapping (address => Bet) bets;
        address[] bettors;        
    }

    struct Bet {
        uint256 amount;
        uint256 outcome; // 0 for Team A, 1 for Draw, 2 for team b
    }

    mapping(uint256 => Match) public matches;
    uint256 public matchCount;
    
    function createMatch(
        string memory _teamA,
        string memory _teamB,
        string memory _logoA,
        string memory _logoB,
        string memory _tournament,
        string memory _startTime
    ) public {
        require(msg.sender == owner, "You are not the owner");
        matchCount++;
        Match storage newMatch = matches[matchCount];
        initializeMatch(newMatch, _teamA, _logoA, _teamB, _logoB, _startTime, _tournament);
    }

    function initializeMatch(
        Match storage _match,
        string memory _teamA,
        string memory _logoA,
        string memory _teamB,
        string memory _logoB,
        string memory _startTime,
        string memory _tournament
    ) internal {
        _match.matchId = matchCount;
        _match.teamA = _teamA;
        _match.logoTeamA = _logoA;
        _match.teamB = _teamB;
        _match.logoTeamB = _logoB;
        _match.date = _startTime;
        _match.tournament = _tournament;
        _match.teamAWins = 0;
        _match.teamBWins = 0;
        _match.draws = 0;        
        _match.bettors;
    }

    function placeBet(uint256 _matchId, uint256 _outcome) external payable {
        require(_outcome <= 2, "Invalid outcome");                
        Match storage matchInstance = matches[_matchId];        

        Bet storage userBet = matchInstance.bets[msg.sender];
        require(userBet.amount == 0, "You already placed a bet");

        userBet.amount = msg.value;
        userBet.outcome = _outcome;

        if (_outcome == 0) {
            matchInstance.teamAWins += msg.value;
        } else if (_outcome == 1) {
            matchInstance.draws += msg.value;            
        } else {            
            matchInstance.teamBWins += msg.value;
        }

        matchInstance.bettors.push(msg.sender);                
    }    

    function finalizeMatch(uint256 _matchId, uint256 _winningOutcome) public {        

        Match storage matchInstance = matches[_matchId];        


        uint256 totalPool = matchInstance.teamAWins + matchInstance.teamBWins + matchInstance.draws;

        if (_winningOutcome == 0) {
            distributePrizes(matchInstance, matchInstance.teamAWins, totalPool, matchInstance.bets, 0);
        } else if (_winningOutcome == 1) {
            distributePrizes(matchInstance, matchInstance.draws, totalPool, matchInstance.bets, 1);
        } else {
            distributePrizes(matchInstance, matchInstance.teamBWins, totalPool, matchInstance.bets, 2);
        }        

        delete matches[_matchId];
    }

    function distributePrizes(Match storage matchInstance, uint256 _totalWinningAmount, uint256 _totalPool, mapping(address => Bet) storage _bets, uint256 _winningOutcome) internal {            
        require(_winningOutcome <= 2, "Invalid winning outcome");

        if ((matchInstance.draws != 0 && matchInstance.teamAWins != 0) ||
            (matchInstance.draws != 0 && matchInstance.teamBWins != 0) ||
            (matchInstance.teamAWins != 0 && matchInstance.teamBWins != 0)) {
            uint256 tax = (_totalPool * 10) / 100;
            _totalPool -= tax;  
            payable(msg.sender).transfer(tax);
        }
        
        //se ninguém venceu, então recebo todo o prêmio
        if (_totalWinningAmount == 0) {
            payable(msg.sender).transfer(_totalPool);
        } else {
            // Distribuir prêmios proporcionalmente
            for (uint256 i = 0; i < matchInstance.bettors.length; i++) {        
                Bet storage userBet = _bets[matchInstance.bettors[i]];
                
                if (userBet.outcome == _winningOutcome) {                
                    uint256 userShare = (userBet.amount * _totalPool) / _totalWinningAmount;                
                    balance[matchInstance.bettors[i]] += userShare;                
                }
            }    
        }        
    }

    // nova struct para armazenar informações resumidas sobre uma partida
    struct MatchSummary {
        uint256 matchId;
        string teamA;
        string logoTeamA;
        string teamB;
        string logoTeamB;
        string date;
        string tournament;        
    }
    

    function getMatches() external view returns (MatchSummary[] memory) {        
        uint256 validMatchesCount = 0;
        
        for (uint256 i = 1; i <= matchCount; i++) {
            if (matches[i].matchId != 0) {
                validMatchesCount++;
            }
        }
        
        MatchSummary[] memory matchSummaries = new MatchSummary[](validMatchesCount);
        
        uint256 index = 0;
        
        for (uint256 i = 1; i <= matchCount; i++) {
            if (matches[i].matchId != 0) {
                matchSummaries[index] = MatchSummary({
                    matchId: matches[i].matchId,
                    teamA: matches[i].teamA,
                    logoTeamA: matches[i].logoTeamA,
                    teamB: matches[i].teamB,
                    logoTeamB: matches[i].logoTeamB,
                    date: matches[i].date,
                    tournament: matches[i].tournament
                });
                index++;
            }
        }

        return matchSummaries;
    }


}


