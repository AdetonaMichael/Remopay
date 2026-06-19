/**
 * Tier Upgrade Flow Hook
 * Manages tier upgrade application lifecycle with draft saving and resuming
 * 
 * Features:
 * - Load existing application (draft or submitted)
 * - Auto-save drafts to localStorage and backend
 * - Submit complete applications
 * - Track application status
 * - Resume from draft
 * 
 * Updated: June 19, 2026
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { tierUpgradeService } from '@/services/tier-upgrade.service';
import { useUIStore } from '@/store/ui.store';
import {
  TierName,
  TierUpgradeApplication,
  TierUpgradeFormData,
  ApplicationStatus,
} from '@/types/tier-upgrade.types';

interface UseTierUpgradeFlowOptions {
  tier: TierName;
  onSuccess?: (status: ApplicationStatus) => void;
  onError?: (error: string) => void;
  autoSaveDraft?: boolean;
  autoSaveInterval?: number; // milliseconds
}

interface UseTierUpgradeFlowState {
  application: TierUpgradeApplication | null;
  formData: Partial<TierUpgradeFormData>;
  status: ApplicationStatus | 'not_started' | null;
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  error: string | null;
  successMessage: string | null;
  isDirty: boolean;
}

export const useTierUpgradeFlow = (options: UseTierUpgradeFlowOptions) => {
  const { tier, onSuccess, onError, autoSaveDraft = true, autoSaveInterval = 30000 } = options;
  const { addToast } = useUIStore();

  // State
  const [state, setState] = useState<UseTierUpgradeFlowState>({
    application: null,
    formData: {},
    status: null,
    loading: true,
    saving: false,
    submitting: false,
    error: null,
    successMessage: null,
    isDirty: false,
  });

  // Refs for auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<Partial<TierUpgradeFormData>>({});

  // ============= LOAD EXISTING APPLICATION =============

  /**
   * Load existing application on component mount
   */
  const loadApplication = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // First, check for existing application on backend
      const response = await tierUpgradeService.getApplication(tier);

      if (response.data) {
        // Application exists
        const appData = response.data;
        setState((prev) => ({
          ...prev,
          application: appData,
          formData: appData.form_data || {},
          status: appData.status,
          loading: false,
        }));

        // If it's a draft, update last saved data
        if (appData.status === 'draft') {
          lastSavedDataRef.current = appData.form_data || {};
        }
      } else {
        // No existing application
        setState((prev) => ({
          ...prev,
          application: null,
          formData: {},
          status: 'not_started',
          loading: false,
        }));
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load application';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [tier, onError]);

  // Load on mount
  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  // ============= FORM DATA MANAGEMENT =============

  /**
   * Update form field
   */
  const updateFormField = useCallback(<K extends keyof Partial<TierUpgradeFormData>>(
    field: K,
    value: Partial<TierUpgradeFormData>[K]
  ) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      isDirty: true,
      error: null,
    }));
  }, []);

  /**
   * Update nested form data (e.g., phone, address)
   */
  const updateFormData = useCallback((data: Partial<TierUpgradeFormData>) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...data,
      },
      isDirty: true,
      error: null,
    }));
  }, []);

  /**
   * Reset form to last saved state
   */
  const resetForm = useCallback(() => {
    if (state.application?.form_data) {
      setState((prev) => ({
        ...prev,
        formData: state.application!.form_data,
        isDirty: false,
        error: null,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        formData: {},
        isDirty: false,
        error: null,
      }));
    }
  }, [state.application]);

  // ============= DRAFT MANAGEMENT =============

  /**
   * Save draft to backend and localStorage
   */
  const saveDraft = useCallback(async () => {
    // Don't save if form hasn't changed
    if (
      !state.isDirty &&
      state.application?.status === 'draft'
    ) {
      return;
    }

    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const response = await tierUpgradeService.saveDraft(tier, state.formData);

      if (response.data) {
        setState((prev) => ({
          ...prev,
          application: response.data,
          status: 'draft',
          isDirty: false,
          saving: false,
        }));

        lastSavedDataRef.current = response.data.form_data || {};

        addToast({
          type: 'success',
          message: 'Draft saved successfully',
          duration: 2000,
        });

        return response.data;
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save draft';
      setState((prev) => ({
        ...prev,
        saving: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
      throw error;
    }
  }, [tier, state.formData, state.isDirty, state.application, addToast, onError]);

  // ============= AUTO-SAVE DRAFT =============

  /**
   * Setup auto-save interval
   */
  useEffect(() => {
    if (!autoSaveDraft || state.status !== 'draft') {
      return;
    }

    const setupAutoSave = () => {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (state.isDirty) {
          saveDraft();
        }
        setupAutoSave(); // Reschedule
      }, autoSaveInterval);
    };

    setupAutoSave();

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSaveDraft, autoSaveInterval, state.isDirty, state.status, saveDraft]);

  // ============= SUBMISSION =============

  /**
   * Submit complete tier upgrade application
   */
  const submitApplication = useCallback(async () => {
    if (state.status === 'submitted' || state.status === 'processing' || state.status === 'pending_review') {
      const msg = 'Application is already submitted and pending approval';
      addToast({
        type: 'warning',
        message: msg,
      });
      return;
    }

    setState((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      // Save draft first if there are changes
      if (state.isDirty) {
        await saveDraft();
      }

      // Submit application
      const response = await tierUpgradeService.submitApplication(tier, state.formData);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          status: 'submitted',
          isDirty: false,
          submitting: false,
          successMessage: 'Application submitted successfully!',
          application: prev.application
            ? { ...prev.application, status: 'submitted' as ApplicationStatus }
            : null,
        }));

        addToast({
          type: 'success',
          message: 'Tier upgrade application submitted!',
        });

        onSuccess?.('submitted');
        return response;
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit application';
      const errors = error?.response?.data?.errors;

      setState((prev) => ({
        ...prev,
        submitting: false,
        error: errorMessage,
      }));

      addToast({
        type: 'error',
        message: errorMessage,
      });

      onError?.(errorMessage);
      throw { message: errorMessage, errors };
    }
  }, [tier, state.formData, state.isDirty, state.status, saveDraft, addToast, onSuccess, onError]);

  // ============= STATUS CHECKING =============

  /**
   * Fetch current application status
   */
  const checkStatus = useCallback(async () => {
    try {
      const response = await tierUpgradeService.getStatus(tier);

      if (response.data) {
        const statusData = response.data;
        if (statusData.application) {
          const appData = statusData.application;
          setState((prev) => ({
            ...prev,
            application: appData,
            status: statusData.status,
            formData: appData.form_data || prev.formData,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            status: statusData.status || 'not_started',
          }));
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Failed to check status:', error);
      throw error;
    }
  }, [tier]);

  // ============= CLEAR STATE =============

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearSuccessMessage = useCallback(() => {
    setState((prev) => ({ ...prev, successMessage: null }));
  }, []);

  // ============= RETURN STATE AND ACTIONS =============

  return {
    // State
    application: state.application,
    formData: state.formData,
    status: state.status,
    loading: state.loading,
    saving: state.saving,
    submitting: state.submitting,
    error: state.error,
    successMessage: state.successMessage,
    isDirty: state.isDirty,

    // Actions
    loadApplication,
    updateFormField,
    updateFormData,
    resetForm,
    saveDraft,
    submitApplication,
    checkStatus,
    clearError,
    clearSuccessMessage,

    // Helpers
    isApproved: state.status === 'approved',
    isRejected: state.status === 'rejected',
    isFailed: state.status === 'failed',
    isPending: state.status === 'submitted' || state.status === 'processing' || state.status === 'pending_review',
    isDraft: state.status === 'draft',
    canRetry: state.application?.can_retry ?? false,
  };
};
