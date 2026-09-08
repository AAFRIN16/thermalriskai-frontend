import axios from 'axios'
import { auth } from '../firebase'

/* ==================== API BACKEND CLIENT ==================== */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Attach Firebase Bearer Token to every outgoing request
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ==================== INTERFACES ==================== */

export interface DigitalTwinSummary {
  user_id: string
  scans_processed: number
  avg_wellness_score: number
  avg_ndvii: number
  baseline_status: string
  recovery_trend: string
}

export interface HistoricalMetric {
  scan_id: string
  timestamp: string
  wellness_score: number
  ndvii: number
  predicted_class: string
  confidence: number
}

export interface LatestScan {
  scanId: string
  userId: string
  timestamp: string
  uploadedImage: string
  prediction: {
    predicted_class: string
    confidence: number
  }
  NDVII: {
    ndvii: number
    stability_score: number
    stability_label: string
  }
  OrganMapping: any
  WellnessScore: number
}

export interface DigitalTwinResponse {
  digital_twin_summary: DigitalTwinSummary
  trend: string
  latest_scan: LatestScan | null
  historical_metrics: HistoricalMetric[]
}

export interface ScanRecord {
  scanId: string
  userId: string
  timestamp: string
  uploadedImage: string
  prediction: {
    predicted_class: string
    confidence: number
  }
  NDVII: {
    ndvii: number
    stability_score: number
    stability_label: string
  }
  OrganMapping: any
  GradCAM?: string
  WellnessScore: number
}

export interface HistoryResponse {
  user_id: string
  total_scans: number
  history: ScanRecord[]
}

/* ==================== API METHODS ==================== */

export async function fetchDigitalTwin(): Promise<DigitalTwinResponse> {
  const response = await apiClient.get<DigitalTwinResponse>('/api/digital-twin')
  return response.data
}

export async function fetchHistory(): Promise<HistoryResponse> {
  const response = await apiClient.get<HistoryResponse>('/api/history')
  return response.data
}

export async function uploadThermalScan(file: File): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function deleteScan(scanId: string): Promise<{ status: string; message: string; scan_id?: string }> {
  const response = await apiClient.delete<{ status: string; message: string; scan_id?: string }>(`/api/history/${scanId}`)
  return response.data
}

export async function deleteAllHistory(): Promise<{ status: string; message: string; deleted_count?: number }> {
  const response = await apiClient.delete<{ status: string; message: string; deleted_count?: number }>('/api/history')
  return response.data
}

