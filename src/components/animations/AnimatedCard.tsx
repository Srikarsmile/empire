'use client';

import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { ReactNode, useRef } from 'react';

export function AnimatedCard({ children, index = 0, className = '' }: {
    children: ReactNode; index?: number; className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), { stiffness: 300, damping: 30 });

    function handleMouseMove(e: React.MouseEvent) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={ref}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: reduceMotion ? 0 : 0.26,
                delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.14),
                ease: [0.22, 1, 0.36, 1],
            }}
            style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
            onMouseMove={reduceMotion ? undefined : handleMouseMove}
            onMouseLeave={reduceMotion ? undefined : handleMouseLeave}
            className={className}
        >
            {children}
        </motion.div>
    );
}
