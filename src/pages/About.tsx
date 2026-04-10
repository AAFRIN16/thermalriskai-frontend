const research = [
  {
    icon: '🧠',
    title: 'Deep Learning Architecture',
    desc: 'EfficientNet-B0 backbone fine-tuned on 1,866 diabetic foot thermograms. Transfer learning from ImageNet enables robust feature extraction from pseudocolor thermal images with 92.4% validation accuracy.'
  },
  {
    icon: '📐',
    title: 'Spatial Symmetry Analysis',
    desc: 'Bilateral thermal distribution comparison detecting asymmetric perfusion patterns. Temperature differentials between anatomically symmetric zones highlight regions where heat dissipation deviates from baseline norms.'
  },
  {
    icon: '⏱️',
    title: 'Temporal Drift Tracking',
    desc: 'Sequential frame analysis monitoring subtle temperature changes over time. LSTM-ready architecture captures perfusion dynamics that single-frame assessments miss, enabling longitudinal stability profiling.'
  },
  {
    icon: '🔬',
    title: 'Perfusion Stability Embedding',
    desc: 'UMAP dimensionality reduction transforms 128-dimensional CNN feature vectors into interpretable 2D embedding space. Control and DM groups achieve 0.69 separation gap — enabling precise stability state classification.'
  },
  {
    icon: '🫀',
    title: 'Organ Zone Thermal Mapping',
    desc: 'Deterministic reflexology-based thermal zone analysis maps surface temperature patterns to 8 major organ systems. Same image always produces identical results for reproducible research outcomes.'
  },
  {
    icon: '🛡️',
    title: 'Non-Diagnostic Instability Index',
    desc: 'NDVII composite score derived from embedding drift velocity, manifold distance, and asymmetry metrics. Normalized to [0,1] with 98% binary classification accuracy — strictly a research computational indicator.'
  },
]

const specs = [
  { label: 'Model', value: 'EfficientNet-B0' },
  { label: 'Feature Dim', value: '128-dim vectors' },
  { label: 'Embedding', value: 'UMAP 2D' },
  { label: 'Dataset', value: '1,866 thermal images' },
  { label: 'Val Accuracy', value: '92.4%' },
  { label: 'NDVII Accuracy', value: '98%' },
  { label: 'Framework', value: 'PyTorch + FastAPI' },
  { label: 'TRL Level', value: 'TRL 4' },
]

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-700/50">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent"/>
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <span className="text-xs text-cyan-400 font-mono uppercase tracking-widest">Research</span>
          </div>
          <h1 className="text-5xl font-black text-black mb-6 tracking-tight">
            About the <span className="gradient-text">Research</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            ThermalRiskAI introduces a computational framework for analyzing perfusion stability
            through infrared thermography, combining CNN-based spatial feature extraction,
            UMAP embedding, organ zone thermal mapping, and the Non-Diagnostic Vascular
            Instability Indicator.
          </p>
        </div>
      </section>

      {/* Tech Specs */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="card-glass rounded-2xl p-6">
          <div className="text-xs text-cyan-500 font-mono uppercase tracking-widest mb-4">Technical Specifications</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specs.map((s) => (
              <div key={s.label} className="bg-navy-800/50 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</div>
                <div className="text-sm font-semibold text-cyan-400 font-mono">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-xs text-cyan-500 font-mono uppercase tracking-widest mb-6">Core Research Components</div>
        <div className="flex flex-col gap-4">
          {research.map((r) => (
            <div key={r.title} className="card-glass rounded-xl p-6 flex items-start gap-5 hover:border-cyan-500/30 transition-all duration-200">
              <div className="text-3xl flex-shrink-0">{r.icon}</div>
              <div>
                <div className="font-bold text-white mb-2">{r.title}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-navy-700/50 bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="card-glass rounded-xl p-6 border-l-4 border-red-500">
            <div className="font-bold text-red-400 mb-3 text-sm uppercase tracking-wider">⚠️ Medical Disclaimer</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              ThermalRiskAI and all its outputs — including NDVII scores, organ zone assessments,
              perfusion levels, health indicators, and PDF reports — are <strong className="text-black">
              non-diagnostic computational research indicators</strong>. This platform does not provide
              medical advice, clinical diagnosis, or treatment recommendations. All analyses are based
              on thermal pattern computational modeling and have not been clinically validated.
              Always consult a qualified and licensed healthcare professional for any medical concerns.
              This tool is strictly for research and educational use only.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}