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
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Save size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">App Settings</h2>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center space-x-2"
          >
            {saving ? <span>Saving...</span> : <><Save size={18} /><span>Save Changes</span></>}
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Notice Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-900 font-bold">
              <Bell size={18} className="text-blue-600" />
              <h3>Home Notice</h3>
            </div>
            <textarea 
              value={settings.notice}
              onChange={(e) => setSettings({...settings, notice: e.target.value})}
              placeholder="Enter notice text here..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all min-h-[100px] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Payment Numbers */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-900 font-bold">
                <Smartphone size={18} className="text-blue-600" />
                <h3>Payment Numbers</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">bKash Number</label>
                  <input 
                    type="text" 
                    value={settings.bkashNumber}
                    onChange={(e) => setSettings({...settings, bkashNumber: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nagad Number</label>
                  <input 
                    type="text" 
                    value={settings.nagadNumber}
                    onChange={(e) => setSettings({...settings, nagadNumber: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rocket Number</label>
                  <input 
                    type="text" 
                    value={settings.rocketNumber}
                    onChange={(e) => setSettings({...settings, rocketNumber: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Support & Theme */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-900 font-bold">
                  <Phone size={18} className="text-blue-600" />
                  <h3>Support</h3>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-900 font-bold">
                  <Palette size={18} className="text-blue-600" />
                  <h3>Theme</h3>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Primary Theme Color</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="color" 
                      value={settings.themeColor}
                      onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={settings.themeColor}
                      onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm font-mono"
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
