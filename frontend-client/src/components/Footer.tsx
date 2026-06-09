import { Mail, Phone, MapPin, MessageCircle, Camera, Video, Send } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  // Brand icons are missing in the current lucide-react version.
  // Using generic high-quality alternatives.
  const socialIcons = [
    { Icon: MessageCircle, label: 'Facebook' },
    { Icon: Camera, label: 'Instagram' },
    { Icon: Send, label: 'Twitter' },
    { Icon: Video, label: 'Youtube' },
  ];
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 overflow-hidden relative">
      <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="container-main relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4H10L14 14V4H18V20H14L10 10V20H6V4Z" fill="white" />
                </svg>
              </div>
              <span className="text-white text-xl font-black tracking-tight">
                Nex<span className="text-orange-500">ora</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Bangladesh's leading premium electronics and lifestyle destination. Bringing quality to your doorstep since 2024.
            </p>
            <div className="flex items-center gap-4">
              {socialIcons.map(({ Icon, label }, i) => (
                <a key={i} href="#" title={label} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all border border-white/5">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Shopping</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/products" className="hover:text-orange-500 transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-orange-500 transition-colors">Categories</Link></li>
              <li><Link href="/offers" className="hover:text-orange-500 transition-colors">Flash Deals</Link></li>
              <li><Link href="/featured" className="hover:text-orange-500 transition-colors">Featured</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Help & Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/track-order" className="hover:text-orange-500 transition-colors">Track Order</Link></li>
              <li><Link href="/shipping" className="hover:text-orange-500 transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-orange-500 transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/faq" className="hover:text-orange-500 transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 shrink-0" />
                <span>123 Tech Tower, Level 4, Gulshan-1, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-orange-500 shrink-0" />
                <span>+880 1700 000000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-orange-500 shrink-0" />
                <span>support@nexora.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-500 font-medium">
            © 2024 Nexora. All rights reserved. Built with passion in Bangladesh.
          </p>
          <div className="flex items-center gap-8 grayscale opacity-50">
             {/* Payment Icons Placeholder */}
             <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Visa / Mastercard / bKash / Nagad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
