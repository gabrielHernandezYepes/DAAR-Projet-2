// import { useEffect, useState } from 'react';
// import { ethers } from 'ethers';
// import NFTCollectionABI from '../abis/NFTCollection.json';

// export const useUserNFTs = (userAddress, provider) => {
//   const [nfts, setNFTs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!userAddress || !provider) return;

//     const fetchNFTs = async () => {
//       setLoading(true);
//       try {
//         const nftContract = new ethers.Contract('ADRESSE_DU_CONTRAT_NFT', NFTCollectionABI, provider);
//         const balance = await nftContract.balanceOf(userAddress);
//         const tokenIds = [];

//         for (let i = 0; i < balance; i++) {
//           const tokenId = await nftContract.tokenOfOwnerByIndex(userAddress, i);
//           tokenIds.push(tokenId.toString());
//         }

//         setNFTs(tokenIds);
//       } catch (err) {
//         console.error(err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNFTs();
//   }, [userAddress, provider]);

//   return { nfts, loading, error };
// };
// export default useUserNFTs;