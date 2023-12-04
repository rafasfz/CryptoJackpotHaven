import { useEffect, useState } from 'react';
import './styles.css'
import { ethers } from 'ethers';

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

export const Slot = (props) => {
  const [randomImage, setRandomImage] = useState<string>(images[0]);
  
  const [intervalId, setIntervalId] = useState<number | null>(null);
  useEffect(() => {
    const changeImage = () => {
      const randomIndex = Math.floor(Math.random() * images.length);
      setRandomImage(images[randomIndex]);
    };

    const id = setInterval(changeImage, 100);
    setIntervalId(id);

    return () => {
      clearInterval(id);
    };
  }, [images]);

  const handleButtonClick = () => {
    clearInterval(intervalId);
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
      <img src={randomImage} alt="Casino image" className='slot-image' style={{ width: '300px', height: '300px',  objectFit: 'cover', }} />
      <img src={randomImage} alt="Casino image" className='slot-image' style={{ width: '300px', height: '300px',  objectFit: 'cover', }} />
      <img src={randomImage} alt="Casino image" className='slot-image' style={{ width: '300px', height: '300px',  objectFit: 'cover', }} />
      <div>
      <button onClick={handleButtonClick}>Parar Troca</button>
      </div>
    </div>
  );
};
