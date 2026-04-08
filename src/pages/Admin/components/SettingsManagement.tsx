import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { AppSettings } from '../../../types';
import { Save, Bell, Phone, Smartphone, Palette } from 'lucide-react';

const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    notice: '',
    bkashNumber: '',
    nagadNumber: '',
    rocketNumber: '',
    themeColor: '#16a34a',
    whatsappNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'app'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'app'), settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-400">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Save size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">App Configuration</h2>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#006a4e] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#005a42] transition-all flex items-center space-x-2"
          >
            {saving ? <span>Saving...</span> : <><Save size={18} /><span>Save Changes</span></>}
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Notice Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-900 font-black uppercase tracking-widest text-[10px]">
              <Bell size={16} className="text-blue-600" />
              <h3>Home Notice</h3>
            </div>
            <textarea 
              value={settings.notice}
              onChange={(e) => setSettings({...settings, notice: e.target.value})}
              placeholder="Enter notice text here..."
              className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all min-h-[120px] text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Payment Numbers */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-gray-900 font-black uppercase tracking-widest text-[10px]">
                <Smartphone size={16} className="text-blue-600" />
                <h3>Payment Numbers</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">bKash Number</label>
                  <input 
                    type="text" 
                    value={settings.bkashNumber}
                    onChange={(e) => setSettings({...settings, bkashNumber: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nagad Number</label>
                  <input 
                    type="text" 
                    value={settings.nagadNumber}
                    onChange={(e) => setSettings({...settings, nagadNumber: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Rocket Number</label>
                  <input 
                    type="text" 
                    value={settings.rocketNumber}
                    onChange={(e) => setSettings({...settings, rocketNumber: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Support & Theme */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-gray-900 font-black uppercase tracking-widest text-[10px]">
                  <Phone size={16} className="text-blue-600" />
                  <h3>Support</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-gray-900 font-black uppercase tracking-widest text-[10px]">
                  <Palette size={16} className="text-blue-600" />
                  <h3>Theme</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Theme Color</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="color" 
                      value={settings.themeColor}
                      onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                      className="w-12 h-12 rounded-xl cursor-pointer border-none"
                    />
                    <input 
                      type="text" 
                      value={settings.themeColor}
                      onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                      className="flex-1 px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
