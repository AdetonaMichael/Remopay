'use client';

import { useState } from 'react';

interface TemplateFieldInputProps {
  fieldName: string;
  fieldType: string;
  label: string;
  description?: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
}

export default function TemplateFieldInput({
  fieldName,
  fieldType,
  label,
  description,
  value,
  onChange,
  required = false,
}: TemplateFieldInputProps) {
  const [arrayItems, setArrayItems] = useState<string[]>(Array.isArray(value) ? value : []);

  const handleArrayChange = (index: number, itemValue: string) => {
    const updated = [...arrayItems];
    updated[index] = itemValue;
    setArrayItems(updated);
    onChange(updated.filter((item) => item.trim()));
  };

  const addArrayItem = () => {
    const updated = [...arrayItems, ''];
    setArrayItems(updated);
  };

  const removeArrayItem = (index: number) => {
    const updated = arrayItems.filter((_, i) => i !== index);
    setArrayItems(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {fieldType === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707] focus:border-transparent resize-none"
        />
      ) : fieldType === 'number' ? (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : '')}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707] focus:border-transparent"
        />
      ) : fieldType === 'date' ? (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707] focus:border-transparent"
        />
      ) : fieldType === 'array' ? (
        <div className="space-y-2">
          {arrayItems.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeArrayItem(index)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addArrayItem}
            className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
          >
            + Add Item
          </button>
        </div>
      ) : (
        <input
          type={fieldType}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707] focus:border-transparent"
        />
      )}

      {description && <p className="text-sm text-gray-600">💡 {description}</p>}
    </div>
  );
}
