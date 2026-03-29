export const metadata = { title: 'Privacy Policy', description: 'MCPmarket Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last updated: March 29, 2026</p>
      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
          <p>MCPmarket collects information you provide when creating an account, listing a server, or subscribing to services. This includes your name, email address, and payment information processed securely through Stripe.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
          <p>We use collected information to provide, maintain, and improve MCPmarket services, process payments, send notifications about your subscriptions, and communicate platform updates.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
          <p>We share developer payout information with Stripe for payment processing. We do not sell your personal information to third parties.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p>For privacy questions, contact us at privacy@mcpmarket.dev</p>
        </section>
      </div>
    </div>
  )
}
