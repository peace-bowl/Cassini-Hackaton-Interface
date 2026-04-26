import { useCallback, useEffect, useState } from 'react'
import { getReports } from '../api/client'
import type { CitizenReport } from '../types'

export function useReports(refreshMs = 30_000) {
  const [reports, setReports] = useState<CitizenReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await getReports()
      setReports(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetch()
    const id = setInterval(() => { void fetch() }, refreshMs)
    return () => clearInterval(id)
  }, [fetch, refreshMs])

  return { reports, loading, error, refresh: fetch }
}
