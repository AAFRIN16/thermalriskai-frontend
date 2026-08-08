import { useState, useRef, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import {
  AlertTriangle,
  Thermometer,
  UploadCloud,
  FileText,
  Scale,
  BarChart3,
  Download,
  Check
} from 'lucide-react'
import { uploadThermalScan } from '../services/api'
import { useDigitalTwin } from '../context/DigitalTwinContext'

interface OrganResult {
  organ: string
  system: string
  description: string
  zone: string
  icon: string
  status: string
  status_color: string
  perfusion_level: number
  thermal_variation: number
  status_index: number
}

interface SystemSummary {
  system: string
  average_concern: number
  status: string
  color: string
}

interface OrganMapping {
  organs: OrganResult[]
  overall_health_score: number
  region_type: string
  systems_summary: SystemSummary[]
}

interface AnalysisResult {
  ndvii: number
  ndvii_100: number
  stability_score: number
  stability_label: string
  predicted_class: string
  confidence: number
  drift_indicator: string
  instability_index: number
  region_type: string
  session_id: string
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
  gradcam_image: string
  organ_mapping: OrganMapping
  pdf_report: string
  dataset_embedding: {
    control: number[][]
    dm: number[][]
    new_point: number[]
  }
}

function getHeatColor(value: number): string {
  if (value < 0.15) return '#1e3a5f'
  if (value < 0.3) return '#1d4ed8'
  if (value < 0.45) return '#0891b2'
  if (value < 0.6) return '#059669'
  if (value < 0.75) return '#d97706'
  if (value < 0.88) return '#dc2626'
  return '#7c3aed'
}

function getNdviiColor(ndvii: number): string {
  if (ndvii < 0.3) return '#16a34a'
  if (ndvii < 0.55) return '#ca8a04'
  if (ndvii < 0.75) return '#ea580c'
  return '#dc2626'
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    'Thermally Stable': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    'Mild Instability': 'bg-amber-50 text-amber-800 border-amber-300',
    'Moderate Instability': 'bg-orange-50 text-orange-800 border-orange-300',
    'High Instability': 'bg-red-50 text-red-800 border-red-300',
    'Optimal': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    'Normal': 'bg-green-50 text-green-800 border-green-300',
    'Mild Variation': 'bg-amber-50 text-amber-800 border-amber-300',
    'Moderate Variation': 'bg-orange-50 text-orange-800 border-orange-300',
    'Elevated Concern': 'bg-red-50 text-red-800 border-red-300',
    'Stable': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    'Unstable': 'bg-red-50 text-red-800 border-red-300',
  }
  return map[status] || 'bg-slate-100 text-slate-800 border-slate-300'
}

const TABS = ['Overview', 'Thermal Map', 'Organ Analysis', 'PSE Embedding', 'Report']

function EmbeddingPlot({ result }: { result: AnalysisResult }) {
  const allPoints = [
    ...result.dataset_embedding.control.map(p => ({ x: p[0], y: p[1] })),
    ...result.dataset_embedding.dm.map(p => ({ x: p[0], y: p[1] })),
    { x: result.dataset_embedding.new_point[0], y: result.dataset_embedding.new_point[1] }
  ]

  const xs = allPoints.map(p => p.x)
  const ys = allPoints.map(p => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const padX = (maxX - minX) * 0.08
  const padY = (maxY - minY) * 0.08

  const W = 400, H = 280
  const scaleX = (v: number) => ((v - minX + padX) / (maxX - minX + padX * 2)) * W
  const scaleY = (v: number) => H - ((v - minY + padY) / (maxY - minY + padY * 2)) * H

  const nx = scaleX(result.dataset_embedding.new_point[0])
  const ny = scaleY(result.dataset_embedding.new_point[1])

  return (
    <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-inner" style={{ height: 280 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {result.dataset_embedding.control.slice(0, 300).map((pt, i) => (
          <circle key={`c${i}`}
            cx={scaleX(pt[0])} cy={scaleY(pt[1])}
            r={2.5} fill="#06b6d4" fillOpacity={0.6}
          />
        ))}
        {result.dataset_embedding.dm.slice(0, 300).map((pt, i) => (
          <circle key={`d${i}`}
            cx={scaleX(pt[0])} cy={scaleY(pt[1])}
            r={2.5} fill="#ef4444" fillOpacity={0.6}
          />
        ))}
        <circle cx={nx} cy={ny} r={16} fill="none" stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.8}/>
        <circle cx={nx} cy={ny} r={7} fill="#ffffff" stroke="#0891b2" strokeWidth={2}/>
        <circle cx={nx} cy={ny} r={3} fill="#0891b2"/>
      </svg>
    </div>
  )
}

export default function Upload() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [showGradcam, setShowGradcam] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refreshData } = useDigitalTwin()

  const handleFile = useCallback((file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setActiveTab('Overview')
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleAnalyze = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    try {
      const data = await uploadThermalScan(image)
      setResult(data)
      setActiveTab('Overview')
      // Immediately refresh Digital Twin & History data in background
      refreshData().catch(err => console.error('Auto-refresh error after upload:', err))
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError(`Invalid image: ${err.response.data.detail}`)
      } else {
        setError(err.response?.data?.detail || 'Analysis failed. Make sure the API server is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!result?.pdf_report) return
    const link = document.createElement('a')
    link.href = `data:application/pdf;base64,${result.pdf_report}`
    link.download = `ThermalRiskAI_${result.session_id}.pdf`
    link.click()
  }

  const stabilityData = result?.charts.stability_over_time.map((v, i) => ({ t: `T${i+1}`, v })) ?? []
  const driftData = result?.charts.drift_progression.map((v, i) => ({ t: `T${i+1}`, v })) ?? []

  const radarData = result?.organ_mapping?.systems_summary.map(s => ({
    subject: s.system,
    value: Math.round((1 - s.average_concern / 4) * 100),
    fullMark: 100
  })) ?? []

  return (
    <div className="min-h-screen py-6 sm:py-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 mb-6 sm:mb-8 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong className="text-slate-900 font-bold">Research Platform — Non-Diagnostic:</strong> All outputs
            are computational research indicators only. Not intended for medical diagnosis or clinical use.
            Upload feet or palm thermal infrared images only.
          </p>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-xs text-cyan-700 font-mono font-bold uppercase tracking-widest mb-1.5 sm:mb-2">Analysis Module</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Thermal Analysis</h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Upload an infrared thermal image of feet or palm for comprehensive stability analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200 min-h-[180px] flex flex-col items-center justify-center
                ${dragging
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-slate-300 hover:border-cyan-500 hover:bg-slate-50 bg-white shadow-2xs'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-sm mb-1">
                Drop thermal image here
              </p>
              <p className="text-xs text-slate-600 font-medium">Feet or palm infrared images only</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">JPG · PNG supported</p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="card-glass rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <div className="relative">
                  <img
                    src={showGradcam && result?.gradcam_image
                      ? `data:image/png;base64,${result.gradcam_image}`
                      : preview}
                    alt="Thermal"
                    className="w-full object-contain max-h-60"
                  />
                  {result?.gradcam_image && (
                    <button
                      onClick={() => setShowGradcam(!showGradcam)}
                      className="absolute bottom-2 right-2 text-[10px] px-2.5 py-1.5 rounded-lg
                        bg-white text-cyan-700 border border-slate-200 hover:bg-slate-50
                        transition-all font-mono font-bold shadow-xs"
                    >
                      {showGradcam ? '← Original' : 'Grad-CAM →'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Analyze button */}
            {image && !loading && (
              <button
                onClick={handleAnalyze}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600
                  text-white font-bold py-3.5 rounded-xl transition-all duration-200
                  hover:shadow-md hover:shadow-cyan-600/20 hover:scale-[1.01]"
              >
                Run Thermal Analysis
              </button>
            )}

            {/* Loading */}
            {loading && (
              <div className="card-glass rounded-xl p-6 text-center bg-white border border-slate-200">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"/>
                  <span className="text-cyan-700 text-sm font-mono font-bold">Analyzing...</span>
                </div>
                <div className="space-y-1.5">
                  {['Feature extraction', 'PSE embedding', 'Organ mapping', 'NDVII computation'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse" style={{animationDelay: `${i*0.2}s`}}/>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="text-red-600 text-base flex-shrink-0">✕</span>
                <p className="text-red-700 text-xs leading-relaxed font-semibold">{error}</p>
              </div>
            )}

            {/* Quick metrics */}
            {result && (
              <div className="grid grid-cols-2 gap-3">
                <div className="card-glass rounded-xl p-3 text-center bg-white border border-slate-200">
                  <div className="text-2xl font-black font-mono" style={{color: getNdviiColor(result.ndvii)}}>
                    {result.ndvii.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">NDVII</div>
                </div>
                <div className="card-glass rounded-xl p-3 text-center bg-white border border-slate-200">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {Math.round(result.stability_score)}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">Stability /100</div>
                </div>
                <div className="card-glass rounded-xl p-3 text-center bg-white border border-slate-200">
                  <div className="text-lg font-bold text-slate-900 font-mono">{result.confidence}%</div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">Confidence</div>
                </div>
                <div className="card-glass rounded-xl p-3 text-center bg-white border border-slate-200">
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    {result.organ_mapping?.overall_health_score ?? '—'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">Health Score</div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel — Results */}
          {result && (
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex gap-1.5 bg-slate-200/70 p-1.5 rounded-xl border border-slate-300/60 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                      ${activeTab === tab
                        ? 'bg-white text-cyan-800 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'Overview' && (
                <div className="flex flex-col gap-4">
                  {/* Status banner */}
                  <div className={`rounded-xl p-4 border shadow-2xs ${getStatusBadge(result.stability_label)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-mono font-bold opacity-80 mb-1">Stability Assessment</div>
                        <div className="text-xl font-black">{result.stability_label}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest font-mono font-bold opacity-80 mb-1">Predicted Class</div>
                        <div className="font-bold text-sm font-mono">{result.predicted_class}</div>
                      </div>
                    </div>
                  </div>

                  {/* 3 stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="card-glass rounded-xl p-3 bg-white border border-slate-200">
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">
                        <Thermometer className="w-3 h-3 text-cyan-700" /> Mean Temp
                      </div>
                      <div className="text-lg font-bold text-slate-900 font-mono">{result.stats.mean_temp}°C</div>
                      <div className="text-[10px] text-slate-500 font-mono">±{result.stats.std_temp}°C std</div>
                    </div>
                    <div className="card-glass rounded-xl p-3 bg-white border border-slate-200">
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">
                        <Scale className="w-3 h-3 text-cyan-700" /> Bilateral Δ
                      </div>
                      <div className="text-lg font-bold text-slate-900 font-mono">{result.stats.bilateral_differential}°C</div>
                      <div className="text-[10px] text-slate-500 font-mono">L/R differential</div>
                    </div>
                    <div className="card-glass rounded-xl p-3 bg-white border border-slate-200">
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">
                        <BarChart3 className="w-3 h-3 text-cyan-700" /> Drift
                      </div>
                      <div className={`text-lg font-bold font-mono ${result.drift_indicator === 'Stable' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {result.drift_indicator}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Indicator</div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="card-glass rounded-xl p-4 bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-3">Stability Over Time</div>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={stabilityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                          <XAxis dataKey="t" tick={{fontSize: 9, fill: '#64748b'}}/>
                          <YAxis domain={[0, 100]} tick={{fontSize: 9, fill: '#64748b'}}/>
                          <Tooltip contentStyle={{background: '#ffffff', border: '1px solid #cbd5e1', fontSize: 11, borderRadius: 8, color: '#0f172a'}}/>
                          <Line type="monotone" dataKey="v" stroke="#0891b2" strokeWidth={2} dot={false}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card-glass rounded-xl p-4 bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-3">Drift Progression</div>
                      <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={driftData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                          <XAxis dataKey="t" tick={{fontSize: 9, fill: '#64748b'}}/>
                          <YAxis domain={[0, 2.5]} tick={{fontSize: 9, fill: '#64748b'}}/>
                          <Tooltip contentStyle={{background: '#ffffff', border: '1px solid #cbd5e1', fontSize: 11, borderRadius: 8, color: '#0f172a'}}/>
                          <Area type="monotone" dataKey="v" stroke="#2563eb" fill="#dbeafe" strokeWidth={2}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Session info */}
                  <div className="card-glass rounded-xl p-4 bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-3 font-mono">Session Metadata</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ['Session ID', result.session_id],
                        ['Embedding X', result.embedding.x.toFixed(3)],
                        ['Embedding Y', result.embedding.y.toFixed(3)],
                        ['Gradient Zones', result.stats.gradient_zones.toString()],
                        ['Instability Index', result.instability_index.toFixed(4)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2">
                          <span className="text-slate-600 font-medium">{k}</span>
                          <span className="text-slate-900 font-mono font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── THERMAL MAP TAB ── */}
              {activeTab === 'Thermal Map' && (
                <div className="flex flex-col gap-4">
                  {/* Heatmap grid */}
                  <div className="card-glass rounded-xl p-5 bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-4">Feature Heatmap Overlay</div>
                    <div className="grid gap-1.5" style={{gridTemplateColumns: 'repeat(8, 1fr)'}}>
                      {result.heatmap_grid.flat().map((val, i) => (
                        <div
                          key={i}
                          className="rounded aspect-square transition-all border border-slate-200/50"
                          style={{backgroundColor: getHeatColor(val)}}
                          title={`Zone ${i}: ${val.toFixed(3)}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-[10px] text-slate-600 font-bold">Low Heat</span>
                      <div className="flex-1 h-2 rounded-full" style={{
                        background: 'linear-gradient(90deg, #1e3a5f, #1d4ed8, #0891b2, #059669, #d97706, #dc2626, #7c3aed)'
                      }}/>
                      <span className="text-[10px] text-slate-600 font-bold">High Heat</span>
                    </div>
                  </div>

                  {/* Grad-CAM */}
                  {result.gradcam_image && (
                    <div className="card-glass rounded-xl p-5 bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-4">
                        Grad-CAM — AI Attention Map
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] text-slate-600 font-bold mb-2">Original</div>
                          <img src={preview!} alt="Original" className="w-full rounded-lg object-contain max-h-48 border border-slate-200"/>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-600 font-bold mb-2">AI Focus Regions</div>
                          <img
                            src={`data:image/png;base64,${result.gradcam_image}`}
                            alt="Grad-CAM"
                            className="w-full rounded-lg object-contain max-h-48 border border-slate-200"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                        Grad-CAM highlights regions the model weighted most heavily during classification.
                        Warmer colors indicate higher attention concentration.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── ORGAN ANALYSIS TAB ── */}
              {activeTab === 'Organ Analysis' && result.organ_mapping && (
                <div className="flex flex-col gap-4">
                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      <strong className="text-amber-800 font-bold">Non-Diagnostic Research Indicator:</strong> Organ zone assessments
                      are computational estimates based on thermal surface patterns and reflexology zone mapping.
                      These are NOT medical diagnoses. Consult a healthcare professional for any health concerns.
                    </p>
                  </div>

                  {/* Overall score */}
                  <div className="card-glass rounded-xl p-5 bg-white border border-slate-200">
                    <div className="mb-4">
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Overall Thermal Health Score</div>
                      <div className="text-4xl font-black text-slate-900 font-mono">
                        {result.organ_mapping.overall_health_score}
                        <span className="text-xl text-slate-500 font-normal">/100</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all"
                        style={{width: `${result.organ_mapping.overall_health_score}%`}}
                      />
                    </div>
                  </div>

                  {/* Radar chart */}
                  {radarData.length > 0 && (
                    <div className="card-glass rounded-xl p-5 bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-3">System Health Radar</div>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#cbd5e1"/>
                          <PolarAngleAxis dataKey="subject" tick={{fontSize: 9, fill: '#475569'}}/>
                          <Radar name="Health" dataKey="value" stroke="#0891b2" fill="#0891b2" fillOpacity={0.2} strokeWidth={2}/>
                          <Tooltip contentStyle={{background: '#ffffff', border: '1px solid #cbd5e1', fontSize: 11, borderRadius: 8, color: '#0f172a'}}/>
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Organ table */}
                  <div className="card-glass rounded-xl overflow-hidden bg-white border border-slate-200">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Organ Zone Thermal Analysis</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {result.organ_mapping.organs.map((organ) => (
                        <div key={organ.organ} className="px-4 py-3 hover:bg-slate-50 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-900">{organ.description}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase ${getStatusBadge(organ.status)}`}>
                                  {organ.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 mb-1 font-medium">{organ.zone}</div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-600 font-medium">Perfusion</span>
                                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-600"
                                      style={{width: `${organ.perfusion_level}%`}}
                                    />
                                  </div>
                                  <span className="text-[10px] text-cyan-800 font-mono font-bold">{organ.perfusion_level}%</span>
                                </div>
                                <div className="text-[10px] font-mono font-bold" style={{color: organ.thermal_variation >= 0 ? '#ea580c' : '#16a34a'}}>
                                  Δ {organ.thermal_variation >= 0 ? '+' : ''}{organ.thermal_variation}°C
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── PSE EMBEDDING TAB ── */}
              {activeTab === 'PSE Embedding' && (
                <div className="flex flex-col gap-4">
                  <div className="card-glass rounded-xl p-5 bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-4">
                      Perfusion Stability Embedding Space
                    </div>
                    <EmbeddingPlot result={result} />
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"/>
                        <span className="text-[10px] text-slate-700 font-bold">Control Group</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"/>
                        <span className="text-[10px] text-slate-700 font-bold">DM Group</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white border-2 border-cyan-600"/>
                        <span className="text-[10px] text-slate-900 font-bold">Your Image</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                        <span className="text-slate-600 font-medium">UMAP-1: </span>
                        <span className="text-cyan-800 font-mono font-bold">{result.embedding.x.toFixed(4)}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                        <span className="text-slate-600 font-medium">UMAP-2: </span>
                        <span className="text-cyan-800 font-mono font-bold">{result.embedding.y.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── REPORT TAB ── */}
              {activeTab === 'Report' && (
                <div className="flex flex-col gap-4">
                  <div className="card-glass rounded-xl p-6 text-center bg-white border border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-slate-900 text-lg mb-1">Research Report Ready</div>
                    <div className="text-slate-600 text-sm mb-2">Session: <span className="font-mono text-cyan-700 font-bold">{result.session_id}</span></div>
                    <div className="text-xs text-slate-600 mb-6 leading-relaxed max-w-sm mx-auto font-medium">
                      Comprehensive PDF report including all thermal analysis metrics,
                      organ zone assessments, PSE embedding coordinates, and NDVII scores.
                    </div>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 mx-auto bg-gradient-to-r from-cyan-600 to-blue-600
                        text-white font-semibold px-6 py-3 rounded-xl hover:shadow-md
                        hover:shadow-cyan-600/20 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF Report
                    </button>
                  </div>

                  {/* Report preview */}
                  <div className="card-glass rounded-xl p-5 bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-4">Report Contents</div>
                    <div className="space-y-2">
                      {[
                        'Session metadata & timestamp',
                        'Core NDVII metrics & stability classification',
                        'Temperature distribution statistics',
                        'Bilateral symmetry differential',
                        'Organ zone thermal analysis (8 systems)',
                        'System-level health summary',
                        'Perfusion levels per zone',
                        'Thermal variation signatures',
                        'PSE embedding coordinates',
                        'Research disclaimer & limitations',
                      ].map(item => (
                        <div key={item} className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs text-red-700 leading-relaxed font-medium">
                      This report is for research purposes only. All findings are computational
                      indicators and do not constitute medical diagnoses or clinical recommendations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}