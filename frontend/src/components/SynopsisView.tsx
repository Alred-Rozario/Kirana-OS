import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Users,
  FileSpreadsheet,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ShieldAlert
} from 'lucide-react';
import type { SynopsisData } from '../types';
import { api } from '../services/api';

export const SynopsisView: React.FC = () => {
  const [synopsis, setSynopsis] = useState<SynopsisData | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'survey' | 'comparison' | 'novelty' | 'timeline'>('overview');

  useEffect(() => {
    loadSynopsis();
  }, []);

  const loadSynopsis = async () => {
    try {
      const data = await api.getSynopsis();
      setSynopsis(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!synopsis) {
    return <div className="p-10 text-center text-slate-400">Loading PPT Synopsis content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* PPT Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 p-6 border border-sky-500/30 shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Presentation className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Synopsis Presentation Reference
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  {synopsis.project_title}
                </h2>
              </div>
            </div>

            <div className="text-right text-xs text-slate-300 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
              <p><strong>Class:</strong> {synopsis.class} | <strong>Guide:</strong> {synopsis.guide}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">{synopsis.date}</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            {synopsis.subtitle}
          </p>

          {/* Authors Credits */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">Submitted By:</span>
            {synopsis.submitted_by.map((author, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5"
              >
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>{author.name} ({author.roll})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs for Synopsis Sections */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: '1. Project Scope & Need', icon: Layers },
          { id: 'survey', label: '2. Pilot Survey Insights (12 Shops)', icon: FileSpreadsheet },
          { id: 'comparison', label: '3. Existing Solutions Matrix', icon: Zap },
          { id: 'novelty', label: '4. Proposed Novelty (5 Key Innovations)', icon: Award },
          { id: 'timeline', label: '5. Development Roadmap', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap flex items-center space-x-2 transition ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'glass-card text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: OVERVIEW & SCOPE */}
      {activeSection === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Problem Statement */}
            <div className="glass-card p-6 rounded-2xl space-y-3 border-l-4 border-l-rose-500">
              <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Core Problem Statement (PPT Slide 7)</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Small general, kirana, confectionery, sweet-shop and bakery retailers have no simple, integrated way to manage inventory, counter billing, expiry tracking, and customer credit together. Existing software is either billing-only or built for large corporate retail.
              </p>
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300">
                <strong>Key Risk:</strong> 75% restock only weekly, and perishable confectionery stock goes unsold without automated expiry warnings.
              </div>
            </div>

            {/* Target Need & Solution */}
            <div className="glass-card p-6 rounded-2xl space-y-3 border-l-4 border-l-emerald-500">
              <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Proposed System Need</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A practical, affordable and easy-to-use operating system combining inventory management, barcode billing, perishable expiry tracking, supplier records, and an udhaar customer credit ledger — designed for low-tech comfort.
              </p>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-300">
                <strong>Target Users:</strong> Kirana shop owners, confectionery counters, bakery staff, and credit customers.
              </div>
            </div>
          </div>

          {/* Scope Modules Grid */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">System Scope & Functional Modules (Q19 - Q26)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
              {synopsis.scope.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <p className="font-semibold text-slate-200 mt-1">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PILOT SURVEY FINDINGS */}
      {activeSection === 'survey' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/60 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-slate-100 text-base">
                  Pilot Survey Responses Analysis (PPT Slides 4 & 5)
                </h3>
                <p className="text-xs text-slate-400">
                  Data collected from {synopsis.pilot_survey.total_responses} pilot retailer Google Form responses ({synopsis.pilot_survey.questions_count} questions)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
                Aug 2026 Collection
              </span>
            </div>

            {/* Key Findings Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {synopsis.pilot_survey.key_findings.map((f, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-3xl font-black text-amber-400 tracking-tight">{f.stat}</span>
                  <p className="text-xs text-slate-300 font-medium">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: EXISTING SOLUTIONS MATRIX */}
      {activeSection === 'comparison' && (
        <div className="glass-card p-6 rounded-2xl space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Analysis of Existing Solutions vs Proposed KIRANA-OS (PPT Slide 6)
            </h3>
            <p className="text-xs text-slate-400">
              Evidenced by pilot survey responses & capability comparison gap analysis
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Capability / Feature</th>
                  <th className="py-3 px-4 text-center">Manual Practice (83.3%)</th>
                  <th className="py-3 px-4 text-center">Generic Billing Apps (16.7%)</th>
                  <th className="py-3 px-4 text-center text-sky-400 font-bold bg-sky-950/40">
                    Proposed KIRANA-OS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {synopsis.solution_matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-200">{row.capability}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-400">
                      {row.manual === 'No' ? '✗ Unsupported' : row.manual}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-amber-300">
                      {row.generic_apps}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-400 bg-sky-950/20">
                      ✓ {row.kirana_os}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: NOVELTY & INNOVATION */}
      {activeSection === 'novelty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
          {synopsis.novelty.map((item) => (
            <div key={item.id} className="glass-card glass-card-hover p-5 rounded-2xl space-y-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow">
                0{item.id}
              </div>
              <h4 className="font-extrabold text-base text-slate-100">{item.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 5: PROJECT TIMELINE ROADMAP */}
      {activeSection === 'timeline' && (
        <div className="glass-card p-6 rounded-2xl space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Project Timeline & Phase Roadmap (PPT Slide 10)</h3>
            <p className="text-xs text-slate-400">Execution plan from August 2026 to November 2026 final presentation</p>
          </div>

          <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
            {synopsis.timeline.map((phase, idx) => (
              <div key={idx} className="relative pl-10 flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs gap-2">
                <div className="absolute left-2.5 top-4 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-slate-900" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-400">{phase.month}</span>
                  <h4 className="font-bold text-slate-100 text-sm">{phase.phase}</h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700 text-right self-start sm:self-auto">
                  {phase.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
