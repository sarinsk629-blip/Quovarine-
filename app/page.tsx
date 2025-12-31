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
          Claude 4.5 Opus Integration with Hexagonal Architecture
        </p>

        {/* Mission Statement */}
        <div className="bg-dark-surface border border-cyber-purple/30 rounded-lg p-8 space-y-4 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-cyber-cyan">Overview</h2>
          <p className="text-gray-300 leading-relaxed">
            Quovarine is a production-ready Claude 4.5 Opus integration layer featuring 
            Extended Thinking capabilities, automatic provider failover, and multi-cloud 
            deployment support. Built on Hexagonal Architecture principles for maximum 
            flexibility and maintainability.
          </p>
        </div>

        {/* API Endpoints */}
        <div className="bg-dark-surface border border-cyber-purple/30 rounded-lg p-8 space-y-4 backdrop-blur-sm text-left">
          <h2 className="text-2xl font-semibold text-cyber-cyan text-center">API Endpoints</h2>
          <ul className="space-y-2 text-gray-300">
            <li><code className="bg-dark-bg px-2 py-1 rounded">POST /api/opus</code> - Send prompts to Claude 4.5</li>
            <li><code className="bg-dark-bg px-2 py-1 rounded">GET /api/opus</code> - Health check</li>
            <li><code className="bg-dark-bg px-2 py-1 rounded">GET /api/health</code> - System health status</li>
          </ul>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className="h-2 w-2 bg-cyber-cyan rounded-full animate-pulse"></div>
          <span className="text-gray-400">System Online</span>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 pt-8">
          <div className="bg-dark-surface border border-cyber-purple/20 rounded-lg p-6 hover:border-cyber-purple/50 transition-colors">
            <div className="text-cyber-purple text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-white mb-2">Claude 4.5 Opus</h3>
            <p className="text-gray-400 text-sm">
              Extended Thinking with up to 10K tokens and 64K token output
            </p>
          </div>
          <div className="bg-dark-surface border border-cyber-cyan/20 rounded-lg p-6 hover:border-cyber-cyan/50 transition-colors">
            <div className="text-cyber-cyan text-2xl mb-2">🔄</div>
            <h3 className="font-semibold text-white mb-2">Self-Healing</h3>
            <p className="text-gray-400 text-sm">
              Automatic provider failover and recovery with multi-cloud support
            </p>
          </div>
          <div className="bg-dark-surface border border-cyber-purple/20 rounded-lg p-6 hover:border-cyber-purple/50 transition-colors">
            <div className="text-cyber-purple text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-white mb-2">Streaming Responses</h3>
            <p className="text-gray-400 text-sm">
              Real-time streaming with Server-Sent Events for instant feedback
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
