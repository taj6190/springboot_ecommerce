'use client';

import { Settings, Save, Store, Globe, Mail, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings size={22} style={{ color: 'var(--accent)' }} /> System Settings
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Configure global store preferences and system parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent-light)] text-[var(--accent)] flex items-center gap-2">
            <Store size={16} /> Store Info
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)] flex items-center gap-2">
            <Globe size={16} /> SEO & Social
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)] flex items-center gap-2">
            <Mail size={16} /> SMTP Config
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)] flex items-center gap-2">
            <ShieldAlert size={16} /> Security
          </button>
        </div>

        {/* Settings Form area */}
        <div className="md:col-span-3 space-y-6">
          <div className="card p-6 space-y-5">
            <h3 className="text-lg font-semibold text-white">Store Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Store Name</label>
                <input type="text" className="input" defaultValue="Nexora" />
              </div>
              <div>
                <label className="label">Contact Email</label>
                <input type="email" className="input" defaultValue="support@nexora.com" />
              </div>
              <div>
                <label className="label">Support Phone</label>
                <input type="text" className="input" defaultValue="+880 1700-000000" />
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input">
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Store Address</label>
              <textarea className="input" rows={3} defaultValue="Dhaka, Bangladesh" />
            </div>

            <hr style={{ borderColor: 'var(--border)' }} />
            
            <h3 className="text-lg font-semibold text-white mt-4">Operational Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-white">Enable Cash on Delivery (COD)</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Allow customers to pay upon delivery.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-white">Stock Warnings</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Show low stock warnings to customers.</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
