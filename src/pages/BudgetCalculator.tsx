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
        contents: [{ role: "user", parts: [{ text: prompt }] }],
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
    <div className="space-y-8 md:space-y-12 pb-12 md:pb-20">
      <header className="px-2 md:px-0">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Budget Calculator</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-2">AI-Powered Cost of Living Analysis</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Input Section */}
        <section className="space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-6 md:mb-8 flex items-center gap-3">
              <Calculator className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" /> Monthly Income
            </h3>
            <div className="relative">
              <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-black text-slate-300">$</span>
              <input
                type="number"
                value={budget.income || ''}
                onChange={e => setBudget({ ...budget, income: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-4 md:py-6 bg-slate-50 rounded-xl md:rounded-2xl text-2xl md:text-3xl font-black text-slate-900 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-rose-500" /> Expenses
              </h3>
              <button
                onClick={handleAddExpense}
                className="p-2 md:p-3 bg-slate-900 text-white rounded-lg md:rounded-xl hover:bg-slate-800 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              {budget.expenses.map((expense, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className="flex gap-2 md:gap-4 items-center"
                >
                  <select
                    value={expense.category}
                    onChange={e => handleExpenseChange(index, 'category', e.target.value)}
                    className="flex-1 px-3 md:px-4 py-3 md:py-4 bg-slate-50 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="relative w-24 md:w-32">
                    <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs md:text-base">$</span>
                    <input
                      type="number"
                      value={expense.amount || ''}
                      onChange={e => handleExpenseChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full pl-6 md:pl-7 pr-2 md:pr-4 py-3 md:py-4 bg-slate-50 rounded-lg md:rounded-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 text-xs md:text-base"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveExpense(index)}
                    className="p-2 md:p-4 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Total Expenses</span>
              <span className="text-2xl md:text-3xl font-black text-slate-900">${totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={analyzeBudget}
            disabled={isAnalyzing || budget.income === 0}
            className="w-full py-5 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase italic tracking-tighter text-lg md:text-xl flex items-center justify-center gap-3 md:gap-4 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-slate-900/20"
          >
            {isAnalyzing ? (
              <>Analyzing Budget...</>
            ) : (
              <>
                Analyze with AI <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              </>
            )}
          </button>
        </section>

        {/* Analysis Section */}
        <section className="space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm min-h-[300px] md:min-h-[400px] relative overflow-hidden">
            {!analysis && !isAnalyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-4 md:mb-6">
                  <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
                </div>
                <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">No Analysis Yet</h4>
                <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Fill in your income and expenses to see AI insights.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white/80 backdrop-blur-sm z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4 md:mb-6" />
                <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">Consulting AI Expert</h4>
                <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Gathering regional data...</p>
              </div>
            )}

            {analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-slate max-w-none"
              >
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-400 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-black" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900">AI Breakdown</h3>
                </div>
                <div className="markdown-body text-slate-600 leading-relaxed font-medium text-sm md:text-base">
                  <Markdown>{analysis}</Markdown>
                </div>
              </motion.div>
            )}
          </div>

          {analysis && (
            <div className="bg-emerald-400 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] text-black shadow-xl shadow-emerald-400/20 group cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-2">Need more help?</h4>
                  <p className="text-xs md:text-sm font-bold opacity-80 max-w-[200px] md:max-w-[250px] leading-tight mb-4 md:mb-6">
                    Connect with a financial counselor to discuss your specific situation.
                  </p>
                  <button className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase italic tracking-tighter">
                    View Counseling Options <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <TrendingUp className="w-12 h-12 md:w-16 md:h-16 text-black/10 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
