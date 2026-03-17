import { useState, useRef } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

interface AnalysisResult {
  ndvii: number
  ndvii_100: number
  stability_score: number
  stability_label: string
  predicted_class: string
  confidence: number
  drift_indicator: string
  instability_index: number
  embedding: { x: number; y: number }
  stats: {
    mean_temp: number
    std_temp: number
    bilateral_differential: number
    gradient_zones: number
  }
  charts: {
    stability_over_time: number[]
    drift_progression: number[]
  }
  heatmap_grid: number[][]
}

function getHeatColor(value: number): string {
  if (value < 0.2) return '#bfdbfe'
  if (value < 0.35) return '#93c5fd'
  if (value < 0.5) return '#60a5fa'
  if (value < 0.65) return '#f97316'
  if (value < 0.8) return '#ef4444'
  return '#dc2626'
}

export default function Upload() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      handleFile(file)
    }
  }

  const handleAnalyze = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', image)
      const response = await axios.post('http://localhost:8000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data)
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError(`Invalid image: ${err.response.data.detail}`)
      } else {
        setError('Analysis failed. Make sure the API server is running on port 8000.')
      }
    } finally {
      setLoading(false)
    }
  }

  const stabilityChartData = result?.charts.stability_over_time.map((val, i) => ({
    time: `T${i + 1}`,
    value: val,
  })) ?? []

  const driftChartData = result?.charts.drift_progression.map((val, i) => ({
    time: `T${i + 1}`,
    value: val,
  })) ?? []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200
          rounded-xl px-5 py-4 mb-10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0
              1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-sm text-blue-800">
            <strong>Disclaimer:</strong> This system provides computational research
            indicators only and is not intended for medical diagnosis.
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold
            px-4 py-1.5 rounded-full mb-4 tracking-wide">
            Analysis Module
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Upload & Detection
          </h1>
          <p className="text-gray-500 text-sm">
            Upload an infrared thermal image to run simulated stability analysis.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-200 mb-6
            ${dragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className="mx-auto mb-3">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p className="font-semibold text-gray-700 mb-1">
            Drag & drop an infrared image here
          </p>
          <p className="text-sm text-gray-400">JPG or PNG supported</p>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="border border-gray-200 rounded-xl p-5 mb-6">
            <p className="font-semibold text-gray-700 mb-3">Image Preview</p>
            <img
              src={preview}
              alt="Thermal preview"
              className="max-h-72 mx-auto rounded-lg object-contain"
            />
          </div>
        )}

        {/* Analyze Button */}
        {image && !loading && (
          <button
            onClick={handleAnalyze}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold
              py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md mb-8"
          >
            Analyze Image
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-600
              border-t-transparent rounded-full animate-spin mb-3"/>
            <p className="text-gray-500 text-sm">Running thermal analysis...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200
            rounded-xl px-5 py-4 mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Analysis Results
            </h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">
                    Temperature Distribution
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Mean {result.stats.mean_temp}°C with {result.stats.std_temp}°C
                  standard deviation across ROI.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">
                    Bilateral Symmetry
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {result.stats.bilateral_differential}°C bilateral differential detected.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">
                    Spatial Heat Variation
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {result.stats.gradient_zones} distinct thermal gradient zones identified.
                </p>
              </div>
            </div>

            {/* Heatmap + Score */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Heatmap */}
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-800 mb-4 text-sm">Heatmap Overlay</p>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
                  {result.heatmap_grid.flat().map((val, i) => (
                    <div
                      key={i}
                      className="rounded aspect-square"
                      style={{ backgroundColor: getHeatColor(val) }}
                    />
                  ))}
                </div>
              </div>

              {/* Score panel */}
              <div className="flex flex-col gap-4">
                {/* Stability Score */}
                <div className="border border-gray-200 rounded-xl p-5 text-center flex-1">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                    className="mx-auto mb-2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <p className="text-xs text-gray-500 mb-1">Stability Score</p>
                  <p className="text-5xl font-extrabold text-gray-900">
                    {Math.round(result.stability_score)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">out of 100</p>
                </div>

                {/* Drift + Instability */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-2">Drift Indicator</p>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full
                      ${result.drift_indicator === 'Stable'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {result.drift_indicator}
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-2">Instability Index</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {result.instability_index.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-800 text-sm mb-4">
                  Stability Score Over Time
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={stabilityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Line
                      type="monotone" dataKey="value"
                      stroke="#2563eb" strokeWidth={2}
                      dot={{ fill: '#2563eb', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-800 text-sm mb-4">
                  Drift Progression
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={driftChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                    <YAxis domain={[0, 2.5]} tick={{ fontSize: 11, fill: '#94a3b8' }}/>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Area
                      type="monotone" dataKey="value"
                      stroke="#2563eb" strokeWidth={2}
                      fill="#dbeafe" fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}