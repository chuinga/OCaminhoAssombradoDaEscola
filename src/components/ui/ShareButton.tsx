'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { ShareableScore } from '@/types';

interface ShareButtonProps {
  scoreId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function ShareButton({ 
  scoreId, 
  className = '', 
  size = 'md',
  variant = 'primary'
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'p-1 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600'
  };

  const handleShare = async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);
      setShareError(null);

      const shareData = await apiClient.generateShareableScore(scoreId);
      
      // Try native sharing first (mobile devices)
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'O Caminho Assombrado da Escola',
            text: shareData.shareText,
            url: shareData.shareUrl,
          });
          return;
        } catch (shareErr) {
          // User cancelled or sharing failed, fall back to clipboard
          console.log('Native sharing cancelled or failed, falling back to clipboard');
        }
      }

      // Fallback to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        const shareContent = `${shareData.shareText}\n\n🎮 Joga também: ${shareData.shareUrl}`;
        await navigator.clipboard.writeText(shareContent);
        
        // Show success feedback
        const button = document.activeElement as HTMLButtonElement;
        if (button) {
          const originalText = button.innerHTML;
          button.innerHTML = '✅ Copiado!';
          button.disabled = true;
          
          setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
          }, 2000);
        }
      } else {
        // Final fallback - show share data in a modal or alert
        const shareContent = `${shareData.shareText}\n\nLink: ${shareData.shareUrl}`;
        
        // Create a temporary textarea to select and copy
        const textarea = document.createElement('textarea');
        textarea.value = shareContent;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          document.execCommand('copy');
          alert('Pontuação copiada para a área de transferência!');
        } catch (err) {
          // Show the content in an alert as last resort
          alert(`Partilha a tua pontuação:\n\n${shareContent}`);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (error) {
      console.error('Failed to share score:', error);
      setShareError('Erro ao partilhar pontuação. Tenta novamente.');
      
      setTimeout(() => {
        setShareError(null);
      }, 3000);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]}
          ${className}
          rounded-lg font-medium transition-all transform hover:scale-105 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          flex items-center justify-center gap-2
        `}
        title="Partilhar pontuação"
      >
        {isSharing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span className="hidden sm:inline">Partilhando...</span>
          </>
        ) : (
          <>
            <span>📤</span>
            <span className="hidden sm:inline">Partilhar</span>
          </>
        )}
      </button>
      
      {shareError && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg whitespace-nowrap z-10">
          {shareError}
        </div>
      )}
    </div>
  );
}

// Utility function to generate share text for different platforms
export function generateShareText(shareData: ShareableScore): {
  twitter: string;
  facebook: string;
  whatsapp: string;
  generic: string;
} {
  const baseText = shareData.shareText;
  const url = shareData.shareUrl;
  
  return {
    twitter: `${baseText} 🎮 #OCaminhoAssombradoDaEscola ${url}`,
    facebook: `${baseText}\n\nJoga também: ${url}`,
    whatsapp: `🎃 ${baseText}\n\n🎮 Joga também: ${url}`,
    generic: `${baseText}\n\nJoga também: ${url}`
  };
}

// Social media specific share functions
export const socialShare = {
  twitter: (shareData: ShareableScore) => {
    const text = generateShareText(shareData).twitter;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  },
  
  facebook: (shareData: ShareableScore) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.shareUrl)}`;
    window.open(url, '_blank', 'width=580,height=296');
  },
  
  whatsapp: (shareData: ShareableScore) => {
    const text = generateShareText(shareData).whatsapp;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  },
  
  telegram: (shareData: ShareableScore) => {
    const text = generateShareText(shareData).generic;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareData.shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
};