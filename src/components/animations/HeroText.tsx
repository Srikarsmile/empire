'use client';

import { motion } from 'framer-motion';

export function HeroText({ title, subtitle }: { title: string; subtitle: string }) {
    const words = title.split(' ');

    return (
        <>
            <h1>
                {words.map((word, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: 0.3 + i * 0.12,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        style={{ display: 'inline-block', marginRight: '0.3em' }}
                    >
                        {word}
                    </motion.span>
                ))}
            </h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                {subtitle}
            </motion.p>
        </>
    );
}
