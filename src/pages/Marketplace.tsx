import { ShoppingBag, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Marketplace() {
  return (
    <div className="space-y-16 py-12">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-slate-900 text-emerald-400 mb-4 shadow-2xl shadow-emerald-400/20">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-6xl font-black uppercase italic tracking-tighter text-slate-900">Marketplace</h2>
        <div className="inline-block px-6 py-2 bg-emerald-400 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">
          Coming Soon
        </div>
        <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          A decentralized, escrow-based marketplace for community trading and skill exchange.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: ShieldCheck, title: 'Escrow Payments', desc: 'Funds are held securely until the buyer confirms delivery. No more scams.', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Clock, title: 'Fair Pricing AI', desc: 'Our AI evaluates item value and suggests optimal pricing based on market data.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: AlertCircle, title: 'Trust System', desc: 'Community-driven feedback and moderation ensures a safe environment.', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((feature, i) => (
          <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
            <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
              <feature.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">{feature.title}</h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="p-16 bg-slate-50 rounded-[4rem] text-center border-2 border-dashed border-slate-200 shadow-inner">
        <h4 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">Want to be a beta tester?</h4>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10">We'll notify you when the marketplace goes live in your region.</p>
        <button className="px-12 py-6 bg-slate-900 text-white font-black uppercase italic tracking-tighter text-sm rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20">
          Join the Waitlist
        </button>
      </div>
    </div>
  );
}
