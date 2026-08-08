import {
  Brain,
  Scale,
  Clock,
  Microscope,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  FileCode,
} from 'lucide-react'

const research = [
  {
    icon: Brain,
    title: 'Deep Learning Architecture',
    desc: 'EfficientNet-B0 backbone fine-tuned on 1,866 diabetic foot thermograms. Transfer learning from ImageNet enables robust feature extraction from pseudocolor thermal images with 92.4% validation accuracy.'
  },
  {
    icon: Scale,
    title: 'Spatial Symmetry Analysis',
    desc: 'Bilateral thermal distribution comparison detecting asymmetric perfusion patterns. Temperature differentials between anatomically symmetric zones highlight regions where heat dissipation deviates from baseline norms.'
  },
  {
    icon: Clock,
    title: 'Temporal Drift Tracking',
    desc: 'Sequential frame analysis monitoring subtle temperature changes over time. LSTM-ready architecture captures perfusion dynamics that single-frame assessments miss, enabling longitudinal stability profiling.'
  },
  {
    icon: Microscope,
    title: 'Perfusion Stability Embedding',
    desc: 'UMAP dimensionality reduction transforms 128-dimensional CNN feature vectors into interpretable 2D embedding space. Control and DM groups achieve 0.69 separation gap — enabling precise stability state classification.'
  },
  {
    icon: HeartPulse,
    title: 'Organ Zone Thermal Mapping',
    desc: 'Deterministic reflexology-based thermal zone analysis maps surface temperature patterns to 8 major organ systems. Same image always produces identical results for reproducible research outcomes.'
  },
  {
    icon: ShieldCheck,
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
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent"/>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
            <FileCode className="w-3.5 h-3.5 text-cyan-700 flex-shrink-0" />
            <span className="text-xs text-cyan-700 font-mono font-bold uppercase tracking-widest">Research Specifications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight">
            About the <span className="gradient-text">Research</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            ThermalRiskAI introduces a computational framework for analyzing perfusion stability
            through infrared thermography, combining CNN-based spatial feature extraction,
            UMAP embedding, organ zone thermal mapping, and the Non-Diagnostic Vascular
            Instability Indicator.
          </p>
        </div>
      </section>

      {/* Tech Specs */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="card-glass rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="text-xs text-cyan-700 font-mono font-bold uppercase tracking-widest mb-4">Technical Specifications</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {specs.map((s) => (
              <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{s.label}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="text-xs text-cyan-700 font-mono font-bold uppercase tracking-widest mb-4 sm:mb-6">Core Research Components</div>
        <div className="flex flex-col gap-4">
          {research.map((r) => {
            const IconComp = r.icon
            return (
              <div key={r.title} className="card-glass rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-5 hover:border-cyan-300 transition-all duration-200 hover:shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center flex-shrink-0">
                  <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-1.5 sm:mb-2 text-sm sm:text-base">{r.title}</div>
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">{r.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-slate-200 bg-slate-100/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 border-l-4 border-l-red-500 shadow-2xs">
            <div className="flex items-center gap-2 text-red-700 font-bold mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              Medical Disclaimer
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              ThermalRiskAI and all its outputs — including NDVII scores, organ zone assessments,
              perfusion levels, health indicators, and PDF reports — are <strong className="text-slate-900 font-bold">
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