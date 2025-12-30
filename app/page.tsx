export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Main Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyber-purple to-cyber-cyan bg-clip-text text-transparent">
            QUOVARINE
          </h1>
          <div className="h-1 w-64 mx-auto bg-gradient-to-r from-cyber-purple via-cyber-cyan to-cyber-purple rounded-full"></div>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-300 font-light">
          Autonomous Workflow Automation System
        </p>

        {/* Mission Statement */}
        <div className="bg-dark-surface border border-cyber-purple/30 rounded-lg p-8 space-y-4 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-cyber-cyan">Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            Quovarine is an autonomous system designed to automate and streamline 
            administrative workflows. Through intelligent automation and self-healing 
            capabilities, we eliminate manual overhead and ensure continuous operation 
            of critical business processes.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className="h-2 w-2 bg-cyber-cyan rounded-full animate-pulse"></div>
          <span className="text-gray-400">System Online</span>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 pt-8">
          <div className="bg-dark-surface border border-cyber-purple/20 rounded-lg p-6 hover:border-cyber-purple/50 transition-colors">
            <div className="text-cyber-purple text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-white mb-2">Automated Deployment</h3>
            <p className="text-gray-400 text-sm">
              Continuous integration and deployment with zero-downtime updates
            </p>
          </div>
          <div className="bg-dark-surface border border-cyber-cyan/20 rounded-lg p-6 hover:border-cyber-cyan/50 transition-colors">
            <div className="text-cyber-cyan text-2xl mb-2">🔄</div>
            <h3 className="font-semibold text-white mb-2">Self-Healing</h3>
            <p className="text-gray-400 text-sm">
              Automatic error detection and recovery with rollback capabilities
            </p>
          </div>
          <div className="bg-dark-surface border border-cyber-purple/20 rounded-lg p-6 hover:border-cyber-purple/50 transition-colors">
            <div className="text-cyber-purple text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-white mb-2">Real-time Monitoring</h3>
            <p className="text-gray-400 text-sm">
              Continuous health checks and performance monitoring
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
