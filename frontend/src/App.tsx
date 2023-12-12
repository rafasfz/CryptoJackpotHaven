import './App.css'
import logo from './assets/logo.png'
import { Roulete } from './games/roulete'
import { useEffect, useState } from 'react'
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from 'ethers';
import { Slot } from './games/slot';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FootballBettingForm } from './games/create';
import abi from '../abi.json'
import { FootballBetting } from './games/football';


declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

function App() {
  const [accountWallet, setAccountWallet] = useState<string | null>(null)
  const [ballance, setBallance] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [currentGame, setCurrentGame] = useState<'roulette' | 'slot' | 'football' | 'create'>('roulette');

  useEffect(() => {
    if (contract) {
      contract.on('WithdrawBallance', (player) => {
        if (player.toLowerCase() === accountWallet?.toLowerCase()) {
          setBallance(0)
        }
      })
    }
  }, [contract])

  async function updateBallance() {
    if (contract) {
      setBallance(Number(ethers.formatEther(await contract.getBalance())));
    }
  }

  async function requestAccount() {
    if (!window.ethereum) {
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      setAccountWallet(accounts[0])
    } catch (error) {
      console.error(error)
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, abi, signer)

      setProvider(provider)
      setSigner(signer)
      setContract(contract)

      setBallance(Number(ethers.formatEther(await contract.getBalance())));

    }
  }

  function accountWalletFormatted() {
    if (!accountWallet) {
      return
    }

    return `${accountWallet.substr(0, 6)}...${accountWallet.substr(accountWallet.length - 4, accountWallet.length)}`
  }

  async function withdraw() {
    if (contract && signer) {
      await contract.withdrawBalance()
      setTimeout(async () => {
        await updateBallance()
      }, 500)
    }
  }

  function isAdmin() {
    return accountWallet === "0xF9639b0225fEB851Fb5FfFA210BC5F39e368568e".toLowerCase() ||
    accountWallet === "0x8AF6A3eE67e881C04a01a23D37C465f003cE6863".toLowerCase();
  }

  return (
    <div>
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
                      <a className="nav-link games" onClick={() => setCurrentGame('roulette')} style={currentGame === 'roulette' ? { backgroundColor: 'lightblue' } : {}}>Roulette <i className="icon ion-ios-arrow-forward icon-mobile"></i></a>
                    </li>
                    <li className="nav-item nav-custom-link">
                      <a className="nav-link games" onClick={() => setCurrentGame('slot')} style={currentGame === 'slot' ? { backgroundColor: 'lightblue' } : {}}>Slot Machine <i className="icon ion-ios-arrow-forward icon-mobile"></i></a>
                    </li>
                    <li className="nav-item nav-custom-link mr-3">
                      <a className="nav-link games" onClick={() => setCurrentGame('football')} style={currentGame === 'football' ? { backgroundColor: 'lightblue' } : {}}> Football <i className="icon ion-ios-arrow-forward icon-mobile"></i></a>
                    </li>


                    {/* modificar para que apenas endereços autorizados possam clicar aqui. */}
                    {isAdmin() ? <li className="nav-item nav-custom-link">
                      <a className="nav-link games" onClick={() => setCurrentGame('create')} style={currentGame === 'create' ? { backgroundColor: 'lightblue' } : {}}> Create <i className="icon ion-ios-arrow-forward icon-mobile"></i></a>
                    </li> : null}
                  </>}
                <li className="">
                  {accountWallet && <div className='nav-item nav-custom-link' style={{ display: 'flex', flexDirection: 'row' }}>

                    <span className="nav-link">Wallet address: {accountWalletFormatted()}</span>
                    <a className="nav-link">Ballance: {ballance}</a>
                    <button className="nav-link" onClick={withdraw}>
                      Withdraw
                    </button>
                  </div>
                  }
                  {!accountWallet && <button className="nav-link" onClick={connectWallet}>Join with Metamask <i className="icon ion-ios-arrow-forward icon-mobile"></i></button>}
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {(!provider || !signer || !contract) && <h1 style={{ color: '#fff' }}>Join with metamask to play</h1>}
        {provider && signer && contract && currentGame === 'roulette' && <Roulete provider={provider} signer={signer} contract={contract} updateBallance={updateBallance} accountWallet={accountWallet} />}
        {provider && signer && contract && currentGame === 'slot' && <Slot provider={provider} signer={signer} contract={contract} updateBallance={updateBallance} accountWallet={accountWallet} />}
        {provider && signer && contract && currentGame === 'create' && <FootballBettingForm contract={contract} accountWallet={accountWallet} />}
        {provider && signer && contract && currentGame === 'football' && <FootballBetting contract={contract} accountWallet={accountWallet} updateBallance={updateBallance} />}
      </>
    </div>
  )
}

export default App