'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import RatingModal from './RatingModal';

interface RatingButtonProps {
  type: 'user' | 'organization' | 'product' | 'service';
  targetId: string;
  targetName: string;
  dealId?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRatingSubmitted?: () => void;
}

export default function RatingButton({
  type,
  targetId,
  targetName,
  dealId,
  variant = 'outline',
  size = 'sm',
  className = '',
  onRatingSubmitted,
}: RatingButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = () => {
    onRatingSubmitted?.();
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className={className}
      >
        <Star className="w-4 h-4 mr-2" />
        Rate {type === 'user' ? 'Member' : type === 'organization' ? 'Organization' : 'This'}
      </Button>

      {showModal && (
        <RatingModal
          type={type}
          targetId={targetId}
          targetName={targetName}
          dealId={dealId}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
