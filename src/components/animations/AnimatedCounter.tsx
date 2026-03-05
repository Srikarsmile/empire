'use client';

import { useInView, useMotionValue, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function AnimatedCounter({ value, prefix = '$', suffix = '' }: {
    value: number; prefix?: string; suffix?: string;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const count = useMotionValue(0);
    const displayRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (isInView) {
            const controls = animate(count, value, {
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
                onUpdate: (v) => {
                    if (displayRef.current) {
                        displayRef.current.textContent = `${prefix}${Math.round(v)}${suffix}`;
                    }
                }
            });
            return () => controls.stop();
        }
    }, [isInView, value, count, prefix, suffix]);

    return (
        <span ref={ref}>
            <span ref={displayRef}>{prefix}0{suffix}</span>
        </span>
    );
}
