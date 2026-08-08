import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  fetchDigitalTwin,
  fetchHistory,
  type DigitalTwinResponse,
  type HistoryResponse,
} from '../services/api'
import { useAuth } from './AuthContext'

/* ==================== DIGITAL TWIN CONTEXT DEFINITION ==================== */

interface DigitalTwinContextType {
  digitalTwinData: DigitalTwinResponse | null
  historyData: HistoryResponse | null
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

const DigitalTwinContext = createContext<DigitalTwinContextType | undefined>(undefined)

export function useDigitalTwin() {
  const context = useContext(DigitalTwinContext)
  if (!context) {
    throw new Error('useDigitalTwin must be used within a DigitalTwinProvider')
  }
  return context
}

interface DigitalTwinProviderProps {
  children: ReactNode
}

export function DigitalTwinProvider({ children }: DigitalTwinProviderProps) {
  const { currentUser } = useAuth()
  const [digitalTwinData, setDigitalTwinData] = useState<DigitalTwinResponse | null>(null)
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
    if (!currentUser) {
      setDigitalTwinData(null)
      setHistoryData(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [dtRes, histRes] = await Promise.all([
        fetchDigitalTwin(),
        fetchHistory(),
      ])
      setDigitalTwinData(dtRes)
      setHistoryData(histRes)
    } catch (err: any) {
      console.error('Failed to fetch Digital Twin / History data:', err)
      setError(err.response?.data?.detail || 'Failed to load Digital Twin data from server.')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  // Fetch data on mount and whenever user changes
  useEffect(() => {
    refreshData()
  }, [refreshData])

  const value = {
    digitalTwinData,
    historyData,
    loading,
    error,
    refreshData,
  }

  return (
    <DigitalTwinContext.Provider value={value}>
      {children}
    </DigitalTwinContext.Provider>
  )
}
