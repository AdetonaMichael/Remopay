'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';

interface ActionButtonProps {
  label: string;
  icon?: LucideIcon;
  onClick: () => Promise<void>;
  variant?: 'primary' | 'danger' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  confirmMessage?: string;
  confirmTitle?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ActionButton = ({
  label,
  icon: Icon,
  onClick,
  variant = 'primary',
  size = 'md',
  confirmMessage,
  confirmTitle = 'Confirm Action',
  isLoading = false,
  disabled = false,
  className,
}: ActionButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (confirmMessage) {
      setShowConfirm(true);
    } else {
      onClick();
    }
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    await onClick();
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        isLoading={isLoading}
        disabled={disabled || isLoading}
        className={className}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </Button>

      {showConfirm && confirmMessage && (
        <Modal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          title={confirmTitle}
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} isLoading={isLoading}>
                Confirm
              </Button>
            </>
          }
        >
          <p className="text-sm text-[#6b7280]">{confirmMessage}</p>
        </Modal>
      )}
    </>
  );
};
