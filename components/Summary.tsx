'use client';

import { useState } from 'react';

export default function SummarizationInterface() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      setSummary(data.summary.trim());
    } catch (error) {
      console.error('Error:', error);
      setSummary('Error generating summary');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSummary('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Maandishi (Text to Summarize)</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Weka maandishi yako hapa..."
            className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSummarize}
              disabled={loading || !inputText.trim()}
              className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Inafupisha...' : 'Fupisha (Summarize)'}
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Muhtasari (Summary)</h2>
          <div className="w-full h-64 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="animate-pulse text-gray-500">Generating summary...</span>
              </div>
            ) : summary ? (
              <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
            ) : (
              <p className="text-gray-400 italic">Summary will appear here...</p>
            )}
          </div>
          {summary && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Characters: {inputText.length} → {summary.length}</p>
              <p>Reduction: {Math.round((1 - summary.length / inputText.length) * 100)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}