'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function FadeInUp({ children, delay = 0, className = '' }: {
    children: ReactNode; delay?: number; className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.1, style }: {
    children: ReactNode; className?: string; staggerDelay?: number; style?: React.CSSProperties;
}) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: staggerDelay } }
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = '' }: {
    children: ReactNode; className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function ScaleIn({ children, delay = 0, className = '' }: {
    children: ReactNode; delay?: number; className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
