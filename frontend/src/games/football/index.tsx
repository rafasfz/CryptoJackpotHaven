import { SetStateAction, useEffect, useState } from 'react';
import './styles.css'
import { ethers } from 'ethers';
import 'react-datepicker/dist/react-datepicker.css';

// @ts-expect-error ...
interface FootballBettingInterface {
    contract: ethers.Contract;
    accountWallet: string | null;
    updateBallance(): Promise<void>;
}

export function FootballBetting({ contract, accountWallet, updateBallance }: { contract: ethers.Contract, accountWallet: string | null, updateBallance: () => Promise<void> }) {
    const [matches, setMatches] = useState<any[]>([]);
    const [betAmounts, setAmounts] = useState<string[]>([]);
    const [outcomes, setOutcomes] = useState<string[]>([]);

    const updateMatches = async () => {
        if (contract) {
            try {
                const matchesFromContract = await contract.getMatches();    
                setMatches(matchesFromContract)
            } catch (error) {
                console.error('Error updating matches:', error);
            }
        }
    };

    useEffect(() => {
        updateMatches();
    }, [updateMatches]);


    useEffect(() => {
        updateBallance();
    }, [updateBallance]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                await updateMatches();
            } catch (error) {
                console.error('Erro ao obter partidas:', error);
            }
        };

        fetchMatches();
    }, [contract, updateMatches]);

    function isAdmin() {
        return accountWallet === "0xF9639b0225fEB851Fb5FfFA210BC5F39e368568e".toLowerCase();
    }

    const handleMatchClose = async (matchId: number, winningOutcome: string) => {
        const outcome = winningOutcome === 'teamA' ? 1 : winningOutcome === 'draw' ? 0 : 2;

        try {
            console.log(matches.length);
            if (winningOutcome != null) {
                console.log(winningOutcome == null);

                const transaction = await contract.finalizeMatch(matchId, outcome);

                await transaction.wait();

                updateMatches();
                alert('Match finalized successfully!');
            } else {
                alert('Invalid outcome value.');
            }
        } catch (error) {
            alert('Error finalizing match: ' + error);
        }
    };

    const handleBetClick = async (matchId: number, index: number) => {
        const re = /^[0-9\b.]+$/;
        if (!re.test(betAmounts[index]) || !outcomes[index]) {
            alert('Digite um valor válido para a aposta e selecione um resultado.');
            return;
        }

        const outcome = outcomes[index] === 'teamA' ? 1 : outcomes[index] === 'draw' ? 0 : 2;

        try {
            const amountInWei = ethers.parseEther(betAmounts[index]);

            console.log(amountInWei + ' ' + outcome);
            const result = await contract.placeBet(matchId, outcome, { value: amountInWei });

            alert('Transação bem-sucedida: ' + result);

            updateMatches();
        } catch (error) {
            // Lida com erros, se houver algum
            alert('Erro ao realizar a aposta: ' + error);
        }
    };

    return (
        <div>
            <h2 className="p-3 m-auto">Football Betting: bet on your favorite team! </h2>
            <br></br>
            <div>

                <ul className="matches-list">
                    {matches.map((match, index) => (
                        <li key={match.matchId} className="match-card">
                            <div className="team-info mb-2">
                                <p className="team-name"> {match.tournament} - {match.date} </p>
                                {isAdmin() ? <span style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={(e) => {
                                    e.preventDefault();
                                    handleMatchClose(match.matchId, outcomes[index]);
                                }}>
                                    <button className="btn btn-danger circle-button" style={{ borderRadius: '50%', marginLeft: '85px', color: 'white' }}>Close</button>
                                </span> : null}
                            </div>

                            <div className="team-info">
                                <img src={match.logoTeamA} alt={match.teamA} className="team-logo" />
                                <span className="team-name">{match.teamA}</span>
                                <input type="radio" name={`match${match.matchId}`} value="teamA" onChange={() => {
                                    const newOutcomes = [...outcomes];
                                    newOutcomes[index] = 'teamA';
                                    setOutcomes(newOutcomes);
                                }} />
                            </div>
                            <div className="team-info">
                                <img
                                    src={"https://garden.spoonflower.com/c/8345881/p/f/m/H2z-v_DSPz_8SzeGQPj1pq-__9bbKydqeXvNp_IJqZKQlBAiEgs/plain%20gray%20solid%20colour%20grey%20wallpaper%20for%20walls.jpg"}
                                    alt={"Draw"}
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        marginBottom: '5px',
                                        backgroundColor: '#ccc',
                                        objectFit: 'cover',
                                    }}
                                />

                                <span className="team-name">{"Draw"}</span>
                                <input type="radio" name={`match${match.matchId}`} value="draw" onChange={() => {
                                    const newOutcomes = [...outcomes];
                                    newOutcomes[index] = 'draw';
                                    setOutcomes(newOutcomes);
                                }} />
                            </div>

                            <div className="team-info mb-1">
                                <img src={match.logoTeamB} alt={match.teamB} className="team-logo" />
                                <span className="team-name">{match.teamB}</span>
                                <input type="radio" name={`match${match.matchId}`} value="teamB" onChange={() => {
                                    const newOutcomes = [...outcomes];
                                    newOutcomes[index] = 'teamB';
                                    setOutcomes(newOutcomes);
                                }} />
                            </div>

                            <div className="bet-info d-flex align-items-center" style={{ textAlign: 'justify' }}>
                                <input
                                    type="text"
                                    className="form-control bet-input"
                                    placeholder="Amount in ETH"
                                    value={betAmounts[index]}
                                    onChange={(e) => {
                                        const newBetAmounts = [...betAmounts];
                                        newBetAmounts[index] = e.target.value;
                                        setAmounts(newBetAmounts);
                                    }}
                                    style={{ borderRadius: '5px', marginRight: '5px' }}
                                />
                                <button className="btn btn-primary" onClick={(e) => {
                                    e.preventDefault();
                                    handleBetClick(match.matchId, index);
                                }} style={{ borderRadius: '50px' }}>Bet</button>
                            </div>
                        </li>

                    ))}
                </ul>

            </div>
        </div>
    );
}
