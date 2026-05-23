'use client';

import { EmailCampaignTemplate } from '@/types/promotional-email.types';
import TemplateFieldInput from '../fields/TemplateFieldInput';

interface ContentEditorProps {
  template: EmailCampaignTemplate;
  templateData: Record<string, any>;
  onUpdateField: (field: string, value: any) => void;
}

export default function ContentEditor({
  template,
  templateData,
  onUpdateField,
}: ContentEditorProps) {
  const getFieldType = (fieldName: string): string => {
    if (fieldName.includes('url')) return 'url';
    if (fieldName.includes('date')) return 'date';
    if (fieldName.includes('email')) return 'email';
    if (fieldName.includes('description') || fieldName.includes('body') || fieldName.includes('details'))
      return 'textarea';
    if (fieldName.includes('amount') || fieldName.includes('count')) return 'number';
    if (fieldName.includes('benefits') || fieldName.includes('conditions') || fieldName.includes('features'))
      return 'array';
    return 'text';
  };

  const formatLabel = (field: string): string => {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Customize Content</h2>
        <p className="mt-1 text-sm text-gray-500">Fill in the required fields to personalize your campaign.</p>
      </div>

      <div className="space-y-6">
        {/* Required Fields */}
        {template.required_fields.length > 0 && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Required Fields *</h3>
              <p className="text-xs text-gray-500 mt-1">These fields must be completed</p>
            </div>
            <div className="space-y-4">
              {template.required_fields.map((field) => (
                <TemplateFieldInput
                  key={field}
                  fieldName={field}
                  fieldType={getFieldType(field)}
                  label={formatLabel(field)}
                  description={template.field_descriptions[field]}
                  value={templateData[field]}
                  onChange={(value) => onUpdateField(field, value)}
                  required
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional Fields */}
        {template.optional_fields.length > 0 && (
          <div>
            <div className="mb-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Optional Fields</h3>
              <p className="text-xs text-gray-500 mt-1">Add these to enhance your campaign</p>
            </div>
            <div className="space-y-4">
              {template.optional_fields.map((field) => (
                <TemplateFieldInput
                  key={field}
                  fieldName={field}
                  fieldType={getFieldType(field)}
                  label={formatLabel(field)}
                  description={template.field_descriptions[field]}
                  value={templateData[field]}
                  onChange={(value) => onUpdateField(field, value)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    