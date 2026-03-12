'use client';

import { motion } from 'motion/react';
import { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }: {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            className={`toast toast-${type}`}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 3000,
                borderLeftColor: type === 'success' ? 'var(--success)' : 'var(--danger)',
            }}
        >
            {type === 'success' ? (
                <CheckCircle2 style={{ width: '1.2rem', height: '1.2rem', color: 'var(--success)' }} />
            ) : (
                <AlertCircle style={{ width: '1.2rem', height: '1.2rem', color: 'var(--danger)' }} />
            )}
            {message}
        </motion.div>
    );
}
