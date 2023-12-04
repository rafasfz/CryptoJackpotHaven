import './App.css'
import logo from './assets/logo.png'
import { Roulete } from './games/roulete'
import { useEffect, useState } from 'react'
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from 'ethers';
import { ToastContainer } from 'react-toastify';
import { Slot } from './games/slot';

declare global {
  interface Window{
    ethereum?:MetaMaskInpageProvider
  }
}

const abi = [
  "function withDrawProfits(uint value)",
  "function getBalance() view returns (uint)",
  "function roulete(uint8 choice) payable public returns (tuple(uint number, uint winValue) memory)",
  "function slotMachine() payable public returns (tuple(uint8[3] symbols, uint winValue) memory)",
  "event RouletteResponse(address winner, uint256 number, uint256 value)",
  "event RouletteLost(address loser, uint256 number)",
  "event UpdateBallance(address player, uint256 value)"
]

function App() {
  const [accountWallet, setAccountWallet] = useState<string | null>(null)
  const [ballance, setBallance] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [currentGame, setCurrentGame] = useState<'roulette' | 'slot'>('roulette')

  async function updateBallance() {
    if (contract) {
      setBallance(ethers.formatEther(await contract.getBalance()));
    }
  }

  async function requestAccount() {
    if(!window.ethereum) {
      return;
    }
  
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      setAccountWallet(accounts[0])
    } catch (error) {
      console.error(error)
    }
  }

  async function connectWallet() {
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, abi, signer)

      setProvider(provider)
      setSigner(signer)
      setContract(contract)
      setBallance(ethers.formatEther(await contract.getBalance()));

    }
  }

  function accountWalletFormatted() {
    if(!accountWallet) {
      return  
    }

    return `${accountWallet.substr(0, 6)}...${accountWallet.substr(accountWallet.length - 4, accountWallet.length)}`
  }

  async function withdraw() {
    if (contract && signer) {
      await contract.withDrawProfits(ethers.parseEther(String(ballance) || '0.0'))
      setTimeout(async () => {
        await updateBallance()
      }, 500)
    }
  }


  return (
    <>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              />
              {/* Same as */}
              <ToastContainer />
        
        <nav className="navbar navbar-default navbar-expand-lg fixed-top custom-navbar">
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span className="icon ion-md-menu"></span>
        </button>
        <img src={logo} className="img-fluid nav-logo-mobile" alt="Company Logo" />
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <div className="container">
            <img src={logo} className="img-fluid nav-logo-desktop" alt="Company Logo" />
            <ul className="navbar-nav ml-auto nav-right" data-easing="easeInOutExpo" data-speed="1250" data-offset="65">
              {accountWallet && 
              <>
              <li className="nav-item nav-custom-link">
                <a className="nav-link" onClick={() => setCurrentGame('roulette')} style={currentGame === 'roulette' ? {backgroundColor: 'lightblue'} : {}}>Roulette <i className="icon ion-ios-arrow-forward icon-mobile"></i></a>
                </li>
                <li className="nav-item nav-custom-link">
                  <a className="nav-link" onClick={() => setCurrentGame('slot')} style={currentGame === 'slot' ? {backgroundColor: 'lightblue'} : {}}>Slot Machine <i className="icon ion-ios-arrow-forward icon-mobile"></i></a>
                </li></>}
              <li className="">
                {accountWallet && <div className='nav-item nav-custom-link' style={{display: 'flex', flexDirection: 'row'}}>
                
                  <span className="nav-link">Wallet address: {accountWalletFormatted()}</span>
                    <a className="nav-link">Ballance: {ballance}</a>
                  <button className="nav-link" onClick={withdraw}>
                    Withdraw
                  </button>
                </div>
                }
                {!accountWallet &&  <button className="nav-link" onClick={connectWallet}>Join with Metamask <i className="icon ion-ios-arrow-forward icon-mobile"></i></button>}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {provider && signer && contract && currentGame === 'roulette' && <Roulete provider={provider} signer={signer} contract={contract} updateBallance={updateBallance} accountWallet={accountWallet} />}
      {provider && signer && contract && currentGame === 'slot' && <Slot provider={provider} signer={signer} contract={contract} updateBallance={updateBallance} accountWallet={accountWallet} />}
    </>
  )
}

export default App
