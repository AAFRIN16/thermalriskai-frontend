import { useNavigate } from 'react-router-dom'

const pipeline = [
  { step: '01', label: 'Infrared Input', desc: 'Thermal image ingestion & validation', icon: '📷' },
  { step: '02', label: 'Preprocessing', desc: 'Noise reduction & normalization', icon: '⚙️' },
  { step: '03', label: 'CNN Extraction', desc: 'EfficientNet-B0 feature vectors', icon: '🧠' },
  { step: '04', label: 'PSE Embedding', desc: 'UMAP stability manifold', icon: '🔬' },
  { step: '05', label: 'NDVII Score', desc: 'Instability indicator generation', icon: '📊' },
  { step: '06', label: 'Organ Mapping', desc: 'Zone-based health analysis', icon: '🫀' },
]

const stats = [
  { value: '92.4%', label: 'Classification Accuracy' },
  { value: '98%', label: 'NDVII Accuracy' },
  { value: '0.69', label: 'PSE Separation Gap' },
  { value: '1,866', label: 'Training Samples' },
]

const features = [
  {
    icon: '🌡️',
    title: 'Grad-CAM Visualization',
    desc: 'AI attention heatmaps showing exact thermal regions influencing the analysis'
  },
  {
    icon: '🫀',
    title: 'Organ Zone Mapping',
    desc: 'Reflexology-based thermal zone analysis mapping to 8 major organ systems'
  },
  {
    icon: '📐',
    title: 'Bilateral Symmetry',
    desc: 'Left-right thermal differential analysis for asymmetry detection'
  },
  {
    icon: '📈',
    title: 'Perfusion Scoring',
    desc: 'Per-zone vascular perfusion level quantification'
  },
  {
    icon: '📄',
    title: 'PDF Reports',
    desc: 'Downloadable comprehensive research reports with all metrics'
  },
  {
    icon: '🔒',
    title: 'Deterministic Output',
    desc: 'Same image always produces identical results for reproducible research'
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent"/>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl"/>

        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>
            <span className="text-xs text-cyan-400 font-mono uppercase tracking-widest">AI Healthcare Research Platform</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-black mb-4 tracking-tight leading-none">
            Thermal<span className="gradient-text">RiskAI</span>
          </h1>

          <p className="text-xl text-cyan-400 font-medium mb-4">
            AI-Based Spatial–Temporal Thermal Stability Analysis
          </p>

          <p className="max-w-2xl mx-auto text-slate-400 text-base leading-relaxed mb-10">
            Advanced computational platform analyzing infrared thermal images of feet and palms
            to model perfusion-related heat patterns, organ zone thermal signatures, and
            vascular stability through deep learning and spatial-temporal modeling.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600
                text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg
                hover:shadow-cyan-500/25 transition-all duration-200 hover:scale-105"
            >
              Begin Analysis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button
              onClick={() => navigate('/about')}
              className="flex items-center gap-2 text-slate-400 hover:text-white
                border border-slate-700 hover:border-slate-500
                font-medium px-6 py-3.5 rounded-xl transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-navy-700/50 bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black gradient-text mb-1">{s.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Pipeline */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-sm text-cyan-500 font-mono uppercase tracking-widest mb-3">Processing Pipeline</div>
          <h2 className="text-4xl font-bold text-black">How It Works</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {pipeline.map((step, i) => (
            <div key={step.step} className="relative">
              <div className="card-glass rounded-xl p-5 text-center hover:border-cyan-500/30 transition-all duration-200 hover:glow-cyan">
                <div className="text-4xl mb-3">{step.icon}</div>
                <div className="text-xs text-cyan-500 font-mono mb-1.5">{step.step}</div>
                <div className="text-sm font-bold text-black mb-1.5">{step.label}</div>
                <div className="text-xs text-slate-400 leading-tight">{step.desc}</div>
              </div>
              {i < pipeline.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 z-10 text-cyan-500/30 text-base">▶</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-navy-900/30 border-y border-navy-700/50">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-sm text-cyan-500 font-mono uppercase tracking-widest mb-3">Capabilities</div>
            <h2 className="text-4xl font-bold text-black">Platform Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card-glass rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-200">
                <div className="text-4xl mb-4">{f.icon}</div>
                <div className="font-bold text-white mb-2 text-base">{f.title}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="card-glass rounded-xl p-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-amber-400 mb-2 text-sm uppercase tracking-wider">
                Research Platform — Non-Diagnostic
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                ThermalRiskAI is an AI-powered computational research tool. All outputs including NDVII scores,
                organ zone assessments, perfusion levels, and health indicators are <strong className="text-black">
                non-diagnostic computational research indicators only</strong>. They do not constitute medical advice,
                diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions.
                This platform is intended for research and educational purposes only.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}