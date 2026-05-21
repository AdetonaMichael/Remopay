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
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Email Content</h2>

      <div className="space-y-8">
        {/* Required Fields */}
        {template.required_fields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Fields *</h3>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Optional Fields</h3>
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
