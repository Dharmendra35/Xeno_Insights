import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { getOrders } from '../services/api';

export default function Metrics() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ start: '', end: '' });

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async (start = '', end = '') => {
    setLoading(true);
    try {
      const response = await getOrders(start, end);
      setOrders(response.data.data.orders);
      setChartData(response.data.data.chartData);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => loadOrders(filters.start, filters.end);
  const clearFilters = () => { setFilters({ start: '', end: '' }); loadOrders(); };
  
  const setQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const newFilters = { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    setFilters(newFilters);
    loadOrders(newFilters.start, newFilters.end);
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';

  const chartConfig = {
    labels: chartData.map(d => d.date),
    datasets: [
      { label: 'Orders', data: chartData.map(d => d.count), borderColor: '#6366f1', backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4, yAxisID: 'y', pointRadius: 4, pointBackgroundColor: '#6366f1' },
      { label: 'Revenue (₹)', data: chartData.map(d => d.revenue), borderColor: '#10b981', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, yAxisID: 'y1', pointRadius: 4, pointBackgroundColor: '#10b981' }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { 
      legend: { position: 'top', labels: { usePointStyle: true, padding: 20, color: isDark ? '#94a3b8' : '#64748b' } }, 
      tooltip: { backgroundColor: isDark ? '#334155' : '#1e293b', padding: 16, cornerRadius: 12 } 
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: isDark ? '#64748b' : '#94a3b8' } },
      y: { type: 'linear', position: 'left', title: { display: true, text: 'Orders', color: '#6366f1' }, grid: { color: isDark ? '#1e293b' : '#f1f5f9' }, ticks: { color: isDark ? '#64748b' : '#94a3b8' } },
      y1: { type: 'linear', position: 'right', title: { display: true, text: 'Revenue (₹)', color: '#10b981' }, grid: { drawOnChartArea: false }, ticks: { color: isDark ? '#64748b' : '#94a3b8' } }
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      paid: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pending: isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200',
      refunded: isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200'
    };
    return styles[status] || (isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-200');
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>Order Analytics</h1>
        </div>
        <p className={`${textSecondary} ml-5`}>Deep dive into your order data and revenue trends.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: orders.length, icon: '📦', color: 'indigo' },
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: '💰', color: 'emerald' },
          { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), icon: '📊', color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className={`${cardBg} rounded-2xl p-5 border shadow-sm card-hover`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {stat.icon}
              </div>
              <div>
                <p className={`text-sm font-medium ${textSecondary}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${cardBg} rounded-2xl shadow-sm border p-6 mb-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Date Range Filter</h2>
              <p className={`text-sm ${textSecondary}`}>Filter orders by date range</p>
            </div>
          </div>
          {(filters.start || filters.end) && (
            <span className={`px-3 py-1.5 text-sm font-bold rounded-full animate-pulse ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>Active</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {['start', 'end'].map((type) => (
            <div key={type}>
              <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>{type === 'start' ? 'From' : 'To'} Date</label>
              <input
                type="date"
                value={filters[type]}
                onChange={(e) => setFilters({ ...filters, [type]: e.target.value })}
                className={`w-full px-4 py-3 ${inputBg} border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium`}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-sm self-center mr-2 font-medium ${textSecondary}`}>Quick:</span>
          {[{ label: 'Today', days: 0 }, { label: '7 days', days: 7 }, { label: '30 days', days: 30 }, { label: '90 days', days: 90 }].map(({ label, days }) => (
            <button key={label} type="button" onClick={() => setQuickFilter(days)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${isDark ? 'bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-300' : 'bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700'}`}>
              {label}
            </button>
          ))}
        </div>
        
        <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button type="button" onClick={applyFilter} className="btn-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Apply Filter
          </button>
          <button type="button" onClick={clearFilters} className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            Clear
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={`${cardBg} rounded-2xl shadow-sm border p-6 mb-6`}>
        <h2 className={`text-lg font-bold ${textPrimary} mb-6`}>Orders & Revenue Trend (₹)</h2>
        {chartData.length > 0 ? (
          <Line data={chartConfig} options={chartOptions} />
        ) : (
          <div className={`h-64 flex items-center justify-center rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <p className={textSecondary}>No data for selected period</p>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className={`${cardBg} rounded-2xl shadow-sm border overflow-hidden`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-lg font-bold ${textPrimary}`}>Orders ({orders.length})</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-slate-800/50' : 'bg-slate-50/50'}>
                  {['Order #', 'Date', 'Customer', 'Status', 'Total'].map(h => (
                    <th key={h} className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${textSecondary}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {orders.map((order) => (
                  <tr key={order.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className={`px-6 py-4 font-bold ${textPrimary}`}>#{order.orderNumber || order.shopifyId}</td>
                    <td className={`px-6 py-4 text-sm ${textSecondary}`}>{formatDate(order.orderDate)}</td>
                    <td className={`px-6 py-4 text-sm ${textSecondary}`}>{order.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getStatusStyle(order.financialStatus)}`}>
                        {order.financialStatus || 'unknown'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-bold ${textPrimary}`}>{formatCurrency(order.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>No orders found</h3>
            <p className={textSecondary}>Try adjusting your filters or sync your Shopify data.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
