import { useEffect, useRef, useState } from 'react';
import './styles.css'
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

// @ts-expect-error ...
interface SlotProps {
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  contract: ethers.Contract;
  accountWallet: string | null;
  updateBallance(): Promise<void>;
}

const images = [
  'https://img.freepik.com/premium-vector/valentines-day-cute-heart-illustration-heart-kawaii-chibi-vector-drawing-style-heart-cartoon-valenti_622550-67.jpg',
  'https://img.freepik.com/premium-vector/star-icon-shiny-golden-star-symbol_160901-5359.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFncT1RXofjBGO_z0dJhU3K0SjDUC_jmqWuQ&usqp=CAU',
  'https://jphoenixbrasil.com/wp-content/uploads/2022/08/haha.jpg',
];

// @ts-expect-error ...
export const Slot = (props) => {
  const [image1, setImage1] = useState<string>(images[0]);
  const [image2, setImage2] = useState<string>(images[0]);
  const [image3, setImage3] = useState<string>(images[0]);
  
  
  const intervalId1 = useRef<number | null>(null);
  const intervalId2 = useRef<number | null>(null);
  const intervalId3 = useRef<number | null>(null);

  const [randomize, setRandomize] = useState<boolean>(true);
  const [valueRoulete, setValueRoulete] = useState<number>(0);
  
  useEffect(() => {
    if (randomize) {
      return randomizeImages();
    }
  }, [randomize])

  function randomizeImages() {
    const changeImage1 = () => {
      const randomIndex = Math.floor(Math.random() * images.length);
      setImage1(images[randomIndex]);
    };

    const changeImage2 = () => {
      const randomIndex = Math.floor(Math.random() * images.length);
      setImage2(images[randomIndex]);
    };

    const changeImage3 = () => {
      const randomIndex = Math.floor(Math.random() * images.length);
      setImage3(images[randomIndex]);
    };

    const id1 = setInterval(changeImage1, 100);
    const id2 = setInterval(changeImage2, 100);
    const id3 = setInterval(changeImage3, 100);
    // @ts-expect-error ...
    intervalId1.current = id1;
    // @ts-expect-error ...
    intervalId2.current = id2;
    // @ts-expect-error ...
    intervalId3.current = id3;

    return () => {
      clearInterval(id1);
      clearInterval(id2);
      clearInterval(id3);
    };
  }

  async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const handleButtonClick = async () => {
      setRandomize(true);

      try {
        const weiValue = ethers.parseEther(valueRoulete.toString());
        console.log(weiValue);
        const tx = await props.contract.slotMachine({value: weiValue});        
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
  };

  useEffect(() => {
    props.contract.on('SlotsResult', async (player: string, resultsNumber: number[], value: number) => {
      if (props.accountWallet && player.toLowerCase() == props.accountWallet.toLowerCase()) {
        console.log(resultsNumber);
        console.log(value);
        console.log(typeof resultsNumber)
        // @ts-expect-error ...
        clearInterval(intervalId1.current);
        setImage1(images[resultsNumber[0]]);
        await sleep(1000);
        // @ts-expect-error ...
        clearInterval(intervalId2.current);
        setImage2(images[resultsNumber[1]]);
        await sleep(1000);
        // @ts-expect-error ...
        clearInterval(intervalId3.current);
        setImage3(images[resultsNumber[2]]);
        setRandomize(false);
        if (value == 0) {
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
        } else {
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
        }
        await props.updateBallance();
      }
    })
  }, [])


  return (
    <div className='slot-container'>
      <div className='rules'>
        <h1>Rules: </h1>
        <p>3x hearts you win 3x yout bet value</p>
        <p>3x stars you win 5x yout bet value</p>
        <p>3x diamonds you win 10x yout bet value</p>
        <p>3x jokers you win 50x yout bet value</p>
        <p>Joker also substitute any other value</p>
      </div>
      <img src={image1} alt="Casino image" className='slot-image' style={{ width: '300px', height: '300px',  objectFit: 'cover', }} />
      <img src={image2} alt="Casino image" className='slot-image' style={{ width: '300px', height: '300px',  objectFit: 'cover', }} />
      <img src={image3} alt="Casino image" className='slot-image' style={{ width: '300px', height: '300px',  objectFit: 'cover', }} />
      <div className='roueltte-bet-container'>
      <div className='input-value'>
            <span  className='label'>BET VALUE IN ETH: </span>
            <input className='' step="any" type='number' onChange={(e) => {
              const re = /^[0-9\b.]+$/;
              if (e.target.value[e.target.value.length - 1] === '.' || e.target.value === '' || re.test(e.target.value)) {
                setValueRoulete(Number(e.target.value))
              }

            }} />
          </div>
      <button onClick={handleButtonClick} style={{marginTop: '10px'}}>Roll machine</button>
      </div>
    </div>
  );
};
