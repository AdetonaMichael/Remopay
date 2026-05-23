'use client';

import { EmailCampaignTemplate } from '@/types/promotional-email.types';
import { AlertCircle, Mail, CheckCircle2 } from 'lucide-react';

interface TemplateSelectorProps {
  templates: EmailCampaignTemplate[];
  selectedTemplate: EmailCampaignTemplate | null;
  onSelectTemplate: (template: EmailCampaignTemplate) => void;
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const categories = Array.from(new Set(templates.map((t) => t.category)));

  if (templates.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Select Email Template</h2>
          <p className="mt-1 text-sm text-gray-500">Choose a template to start building your campaign.</p>
        </div>

        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-8">
          <div className="flex gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">No Templates Available</h3>
              <p className="text-sm text-yellow-800 mb-3">
                Email templates need to be created in the backend before you can create campaigns.
              </p>
              <div className="bg-yellow-100 rounded-lg p-3 text-xs text-yellow-900 mt-3">
                <p className="font-semibold mb-2">To create templates, contact your backend administrator or:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                  <li>Make a POST request to <code className="bg-white px-1 rounded text-xs font-mono">/admin/promotional-emails/templates</code></li>
                  <li>Include template name, description, required_fields, and other metadata</li>
                  <li>Once templates are created, refresh this page to see them</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Email Template</h2>
        <p className="mt-1 text-sm text-gray-500">Choose a template to start building your campaign.</p>
      </div>

      {categories.map((category) => {
        const categoryTemplates = templates.filter((t) => t.category === category);
        return (
          <div key={category}>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{category} Templates</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className={`text-left rounded-xl border p-6 transition-all ${
                      isSelected
                        ? 'border-[#620707] bg-[#fdf2f2] shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#620707]' : 'bg-gray-100'
                      }`}>
                        <Mail size={18} className={isSelected ? 'text-white' : 'text-gray-600'} />
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={20} className="text-[#620707] flex-shrink-0" />
                      )}
                    </div>
                    <h4 className={`font-semibold mb-2 ${isSelected ? 'text-[#620707]' : 'text-gray-900'}`}>
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded font-medium ${
                        isSelected 
                          ? 'bg-[#620707] text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {template.category}
                      </span>
                      <span className="text-gray-500">
                        Used {template.usage_count} times
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
