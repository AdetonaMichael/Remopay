/**
 * useUsdAccount Hook
 * Manages USD account creation and state
 */

import { useCallback, useState } from 'react';
import { usdAccountService } from '@/services/usd-account.service';
import {
  CreateUSDAccountRequest,
  USDAccountFormData,
  USDAccountData,
  EmploymentStatus,
  USResidencyStatus,
  IdentificationType,
} from '@/types/usd-account.types';

interface UseUsdAccountReturn {
  account: USDAccountData | null;
  isCreating: boolean;
  error: string | null;
  createAccount: (customerId: string, formData: USDAccountFormData) => Promise<USDAccountData | null>;
  clearError: () => void;
}

export const useUsdAccount = (): UseUsdAccountReturn => {
  const [account, setAccount] = useState<USDAccountData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createAccount = useCallback(
    async (customerId: string, formData: USDAccountFormData) => {
      if (!customerId) {
        const errorMsg = 'Customer ID is required to create USD account';
        setError(errorMsg);
        return null;
      }

      setIsCreating(true);
      setError(null);

      try {
        // Validate required files
        if (!formData.sourceOfFundsFile || !formData.proofOfAddressFile) {
          throw new Error('Source of funds and proof of address documents are required');
        }

        // Convert files to base64
        const sourceOfFundsBase64 = await usdAccountService.fileToBase64(
          formData.sourceOfFundsFile
        );
        const proofOfAddressBase64 = await usdAccountService.fileToBase64(
          formData.proofOfAddressFile
        );

        // Compress and encode identification images if provided
        let identificationFrontBase64: string | undefined;
        let identificationBackBase64: string | undefined;

        if (formData.identificationFrontImage) {
          identificationFrontBase64 = await usdAccountService.compressAndEncodeImage(
            formData.identificationFrontImage
          );
        }

        if (formData.identificationBackImage) {
          identificationBackBase64 = await usdAccountService.compressAndEncodeImage(
            formData.identificationBackImage
          );
        }

        // Build the request
        const request: CreateUSDAccountRequest = {
          customer_id: customerId,
          meta: {
            identification_number: formData.identificationNumber,
            passport_number: formData.passportNumber,
            employment_status: formData.employmentStatus as EmploymentStatus,
            employment_description: formData.employmentDescription,
            nationality: formData.nationality,
            employer_name: formData.employerName,
            occupation: formData.occupation,
            us_residency_status: formData.usResidencyStatus as USResidencyStatus,
            documents: {
              identification_country: formData.identificationCountry,
              identification_type: formData.identificationType as IdentificationType | undefined,
              identification_number: formData.identificationNumber,
              identification_expiration: formData.identificationExpiration,
              identification_image_front: identificationFrontBase64,
              identification_image_back: identificationBackBase64,
              source_of_funds: {
                file_name: formData.sourceOfFundsFile.name,
                file: sourceOfFundsBase64,
              },
              proof_of_address: {
                file_name: formData.proofOfAddressFile.name,
                file: proofOfAddressBase64,
              },
            },
          },
        };

        // Call the API
        const response = await usdAccountService.createUSDAccount(request);

        if (!response.success || !response.data.account) {
          throw new Error(response.message || 'Failed to create USD account');
        }

        setAccount(response.data.account);
        return response.data.account;
      } catch (err: any) {
        const errorMsg =
          err?.message || 'An error occurred while creating your USD account. Please try again.';
        setError(errorMsg);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    account,
    isCreating,
    error,
    createAccount,
    clearError,
  };
};
