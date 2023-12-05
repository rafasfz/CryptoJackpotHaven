import { useEffect, useRef, useState } from 'react';
import './styles.css'
import { ethers } from 'ethers';

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

      await sleep(1000);
      // @ts-expect-error ...
      clearInterval(intervalId1.current);
      await sleep(1000);
      // @ts-expect-error ...
      clearInterval(intervalId2.current);
      await sleep(1000);
      // @ts-expect-error ...
      clearInterval(intervalId3.current);

      setRandomize(false);
  };


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
      <div>
      <button onClick={handleButtonClick}>Parar Troca</button>
      </div>
    </div>
  );
};
