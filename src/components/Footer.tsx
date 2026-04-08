import React from 'react';
import { Facebook, Instagram, Youtube, Mail, Send, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a192f] text-white pt-10 pb-10 px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">STAY CONNECTED</h3>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            কোন সমস্যায় পড়লে হোয়াটসঅ্যাপ এ যোগাযোগ করবেন। তাহলে দ্রুত সমাধান পেয়ে যাবেন।
          </p>
          <div className="flex space-x-4 mb-10">
            <a href="#" className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all">
              <Facebook size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all">
              <Youtube size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all">
              <Mail size={20} />
            </a>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-bold mb-6 uppercase tracking-tight">SUPPORT CENTER</h3>
          <div className="space-y-4">
            <a href="#" className="flex items-center space-x-4 p-4 rounded-xl border border-white/20 hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Help line [9AM-12PM]</p>
                <p className="text-sm font-bold">Whatsapp HelpLine</p>
              </div>
            </a>
            <a href="#" className="flex items-center space-x-4 p-4 rounded-xl border border-white/20 hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Send size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Help line [9AM-12PM]</p>
                <p className="text-sm font-bold">টেলিগ্রামে সাপোর্ট</p>
              </div>
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            © RG BAZZER 2026 | All Rights Reserved | Developed by Team Mahal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
