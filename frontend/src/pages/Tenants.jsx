import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { getCurrentTenant, registerShopify, syncData } from '../services/api';

export default function Tenants() {
  const { isDark } = useTheme();
  const [tenant, setTenant] = useState(null);
  const [formData, setFormData] = useState({ shopifyDomain: '', shopifyToken: '' });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400';

  useEffect(() => { loadTenant(); }, []);

  const loadTenant = async () => {
    try {
      const response = await getCurrentTenant();
      setTenant(response.data.data);
      if (response.data.data.shopifyDomain) {
        setFormData({ shopifyDomain: response.data.data.shopifyDomain, shopifyToken: '' });
      }
    } catch (err) {
      console.error('Failed to load tenant:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await registerShopify(formData);
      setMessage({ type: 'success', text: 'Shopify store connected successfully!' });
      loadTenant();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to connect store' });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await syncData();
      const { customersCount, ordersCount, productsCount } = response.data.data;
      setMessage({ type: 'success', text: `Synced ${customersCount} customers, ${ordersCount} orders, ${productsCount} products!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>Settings</h1>
        </div>
        <p className={`${textSecondary} ml-5`}>Manage your account and Shopify integration.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' 
          ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'
          : isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'success' 
            ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100' 
            : isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
            {message.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <p className={`font-medium ${message.type === 'success' ? isDark ? 'text-emerald-400' : 'text-emerald-700' : isDark ? 'text-red-400' : 'text-red-700'}`}>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Card */}
        <div className="lg:col-span-1">
          <div className={`${cardBg} rounded-2xl shadow-sm border p-6 card-hover`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Account</h2>
            </div>
            
            {tenant && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/25">
                    {(tenant.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${textPrimary}`}>{tenant.name}</p>
                    <p className={`text-sm ${textSecondary}`}>{tenant.email}</p>
                  </div>
                </div>
                
                <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textSecondary}`}>Store Status</span>
                    {tenant.shopifyDomain ? (
                      <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Connected
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                        Not Connected
                      </span>
                    )}
                  </div>
                  {tenant.shopifyDomain && (
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${textSecondary}`}>Domain</span>
                      <span className={`text-sm font-semibold ${textPrimary}`}>{tenant.shopifyDomain}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shopify Connection */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${cardBg} rounded-2xl shadow-sm border p-6 card-hover`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.337 3.415c-.022-.165-.187-.247-.312-.261-.124-.014-2.551-.187-2.551-.187s-1.703-1.676-1.89-1.863c-.187-.187-.55-.132-.693-.088-.02.006-.37.114-.948.293C8.591.475 8.089.001 7.412.001c-.99 0-1.98.99-2.475 2.475-.66.204-1.128.348-1.188.366-.372.117-.384.129-.432.48C3.27 3.63 2.25 11.61 2.25 11.61l9.75 1.83 5.25-1.14s-1.89-8.72-1.913-8.885z"/>
                </svg>
              </div>
              <div>
                <h2 className={`text-lg font-bold ${textPrimary}`}>Connect Shopify Store</h2>
                <p className={`text-sm ${textSecondary}`}>Link your store to start syncing data</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Shopify Domain</label>
                <input
                  type="text"
                  required
                  value={formData.shopifyDomain}
                  onChange={(e) => setFormData({ ...formData, shopifyDomain: e.target.value })}
                  className={`w-full px-4 py-3.5 ${inputBg} border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium`}
                  placeholder="your-store.myshopify.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Admin API Access Token</label>
                <input
                  type="password"
                  required
                  value={formData.shopifyToken}
                  onChange={(e) => setFormData({ ...formData, shopifyToken: e.target.value })}
                  className={`w-full px-4 py-3.5 ${inputBg} border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium`}
                  placeholder="shpat_xxxxx"
                />
                <p className={`text-xs ${textSecondary} mt-2`}>Settings → Apps → Develop apps → Create app → API credentials</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3.5 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Connecting...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> Connect Store</>
                )}
              </button>
            </form>
          </div>

          {tenant?.shopifyDomain && (
            <div className={`${cardBg} rounded-2xl shadow-sm border p-6 card-hover`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${textPrimary}`}>Data Sync</h2>
                  <p className={`text-sm ${textSecondary}`}>Sync your Shopify data manually</p>
                </div>
              </div>

              <div className={`rounded-xl p-4 mb-6 flex items-start gap-3 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>Auto-sync enabled</p>
                  <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Data syncs automatically every 10 minutes</p>
                </div>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full btn-primary text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {syncing ? (
                  <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Syncing...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Sync Now</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
