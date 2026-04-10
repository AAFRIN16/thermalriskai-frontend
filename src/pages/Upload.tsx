import { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts'

const API_URL = 'https://ffrrin-thermalriskai.hf.space'

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
  if (ndvii < 0.3) return '#22c55e'
  if (ndvii < 0.55) return '#eab308'
  if (ndvii < 0.75) return '#f97316'
  return '#ef4444'
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    'Thermally Stable': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Mild Instability': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Moderate Instability': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'High Instability': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Optimal': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Normal': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Mild Variation': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Moderate Variation': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Elevated Concern': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Stable': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Unstable': 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
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
    <div className="relative bg-navy-950 rounded-xl overflow-hidden" style={{ height: 280 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {result.dataset_embedding.control.slice(0, 300).map((pt, i) => (
          <circle key={`c${i}`}
            cx={scaleX(pt[0])} cy={scaleY(pt[1])}
            r={2.5} fill="#06b6d4" fillOpacity={0.5}
          />
        ))}
        {result.dataset_embedding.dm.slice(0, 300).map((pt, i) => (
          <circle key={`d${i}`}
            cx={scaleX(pt[0])} cy={scaleY(pt[1])}
            r={2.5} fill="#ef4444" fillOpacity={0.5}
          />
        ))}
        <circle cx={nx} cy={ny} r={16} fill="none" stroke="#06b6d4" strokeWidth={1} strokeDasharray="4 3" opacity={0.4}/>
        <circle cx={nx} cy={ny} r={7} fill="white" stroke="#06b6d4" strokeWidth={2}/>
        <circle cx={nx} cy={ny} r={3} fill="#06b6d4"/>
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
      const formData = new FormData()
      formData.append('file', image)
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data)
      setActiveTab('Overview')
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError(`Invalid image: ${err.response.data.detail}`)
      } else {
        setError('Analysis failed. Make sure the API server is running.')
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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-5 py-3 mb-8">
          <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
          <p className="text-xs text-black-200/70 leading-relaxed">
            <strong className="text-black-400">Research Platform — Non-Diagnostic:</strong> All outputs
            are computational research indicators only. Not intended for medical diagnosis or clinical use.
            Upload feet or palm thermal infrared images only.
          </p>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-cyan-500 font-mono uppercase tracking-widest mb-2">Analysis Module</div>
          <h1 className="text-4xl font-black text-white tracking-tight">Thermal Analysis</h1>
          <p className="text-slate-400 text-sm mt-2">
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
                  ? 'border-cyan-400 bg-cyan-500/5'
                  : 'border-navy-600 hover:border-cyan-500/50 hover:bg-cyan-500/3 bg-navy-900/50'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="text-3xl mb-3">🌡️</div>
              <p className="font-semibold text-slate-300 text-sm mb-1">
                Drop thermal image here
              </p>
              <p className="text-xs text-slate-500">Feet or palm infrared images only</p>
              <p className="text-xs text-slate-600 mt-1">JPG · PNG supported</p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="card-glass rounded-xl overflow-hidden">
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
                      className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded
                        bg-navy-900/80 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/10
                        transition-all font-mono"
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
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600
                  text-white font-bold py-3.5 rounded-xl transition-all duration-200
                  hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]"
              >
                Run Thermal Analysis
              </button>
            )}

            {/* Loading */}
            {loading && (
              <div className="card-glass rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
                  <span className="text-cyan-400 text-sm font-mono">Analyzing...</span>
                </div>
                <div className="space-y-1.5">
                  {['Feature extraction', 'PSE embedding', 'Organ mapping', 'NDVII computation'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" style={{animationDelay: `${i*0.2}s`}}/>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 text-lg flex-shrink-0">✕</span>
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Quick metrics */}
            {result && (
              <div className="grid grid-cols-2 gap-3">
                <div className="card-glass rounded-xl p-3 text-center">
                  <div className="text-2xl font-black font-mono" style={{color: getNdviiColor(result.ndvii)}}>
                    {result.ndvii.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">NDVII</div>
                </div>
                <div className="card-glass rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-black font-mono">
                    {Math.round(result.stability_score)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Stability /100</div>
                </div>
                <div className="card-glass rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-black font-mono">{result.confidence}%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Confidence</div>
                </div>
                <div className="card-glass rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-black font-mono">
                    {result.organ_mapping?.overall_health_score ?? '—'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Health Score</div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel — Results */}
          {result && (
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex gap-1 bg-navy-900/50 p-1 rounded-xl border border-navy-700/50 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      ${activeTab === tab
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'Overview' && (
                <div className="flex flex-col gap-4 fade-in-up">
                  {/* Status banner */}
                  <div className={`rounded-xl p-4 border ${getStatusBadge(result.stability_label)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-widest opacity-70 mb-1">Stability Assessment</div>
                        <div className="text-xl font-bold">{result.stability_label}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-70 mb-1">Predicted</div>
                        <div className="font-semibold text-sm">{result.predicted_class}</div>
                      </div>
                    </div>
                  </div>

                  {/* 3 stat cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="card-glass rounded-xl p-3">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">🌡️ Mean Temp</div>
                      <div className="text-lg font-bold text-white font-mono">{result.stats.mean_temp}°C</div>
                      <div className="text-[10px] text-slate-600">±{result.stats.std_temp}°C std</div>
                    </div>
                    <div className="card-glass rounded-xl p-3">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">⚖️ Bilateral Δ</div>
                      <div className="text-lg font-bold text-white font-mono">{result.stats.bilateral_differential}°C</div>
                      <div className="text-[10px] text-slate-600">L/R differential</div>
                    </div>
                    <div className="card-glass rounded-xl p-3">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">📊 Drift</div>
                      <div className={`text-lg font-bold font-mono ${result.drift_indicator === 'Stable' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.drift_indicator}
                      </div>
                      <div className="text-[10px] text-slate-600">Indicator</div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card-glass rounded-xl p-4">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Stability Over Time</div>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={stabilityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47"/>
                          <XAxis dataKey="t" tick={{fontSize: 9, fill: '#475569'}}/>
                          <YAxis domain={[0, 100]} tick={{fontSize: 9, fill: '#475569'}}/>
                          <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e3a5f', fontSize: 11, borderRadius: 8}}/>
                          <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2} dot={false}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card-glass rounded-xl p-4">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Drift Progression</div>
                      <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={driftData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47"/>
                          <XAxis dataKey="t" tick={{fontSize: 9, fill: '#475569'}}/>
                          <YAxis domain={[0, 2.5]} tick={{fontSize: 9, fill: '#475569'}}/>
                          <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e3a5f', fontSize: 11, borderRadius: 8}}/>
                          <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#1e3a5f" strokeWidth={2}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Session info */}
                  <div className="card-glass rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-mono">Session Metadata</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ['Session ID', result.session_id],
                        ['Embedding X', result.embedding.x.toFixed(3)],
                        ['Embedding Y', result.embedding.y.toFixed(3)],
                        ['Gradient Zones', result.stats.gradient_zones.toString()],
                        ['Instability Index', result.instability_index.toFixed(4)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2">
                          <span className="text-slate-500">{k}</span>
                          <span className="text-slate-300 font-mono">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── THERMAL MAP TAB ── */}
              {activeTab === 'Thermal Map' && (
                <div className="flex flex-col gap-4 fade-in-up">
                  {/* Heatmap grid */}
                  <div className="card-glass rounded-xl p-5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">Feature Heatmap Overlay</div>
                    <div className="grid gap-1.5" style={{gridTemplateColumns: 'repeat(8, 1fr)'}}>
                      {result.heatmap_grid.flat().map((val, i) => (
                        <div
                          key={i}
                          className="rounded aspect-square transition-all"
                          style={{backgroundColor: getHeatColor(val)}}
                          title={`Zone ${i}: ${val.toFixed(3)}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-[10px] text-slate-600">Low</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{
                        background: 'linear-gradient(90deg, #1e3a5f, #1d4ed8, #0891b2, #059669, #d97706, #dc2626, #7c3aed)'
                      }}/>
                      <span className="text-[10px] text-slate-600">High</span>
                    </div>
                  </div>

                  {/* Grad-CAM */}
                  {result.gradcam_image && (
                    <div className="card-glass rounded-xl p-5">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">
                        Grad-CAM — AI Attention Map
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] text-slate-600 mb-2">Original</div>
                          <img src={preview!} alt="Original" className="w-full rounded-lg object-contain max-h-48"/>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-600 mb-2">AI Focus Regions</div>
                          <img
                            src={`data:image/png;base64,${result.gradcam_image}`}
                            alt="Grad-CAM"
                            className="w-full rounded-lg object-contain max-h-48"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                        Grad-CAM highlights regions the model weighted most heavily during classification.
                        Warmer colors indicate higher attention concentration.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── ORGAN ANALYSIS TAB ── */}
              {activeTab === 'Organ Analysis' && result.organ_mapping && (
                <div className="flex flex-col gap-4 fade-in-up">
                  {/* Disclaimer */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-[10px] text-red-300/70 leading-relaxed">
                      ⚠️ <strong className="text-red-400">Non-Diagnostic Research Indicator:</strong> Organ zone assessments
                      are computational estimates based on thermal surface patterns and reflexology zone mapping.
                      These are NOT medical diagnoses. Consult a healthcare professional for any health concerns.
                    </p>
                  </div>

                  {/* Overall score */}
                  <div className="card-glass rounded-xl p-5">
                    <div className="mb-4">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Overall Thermal Health Score</div>
                      <div className="text-4xl font-black text-black font-mono">
                        {result.organ_mapping.overall_health_score}
                        <span className="text-xl text-slate-500">/100</span>
                      </div>
                    </div>
                    <div className="w-full bg-navy-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                        style={{width: `${result.organ_mapping.overall_health_score}%`}}
                      />
                    </div>
                  </div>

                  {/* Radar chart */}
                  {radarData.length > 0 && (
                    <div className="card-glass rounded-xl p-5">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">System Health Radar</div>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#1e3a5f"/>
                          <PolarAngleAxis dataKey="subject" tick={{fontSize: 9, fill: '#475569'}}/>
                          <Radar name="Health" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2}/>
                          <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e3a5f', fontSize: 11, borderRadius: 8}}/>
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Organ table */}
                  <div className="card-glass rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-navy-700/50">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Organ Zone Thermal Analysis</div>
                    </div>
                    <div className="divide-y divide-navy-700/30">
                      {result.organ_mapping.organs.map((organ) => (
                        <div key={organ.organ} className="px-4 py-3 hover:bg-cyan-500/3 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-black">{organ.description}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-mono uppercase ${getStatusBadge(organ.status)}`}>
                                  {organ.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 mb-1">{organ.zone}</div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-slate-600">Perfusion</span>
                                  <div className="w-16 h-1 bg-navy-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                      style={{width: `${organ.perfusion_level}%`}}
                                    />
                                  </div>
                                  <span className="text-[9px] text-cyan-400 font-mono">{organ.perfusion_level}%</span>
                                </div>
                                <div className="text-[9px] font-mono" style={{color: organ.thermal_variation >= 0 ? '#f97316' : '#22c55e'}}>
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
                <div className="flex flex-col gap-4 fade-in-up">
                  <div className="card-glass rounded-xl p-5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">
                      Perfusion Stability Embedding Space
                    </div>
                    <EmbeddingPlot result={result} />
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 opacity-60"/>
                        <span className="text-[10px] text-slate-400">Control Group</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 opacity-60"/>
                        <span className="text-[10px] text-slate-400">DM Group</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-black"/>
                        <span className="text-[10px] text-slate-400">Your Image</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                      <div className="bg-navy-800/50 rounded-lg p-2">
                        <span className="text-slate-500">UMAP-1: </span>
                        <span className="text-cyan-400 font-mono">{result.embedding.x.toFixed(4)}</span>
                      </div>
                      <div className="bg-navy-800/50 rounded-lg p-2">
                        <span className="text-slate-500">UMAP-2: </span>
                        <span className="text-cyan-400 font-mono">{result.embedding.y.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── REPORT TAB ── */}
              {activeTab === 'Report' && (
                <div className="flex flex-col gap-4 fade-in-up">
                  <div className="card-glass rounded-xl p-6 text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <div className="font-bold text-black text-lg mb-2">Research Report Ready</div>
                    <div className="text-slate-400 text-sm mb-2">Session: <span className="font-mono text-cyan-400">{result.session_id}</span></div>
                    <div className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
                      Comprehensive PDF report including all thermal analysis metrics,
                      organ zone assessments, PSE embedding coordinates, and NDVII scores.
                    </div>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600
                        text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg
                        hover:shadow-cyan-500/20 transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download PDF Report
                    </button>
                  </div>

                  {/* Report preview */}
                  <div className="card-glass rounded-xl p-5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">Report Contents</div>
                    <div className="space-y-2">
                      {[
                        '✓ Session metadata & timestamp',
                        '✓ Core NDVII metrics & stability classification',
                        '✓ Temperature distribution statistics',
                        '✓ Bilateral symmetry differential',
                        '✓ Organ zone thermal analysis (8 systems)',
                        '✓ System-level health summary',
                        '✓ Perfusion levels per zone',
                        '✓ Thermal variation signatures',
                        '✓ PSE embedding coordinates',
                        '✓ Research disclaimer & limitations',
                      ].map(item => (
                        <div key={item} className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="text-emerald-400">{item.split(' ')[0]}</span>
                          <span>{item.split(' ').slice(1).join(' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <p className="text-[10px] text-red-300/70 leading-relaxed">
                      ⚠️ This report is for research purposes only. All findings are computational
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