import React from 'react';
import { Facebook, Instagram, Youtube, Mail, Phone, Send } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a192f] text-white pt-10 pb-24 md:pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h3 className="text-xl font-black mb-4 uppercase tracking-tight">STAY CONNECTED</h3>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            কোন সমস্যায় পড়লে হোয়াটসঅ্যাপ এ যোগাযোগ করবেন। তাহলে দ্রুত সমাধান পেয়ে যাবেন।
          </p>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400">
            © RG BAZZER 2026 | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
