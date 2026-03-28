import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, TrendingDown, TrendingUp, AlertCircle, Plus, Trash2, Sparkles, ChevronRight } from 'lucide-react';
import { storage } from '../services/storage';
import { Budget } from '../types';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

const CATEGORIES = [
  'Rent/Mortgage',
  'Groceries',
  'Utilities',
  'Transportation',
  'Healthcare',
  'Insurance',
  'Debt Payments',
  'Entertainment',
  'Other'
];

export default function BudgetCalculator() {
  const [budget, setBudget] = useState<Budget>({
    income: 0,
    expenses: [{ category: 'Rent/Mortgage', amount: 0 }],
    region: 'US'
  });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const saved = storage.getBudget();
    if (saved) setBudget(saved);
  }, []);

  const handleAddExpense = () => {
    setBudget({
      ...budget,
      expenses: [...budget.expenses, { category: 'Other', amount: 0 }]
    });
  };

  const handleRemoveExpense = (index: number) => {
    const newExpenses = budget.expenses.filter((_, i) => i !== index);
    setBudget({ ...budget, expenses: newExpenses });
  };

  const handleExpenseChange = (index: number, field: 'category' | 'amount', value: string | number) => {
    const newExpenses = [...budget.expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setBudget({ ...budget, expenses: newExpenses });
  };

  const totalExpenses = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = budget.income - totalExpenses;

  const analyzeBudget = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        As a financial expert for people in hardship, analyze this monthly budget:
        Region: ${budget.region}
        Monthly Income: $${budget.income}
        Expenses:
        ${budget.expenses.map(e => `- ${e.category}: $${e.amount}`).join('\n')}
        
        Total Expenses: $${totalExpenses}
        Remaining Balance: $${balance}

        Please provide:
        1. A breakdown of how this compares to regional cost-of-living averages for ${budget.region}.
        2. Identify if the income covers essentials (Rent, Food, Utilities).
        3. Suggest 3 specific, empathetic adjustments or resources to help improve the situation.
        4. Use a supportive, non-judgmental tone.
        
        Format the response in Markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAnalysis(response.text);
      storage.saveBudget(budget);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h2 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">Budget Calculator</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1">AI-Powered Cost of Living Analysis</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Section */}
        <section className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-8 flex items-center gap-3">
              <Calculator className="w-6 h-6 text-emerald-500" /> Monthly Income
            </h3>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
              <input
                type="number"
                value={budget.income || ''}
                onChange={e => setBudget({ ...budget, income: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full pl-12 pr-6 py-6 bg-slate-50 rounded-2xl text-3xl font-black text-slate-900 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-rose-500" /> Expenses
              </h3>
              <button
                onClick={handleAddExpense}
                className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {budget.expenses.map((expense, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className="flex gap-4 items-center"
                >
                  <select
                    value={expense.category}
                    onChange={e => handleExpenseChange(index, 'category', e.target.value)}
                    className="flex-1 px-4 py-4 bg-slate-50 rounded-xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                    <input
                      type="number"
                      value={expense.amount || ''}
                      onChange={e => handleExpenseChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full pl-7 pr-4 py-4 bg-slate-50 rounded-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveExpense(index)}
                    className="p-4 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Monthly Expenses</span>
              <span className="text-3xl font-black text-slate-900">${totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={analyzeBudget}
            disabled={isAnalyzing || budget.income === 0}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase italic tracking-tighter text-xl flex items-center justify-center gap-4 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-slate-900/20"
          >
            {isAnalyzing ? (
              <>Analyzing Budget...</>
            ) : (
              <>
                Analyze with AI <Sparkles className="w-6 h-6 text-emerald-400" />
              </>
            )}
          </button>
        </section>

        {/* Analysis Section */}
        <section className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[400px] relative overflow-hidden">
            {!analysis && !isAnalyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-slate-200" />
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">No Analysis Yet</h4>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Fill in your income and expenses to see how you compare to regional averages.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-white/80 backdrop-blur-sm z-10">
                <div className="w-20 h-20 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-6" />
                <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">Consulting AI Expert</h4>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Gathering regional data...</p>
              </div>
            )}

            {analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-slate max-w-none"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">AI Breakdown</h3>
                </div>
                <div className="markdown-body text-slate-600 leading-relaxed font-medium">
                  <Markdown>{analysis}</Markdown>
                </div>
              </motion.div>
            )}
          </div>

          {analysis && (
            <div className="bg-emerald-400 p-10 rounded-[3rem] text-black shadow-xl shadow-emerald-400/20 group cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Need more help?</h4>
                  <p className="text-sm font-bold opacity-80 max-w-[250px] leading-tight mb-6">
                    Connect with a financial counselor to discuss your specific situation.
                  </p>
                  <button className="flex items-center gap-2 text-xs font-black uppercase italic tracking-tighter">
                    View Counseling Options <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <TrendingUp className="w-16 h-16 text-black/10 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
