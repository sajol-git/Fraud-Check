import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (phone: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().length > 5) {
      onSearch(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        )}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter customer phone number (e.g., 017...)"
        className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-400"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || input.length < 5}
        className="absolute inset-y-2 right-2 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium rounded-xl transition-colors shadow-sm"
      >
        Check
      </button>
    </form>
  );
};