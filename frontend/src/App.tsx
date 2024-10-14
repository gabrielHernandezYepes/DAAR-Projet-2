import { useWallet } from './hooks/useWallet';
import { useCollections } from './hooks/useCollections';
import styles from './styles.module.css';
import { CollectionList } from './components/CollectionList';
import { MintCardsForm } from './components/MintCardsForm'; 

export const App = () => {
  const wallet = useWallet();
  const { details, contract } = wallet || {};
  const { collections, loading, error } = useCollections(contract);

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
      {loading && <p>Loading collections...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && <CollectionList collections={collections} />}
      
      {/* Intégration du formulaire de mint */}
      {contract && <MintCardsForm contract={contract} />}
    </div>
  );
};
