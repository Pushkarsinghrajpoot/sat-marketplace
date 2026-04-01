import Link from 'next/link';
import { Zap, Globe, Mail, Share2 } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ background: '#161B2B' }} className="text-white w-full pt-20 pb-10 text-sm leading-relaxed">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">NexTrade <span style={{ color: '#818CF8' }}>Pro</span></span>
            </Link>
            <p className="text-[#64748B] mb-8 max-w-xs leading-relaxed">
              The world's leading curated digital marketplace for premium B2B technology procurement.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe, href: '#' },
                { icon: Mail, href: 'mailto:support@marketplace.satmz.com' },
                { icon: Share2, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:border-[#4648D4] hover:bg-[#4648D4]"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon className="h-4 w-4 text-[#94A3B8]" />
                </a>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px]">Solutions</h4>
            <ul className="space-y-4">
              {[
                { label: 'Enterprise Networking', href: '/categories' },
                { label: 'Cloud Infrastructure', href: '/categories' },
                { label: 'Managed Security', href: '/categories' },
                { label: 'Hardware Lifecycle', href: '/categories' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}
                    className="text-[#64748B] hover:text-[#818CF8] transition-all hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px]">Platform</h4>
            <ul className="space-y-4">
              {[
                { label: 'Deal Registration', href: '/how-it-works' },
                { label: 'Distributor Portal', href: '/distributors' },
                { label: 'Partner Program', href: '/partner-program' },
                { label: 'How It Works', href: '/how-it-works' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}
                    className="text-[#64748B] hover:text-[#818CF8] transition-all hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px]">Resources</h4>
            <ul className="space-y-4">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'API Documentation', href: '/api' },
                { label: 'Success Stories', href: '/blog' },
                { label: 'Contact Support', href: 'mailto:support@marketplace.satmz.com' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}
                    className="text-[#64748B] hover:text-[#818CF8] transition-all hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-10 flex flex-col md:flex-row justify-between items-center gap-6"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="text-[#475569] text-xs">© 2024 NexTrade Pro. The Digital Curator for B2B Technology.</p>
          <div className="flex gap-8 text-xs font-medium text-[#475569]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
