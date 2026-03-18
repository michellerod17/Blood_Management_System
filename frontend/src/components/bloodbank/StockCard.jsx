import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import StockUpdateModal from './StockUpdateModal';

function stockStatus(units, capacity) {
    const pct = units / capacity;
    if (pct > 0.6) return { label: 'HEALTHY', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', barColor: '#22c55e' };
    if (pct > 0.3) return { label: 'LOW', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', barColor: '#f59e0b' };
    return { label: 'CRITICAL', color: 'var(--red)', bg: 'rgba(217,0,37,0.1)', border: 'rgba(217,0,37,0.3)', barColor: 'var(--red)', pulse: true };
}

export default function StockCard({ stock, size = 'normal', onUpdate }) {
    const { blood_group, available_units, capacity, last_updated } = stock;
    const sts = stockStatus(available_units, capacity);
    const pct = Math.round((available_units / capacity) * 100);
    const [showModal, setShowModal] = useState(false);
    const [hovered, setHovered] = useState(false);

    return (
        <>
            <motion.div
                whileHover={{ y: -3, borderColor: 'rgba(217,0,37,0.35)', boxShadow: '0 0 20px rgba(217,0,37,0.1)' }}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                onClick={() => setShowModal(true)}
                style={{ background: '#0F0F17', border: `1px solid ${sts.pulse ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: '20px', cursor: 'pointer', transition: 'all 0.2s', animation: sts.pulse ? 'borderPulse 1.5s ease-in-out infinite' : undefined, position: 'relative', overflow: 'hidden' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff', lineHeight: 1 }}>{blood_group}</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sts.bg, border: `1px solid ${sts.border}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: sts.color }}>
                        {sts.pulse && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.2s infinite' }} />}
                        {sts.label}
                    </span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: size === 'large' ? 64 : 52, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{available_units}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>UNITS AVAILABLE</div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ height: '100%', background: sts.barColor, borderRadius: 3 }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{available_units}/{capacity}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>Updated {last_updated}</span>
                </div>
                {hovered && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                        Update Stock ↑
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {showModal && <StockUpdateModal onClose={() => { setShowModal(false); if (onUpdate) onUpdate(); }} preselected={blood_group} />}
            </AnimatePresence>
        </>
    );
}