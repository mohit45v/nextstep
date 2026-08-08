'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  Copy, 
  Check
} from 'lucide-react';
import { FORMULA_CARDS, FormulaCard } from '@/app/data/aptitudeData';

export const FormulaCheatsheet: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (card: FormulaCard) => {
    navigator.clipboard.writeText(`${card.title}: ${card.formula}`);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCards = FORMULA_CARDS.filter(card => {
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    const matchesSearch = 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.formula.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-950/40 text-amber-300 border border-amber-800/40 px-3 py-1 rounded-full text-xs font-bold mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Placement Revision Cheatsheet</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Formulas & Shortcut Vault</h1>
          <p className="text-xs text-slate-400">Quick-reference formulas, mental math tricks, and logical rules for last-minute preparation</p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search formulas or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#262F40] bg-[#131927] text-slate-200 text-xs font-medium focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1 bg-[#131927] p-1 rounded-xl border border-[#262F40] w-fit">
        {['All', 'Quantitative', 'Logical Reasoning', 'Verbal Ability'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-[#6C5CE7] text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:bg-[#1C2333] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCards.map((card) => (
          <div key={card.id} className="soft-card p-6 space-y-4 soft-card-hover flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#A29BFE] bg-[#6C5CE7]/20 px-2 py-0.5 rounded border border-[#6C5CE7]/30">
                  {card.category} • {card.topic}
                </span>

                <button
                  onClick={() => handleCopy(card)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#A29BFE] hover:bg-[#1C2333] transition-colors"
                  title="Copy Formula"
                >
                  {copiedId === card.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <h3 className="text-base font-bold text-white">{card.title}</h3>

              {/* Main Formula Highlight Box */}
              <div className="p-4 rounded-xl purple-dark-gradient border border-[#3B336B] text-[#A29BFE] font-mono text-xs font-bold space-y-1">
                <span className="text-[10px] text-purple-300 uppercase tracking-widest block font-sans">Formula</span>
                <p className="text-sm text-white">{card.formula}</p>
              </div>

              {/* Key Rule */}
              <div className="space-y-1 text-xs">
                <strong className="text-white font-bold">Key Rule / Shortcut Tip:</strong>
                <p className="text-slate-400 leading-relaxed">{card.keyRule}</p>
              </div>
            </div>

            {/* Example Box */}
            <div className="p-3 bg-[#1C2333] rounded-xl border border-[#262F40] text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white text-[11px] block">Worked Example:</span>
              <p className="font-mono text-[11px] text-slate-300">{card.example}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
