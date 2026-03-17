import { useNavigate } from 'react-router-dom'

const pipelineSteps = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
    label: 'Infrared Imaging',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <rect x="9" y="9" width="6" height="6"/>
        <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
      </svg>
    ),
    label: 'Feature Extraction',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    label: 'Stability Modeling',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    label: 'Drift Analysis',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    label: 'Visualization',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold
          px-4 py-1.5 rounded-full mb-6 tracking-wide">
          AI Healthcare Research
        </span>

        <h1 className="text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
          ThermalRiskAI
        </h1>

        <p className="text-xl font-semibold text-blue-600 mb-5">
          AI-Based Spatial–Temporal Thermal Stability Analysis
        </p>

        <p className="max-w-xl text-gray-500 text-base leading-relaxed mb-10">
          An advanced research system that analyzes infrared thermal images to study
          perfusion-related heat patterns through computational modeling and
          spatial-temporal stability analysis.
        </p>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
            text-white font-semibold px-8 py-3.5 rounded-full shadow-md
            transition-all duration-200 hover:shadow-lg text-base"
        >
          Try Thermal Analysis
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </section>

      {/* Pipeline */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            System Pipeline
          </h2>

          <div className="flex items-center justify-center gap-0 flex-wrap">
            {pipelineSteps.map((step, index) => (
              <div key={step.label} className="flex items-center">
                {/* Step card */}
                <div className="flex flex-col items-center gap-3 bg-white
                  border border-gray-200 rounded-xl px-6 py-5 w-36
                  shadow-sm hover:shadow-md transition-shadow duration-200">
                  {step.icon}
                  <span className="text-xs font-medium text-gray-600 text-center leading-tight">
                    {step.label}
                  </span>
                </div>

                {/* Arrow */}
                {index < pipelineSteps.length - 1 && (
                  <div className="px-2 text-gray-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}