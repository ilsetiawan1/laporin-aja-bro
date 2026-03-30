"use client";

import { useState } from "react";
import { generateSummaryAction, generateSuggestionAction } from "@/lib/actions/aiActions";

export default function AiPanel({ reportId }: { reportId: string }) {
  const [summary, setSummary] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-sm">✨</div>
        <h3 className="text-sm font-bold text-navy">AI Assistant</h3>
      </div>

      {/* Summary */}
      <div>
        <button
          onClick={async () => {
            setLoadingSummary(true);
            setSummary(await generateSummaryAction(reportId));
            setLoadingSummary(false);
          }}
          disabled={loadingSummary}
          className="w-full btn-outline-dark text-xs py-2 disabled:opacity-50"
        >
          {loadingSummary ? "Membuat ringkasan..." : "✦ Generate Ringkasan"}
        </button>
        {summary && (
          <p className="mt-2 text-xs text-navy/70 bg-slate-50 rounded-xl p-3 leading-relaxed">
            {summary}
          </p>
        )}
      </div>

      {/* Suggestion */}
      <div>
        <button
          onClick={async () => {
            setLoadingSuggestion(true);
            setSuggestion(await generateSuggestionAction(reportId));
            setLoadingSuggestion(false);
          }}
          disabled={loadingSuggestion}
          className="w-full btn-outline-dark text-xs py-2 disabled:opacity-50"
        >
          {loadingSuggestion ? "Menganalisis..." : "✦ Saran Tindakan Admin"}
        </button>
        {suggestion && (
          <p className="mt-2 text-xs text-navy/70 bg-blue/5 border border-blue/15 rounded-xl p-3 leading-relaxed">
            {suggestion}
          </p>
        )}
      </div>
    </div>
  );
}