import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import styles from './styles.module.css';
import SetsComponent from './components/SetsComponent';
import UsersComponent from './components/UsersComponent';
import logo from './assets/images/logo.png';
import backgroundImage from './assets/images/charizard.jpg';

export const App = () => {
  const wallet = useWallet();
  const { account, balance } = wallet || {};
  const { ethereum } = window;

  const [showSets, setShowSets] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  if (!ethereum) {
    return (
      <div className={styles.body}>
        <h1>Bienvenue dans Pokémon TCG</h1>
        <p>Veuillez installer MetaMask.</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className={styles.body}>
        <h1>Bienvenue dans Pokémon TCG</h1>
        <p>Veuillez connecter votre portefeuille.</p>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.body} ${styles.background}`} 
      style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.buttons}>
        <img src={logo} alt="Logo Pokémon TCG" className={styles.logo} />
        <button onClick={() => { setShowSets(false); setShowUsers(false); }}>Home</button>
        <button onClick={() => { setShowSets(!showSets); setShowUsers(false); }}>Sets</button>
        <button onClick={() => { setShowUsers(!showUsers); setShowSets(false); }}>Users</button>
        <button>Boosters</button>
      </div>
      <h1>Bienvenue dans Pokémon TCG</h1>

      {showSets && <SetsComponent />}
      {showUsers && <UsersComponent />}
    </div>
  );
}

export default App;
