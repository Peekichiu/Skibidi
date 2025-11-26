import React, { useState } from 'react';
import { Activity, AIAnalysisResult } from '../types';
import { analyzeSchedule } from '../services/geminiService';
import { BrainCircuit, Loader2, Sparkles, AlertOctagon } from 'lucide-react';

interface AIAdvisorProps {
  activities: Activity[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ activities }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeSchedule(activities);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            AI Schedule Advisor
          </h3>
          <button
            onClick={handleAnalyze}
            disabled={loading || activities.length === 0}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze Plan'}
          </button>
        </div>

        {!analysis && !loading && (
          <p className="text-indigo-200 text-sm">
            Get personalized tips and burnout risk assessment powered by Gemini AI based on your current schedule.
          </p>
        )}

        {analysis && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <h4 className="text-xs uppercase tracking-wider text-indigo-200 font-semibold mb-1">Assessment</h4>
              <p className="text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="flex gap-3">
               <div className={`flex-1 p-3 rounded-lg border border-white/10 ${
                 analysis.burnoutRisk === 'High' ? 'bg-red-500/20' : 
                 analysis.burnoutRisk === 'Medium' ? 'bg-orange-500/20' : 'bg-green-500/20'
               }`}>
                 <span className="text-xs text-white/70 block">Burnout Risk</span>
                 <span className="font-bold text-lg flex items-center gap-2">
                   {analysis.burnoutRisk}
                   {analysis.burnoutRisk === 'High' && <AlertOctagon className="w-4 h-4" />}
                 </span>
               </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-xs uppercase tracking-wider text-indigo-200 font-semibold mb-2">Strategic Tips</h4>
              <ul className="space-y-2">
                {analysis.tips.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="bg-indigo-500/50 rounded-full w-5 h-5 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
