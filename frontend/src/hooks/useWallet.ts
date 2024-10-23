// src/hooks/useWallet.ts

import { useEffect, useMemo, useRef, useState } from 'react'
import * as ethereum from '../lib/ethereum'
import * as main from '../lib/main'
import { Main } from '../lib/main'

type Canceler = () => void

const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>()
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error))
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current()
        cancelerRef.current = undefined
      }
    }
  }, dependencies)
}

export const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details | null>(null)
  const [contract, setContract] = useState<Main | null>(null)

  useAffect(async () => {
    const details_ = await ethereum.connect('metamask')
    if (!details_) return
    setDetails(details_)
    const contract_ = await main.init(details_)
    if (!contract_) return
    setContract(contract_)
  }, [])

  return useMemo(() => {
    if (!details || !contract) return null
    return {
      account: details.account,
      balance: details.balance,
      contract,
    }
  }, [details, contract])
}
