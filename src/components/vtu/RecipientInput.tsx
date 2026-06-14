'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Clock, TrendingUp } from 'lucide-react';
import { VtuRecipient, RecipientSearchSuggestion } from '@/types/api.types';
import { formatPhoneNumber } from '@/utils/format.utils';

interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (recipient: VtuRecipient | RecipientSearchSuggestion) => void;
  suggestions?: RecipientSearchSuggestion[];
  recentlyUsed?: VtuRecipient[];
  onSearch: (value: string) => void;
  isSearching?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  credentialType?: 'phone' | 'meter' | 'card';
}

export const RecipientInput: React.FC<RecipientInputProps> = ({
  value,
  onChange,
  onSelect,
  suggestions = [],
  recentlyUsed = [],
  onSearch,
  isSearching = false,
  placeholder = 'Enter phone number or select saved recipient',
  label = 'Recipient',
  error,
  disabled = false,
  credentialType = 'phone',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger search when value changes
  useEffect(() => {
    if (value.length >= 2) {
      onSearch(value);
      setShowDropdown(true);
    } else if (value.length === 0) {
      setShowDropdown(false);
    }
  }, [value, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleSelectRecipient = (recipient: VtuRecipient | RecipientSearchSuggestion) => {
    onSelect(recipient);
    onChange(recipient.credential);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value.length === 0 && recentlyUsed.length > 0) {
      setShowDropdown(true);
    }
  };

  const displaySuggestions = value.length >= 2 ? suggestions : [];
  const displayRecent = value.length === 0 ? recentlyUsed.slice(0, 3) : [];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Input Container */}
        <div
          className={`relative flex items-center transition-all duration-200 ${
            isFocused || showDropdown
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-gray-50'
          } ${error ? 'ring-2 ring-red-500' : ''} ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          } border rounded-lg overflow-hidden`}
        >
          <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 pl-10 pr-10 py-3 bg-transparent outline-none text-gray-900 placeholder-gray-500"
          />

          {value && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1 hover:bg-gray-200 rounded transition"
              type="button"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}

          {isSearching && (
            <div className="absolute right-3 animate-spin">
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {/* Dropdown Menu */}
        {showDropdown && (isFocused || displaySuggestions.length > 0 || displayRecent.length > 0) && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Recently Used Section */}
            {displayRecent.length > 0 && (
              <div className="border-b">
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </div>
                <div className="divide-y">
                  {displayRecent.map((recipient) => (
                    <button
                      key={recipient.id}
                      onClick={() => handleSelectRecipient(recipient)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center justify-between group"
                      type="button"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {recipient.credential}
                        </p>
                        {recipient.recipient_name && (
                          <p className="text-sm text-gray-500 truncate">
                            {recipient.recipient_name}
                          </p>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition transform -rotate-90" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Section */}
            {displaySuggestions.length > 0 && (
              <div className="border-b">
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Suggestions
                </div>
                <div className="divide-y">
                  {displaySuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectRecipient(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center justify-between group"
                      type="button"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {suggestion.credential}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {suggestion.recipient_name && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {suggestion.recipient_name}
                            </span>
                          )}
                          {suggestion.usage_count > 1 && (
                            <span className="text-xs text-gray-500">
                              Used {suggestion.usage_count}x
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition transform -rotate-90 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {displaySuggestions.length === 0 && displayRecent.length === 0 && value.length >= 2 && (
              <div className="px-4 py-6 text-center text-gray-500">
                <p>No recipients found for &quot;{value}&quot;</p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="px-4 py-6 text-center">
                <div className="inline-flex items-center gap-2 text-gray-600">
                  <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Searching...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {!error && credentialType === 'phone' && (
        <p className="mt-1 text-xs text-gray-500">
          Enter a phone number or select from your saved recipients
        </p>
      )}
    </div>
  );
};
