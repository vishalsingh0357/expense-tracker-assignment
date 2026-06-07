import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wallet, ArrowUpRight, ArrowDownRight, 
  Percent, Plus, Trash2, Edit2, Calendar, Filter, User, LogOut, ChevronDown, Lock, Mail, Eye, EyeOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Salary', 'Freelance', 'Other'];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

export default function App() {
  // Navigation State: 'login' | 'signup' | 'dashboard' | 'income' | 'expenses' | 'profile'
  const [currentView, setCurrentView] = useState('login');
  
  // Auth Form States
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Core Data States
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [transactionType, setTransactionType] = useState('expense'); // 'income' | 'expense'
  
  // Filtering & Modals
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/expenses');
      const data = await response.json();
      // Map data backward compatibility if backend 'type' is missing, fallback to 'expense'
      const sanitized = data.map(item => ({
        ...item,
        type: item.type || (['Salary', 'Freelance'].includes(item.category) ? 'income' : 'expense')
      }));
      setTransactions(sanitized);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    if (currentView !== 'login' && currentView !== 'signup') {
      fetchTransactions();
    }
  }, [currentView]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert('Please fill in all fields');
    if (currentView === 'signup' && !authName) return alert('Please enter your name');
    
    // Simulate dynamic authentication entry
    setCurrentView('dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return alert('Please enter a valid amount');

    const payload = { 
      amount: parseFloat(amount), 
      category, 
      date, 
      note,
      type: transactionType 
    };

    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/expenses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setEditingId(null);
      } else {
        await fetch('http://localhost:5000/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      
      setAmount('');
      setNote('');
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await fetch(`http://localhost:5000/api/expenses/${id}`, { method: 'DELETE' });
        fetchTransactions();
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
  };

  const startEdit = (tx) => {
    setEditingId(tx.id);
    setAmount(tx.amount);
    setCategory(tx.category);
    setDate(tx.date);
    setNote(tx.note);
    setTransactionType(tx.type || 'expense');
    setShowModal(true);
  };

  // Calculations & Analytics Definitions
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  const filteredTransactions = transactions.filter(tx => {
    const matchesCategory = filterCategory === 'All' || tx.category === filterCategory;
    let matchesDate = true;
    const txMonth = tx.date.substring(0, 7);
    
    if (filterDateRange === 'this-month') {
      matchesDate = txMonth === currentMonthStr;
    } else if (filterDateRange === 'last-month') {
      const prev = new Date();
      prev.setMonth(prev.getMonth() - 1);
      const lastMonthStr = prev.toISOString().substring(0, 7);
      matchesDate = txMonth === lastMonthStr;
    }
    
    return matchesCategory && matchesDate;
  });

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const totalSpentThisMonth = transactions
    .filter(tx => tx.type === 'expense' && tx.date.substring(0, 7) === currentMonthStr)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const highestSingleExpense = transactions.length > 0 
    ? Math.max(...transactions.filter(t => t.type === 'expense').map(e => e.amount), 0) 
    : 0;

  const chartData = CATEGORIES.map(cat => {
    const total = filteredTransactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, amount: total };
  }).filter(item => item.amount > 0);

  // --- RENDERING ROUTER CONDITIONAL VIEWS ---

  if (currentView === 'login' || currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="bg-white/10 backdrop-blur-md border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl"></div>
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/20 mb-3">
              E
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {currentView === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Studio Graphene Assignment Dashboard</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {currentView === 'signup' && (
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" required className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-white transition-all"
                    placeholder="Vishal Singh" value={authName} onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="email" required className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-white transition-all"
                  placeholder="name@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} required 
                  className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-11 pr-10 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-white transition-all"
                  placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/10 pt-3">
              {currentView === 'login' ? 'Sign In' : 'Get Started'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => setCurrentView(currentView === 'login' ? 'signup' : 'login')}
              className="text-xs font-semibold text-cyan-400 hover:underline transition-all"
            >
              {currentView === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold shadow-sm">
              VS
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm leading-tight">{authName || 'Vishal Singh'}</h4>
              <p className="text-xs text-slate-400">{authEmail || 'vishal@example.com'}</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => setCurrentView('dashboard')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm transition-all font-semibold ${currentView === 'dashboard' ? 'bg-cyan-50 text-cyan-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button onClick={() => setCurrentView('income')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm transition-all font-semibold ${currentView === 'income' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Income Manager
            </button>
            <button onClick={() => setCurrentView('expenses')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm transition-all font-semibold ${currentView === 'expenses' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              <ArrowDownRight className="w-4 h-4 text-rose-500" /> Expense Records
            </button>
            <button onClick={() => setCurrentView('profile')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm transition-all font-semibold ${currentView === 'profile' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              <User className="w-4 h-4" /> User Profile
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button onClick={() => setCurrentView('login')} className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-400 hover:text-rose-600 rounded-xl text-sm transition-colors font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* CORE FRAMEWORK WORKSPACE */}
      <main className="flex-1 min-w-0 flex flex-col">
        
        {/* RUNNING APP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black">E</div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">ExpenseTracker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md hidden sm:inline-block">Studio Graphene Assignment</span>
            <div className="flex items-center gap-2 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-700">
              <div className="w-6 h-6 rounded-md bg-cyan-600 text-white font-bold flex items-center justify-center">V</div>
              <span>{authName.split(' ')[0] || 'Vishal'}</span>
            </div>
          </div>
        </header>

        {/* CONDITIONALLY CHOSEN VIEWPORTS CONTENT */}
        <div className="p-8 max-w-6xl w-full mx-auto space-y-8 flex-1 overflow-y-auto">
          
          {/* PROFILE VIEW */}
          {currentView === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">My Information Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">User Identification Name</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60">{authName || 'Vishal Singh'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Registered Mailing Route</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60">{authEmail || 'vishal@example.com'}</p>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD VIEW OR INCOME/EXPENSE SPECIFIC FILTERS MANAGER */}
          {currentView !== 'profile' && (
            <>
              {/* HEADER HERO BOARD */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-cyan-500/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 capitalize tracking-tight">{currentView} Dashboard</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Comprehensive entry points for full-stack data records.</p>
                </div>
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => { setTransactionType('income'); setCategory('Salary'); setEditingId(null); setAmount(''); setNote(''); setShowModal(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Income
                  </button>
                  <button 
                    onClick={() => { setTransactionType('expense'); setCategory('Food'); setEditingId(null); setAmount(''); setNote(''); setShowModal(true); }}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Expense
                  </button>
                </div>
              </div>

              {/* CARD KPI SYSTEM METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Net Total Balance</p>
                    <h3 className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>₹{netBalance.toLocaleString('en-IN')}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Income minus Payouts</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center"><Wallet className="w-5 h-5" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Spent This Month</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalSpentThisMonth.toLocaleString('en-IN')}</h3>
                    <p className="text-[11px] text-rose-600 font-medium mt-1">Monthly Billing Cycle</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><ArrowUpRight className="w-5 h-5" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Total Incomes</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalIncome.toLocaleString('en-IN')}</h3>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">Cumulative profits loaded</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ArrowDownRight className="w-5 h-5" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Peak Single Expense</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{highestSingleExpense.toLocaleString('en-IN')}</h3>
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">Highest logged check</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Percent className="w-5 h-5" /></div>
                </div>
              </div>

              {/* CORE METRIC VISUAL INTERFACING GRIDS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* RECHARTS BOX PLOT */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Categorical Ratios</h3>
                    <p className="text-xs text-slate-400 mb-6">Visual layout analytics summary</p>
                  </div>
                  {chartData.length > 0 ? (
                    <div className="h-56 w-full flex items-end">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(v) => [`₹${v}`, 'Sum']} contentStyle={{ borderRadius: '12px' }} />
                          <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={24}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[CATEGORIES.indexOf(entry.name) % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 text-xs font-semibold flex-1 flex items-center justify-center">No structural logs found.</div>
                  )}
                </div>

                {/* RELATIONAL DATA LEDGER TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Ledger Audit Trail</h3>
                      <p className="text-xs text-slate-400">Filtering transaction configurations dynamically.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer">
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={filterDateRange} onChange={(e) => setFilterDateRange(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer">
                        <option value="All">All Time</option>
                        <option value="this-month">This Month</option>
                        <option value="last-month">Last Month</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto flex-1">
                    {filteredTransactions.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-3.5">Date</th>
                            <th className="px-6 py-3.5">Category</th>
                            <th className="px-6 py-3.5">Note</th>
                            <th className="px-6 py-3.5 text-right">Amount</th>
                            <th className="px-6 py-3.5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                          {filteredTransactions
                            .filter(tx => currentView === 'dashboard' ? true : currentView === 'income' ? tx.type === 'income' : tx.type === 'expense')
                            .map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-500 whitespace-nowrap">{tx.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS[CATEGORIES.indexOf(tx.category)]}12`, color: COLORS[CATEGORIES.indexOf(tx.category)] }}>
                                    {tx.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 max-w-[140px] truncate text-slate-400">{tx.note || '—'}</td>
                                <td className={`px-6 py-4 text-right font-bold text-sm whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                  {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <div className="flex justify-center gap-2">
                                    <button onClick={() => startEdit(tx)} className="p-1 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDelete(tx.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-20 text-slate-400 text-sm font-semibold">No recent transactions matches structural metrics filters.</div>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      </main>

      {/* POPUP TRANSACTION ENTRY FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 capitalize">Log {transactionType} Entry</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 text-xs">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount (₹)</label>
                <input type="number" required min="1" step="any" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category Domain</label>
                <select className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Timestamp</label>
                <input type="date" required className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Metadata Note (Optional)</label>
                <input type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add transaction descriptive logs..." />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 bg-cyan-600 text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-cyan-600/10">Confirm Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}