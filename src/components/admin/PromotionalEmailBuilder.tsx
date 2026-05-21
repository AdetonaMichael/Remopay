'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import promotionalEmailService from '@/services/promotional-email.service';
import {
  EmailCampaignTemplate,
  TargetCriteria,
  CreateCampaignRequest,
} from '@/types/promotional-email.types';
import { useAlert } from '@/hooks/useAlert';
import TemplateSelector from './promotional-emails/steps/TemplateSelector';
import CampaignDetails from './promotional-emails/steps/CampaignDetails';
import ContentEditor from './promotional-emails/steps/ContentEditor';
import AudienceSelector from './promotional-emails/steps/AudienceSelector';
import PreviewAndSend from './promotional-emails/steps/PreviewAndSend';

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  template_id: number | null;
  campaign_name: string;
  campaign_description: string;
  template_data: Record<string, any>;
  target_criteria: TargetCriteria;
}

export default function PromotionalEmailBuilder() {
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetUserCount, setTargetUserCount] = useState(0);
  const [previewHtml, setPreviewHtml] = useState('');

  const [formData, setFormData] = useState<FormData>({
    template_id: null,
    campaign_name: '',
    campaign_description: '',
    template_data: {},
    target_criteria: {
      type: 'all_users',
    },
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await promotionalEmailService.getTemplates();
      setTemplates(response.templates);
    } catch (error) {
      showAlert('Failed to load templates', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailCampaignTemplate) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      template_id: template.id,
      template_data: {},
    }));
  };

  const handleUpdateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleUpdateTemplateData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        [field]: value,
      },
    }));
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!selectedTemplate) {
          showAlert('Please select a template', 'warning');
          return false;
        }
        return true;

      case 2:
        if (!formData.campaign_name.trim()) {
          showAlert('Campaign name is required', 'warning');
          return false;
        }
        return true;

      case 3:
        if (!selectedTemplate) return false;
        const requiredFields = selectedTemplate.required_fields;
        const missingFields = requiredFields.filter(
          (field) => !formData.template_data[field]
        );
        if (missingFields.length > 0) {
          showAlert(
            `Please fill all required fields: ${missingFields.join(', ')}`,
            'warning'
          );
          return false;
        }
        return true;

      case 4:
        if (!formData.target_criteria.type) {
          showAlert('Please select an audience', 'warning');
          return false;
        }
        return true;

      case 5:
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 3) {
      // Generate preview before moving to step 4
      await generatePreview();
    }

    if (currentStep === 4) {
      // Calculate target users
      await calculateTargetUsers();
    }

    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      window.scrollTo(0, 0);
    }
  };

  const generatePreview = async () => {
    if (!selectedTemplate) return;
    try {
      setLoading(true);
      const html = await promotionalEmailService.previewEmail(
        selectedTemplate.id,
        formData.template_data
      );
      setPreviewHtml(html);
    } catch (error) {
      showAlert('Failed to generate preview', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTargetUsers = async () => {
    try {
      const result = await promotionalEmailService.calculateTargetUsers(
        formData.target_criteria
      );
      setTargetUserCount(result.count);
    } catch (error) {
      console.error('Error calculating target users:', error);
      setTargetUserCount(0);
    }
  };

  const handleSendCampaign = async (sendOption: 'now' | 'schedule', scheduledAt?: string) => {
    try {
      setLoading(true);

      if (!formData.template_id) throw new Error('Template not selected');

      // Create campaign
      const campaign = await promotionalEmailService.createCampaign({
        template_id: formData.template_id,
        campaign_name: formData.campaign_name,
        campaign_description: formData.campaign_description,
        template_data: formData.template_data,
        target_criteria: formData.target_criteria,
      } as CreateCampaignRequest);

      // Send or schedule
      if (sendOption === 'now') {
        await promotionalEmailService.sendCampaign(campaign.id);
        showAlert('Campaign sent successfully!', 'success');
      } else if (scheduledAt) {
        await promotionalEmailService.scheduleCampaign(campaign.id, scheduledAt);
        showAlert('Campaign scheduled successfully!', 'success');
      }

      // Redirect to campaigns list
      setTimeout(() => {
        router.push('/admin/promotional-emails');
      }, 1500);
    } catch (error) {
      showAlert('Failed to send campaign', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Promotional Email Campaign
            </h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              ← Back
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                    step <= currentStep
                      ? 'bg-[#620707] text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      step < currentStep ? 'bg-[#620707]' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Template</span>
            <span>Details</span>
            <span>Content</span>
            <span>Audience</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Steps Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStep === 1 && (
            <TemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
            />
          )}

          {currentStep === 2 && (
            <CampaignDetails
              data={formData}
              onUpdate={handleUpdateFormData}
            />
          )}

          {currentStep === 3 && selectedTemplate && (
            <ContentEditor
              template={selectedTemplate}
              templateData={formData.template_data}
              onUpdateField={handleUpdateTemplateData}
            />
          )}

          {currentStep === 4 && (
            <AudienceSelector
              criteria={formData.target_criteria}
              targetUserCount={targetUserCount}
              onUpdate={(criteria) =>
                handleUpdateFormData({ target_criteria: criteria })
              }
            />
          )}

          {currentStep === 5 && (
            <PreviewAndSend
              previewHtml={previewHtml}
              targetUserCount={targetUserCount}
              campaignName={formData.campaign_name}
              onSend={handleSendCampaign}
              loading={loading}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentStep < 5 && (
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#620707] text-white rounded-lg font-medium hover:bg-[#4a0505] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Next →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
