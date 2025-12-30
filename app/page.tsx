export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Quovarine - Claude 4.5 Opus Integration</h1>
      <p>Hexagonal Architecture AI integration layer with Extended Thinking capabilities.</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>API Endpoints</h2>
        <ul>
          <li>
            <code>POST /api/opus</code> - Send prompts to Claude 4.5
          </li>
          <li>
            <code>GET /api/opus</code> - Health check
          </li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Features</h2>
        <ul>
          <li>Claude 4.5 Opus with Extended Thinking (up to 10K tokens)</li>
          <li>64K token output support</li>
          <li>Streaming responses</li>
          <li>Automatic provider failover</li>
          <li>Multi-cloud deployment support</li>
          <li>Self-healing system</li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Documentation</h2>
        <p>See <a href="https://github.com/sarinsk629-blip/Quovarine-/blob/main/docs/ARCHITECTURE.md">ARCHITECTURE.md</a> for detailed documentation.</p>
      </section>
    </main>
  );
}
