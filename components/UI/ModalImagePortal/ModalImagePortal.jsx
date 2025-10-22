import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

const ModalImagePortal = ({ small, large, className, alt = "Modal Image" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Thumbnail Image */}
      <div className="cursor-pointer" onClick={handleClick}>
        {small ? (
          <Image
            src={small}
            alt={alt}
            width={48}
            height={48}
            className={className}
            loading="lazy"
          />
        ) : (
          <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleBackdropClick}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] p-4">

            {/* Large Image */}
            <div className="relative">
              <Image
                src={large || small}
                alt={alt}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
                priority
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );

  return modalContent;
};

export default ModalImagePortal;
