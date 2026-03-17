const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      title: 'Spatial Symmetry Analysis',
      description:
        'Compares bilateral thermal distributions to detect asymmetric perfusion patterns across corresponding tissue regions. By evaluating temperature differentials between anatomically symmetric zones, the system highlights areas where heat dissipation deviates from expected norms.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: 'Temporal Drift Tracking',
      description:
        'Monitors subtle temperature changes over sequential infrared frames to identify gradual thermal drift. This longitudinal analysis captures perfusion dynamics that single-frame assessments miss, enabling more comprehensive stability profiling.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      ),
      title: 'Perfusion Stability Embedding',
      description:
        'Converts spatial-temporal thermal features into a compact mathematical embedding that encodes the overall perfusion stability state. This embedding enables quantitative comparison across time points and patient cohorts for research purposes.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: 'Non-Diagnostic Instability Index',
      description:
        'Generates a composite index from embedding deviations that highlights regions with emerging thermal irregularities. This index is strictly for computational research and does not constitute medical advice or diagnosis.',
    },
  ]
  
  export default function About() {
    return (
      <div className="min-h-screen bg-white">
        <section className="max-w-3xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold
              px-4 py-1.5 rounded-full mb-6 tracking-wide">
              Research
            </span>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              About the Research
            </h1>
            <p className="text-gray-500 text-base leading-relaxed max-w-2xl mx-auto">
              ThermalRiskAI introduces a computational framework for analyzing perfusion
              stability through infrared thermography, combining spatial symmetry assessment
              with temporal drift modeling.
            </p>
          </div>
  
          {/* Feature cards */}
          <div className="flex flex-col gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-5 bg-white border border-gray-200
                  rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg
                  flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-base">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }