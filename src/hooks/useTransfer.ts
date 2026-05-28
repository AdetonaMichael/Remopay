/**
 * useTransfer Hook
 * Handles Remopay-to-Remopay transfer logic, validation, and state management
 */

import { useCallback, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { transferService } from '@/services/transfer.service';
import {
  RemopayTransferFormData,
  RemopayTransferResponse,
  RecipientUser,
  Recipient,
  IdentifierType,
  TransferValidationResult,
} from '@/types/transfer.types';
import {
  normalizePhoneNumber,
  validateRemopayTransferForm,
  validateIdentifier,
  validateRemopayAmount,
  extractErrorMessage,
  extractFieldErrors,
} from '@/utils/transfer.utils';

interface UseTransferOptions {
  onSuccess?: (response: RemopayTransferResponse) => void;
  onError?: (error: any) => void;
}

export const useTransfer = (options?: UseTransferOptions) => {
  const { user } = useAuthStore();
  const { addToast, setIsLoading } = useUIStore();

  // State management
  const [formData, setFormData] = useState<RemopayTransferFormData>({
    recipientIdentifier: '',
    identifierType: IdentifierType.PHONE,
    amount: 0,
    description: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [recipientDetails, setRecipientDetails] = useState<RecipientUser | null>(null);
  const [recentRecipients, setRecentRecipients] = useState<Recipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  /**
   * Update form field
   */
  const updateField = useCallback(
    (field: keyof RemopayTransferFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error for this field
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    },
    [validationErrors]
  );

  /**
   * Verify recipient exists
   */
  const verifyRecipient = useCallback(async () => {
    if (!formData.recipientIdentifier) {
      setValidationErrors({ recipient: 'Please enter recipient identifier' });
      return;
    }

    // Validate identifier format
    const validation = validateIdentifier(formData.recipientIdentifier, formData.identifierType);
    if (!validation.valid) {
      setValidationErrors({ recipient: validation.error || 'Invalid identifier' });
      return;
    }

    // Normalize phone if needed
    let identifier = formData.recipientIdentifier;
    if (formData.identifierType === IdentifierType.PHONE) {
      const normalized = normalizePhoneNumber(identifier);
      if (!normalized.isValid) {
        setValidationErrors({ recipient: normalized.error || 'Invalid phone number' });
        return;
      }
      identifier = normalized.normalized!;
    }

    setIsVerifying(true);
    setValidationErrors({});

    try {
      const response = await transferService.verifyRecipient({
        identifier,
        identifier_type: formData.identifierType,
      });

      if (response?.success && response.data) {
        setRecipientDetails(response.data);
        addToast({
          type: 'success',
          message: `${response.data.name} verified successfully`,
        });
      } else {
        setRecipientDetails(null);
        setValidationErrors({ recipient: 'Recipient not found. Check the identifier and try again.' });
      }
    } catch (error: any) {
      setRecipientDetails(null);
      const errorMsg = extractErrorMessage(error);
      setValidationErrors({ recipient: errorMsg });
      setTransferError(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  }, [formData.recipientIdentifier, formData.identifierType, addToast]);

  /**
   * Load recent recipients for quick selection
   */
  const loadRecentRecipients = useCallback(async (limit: number = 5) => {
    setIsLoadingRecipients(true);
    try {
      const recipients = await transferService.getRecentRemopayRecipients(limit);
      if (recipients) {
        setRecentRecipients(recipients);
      }
    } catch (error) {
      console.error('Error loading recent recipients:', error);
    } finally {
      setIsLoadingRecipients(false);
    }
  }, []);

  /**
   * Select a recent recipient (auto-populate)
   */
  const selectRecentRecipient = useCallback((recipient: Recipient) => {
    const identifier =
      recipient.identifier_type === IdentifierType.PHONE
        ? recipient.phone || ''
        : recipient.email || '';

    setFormData((prev) => ({
      ...prev,
      recipientIdentifier: identifier,
      identifierType: recipient.identifier_type || IdentifierType.PHONE,
    }));

    // Set recipient details
    if (recipient.id) {
      setRecipientDetails({
        id: recipient.id,
        name: recipient.name,
        email: recipient.email || '',
        phone_number: recipient.phone || '',
        avatar: recipient.profile_image,
        identifier_type: recipient.identifier_type || IdentifierType.PHONE,
        identifier,
      });
    }

    setValidationErrors({});
  }, []);

  /**
   * Validate form before proceeding to review
   */
  const validateForm = useCallback(
    (walletBalance: number): boolean => {
      // If recipient is already verified, skip identifier validation
      if (!recipientDetails) {
        setValidationErrors({ recipient: 'Please verify a recipient first' });
        return false;
      }

      // Validate amount and balance only
      const amountValidation = validateRemopayAmount(formData.amount);
      if (!amountValidation.valid) {
        setValidationErrors({ amount: amountValidation.error || 'Invalid amount' });
        return false;
      }

      // Check balance
      if (formData.amount > walletBalance) {
        setValidationErrors({
          balance: `Insufficient balance. Available: ₦${walletBalance?.toLocaleString() || '0'}`,
        });
        return false;
      }

      setValidationErrors({});
      return true;
    },
    [formData.amount, recipientDetails]
  );

  /**
   * Submit transfer request
   */
  const submitTransfer = useCallback(
    async (pin: string): Promise<RemopayTransferResponse | null> => {
      if (!user) {
        addToast({ type: 'error', message: 'User not authenticated' });
        return null;
      }

      setIsLoading(true);
      setTransferError(null);

      try {
        // Normalize phone if needed
        let identifier = formData.recipientIdentifier;
        if (formData.identifierType === IdentifierType.PHONE) {
          const normalized = normalizePhoneNumber(identifier);
          if (!normalized.isValid) {
            throw new Error(normalized.error || 'Invalid phone number');
          }
          identifier = normalized.normalized!;
        }

        const payload: any = {
          identifier,
          identifier_type: formData.identifierType,
          amount: formData.amount,
          pin,
        };

        if (formData.description) {
          payload.description = formData.description;
        }

        const response = await transferService.initiateRemopayTransfer(payload);

        if (response?.success) {
          addToast({
            type: 'success',
            message: `Transfer of ₦${formData.amount.toLocaleString()} successful!`,
          });

          options?.onSuccess?.(response);
          return response;
        } else {
          throw new Error(response?.message || 'Transfer failed');
        }
      } catch (error: any) {
        const errorMsg = extractErrorMessage(error);
        setTransferError(errorMsg);

        // Handle specific error cases
        if (error.response?.status === 429) {
          // PIN locked
          const lockData = error.response?.data?.data;
          addToast({
            type: 'error',
            message: `PIN is locked. Try again in ${lockData?.remaining_seconds || 30} seconds.`,
          });
        } else if (error.response?.status === 401) {
          // Invalid PIN
          const failedAttempts = error.response?.data?.data?.failed_attempts || 0;
          const remaining = 3 - failedAttempts;
          addToast({
            type: 'error',
            message: `Invalid PIN. You have ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
          });
        } else {
          addToast({ type: 'error', message: errorMsg });
        }

        options?.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user, formData, addToast, setIsLoading, options]
  );

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData({
      recipientIdentifier: '',
      identifierType: IdentifierType.PHONE,
      amount: 0,
      description: '',
    });
    setValidationErrors({});
    setRecipientDetails(null);
    setTransferError(null);
  }, []);

  /**
   * Restore form data from sessionStorage (used on review pages)
   */
  const restoreFormData = useCallback((data: RemopayTransferFormData, recipient?: RecipientUser) => {
    setFormData(data);
    if (recipient) {
      setRecipientDetails(recipient);
    }
  }, []);

  return {
    // State
    formData,
    validationErrors,
    recipientDetails,
    recentRecipients,
    isVerifying,
    isLoadingRecipients,
    transferError,

    // Methods
    updateField,
    verifyRecipient,
    selectRecentRecipient,
    loadRecentRecipients,
    validateForm,
    submitTransfer,
    resetForm,
    restoreFormData,
  };
};
