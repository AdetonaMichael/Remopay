import { useState, useCallback } from 'react';

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong';
  score: number;
}

const PASSWORD_REGEX = {
  minLength: /.{8,}/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  symbol: /[!@#$%^&*]/,
};

export const usePasswordValidation = () => {
  const [requirements, setRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  const validatePassword = useCallback((password: string): PasswordRequirements => {
    const newRequirements: PasswordRequirements = {
      minLength: PASSWORD_REGEX.minLength.test(password),
      hasUppercase: PASSWORD_REGEX.uppercase.test(password),
      hasLowercase: PASSWORD_REGEX.lowercase.test(password),
      hasNumber: PASSWORD_REGEX.number.test(password),
      hasSymbol: PASSWORD_REGEX.symbol.test(password),
    };

    // Only update state if requirements actually changed
    setRequirements((prevRequirements) => {
      const hasChanged = JSON.stringify(prevRequirements) !== JSON.stringify(newRequirements);
      return hasChanged ? newRequirements : prevRequirements;
    });
    
    return newRequirements;
  }, []);

  const getPasswordStrength = useCallback(
    (password: string): PasswordStrength => {
      const reqs = validatePassword(password);
      const score = Object.values(reqs).filter(Boolean).length;

      let level: 'weak' | 'medium' | 'strong';
      if (score <= 2) level = 'weak';
      else if (score <= 4) level = 'medium';
      else level = 'strong';

      return { level, score };
    },
    [validatePassword]
  );

  const isPasswordValid = useCallback((): boolean => {
    return Object.values(requirements).every(Boolean);
  }, [requirements]);

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength.level) {
      case 'weak':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      case 'strong':
        return '#16a34a';
      default:
        return '#d1d5db';
    }
  };

  const getStrengthLabel = (strength: PasswordStrength) => {
    switch (strength.level) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return 'Unknown';
    }
  };

  return {
    requirements,
    validatePassword,
    getPasswordStrength,
    isPasswordValid,
    getStrengthColor,
    getStrengthLabel,
  };
};
