'use client';

import { EmailCampaignTemplate } from '@/types/promotional-email.types';
import { AlertCircle } from 'lucide-react';

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Select Template</h2>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Templates Available</h3>
          <p className="text-yellow-800 mb-4">
            Email templates need to be created in the backend before you can create campaigns.
          </p>
          <div className="bg-yellow-100 rounded p-4 text-left text-sm text-yellow-900 mt-4">
            <p className="font-semibold mb-2">To create templates, contact your backend administrator or:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-800">
              <li>Make a POST request to <code className="bg-white px-2 py-1 rounded">/admin/promotional-emails/templates</code></li>
              <li>Include template name, description, required_fields, and other metadata</li>
              <li>Once templates are created, refresh this page to see them</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Select Template</h2>

      {categories.map((category) => {
        const categoryTemplates = templates.filter((t) => t.category === category);
        return (
          <div key={category} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 capitalize">
              {category} Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`p-6 rounded-lg border-2 transition text-left ${
                    selectedTemplate?.id === template.id
                      ? 'border-[#620707] bg-[#faf7f7]'
                      : 'border-gray-200 bg-white hover:border-[#620707] hover:shadow-lg'
                  }`}
                >
                  <div className="text-4xl mb-2">📧</div>
                  <h4 className="font-bold text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase px-2 py-1 bg-[#620707]/10 text-[#620707] rounded">
                      {template.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Used {template.usage_count} times
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
