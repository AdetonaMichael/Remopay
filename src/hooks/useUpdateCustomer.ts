'use client';

/**
 * useUpdateCustomer Hook
 * Manages customer profile update state and operations
 */

import { useCallback, useState } from 'react';
import { customerService } from '@/services/customer.service';
import {
  UpdateCustomerPayload,
  UpdateCustomerResponse,
  CustomerProfile,
} from '@/types/customer.types';
import { useAlert } from './useAlert';

interface UseUpdateCustomerOptions {
  onSuccess?: (data: CustomerProfile) => void;
  onError?: (error: any) => void;
}

interface FieldErrors {
  [key: string]: string;
}

interface UseUpdateCustomerReturn {
  loading: boolean;
  error: string | null;
  fieldErrors: FieldErrors;
  success: boolean;
  updateCustomer: (payload: UpdateCustomerPayload) => Promise<UpdateCustomerResponse | null>;
  updateField: (customerId: string, field: string, value: any) => Promise<UpdateCustomerResponse | null>;
  updateContactInfo: (customerId: string, phone?: any, address?: any) => Promise<UpdateCustomerResponse | null>;
  updateIdentity: (customerId: string, identity: any) => Promise<UpdateCustomerResponse | null>;
  clearError: () => void;
}

export const useUpdateCustomer = (options?: UseUpdateCustomerOptions): UseUpdateCustomerReturn => {
  const { success: showSuccess, error: showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const updateCustomer = useCallback(
    async (payload: UpdateCustomerPayload): Promise<UpdateCustomerResponse | null> => {
      setLoading(true);
      setError(null);
      setFieldErrors({});
      setSuccess(false);

      try {
        const response = await customerService.updateCustomer(payload);

        if (response?.data?.data?.customer) {
          setSuccess(true);
          showSuccess('Profile updated successfully!');
          options?.onSuccess?.(response.data.data.customer);
          return response.data;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err: any) {
        // Extract field-level errors
        const newFieldErrors: FieldErrors = err.fieldErrors || {};
        setFieldErrors(newFieldErrors);

        // Build user-friendly error message
        let errorMessage = err.message || 'Failed to update customer profile';
        
        // If there are field errors, append them to the message
        if (Object.keys(newFieldErrors).length > 0) {
          const fieldErrorList = Object.entries(newFieldErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          errorMessage = `${errorMessage}. Details: ${fieldErrorList}`;
        }

        setError(errorMessage);
        showError(errorMessage);

        // Log full error for debugging
        console.error('[useUpdateCustomer] Error:', {
          message: errorMessage,
          fieldErrors: newFieldErrors,
          fullError: err,
        });

        options?.onError?.(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options, showSuccess, showError]
  );

  const updateField = useCallback(
    async (customerId: string, field: string, value: any): Promise<UpdateCustomerResponse | null> => {
      return updateCustomer({
        customer_id: customerId,
        [field]: value,
      });
    },
    [updateCustomer]
  );

  const updateContactInfo = useCallback(
    async (
      customerId: string,
      phone?: { phone_country_code: string; phone_number: string },
      address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
        street2?: string;
      }
    ): Promise<UpdateCustomerResponse | null> => {
      const payload: UpdateCustomerPayload = {
        customer_id: customerId,
      };

      if (phone) payload.phone = phone;
      if (address) payload.address = address;

      return updateCustomer(payload);
    },
    [updateCustomer]
  );

  const updateIdentity = useCallback(
    async (
      customerId: string,
      identity: {
        type: 'NIN' | 'PASSPORT' | 'VOTERS_CARD' | 'DRIVERS_LICENSE';
        number: string;
        image?: string;
        country?: string;
      }
    ): Promise<UpdateCustomerResponse | null> => {
      return updateCustomer({
        customer_id: customerId,
        identity,
      });
    },
    [updateCustomer]
  );

  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  return {
    loading,
    error,
    fieldErrors,
    success,
    updateCustomer,
    updateField,
    updateContactInfo,
    updateIdentity,
    clearError,
  };
};
