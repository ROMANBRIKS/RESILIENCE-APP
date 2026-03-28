import React, { useState } from 'react';
import { compareProducts } from '../services/gemini';
import { Product } from '../types';
import { Search, ShoppingCart, ExternalLink, Tag, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Comparison() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError('');
    try {
      const results = await compareProducts(query);
      setProducts(results);
    } catch (err) {
      setError('Failed to fetch product data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Price Comparison</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Find the best deals • Instant savings</p>
      </header>

      <form onSubmit={handleSearch} className="relative max-w-3xl">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What product are you looking for?"
          className="w-full pl-20 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2.5rem] focus:border-slate-900 outline-none transition-all shadow-xl shadow-slate-200/50 text-xl font-medium"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-4 bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-[1.5rem] hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Compare'}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-12">
        <AnimatePresence>
          {products.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Affiliate Row */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider text-sm">Recommended Deals</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.filter(p => p.isAffiliate).map(product => (
                    <div key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Other Row */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Search className="w-5 h-5 text-slate-400" />
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider text-sm">Other Options</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.filter(p => !p.isAffiliate).map(product => (
                    <div key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && products.length === 0 && !error && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-6">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Search for a product</h3>
            <p className="text-slate-500 mt-2">We'll find the best prices and savings for you.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
    >
      <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        {product.isAffiliate && (
          <div className="absolute top-6 left-6 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
            TOP PICK
          </div>
        )}
      </div>
      <div className="p-8">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-tight line-clamp-2">{product.name}</h4>
          <span className="text-2xl font-black text-slate-900">${product.price}</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">{product.store}</p>
        
        {product.savingsDescription && (
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl mb-6">
            <p className="text-xs font-bold text-emerald-700 leading-relaxed italic">
              "{product.savingsDescription}"
            </p>
          </div>
        )}

        <button className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
          Get Deal <ExternalLink className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
