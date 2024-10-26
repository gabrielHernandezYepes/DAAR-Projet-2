import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import styles from './styles.module.css';
import SetsComponent from './components/SetsComponent';
import UsersComponent from './components/UsersComponent';
import BoosterComponent from './components/BoosterComponent'; // Importer le composant
import logo from './assets/images/logo.png';
import backgroundImage from './assets/images/charizard.jpg';

export const App = () => {
  const wallet = useWallet();
  const { account, balance } = wallet || {};
  const { ethereum } = window;

  const [showSets, setShowSets] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showBoosters, setShowBoosters] = useState(false); // Ajouter un état pour les boosters



  return (
    <div 
      className={`${styles.body} ${styles.background}`} 
      style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.buttons}>
        <img src={logo} alt="Logo Pokémon TCG" className={styles.logo} />
        <button onClick={() => { setShowSets(false); setShowUsers(false); setShowBoosters(false); }}>Home</button>
        <button onClick={() => { setShowSets(!showSets); setShowUsers(false); setShowBoosters(false); }}>Sets</button>
        <button onClick={() => { setShowUsers(!showUsers); setShowSets(false); setShowBoosters(false); }}>Users</button>
        <button onClick={() => { setShowBoosters(!showBoosters); setShowSets(false); setShowUsers(false); }}>Boosters</button> {/* Bouton pour les boosters */}
      </div>
      <h1>Bienvenue dans Pokémon TCG</h1>

      {showSets && <SetsComponent />}
      {showUsers && <UsersComponent />}
      {showBoosters && <BoosterComponent />} {/* Afficher le composant Booster */}
    </div>
  );
}

export default App;
