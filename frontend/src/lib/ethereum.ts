// src/lib/ethereum.ts

import { ethers } from 'ethers'
import * as providers from './ethereum/provider'
export * as account from './ethereum/account'

export type Wallet = 'metamask' | 'silent'

export type Details = {
  provider: ethers.providers.Provider
  signer?: ethers.providers.JsonRpcSigner
  account?: string
  balance?: string // Ajout de la propriété balance
}

// Fonction pour se connecter via MetaMask
const metamask = async (requestAccounts = true): Promise<Details | null> => {
  const ethereum = (window as any).ethereum
  if (ethereum) {
    if (requestAccounts) {
      try {
        await ethereum.request({ method: 'eth_requestAccounts' })
      } catch (error) {
        console.error('Erreur lors de la demande d\'accès aux comptes MetaMask:', error)
        return null
      }
    }

    const provider = new ethers.providers.Web3Provider(ethereum as any)
    const accounts = await provider.listAccounts()
    const account = accounts.length ? accounts[0] : undefined
    const signer = account ? provider.getSigner() : undefined
    let balance: string | undefined = undefined

    if (account) {
      try {
        const balanceBigNumber = await provider.getBalance(account)
        balance = ethers.utils.formatEther(balanceBigNumber)
      } catch (error) {
        console.error('Erreur lors de la récupération du solde:', error)
      }
    }

    return { provider, signer, account, balance }
  }
  return null
}

// Fonction de connexion silencieuse
const silent = async (): Promise<Details> => {
  const ethereum = (window as any).ethereum
  if (ethereum) {
    const unlocked = await ethereum?._metamask?.isUnlocked?.()
    if (unlocked) {
      const details = await metamask(false)
      if (details?.account) {
        // Si un compte est disponible, récupérez le solde
        try {
          const provider = details.provider
          const balanceBigNumber = await provider.getBalance(details.account)
          details.balance = ethers.utils.formatEther(balanceBigNumber)
        } catch (error) {
          console.error('Erreur lors de la récupération du solde en mode silencieux:', error)
        }
      }
      return details!
    }
    const provider = new ethers.providers.Web3Provider(ethereum as any)
    return { provider }
  }
  const provider = providers.fromEnvironment()
  return { provider }
}

// Fonction principale de connexion
export const connect = async (providerType: Wallet) => {
  switch (providerType) {
    case 'metamask':
      return metamask()
    case 'silent':
      return silent()
    default:
      return null
  }
}

// Gestionnaire pour les changements de comptes
export const accountsChanged = (callback: (accounts: string[]) => void) => {
  const ethereum = (window as any).ethereum
  if (ethereum && ethereum.on) {
    ethereum.on('accountsChanged', callback)
    return () => ethereum.removeListener('accountsChanged', callback)
  } else {
    return () => {}
  }
}

// Gestionnaire pour les changements de chaîne (chain)
export const chainChanged = (callback: (chainId: string) => void) => {
  const ethereum = (window as any).ethereum
  if (ethereum && ethereum.on) {
    ethereum.on('chainChanged', callback)
    return () => ethereum.removeListener('chainChanged', callback)
  } else {
    return () => {}
  }
}
