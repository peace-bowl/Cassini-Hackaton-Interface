import { useCallback, useEffect, useState } from 'react'
import { getAlerts } from '../api/client'
import type { Alert } from '../types'

export function useAlerts(refreshMs = 30_000) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await getAlerts()
      setAlerts(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetch()
    const id = setInterval(() => { void fetch() }, refreshMs)
    return () => clearInterval(id)
  }, [fetch, refreshMs])

  return { alerts, loading, error, refresh: fetch }
}
