import { useEffect, useState } from 'react';
import { useWallet } from './hooks/useWallet';
import styles from './styles.module.css';
import { ethers } from 'ethers';
import MainABI from './abis/Main.json'; // Ensure the path is correct
import { MintCardsForm } from './components/MintCardsForm'; 
import { CreateCollectForm } from './components/CreateCollectForm'; 

// Replace with your deployed contract address from Hardhat deployment logs
const contractAddress = "0x7751483EAe19d423C390632Dc2e0cABcd2d42054";

export const App = () => {
  const wallet = useWallet();
  const { details, contract } = wallet || {};
  const [currentOwner, setCurrentOwner] = useState<string>('');
  const { ethereum } = window;

  // Request MetaMask access on component mount
  useEffect(() => {
    const requestMetaMaskAccess = async () => {
      if (ethereum) {
        try {
          await ethereum.request({ method: 'eth_requestAccounts' });
          console.log('MetaMask access granted.');
        } catch (error) {
          console.error('User denied MetaMask access:', error);
        }
      } else {
        console.error('MetaMask is not installed!');
      }
    };
    requestMetaMaskAccess();
  }, [ethereum]);

  // Initialize the contract
  const initializeContract = async () => {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      if (network.chainId === 31337 || network.name === "unknown") {
        console.log("Connected to local Hardhat network.");
        const contractInstance = new ethers.Contract(contractAddress, MainABI, signer);
        return contractInstance;
      } else {
        console.error("Unsupported network:", network.name);
        return null;
      }
    }
    return null;
  };



  // Transfer ownership function
  const transferOwnership = async (newOwnerAddress: string) => {
    const contractInstance = await initializeContract();
    if (contractInstance) {
      try {
        // Normalize the address to prevent ENS resolution
        const normalizedAddress = ethers.utils.getAddress(newOwnerAddress);
        const tx = await contractInstance['transferOwnership(address)'](normalizedAddress);

        console.log(`Ownership transfer transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Ownership transferred successfully to ${normalizedAddress}`);
        setCurrentOwner(normalizedAddress); // Update state
      } catch (error) {
        console.error('Error during ownership transfer:', error);
      }
    }
  };

  // Example ownership transfer handler
  const handleTransferOwnership = async () => {
    const newOwner: string = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; 
    await transferOwnership(newOwner);
  };

  if (!ethereum) {
    return (
      <div className={styles.body}>
        <h1>Welcome to Pokémon TCG</h1>
        <p>Please install MetaMask.</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className={styles.body}>
        <h1>Welcome to Pokémon TCG</h1>
        <p>Please connect your wallet.</p>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <h1>Welcome to Pokémon TCG</h1>
      
      {/* Display the current contract owner */}
      <p>Current Contract Owner: {currentOwner ? currentOwner : 'Loading...'}</p>
      
      {/* Button to transfer ownership */}
      <button onClick={handleTransferOwnership}>
        Transfer Ownership to Your Address
      </button>

      {/* Integration of minting and collection creation forms */}
      {contract && <MintCardsForm contract={contract} />}
      {contract && <CreateCollectForm contract={contract} />}
    </div>
  );
};

export default App;
