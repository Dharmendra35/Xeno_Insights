import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { getSummary, getTopCustomers, getRevenueByMonth } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ShoppingBagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const CurrencyIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CubeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

export default function Dashboard() {
  const { isDark } = useTheme();
  const [summary, setSummary] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [summaryRes, customersRes, revenueRes] = await Promise.all([
        getSummary(), getTopCustomers(5), getRevenueByMonth()
      ]);
      setSummary(summaryRes.data.data);
      setTopCustomers(customersRes.data.data);
      setRevenueData(revenueRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value || 0);
  const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  const revenueChartData = {
    labels: revenueData.map(d => d.month),
    datasets: [{
      label: 'Revenue',
      data: revenueData.map(d => d.revenue),
      borderColor: '#6366f1',
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: isDark ? '#1e293b' : '#fff',
      pointBorderWidth: 3,
      pointRadius: 6
    }]
  };

  const ordersChartData = {
    labels: revenueData.map(d => d.month),
    datasets: [{
      label: 'Orders',
      data: revenueData.map(d => d.orders),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: isDark ? '#334155' : '#1e293b', padding: 16, cornerRadius: 12 }
    },
    scales: {
      x: { grid: { display: false, color: isDark ? '#334155' : '#f1f5f9' }, ticks: { color: isDark ? '#64748b' : '#94a3b8' } },
      y: { grid: { color: isDark ? '#1e293b' : '#f1f5f9' }, ticks: { color: isDark ? '#64748b' : '#94a3b8' } }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colors = {
      indigo: { bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50', icon: 'text-indigo-500', gradient: 'from-indigo-500 to-purple-500' },
      emerald: { bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50', icon: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
      blue: { bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', icon: 'text-blue-500', gradient: 'from-blue-500 to-cyan-500' },
      purple: { bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50', icon: 'text-purple-500', gradient: 'from-purple-500 to-pink-500' }
    };
    const c = colors[color];
    return (
      <div className={`${cardBg} rounded-2xl p-6 shadow-sm border card-hover`}>
        <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${c.icon}`} />
        </div>
        <p className={`text-sm font-medium ${textSecondary}`}>{title}</p>
        <p className={`text-3xl font-bold mt-1 bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>{value}</p>
        {subtitle && <p className={`text-xs ${textSecondary} mt-1`}>{subtitle}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <p className={`mt-6 font-medium ${textSecondary}`}>Loading your insights...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>Dashboard</h1>
        </div>
        <p className={`${textSecondary} ml-5`}>Welcome back! Here's your store performance overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Customers" value={formatNumber(summary?.totalCustomers)} icon={UsersIcon} color="indigo" subtitle="All time" />
        <StatCard title="Total Orders" value={formatNumber(summary?.totalOrders)} icon={ShoppingBagIcon} color="emerald" subtitle="All time" />
        <StatCard title="Total Revenue" value={formatCurrency(summary?.totalRevenue)} icon={CurrencyIcon} color="blue" subtitle="Lifetime value" />
        <StatCard title="Products" value={formatNumber(summary?.totalProducts)} icon={CubeIcon} color="purple" subtitle="In catalog" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`${cardBg} rounded-2xl shadow-sm border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Revenue Trend</h2>
              <p className={`text-sm ${textSecondary}`}>Monthly revenue (INR)</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Growing</span>
            </div>
          </div>
          {revenueData.length > 0 ? <Line data={revenueChartData} options={chartOptions} /> : (
            <div className={`h-64 flex items-center justify-center rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <p className={textSecondary}>No revenue data yet</p>
            </div>
          )}
        </div>

        <div className={`${cardBg} rounded-2xl shadow-sm border p-6`}>
          <h2 className={`text-lg font-bold ${textPrimary} mb-6`}>Orders Volume</h2>
          {revenueData.length > 0 ? <Bar data={ordersChartData} options={chartOptions} /> : (
            <div className={`h-64 flex items-center justify-center rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <p className={textSecondary}>No order data yet</p>
            </div>
          )}
        </div>
      </div>

      <div className={`${cardBg} rounded-2xl shadow-sm border overflow-hidden`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Top Customers</h2>
              <p className={`text-sm ${textSecondary}`}>Highest spending customers</p>
            </div>
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>TOP 5</span>
          </div>
        </div>
        
        {topCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-slate-800/50' : 'bg-slate-50/50'}>
                  {['Rank', 'Customer', 'Email', 'Orders', 'Total Spent'].map(h => (
                    <th key={h} className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${textSecondary}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {topCustomers.map((customer, index) => (
                  <tr key={customer.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                        isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>{index + 1}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                          {(customer.firstName?.[0] || customer.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${textPrimary}`}>
                            {customer.firstName || customer.lastName ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'Unknown'}
                          </p>
                          {index === 0 && <span className="text-xs text-amber-500 font-semibold">🏆 Top Spender</span>}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${textSecondary}`}>{customer.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>
                        {customer.ordersCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-emerald-500">{formatCurrency(customer.totalSpent)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <UsersIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} />
            <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>No customers yet</h3>
            <p className={textSecondary}>Connect your Shopify store to see data.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
