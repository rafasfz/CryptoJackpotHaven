import { useEffect, useState } from 'react';
import './styles.css'
import { ethers } from 'ethers';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

// @ts-expect-error ...
export function FootballBettingForm({ contract, accountWallet }: { contract: ethers.Contract, accountWallet: string | null }) {
  const [teamA, setTeamA] = useState('');
  const [teamALogo, setTeamALogo] = useState('');
  const [teamB, setTeamB] = useState('');
  const [teamBLogo, setTeamBLogo] = useState('');  
  const [tournament, setTournament] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  // const [round, setRound] = useState('');
  // @ts-expect-error ...
  const [matches, setMatches] = useState<any[]>([]);


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

  const handleCreateMatch = async () => {
    try {
      await contract.createMatch(teamA, teamB, teamALogo, teamBLogo, tournament, date ? format(date, 'dd/MM/yyyy') : 'TBD');
      updateMatches();
    } catch (error) {
      console.error('Erro ao criar partida:', error);
    }
  };

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


  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  

  return (
    <div>
      <h2 className="p-3 m-4">Football Betting</h2>

      {/* Formulário para adicionar campeonatos */}
      <form className="mt-3">
        <div className="mb-3 d-flex align-items-start">
          <div className="mb-3">
            <div>
              <label htmlFor="teamA" className="form-label">
                First Team:
              </label>
              <input
                type="text"
                className="form-control"
                id="teamA"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
              />
            </div>

            <div className="mt-2">
              <label htmlFor="teamALogo" className="form-label">
                First Team Logo URL:
              </label>
              <input
                type="text"
                className="form-control"
                id="teamALogo"
                placeholder="Team A Logo URL"
                value={teamALogo}
                onChange={(e) => setTeamALogo(e.target.value)}
              />
            </div>
          </div>

          {teamALogo && (
            <div className="img-container d-flex justify-content-center align-items-center ml-3" style={{ width: '200px', height: '200px', marginTop: '-10px', border: '1px solid #000' }}>
              <img src={teamALogo} alt="Team A Logo" className="img-fluid" />
            </div>
          )}
        </div>

        <br></br>        

        <div className="mb-3 d-flex align-items-start">
          <div className="mb-3">
            <div>
              <label htmlFor="teamB" className="form-label">
                Second Team:
              </label>
              <input
                type="text"
                className="form-control"
                id="teamB"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
              />
            </div>

            <div className="mt-2">
              <label htmlFor="teamBLogo" className="form-label">
                Second Team Logo URL:
              </label>
              <input
                type="text"
                className="form-control"
                id="teamBLogo"
                placeholder="Team B Logo URL"
                value={teamBLogo}
                onChange={(e) => setTeamBLogo(e.target.value)}
              />
            </div>
          </div>

          {teamBLogo && (
            <div className="img-container d-flex justify-content-center align-items-center ml-3" style={{ width: '200px', height: '200px', marginTop: '-10px', border: '1px solid #000' }}>
              <img src={teamBLogo} alt="Team B Logo" className="img-fluid" />
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between">
          <div className="mb-3">
            <label htmlFor="tournament" className="form-label">
              Tournament:
            </label>
            <input
              type="text"
              className="form-control"
              id="tournament"
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
            />
          </div>

          <div className="mb-3 ml-3">
            <label htmlFor="date" className="form-label">
              Date:
            </label>
            <div className="input-group">                          
              <DatePicker
                selected={date}                
                onChange={handleDateChange}
                className="form-control"
              />
              
            </div>
          </div>

          
        </div>

        <br></br>

        <div className="d-flex justify-content-center mt-3">
          <button type="button" className="btn btn-primary btn-lg" onClick={handleCreateMatch}>
            Create Match
          </button>
        </div>


      </form>
    </div>
  );
}
