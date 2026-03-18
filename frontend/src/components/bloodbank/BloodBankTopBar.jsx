import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, Droplets } from 'lucide-react';
import RecordDonationModal from './RecordDonationModal';
import { getDashboard } from '../../api/bloodBankApi';

export default function BloodBankTopBar({ title, page }) {
    const [showModal, setShowModal] = useState(false);
    const [totalUnits, setTotalUnits] = useState(0);
    const [emergencyCount, setEmergencyCount] = useState(0);

    useEffect(() => {
        getDashboard().then(data => {
            const units = (data.stock || []).reduce((s, b) => s + b.available_units, 0);
            const emergency = (data.requests || []).filter(r => r.priority === 'Emergency' && r.status === 'Pending').length;
            setTotalUnits(units);
            setEmergencyCount(emergency);
        }).catch(() => {});
    }, []);

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 240, right: 0, height: 64, background: 'rgba(7,7,11,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 30 }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff', lineHeight: 1.2 }}>{title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                        HEM∆ › BLOOD BANK › {(page || title).toUpperCase()}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button onClick={() => setShowModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--red)', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 13, color: '#fff', boxShadow: '0 2px 12px rgba(217,0,37,0.4)', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(217,0,37,0.6)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(217,0,37,0.4)'}
                    >
                        <Droplets size={14} /> Record Donation
                    </button>

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>{totalUnits} UNITS LIVE</span>
                    </div>

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />

                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}>
                        <Bell size={18} color="var(--text2)" />
                        {emergencyCount > 0 && (
                            <span style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, background: 'var(--red)', borderRadius: '50%', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{emergencyCount}</span>
                        )}
                    </button>

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--red)', letterSpacing: 1 }}>BB</div>
                        <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>Suresh</span>
                        <ChevronDown size={14} color="var(--text3)" />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showModal && <RecordDonationModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </>
    );
}
