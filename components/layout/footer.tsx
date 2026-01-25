import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-white transition">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-white transition">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="/partner-program" className="hover:text-white transition">
                  Partner Program
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/networking" className="hover:text-white transition">
                  Networking
                </Link>
              </li>
              <li>
                <Link href="/categories/cloud" className="hover:text-white transition">
                  Cloud Services
                </Link>
              </li>
              <li>
                <Link href="/categories/security" className="hover:text-white transition">
                  Cybersecurity
                </Link>
              </li>
              <li>
                <Link href="/categories/storage" className="hover:text-white transition">
                  Storage
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@marketplace.satmz.com" className="hover:text-white transition">
                  support@marketplace.satmz.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+1-800-555-0100" className="hover:text-white transition">
                  +1-800-555-0100
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="https://facebook.com/b2bmarketplace" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/b2bmarketplace" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/b2bmarketplace" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© 2024 B2B Marketplace. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-sm hover:text-white transition">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
