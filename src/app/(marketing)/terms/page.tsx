export const metadata = { title: 'Terms of Service', description: 'MCPmarket Terms of Service' }

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last updated: March 29, 2026</p>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
          <p>By using MCPmarket, you agree to these Terms of Service. MCPmarket provides a marketplace platform for MCP server developers and subscribers.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">Revenue Share</h2>
          <p>MCPmarket retains a 20% platform fee on all transactions. Developers receive 80% of gross subscription and usage revenue. Payouts are processed via Stripe Connect.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">Prohibited Content</h2>
          <p>Developers may not list servers that violate applicable laws, infringe intellectual property rights, or contain malicious code.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p>For questions about these terms, contact legal@mcpmarket.dev</p>
        </section>
      </div>
    </div>
  )
}
