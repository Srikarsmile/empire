'use client';

import { usePathname } from 'next/navigation';

interface WhatsAppButtonProps {
  phone: string;
}

export default function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  const pathname = usePathname();

  if (!phone || pathname.startsWith('/admin')) return null;

  const waPhone = phone.replace(/\D/g, '');
  if (!waPhone) return null;

  return (
    <>
      <a
        href={`https://wa.me/${waPhone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        aria-label="Chat with us on WhatsApp"
      >
        {/* WhatsApp SVG icon */}
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M16 2C8.268 2 2 8.268 2 16c0 2.46.664 4.763 1.822 6.74L2 30l7.453-1.793A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.558 11.558 0 0 1-5.89-1.607l-.422-.252-4.42 1.063 1.1-4.298-.277-.44A11.56 11.56 0 0 1 4.4 16c0-6.398 5.202-11.6 11.6-11.6 6.4 0 11.6 5.202 11.6 11.6 0 6.4-5.2 11.6-11.6 11.6zm6.36-8.684c-.348-.174-2.063-1.018-2.384-1.134-.32-.115-.553-.174-.786.174-.232.348-.9 1.134-1.102 1.368-.203.232-.405.26-.754.086-.348-.174-1.47-.542-2.8-1.727-1.033-.923-1.73-2.062-1.933-2.41-.203-.348-.022-.536.152-.71.157-.155.348-.405.523-.607.173-.203.23-.348.347-.58.116-.232.058-.434-.03-.608-.086-.174-.786-1.895-1.077-2.597-.283-.682-.57-.59-.786-.6l-.67-.012a1.284 1.284 0 0 0-.93.434c-.32.348-1.218 1.19-1.218 2.9 0 1.712 1.247 3.366 1.42 3.598.174.232 2.452 3.742 5.942 5.248.83.358 1.479.572 1.984.732.834.265 1.592.228 2.191.138.668-.1 2.063-.843 2.354-1.658.29-.814.29-1.512.203-1.658-.086-.145-.32-.23-.668-.405z"
            fill="white"
          />
        </svg>
      </a>

      <style>{`
        .whatsapp-btn {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9000;
          width: 3.25rem;
          height: 3.25rem;
          border-radius: 50%;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.45);
          animation: whatsapp-pulse 2.5s ease-in-out infinite;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .whatsapp-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 24px rgba(37, 211, 102, 0.55);
          animation: none;
        }
        .whatsapp-btn svg {
          width: 1.75rem;
          height: 1.75rem;
        }
        @keyframes whatsapp-pulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(37, 211, 102, 0.45); }
          50% { box-shadow: 0 4px 28px rgba(37, 211, 102, 0.7); }
        }
      `}</style>
    </>
  );
}
