import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  Activity,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingDown,
  Layers,
  ArrowDown,
  Mail,
  CalendarDays,
  KeyRound,
  UploadCloud,
  AlertTriangle,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDigitalTwin } from '../context/DigitalTwinContext'
import { deleteScan, deleteAllHistory } from '../services/api'

/* ==================== DIGITAL TWIN PAGE COMPONENT ==================== */

export default function DigitalTwin() {
  const { currentUser } = useAuth()
  const { digitalTwinData, historyData, loading, error, refreshData } = useDigitalTwin()

  // Deletion modal and feedback state management
  const [deleteModal, setDeleteModal] = useState<{ type: 'single'; scanId: string } | { type: 'all' } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Auto-dismiss success feedback message after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Handle execution of scan deletion
  const handleConfirmDelete = async () => {
    if (!deleteModal || isDeleting) return
    setIsDeleting(true)
    setActionError(null)

    try {
      if (deleteModal.type === 'single') {
        await deleteScan(deleteModal.scanId)
        setSuccessMessage('Scan deleted.')
      } else if (deleteModal.type === 'all') {
        await deleteAllHistory()
        setSuccessMessage('All scan history deleted.')
      }
      setDeleteModal(null)
      await refreshData()
    } catch (err: any) {
      console.error('Deletion error:', err)
      const status = err.response?.status
      if (status === 401) {
        setActionError('Authentication required. Please sign in again.')
      } else if (status === 403) {
        setActionError('You do not have permission to delete this record.')
      } else if (status === 404) {
        setActionError('Scan record not found.')
      } else {
        setActionError(err.response?.data?.detail || 'Failed to delete scan record. Please try again.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // Format authenticated user dates
  const createdDate = currentUser?.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : 'Today'

  const lastLoginTime = currentUser?.metadata.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'Today'

  const userInitial = currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase()
    : currentUser?.email
      ? currentUser.email.charAt(0).toUpperCase()
      : 'U'

  // Extract live metrics from API response
  const summary = digitalTwinData?.digital_twin_summary
  const scansProcessed = summary?.scans_processed ?? 0
  const avgWellness = summary?.avg_wellness_score ? `${summary.avg_wellness_score}%` : 'N/A'
  const avgNdvii = summary?.avg_ndvii ? summary.avg_ndvii.toFixed(4) : 'N/A'
  const baselineStatus = summary?.baseline_status || 'Not Established'
  const recoveryTrend = summary?.recovery_trend || '0.0%'
  const overallTrend = digitalTwinData?.trend || (scansProcessed === 0 ? 'Awaiting initial scan' : 'Calibrating')

  // Scan history list (Newest first for history list)
  const scansList = historyData?.history
    ? [...historyData.history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : []

  // Dynamic Trend Chart Data (Chronological: Oldest to Newest)
  const chartData = historyData?.history
    ? [...historyData.history]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((scan, idx) => ({
        label: `Scan ${idx + 1}`,
        date: new Date(scan.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        wellnessScore: scan.WellnessScore ?? Math.round((1 - (scan.NDVII?.ndvii ?? 0)) * 100),
        ndvii: scan.NDVII?.ndvii ?? 0,
        confidence: scan.prediction?.confidence ?? 0,
      }))
    : []

  // Metric card definitions mapping live data
  const summaryCards = [
    {
      title: 'Overall Wellness Score',
      value: avgWellness,
      subtitle: scansProcessed > 0 ? 'Live Average' : 'Initial Calibration',
      icon: Activity,
      color: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      bgColor: 'bg-cyan-50',
      trend: scansProcessed > 0 ? `Recovery ${recoveryTrend}` : 'Awaiting first scan',
    },
    {
      title: 'Recovery Status',
      value: recoveryTrend,
      subtitle: overallTrend,
      icon: RotateCcw,
      color: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      bgColor: 'bg-emerald-50',
      trend: scansProcessed > 0 ? 'Vascular trajectory' : 'Model initializing',
    },
    {
      title: 'Baseline Stability',
      value: baselineStatus,
      subtitle: scansProcessed >= 3 ? 'Multi-scan baseline' : `Requires 3 scans (${scansProcessed}/3)`,
      icon: ShieldCheck,
      color: 'text-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      trend: scansProcessed > 0 ? `Avg NDVII: ${avgNdvii}` : 'Not Established',
    },
    {
      title: 'Risk Trend',
      value: overallTrend,
      subtitle: 'Vascular Stability',
      icon: TrendingDown,
      color: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      bgColor: 'bg-indigo-50',
      trend: scansProcessed > 0 ? `${scansProcessed} scans analyzed` : 'Routine tracking',
    },
  ]

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-10 overflow-x-hidden">

      {/* ==================== 1. HEADER & AUTHENTICATED USER PROFILE ==================== */}
      <section className="relative overflow-hidden card-glass rounded-2xl p-5 sm:p-8 md:p-10 border border-slate-200 shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-3 sm:mb-4">
              <Sparkles className="w-4 h-4 text-cyan-700 animate-pulse flex-shrink-0" />
              <span className="text-xs text-cyan-800 font-mono uppercase tracking-wider font-bold">
                Personalized Digital Model
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3">
              Digital <span className="gradient-text">Twin</span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-normal">
              Personalized thermal wellness monitoring using historical thermal scans.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 w-full sm:w-auto">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 flex-shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Digital Twin Engine</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono">v2.4 Neural Mesh</div>
            </div>
          </div>
        </div>

        {/* Authenticated User Account Details Card */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
          <div className="flex items-center gap-3 sm:gap-4 sm:col-span-2">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Profile'}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-cyan-500 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-cyan-600 text-white font-bold text-lg sm:text-xl flex items-center justify-center shadow-md flex-shrink-0">
                {userInitial}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">
                  {currentUser?.displayName || 'Authenticated User'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Verified
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{currentUser?.email || 'No email provided'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
            <CalendarDays className="w-4 h-4 text-cyan-700 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account Created</div>
              <div className="text-xs font-bold text-slate-900 font-mono">{createdDate}</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-cyan-700 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Last Login</div>
              <div className="text-xs font-bold text-slate-900 font-mono">{lastLoginTime}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Success / Error Feedback Notifications */}
      {successMessage && (
        <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold p-0.5 rounded-md hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-medium shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold p-0.5 rounded-md hover:bg-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* API Error Notification */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ==================== LOADING SKELETONS ==================== */}
      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 bg-slate-200/70 rounded-xl" />
            ))}
          </div>
          <div className="h-28 bg-slate-200/70 rounded-2xl" />
          <div className="h-64 bg-slate-200/70 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* ==================== 2. WELLNESS SUMMARY CARDS ==================== */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {summaryCards.map((card, idx) => {
              const IconComp = card.icon
              return (
                <div
                  key={idx}
                  className="card-glass rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-cyan-300 hover:-translate-y-0.5 hover:shadow-md group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-lg ${card.bgColor} border ${card.borderColor} flex items-center justify-center ${card.color} group-hover:scale-105 transition-transform flex-shrink-0`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1 font-mono">
                    {card.value}
                  </div>
                  <div className="text-xs font-semibold text-cyan-700 mb-3 truncate">
                    {card.subtitle}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center text-[11px] text-slate-500 font-mono font-medium truncate">
                    <ChevronRight className="w-3 h-3 text-cyan-600 mr-1 flex-shrink-0" />
                    <span className="truncate">{card.trend}</span>
                  </div>
                </div>
              )
            })}
          </section>

          {/* ==================== 3. DIGITAL TWIN STATUS ==================== */}
          <section className="card-glass rounded-2xl p-5 sm:p-8 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-600 animate-ping flex-shrink-0" />
                <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                  Digital Twin Status
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                Realtime Mirror
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Status Display */}
              <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0">
                  <Cpu className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-slate-900">Learning</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Adaptive
                    </span>
                  </div>
                </div>
              </div>

              {/* Scans Processed Display */}
              <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 flex-shrink-0">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Scans Processed</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    {scansProcessed}
                  </div>
                </div>
              </div>

              {/* Average Wellness Score */}
              <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800 flex-shrink-0">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Wellness Score</div>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {avgWellness}
                  </div>
                </div>
              </div>

              {/* Baseline */}
              <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Baseline</div>
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    {baselineStatus}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 4. HISTORICAL SCAN TIMELINE / PREVIOUS SCANS ==================== */}
          <section className="card-glass rounded-2xl p-5 sm:p-8 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <div className="text-xs text-cyan-700 font-mono font-bold uppercase tracking-widest mb-1">
                  Longitudinal Track
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Historical Scan Timeline</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-500">
                  {scansList.length} Total Records
                </span>
                {scansList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ type: 'all' })}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs disabled:opacity-50"
                    title="Delete all scan records"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All History</span>
                  </button>
                )}
              </div>
            </div>

            {scansList.length === 0 ? (
              /* EMPTY HISTORY STATE */
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 sm:p-10 text-center space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">No scans yet</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Upload your first thermal image to initialize your Digital Twin and generate baseline vascular stability metrics.
                  </p>
                </div>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md hover:shadow-cyan-600/20 hover:scale-[1.02] transition-all"
                >
                  Upload First Scan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* HISTORICAL SCANS TIMELINE */
              <div className="space-y-4 sm:space-y-6">
                {scansList.map((scan, idx) => {
                  const label = scan.NDVII?.stability_label || 'Analyzed'
                  const ndviiVal = scan.NDVII?.ndvii?.toFixed(4) ?? '0.0000'
                  const score = scan.WellnessScore ?? Math.round((1 - (scan.NDVII?.ndvii ?? 0)) * 100)

                  return (
                    <React.Fragment key={scan.scanId || idx}>
                      <div className="relative bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-cyan-300 transition-all duration-200 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-800 flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs flex-shrink-0 mt-0.5 sm:mt-0">
                              #{scansList.length - idx}
                            </div>

                            <div className="overflow-hidden">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-mono truncate">{scan.scanId}</h3>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-300">
                                  {label}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 text-slate-800">
                                  {scan.prediction?.predicted_class || 'Control Group'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                                Wellness Score: <strong className="text-slate-900 font-mono">{score}%</strong> · NDVII: <strong className="text-cyan-800 font-mono">{ndviiVal}</strong> · Confidence: <strong className="text-slate-900 font-mono">{scan.prediction?.confidence ?? 0}%</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ type: 'single', scanId: scan.scanId })}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors shadow-2xs disabled:opacity-50"
                              title="Delete scan record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {idx < scansList.length - 1 && (
                        <div className="flex justify-center my-1 py-0.5">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-300 text-cyan-700 shadow-xs">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            )}
          </section>

          {/* ==================== 5. TREND CHARTS ==================== */}
          <section className="card-glass rounded-2xl p-5 sm:p-8 border border-slate-200 space-y-6 sm:space-y-8">
            <div>
              <div className="text-xs text-cyan-700 font-mono font-bold uppercase tracking-widest mb-1">
                Analytics & Metrics
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Trend Charts</h2>
              <p className="text-xs text-slate-600 mt-1">
                Multi-scan temporal indicators tracking thermal wellness, vascular instability (NDVII), and neural model confidence.
              </p>
            </div>

            {chartData.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 font-mono">
                No scan data available to render charts. Complete thermal scans to plot stability trends over time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Chart 1: Wellness Score */}
                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Wellness Score</h3>
                      <span className="text-[11px] text-emerald-700 font-mono font-semibold">{recoveryTrend} Trajectory</span>
                    </div>
                    <Activity className="w-4 h-4 text-cyan-700" />
                  </div>
                  <div className="h-48 sm:h-56 w-full mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="wellnessGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="wellnessScore" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#wellnessGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: NDVII Trend */}
                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">NDVII Trend</h3>
                      <span className="text-[11px] text-indigo-700 font-mono font-semibold">Avg: {avgNdvii}</span>
                    </div>
                    <TrendingDown className="w-4 h-4 text-indigo-700" />
                  </div>
                  <div className="h-48 sm:h-56 w-full mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} domain={[0, 1.0]} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="ndvii" stroke="#4f46e5" strokeWidth={2.5} dot={{ fill: '#4f46e5', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 3: Model Confidence */}
                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col md:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Model Confidence</h3>
                      <span className="text-[11px] text-emerald-700 font-mono font-semibold">Classification Match %</span>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="h-48 sm:h-56 w-full mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="confidence" fill="#059669" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </section>
        </>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setDeleteModal(null)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {deleteModal.type === 'single' ? 'Delete this scan?' : 'Delete all your scan history?'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {deleteModal.type === 'single'
                  ? 'This record will be permanently removed from your history.'
                  : 'This will permanently remove all your saved scans.'}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : deleteModal.type === 'single' ? (
                  <span>Delete</span>
                ) : (
                  <span>Delete All</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

