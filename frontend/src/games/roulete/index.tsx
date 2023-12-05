import { useEffect, useState } from 'react';
import './styles.css'
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

interface RoueleteProps {
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  contract: ethers.Contract;
  accountWallet: string | null;
  updateBallance(): Promise<void>;
}

export function Roulete(props: RoueleteProps) {

    const [degrees, setDegrees] = useState<number>(0);
    const [valueRoulete, setValueRoulete] = useState<number>(0);
    const [resultText, setResultText] = useState<string>('');
    const degreesByNumber = {
      0: 0,
      32: 36,
      15: 35,
      19: 34,
      4: 33,
      21: 32,
      2: 31,
      25: 30,
      17: 29,
      34: 28,
      6: 27,
      27: 26,
      13: 25,
      36: 24,
      11: 23,
      30: 22,
      8: 21,
      23: 20,
      10: 19,
      5: 18,
      24: 17,
      16: 16,
      33: 15,
      1: 14,
      20: 13,
      14: 12,
      31: 11,
      9: 10,
      22: 9,
      18: 8,
      29: 7,
      7: 6,
      28: 6,
      12: 4,
      35: 3,
      3: 2,
      26: 1,
    }

    useEffect(() => {
      const container = document.querySelector(".roulette-container") as Element;
      // @ts-expect-error ...
      container.style.transform = `rotate(${degrees}deg)`;
      // @ts-expect-error ...
      container.style.transition = 'transform 2s ease-in-out';
  }, [degrees]);

    function spinRoullete() {
          setDegrees(prevDegrees => {
              const newDegrees = prevDegrees + 20000;
              return newDegrees;
          });
    }


    async function spin(target: number) {
      const totalRotationTime = 1000;
      // @ts-expect-error ...
      const targetDegree = degreesByNumber[target];
      
      const startTime = Date.now();
    
      const rotate = () => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < totalRotationTime) {
          spinRoullete();
          requestAnimationFrame(rotate);
        } else {
          setDegrees(targetDegree * (360 / 37));
        }
      };
    
      rotate();
    }


  async function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  

    useEffect(() => {
      if (props.contract) {
        props.contract.on("RouletteResponse", async (winner, number, value) => {
          if (props.accountWallet && winner.toLocaleLowerCase() == props.accountWallet.toLowerCase()) {
            await spin(number);
            await sleep(5000)
            console.log('asdasd');
            toast.success(`You won ${ethers.formatEther(value)} ETH`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              });
            await props.updateBallance();
          }
        })
      }
    }, [])

    useEffect(() => {
      if (props.contract) {
        props.contract.on("RouletteLost", async (loser, number) => {
          if (props.accountWallet && loser.toLowerCase() == props.accountWallet.toLowerCase()) {
            await spin(number);
            await props.updateBallance();
            await sleep(5000)
            console.log('asdasd');
              toast.warning(`You lost :(`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
          }
        })
      }
    }, [])

    async function betRoullete(color: number) {
      try {
        const weiValue = ethers.parseEther(valueRoulete.toString());
        const tx = await props.contract.roulete(color, {value: weiValue});
        await tx.wait();
      } catch(e) {
        toast.error(`Something went wrong :(`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      }
      
    }

  
    return (
      <div>


      <div className='rules'>
        <h1>Rules: </h1>
        <p>Green pays 14x bet value</p>
        <p>Red and Black pays 2x bet value</p>
      </div>
        <h3 style={{color: '#fff', textAlign: 'center'}}>
          {resultText}
        </h3>
        <span className="arrow"></span>
        <div className="roulette-container">
            <div className="zero">0</div>
            <div className="thirty-two">32</div>
            <div className="fifteen">15</div>
            <div className="nineteen">19</div>
            <div className="four">4</div>
            <div className="twenty-one">21</div>
            <div className="two">2</div>
            <div className="twenty-five">25</div>
            <div className="seventeen">17</div>
            <div className="thirty-four">34</div>
            <div className="six">6</div>
            <div className="twenty-seven">27</div>
            <div className="thirteen">13</div>
            <div className="thirty-six">36</div>
            <div className="eleven">11</div>
            <div className="thirty">30</div>
            <div className="eight">8</div>
            <div className="twenty-three">23</div>
            <div className="ten">10</div>
            <div className="five">5</div>
            <div className="twenty-four">24</div>
            <div className="sixteen">16</div>
            <div className="thirty-three">33</div>
            <div className="one">1</div>
            <div className="twenty">20</div>
            <div className="fourteen">14</div>
            <div className="thirty-one">31</div>
            <div className="nine">9</div>
            <div className="twenty-two">22</div>
            <div className="eighteen">18</div>
            <div className="twenty-nine">29</div>
            <div className="seven">7</div>
            <div className="twenty-eight">28</div>
            <div className="twelve">12</div>
            <div className="thirty-five">35</div>
            <div className="three">3</div>
            <div className="twenty-six">26</div>

        </div>

        <div className="roueltte-bet-container">
          
          <div>
            <button className="spin" style={{backgroundColor: 'red'}} onClick={() => betRoullete(1)}></button>
            <button className="spin" style={{backgroundColor: 'black'}} onClick={() => betRoullete(2)}></button>
            <button className="spin"  style={{backgroundColor: 'green'}} onClick={() => betRoullete(0)}></button>
          </div>
          <div className='input-value'>
            <span  className='label'>BET VALUE IN ETH: </span>
            <input className='' step="any" type='number' onChange={(e) => {
              const re = /^[0-9\b.]+$/;
              if ( e.target.value[e.target.value.length - 1] === '.' || e.target.value === '' || re.test(e.target.value)) {
                setValueRoulete(Number(e.target.value))
              }

            }} />
          </div>
        </div>
      </div>
    )
}

