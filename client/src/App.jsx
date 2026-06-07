import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownRight, 
  User, 
  LogOut, 
  Plus, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  CircleDollarSign,
  PieChart,
  Trash2,
  Calendar,
  FileText,
  Lock,
  Mail,
  Wallet,
  Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = 'http://localhost:5000/api/expenses';

const categoryIcons = {
  'Food': '🍔',
  'Rent': '🏠',
  'Utilities': '⚡',
  'Entertainment': '🎬',
  'Salary': '💼',
  'Freelance': '🚀',
  'Others': '✨'
};

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('tracker_user') || '');
  const [authMode, setAuthMode] = useState('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');

  const [expenses, setExpenses] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formType, setFormType] = useState('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNote, setFormNote] = useState('');

  const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Salary', 'Freelance', 'Others'];

  const loadTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}?username=${encodeURIComponent(user)}`);
      if (!res.ok) throw new Error('Backend offline');
      const data = await res.json();
      setExpenses(data);
      setIsDemoMode(false);
    } catch (err) {
      setIsDemoMode(true);
      const localData = localStorage.getItem(`local_expenses_${user}`);
      setExpenses(localData ? JSON.parse(localData) : []);
    }
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const activeName = authMode === 'signup' ? nameInput.trim() : emailInput.split('@')[0];
    if (activeName) {
      localStorage.setItem('tracker_user', activeName);
      setUser(activeName);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tracker_user');
    setUser('');
    setExpenses([]);
    setEmailInput('');
    setPasswordInput('');
    setNameInput('');
    setCurrentView('dashboard');
  };

  const commitTransaction = async (e) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) return;

    const newTransaction = {
      amount: parseFloat(formAmount),
      category: formCategory,
      date: formDate,
      note: formNote.trim() || 'N/A',
      type: formType,
      username: user
    };

    if (!isDemoMode) {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTransaction)
        });
        if (res.ok) {
          loadTransactions();
          setShowAddModal(false);
          resetForm();
          return;
        }
      } catch (err) {}
    }

    const localItem = { ...newTransaction, id: Date.now() };
    const updated = [localItem, ...expenses];
    setExpenses(updated);
    localStorage.setItem(`local_expenses_${user}`, JSON.stringify(updated));
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormAmount('');
    setFormNote('');
    setFormType('expense');
    setFormCategory('Food');
  };

  const handleDelete = async (id) => {
    if (!isDemoMode) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) {
          loadTransactions();
          return;
        }
      } catch (err) {}
    }
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    localStorage.setItem(`local_expenses_${user}`, JSON.stringify(updated));
  };

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, c) => sum + c.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((sum, c) => sum + c.amount, 0);
  const totalBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  const chartData = categories.map(cat => {
    const amount = expenses
      .filter(e => e.category === cat && e.type === 'expense')
      .reduce((sum, c) => sum + c.amount, 0);
    return { name: cat, amount };
  }).filter(item => item.amount > 0);

  // Sky blue first palette color sequence
  const COLORS = ['#0EA5E9', '#FF6B6B', '#2ECC71', '#F1C40F', '#9B5DE5', '#FF007F', '#34495E'];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 antialiased">
        <div className="bg-[#1E293B] p-8 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md space-y-6">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-tr from-sky-400 to-blue-500 p-4 rounded-2xl text-white mb-3 shadow-lg shadow-sky-500/20">
              <CircleDollarSign className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Expense Tracker</h2>
            <p className="text-slate-400 text-xs mt-1">Premium Wealth & Asset Intelligence</p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#0F172A] p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => setAuthMode('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-[#0EA5E9] text-white shadow-md' : 'text-slate-400'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setAuthMode('signup')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'signup' ? 'bg-[#0EA5E9] text-white shadow-md' : 'text-slate-400'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-sm text-slate-200">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Full Name</label>
                <input type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Vishal Singh" className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#0EA5E9]" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Email Address</label>
              <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="vishal@fg.com" className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#0EA5E9]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Password</label>
              <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#0EA5E9]" />
            </div>
            <button type="submit" className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-500/20 mt-2">
              {authMode === 'login' ? 'Access Workspace' : 'Create Credentials'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 font-sans antialiased flex flex-col">
      
      {/* Top Premium Navbar */}
      <header className="bg-white border-b border-slate-200/60 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-sky-400 to-blue-500 p-2 rounded-xl text-white shadow-sm">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <span className="font-black text-lg text-slate-900 tracking-tight">Finstack Premium</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-800 tracking-tight capitalize">👑 {user}</p>
            <p className="text-[10px] text-slate-400 font-medium">authur@gmail.com</p>
          </div>
          <div className="bg-sky-50 text-[#0EA5E9] h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border border-sky-100 shadow-xs uppercase">
            {user.charAt(0)}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Luxury High-Contrast Dark Sidebar */}
        <aside className="w-full md:w-64 bg-[#0F172A] p-4 flex flex-col justify-between border-r border-slate-800">
          <div className="space-y-1">
            <div className="px-3 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Core Console</div>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${currentView === 'dashboard' ? 'bg-[#0EA5E9] text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard Matrix
            </button>
            <button 
              onClick={() => setCurrentView('income')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${currentView === 'income' ? 'bg-slate-800 text-[#0EA5E9]' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <ArrowUpRight className="h-4 w-4 text-emerald-400" /> Income Ledger
            </button>
            <button 
              onClick={() => setCurrentView('expenses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${currentView === 'expenses' ? 'bg-slate-800 text-[#0EA5E9]' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <ArrowDownRight className="h-4 w-4 text-red-400" /> Expense Registry
            </button>
            <button 
              onClick={() => setCurrentView('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${currentView === 'profile' ? 'bg-slate-800 text-[#0EA5E9]' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <Settings className="h-4 w-4" /> System Profiles
            </button>
          </div>
          
          <div className="pt-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-400 rounded-xl text-xs font-bold transition-all">
              <LogOut className="h-4 w-4" /> Terminate Session
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/60 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">{currentView} Panel</h2>
              <p className="text-xs text-slate-400 font-medium">Enterprise financial metrics monitoring asset layers.</p>
            </div>
          </div>

          {currentView === 'dashboard' && (
            <>
              {/* Luxury Gradient Elevated KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between group hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-400 to-blue-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Balance</p>
                    <h3 className={`text-2xl font-black mt-1 tracking-tight ${totalBalance >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                      ₹{totalBalance.toLocaleString('en-IN')}
                    </h3>
                    <span className="text-[9px] font-extrabold text-[#0EA5E9] bg-sky-50 px-2 py-0.5 rounded-md mt-1.5 inline-block">Liquid Capital</span>
                  </div>
                  <div className="bg-sky-50 text-[#0EA5E9] p-3 rounded-xl border border-sky-100 font-black text-sm">₹</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between group hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-400 to-teal-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Income</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1 tracking-tight">₹{totalIncome.toLocaleString('en-IN')}</h3>
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 inline-block">📈 +12.5% Inflow</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl text-emerald-500"><ArrowUpRight className="h-5 w-5" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between group hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-400 to-rose-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Expenses</p>
                    <h3 className="text-2xl font-black text-rose-500 mt-1 tracking-tight">₹{totalExpense.toLocaleString('en-IN')}</h3>
                    <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md mt-1.5 inline-block">📉 -0.5% Outflow</span>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-xl text-rose-400"><ArrowDownRight className="h-5 w-5" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between group hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-400 to-indigo-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Savings Efficiency</p>
                    <h3 className="text-2xl font-black text-blue-600 mt-1 tracking-tight">{savingsRate}%</h3>
                    <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1.5 inline-block">Net Efficiency</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-500"><TrendingUp className="h-5 w-5" /></div>
                </div>
              </div>

              {/* Grid Subgrids */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Visual Analytics Segment */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      📊 Expense Distribution Vectors
                    </h4>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Log Entry
                    </button>
                  </div>

                  <div className="pt-2">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }} />
                          <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={40}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-xs py-20">
                        <span className="text-3xl mb-2">📊</span>
                        No spend logs recorded on this session profile node.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Analytics Summary Feed */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 min-h-[355px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-black text-slate-800">
                        📋 Transaction Feed Logs
                      </h4>
                      <button onClick={loadTransactions} className="text-slate-400 hover:text-slate-600"><RefreshCw className="h-3.5 w-3.5" /></button>
                    </div>

                    <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
                      {expenses.length > 0 ? (
                        expenses.slice(0, 4).map((exp) => (
                          <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/60 hover:bg-slate-100/50 transition-all">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="text-lg p-1.5 bg-white rounded-xl shadow-xs border border-slate-100">
                                {categoryIcons[exp.category] || '✨'}
                              </span>
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-800 truncate">{exp.note}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{exp.category} • {exp.date}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-black ${exp.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {exp.type === 'income' ? '+' : '-'}₹{exp.amount}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-slate-400 py-16">
                          No logging rows instantiated.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-[#F8FAFC] p-2 rounded-xl border border-slate-200/60">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gross Income</p>
                      <p className="font-black text-emerald-600 mt-0.5">₹{totalIncome}</p>
                    </div>
                    <div className="bg-[#F8FAFC] p-2 rounded-xl border border-slate-200/60">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gross Burn</p>
                      <p className="font-black text-rose-500 mt-0.5">₹{totalExpense}</p>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Table Render Scopes */}
          {(currentView === 'income' || currentView === 'expenses') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
                <h4 className="text-sm font-black text-slate-800 capitalize">Historical Stream Audit Registry ({currentView})</h4>
                <button 
                  onClick={() => { setFormType(currentView === 'income' ? 'income' : 'expense'); setShowAddModal(true); }}
                  className="bg-[#0EA5E9] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
                >
                  + Add Row Element
                </button>
              </div>

              <div className="overflow-x-auto">
                {expenses.filter(e => e.type === (currentView === 'income' ? 'income' : 'expense')).length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="px-6 py-3.5">Timestamp</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Annotations</th>
                        <th className="px-6 py-3.5">Payload Value</th>
                        <th className="px-6 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {expenses
                        .filter(e => e.type === (currentView === 'income' ? 'income' : 'expense'))
                        .map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500">{exp.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 bg-[#F1F5F9] text-slate-800 px-2 py-0.5 rounded-md font-bold uppercase text-[9px] border border-slate-200/50">
                                {categoryIcons[exp.category] || '✨'} {exp.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate text-slate-500">{exp.note}</td>
                            <td className={`px-6 py-4 font-black text-sm ${exp.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                              ₹{exp.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-20 text-slate-400 text-xs">
                    No matching ledger transactions found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profiles Configurations Settings Layout */}
          {currentView === 'profile' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-md space-y-4">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">⚙️ System Console Profiles</h4>
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-400 font-bold">Session Identity Node:</span> <span className="font-black text-slate-800 uppercase tracking-tight">{user}</span></div>
                <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-400 font-bold">Core Drivers Schema:</span> <span className="text-slate-600 font-bold">SQLite3 Native Data File</span></div>
                <div className="flex justify-between py-2"><span className="text-slate-400 font-bold">Network State Pipeline:</span> <span className="text-emerald-600 font-black">Active Synced Node</span></div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* PopUp Modular Submission Box Frame */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-sm font-black text-slate-800">Log Financial Event Matrix</h4>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={commitTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button type="button" onClick={() => { setFormType('expense'); setFormCategory('Food'); }} className={`py-1.5 rounded-lg font-bold transition-all ${formType === 'expense' ? 'bg-white text-rose-500 shadow-xs' : 'text-slate-400'}`}>Debit Outflow</button>
                <button type="button" onClick={() => { setFormType('income'); setFormCategory('Salary'); }} className={`py-1.5 rounded-lg font-bold transition-all ${formType === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400'}`}>Credit Inflow</button>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Value Amount (INR)</label>
                <input type="number" step="0.01" required value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none focus:border-[#0EA5E9]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Category Domain</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none focus:border-[#0EA5E9] font-medium text-slate-700">
                    {formType === 'income' 
                      ? ['Salary', 'Freelance', 'Others'].map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)
                      : ['Food', 'Rent', 'Utilities', 'Entertainment', 'Others'].map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Timestamp</label>
                  <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none focus:border-[#0EA5E9]" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Annotations / Notes</label>
                <input type="text" value={formNote} onChange={(e) => setFormNote(e.target.value)} placeholder="Payload metadata annotations..." className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#0EA5E9]" />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="w-1/2 border border-slate-200 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-50">Cancel</button>
                <button type="submit" className={`w-1/2 text-white font-bold py-2 rounded-xl shadow-md bg-[#0EA5E9] hover:bg-[#0284C7]`}>Commit Node</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}