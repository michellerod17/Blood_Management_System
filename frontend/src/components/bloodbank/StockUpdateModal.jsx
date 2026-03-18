import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { getStock, updateStock } from '../../api/bloodBankApi';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function StockUpdateModal({ onClose, preselected }) {
    const [group, setGroup] = useState(preselected || '');
    const [newUnits, setNewUnits] = useState('');
    const [action, setAction] = useState('add');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState(null);
    const [stock, setStock] = useState([]);

    useEffect(() => {
        getStock().then(setStock).catch(() => {});
    }, []);

    const currentStock = stock.find(s => s.blood_group === group);
    const currentUnits = currentStock?.available_units || 0;

    const handleSubmit = () => {
        if (!group || !newUnits) return;
        setLoading(true); setErr(null);
        updateStock(group, parseInt(newUnits), action)
            .then(() => { setLoading(false); setDone(true); })
            .catch(e => { setLoading(false); setErr(e.message); });
    };

    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 18 };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 480, position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Check size={28} color="#22c55e" />
                        </motion.div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>Stock Updated!</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#22c55e', marginBottom: 8 }}>Database updated successfully.</div>
                        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', marginTop: 16 }}>Close</button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 4 }}>Update Blood Stock</div>
                        {err && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>{err}</div>}

                        <label style={lS}>BLOOD GROUP</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {BLOOD_TYPES.map(b => (
                                <button key={b} onClick={() => setGroup(b)} style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer', background: group === b ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${group === b ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 12, color: '#fff' }}>{b}</button>
                            ))}
                        </div>

                        {group && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
                                    <div style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>CURRENT STOCK</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#fff', lineHeight: 1 }}>{currentUnits}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>units</div>
                                    </div>
                                    <div>
                                        <label style={{ ...lS, marginTop: 0 }}>UNIT COUNT TO {action === 'add' ? 'ADD' : 'REMOVE'}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button onClick={() => setNewUnits(v => Math.max(0, (parseInt(v) || 0) - 1).toString())} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 18 }}>−</button>
                                            <input type="number" value={newUnits} onChange={e => setNewUnits(e.target.value)} placeholder="0" style={{ ...iS, textAlign: 'center', flex: 1 }} />
                                            <button onClick={() => setNewUnits(v => ((parseInt(v) || 0) + 1).toString())} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 18 }}>+</button>
                                        </div>
                                    </div>
                                </div>

                                <label style={lS}>ACTION TYPE</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {[['add', '+ Add Units'], ['remove', '− Remove Units']].map(([k, l]) => (
                                        <div key={k} onClick={() => setAction(k)} style={{ padding: '14px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', background: action === k ? 'rgba(217,0,37,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${action === k ? 'rgba(217,0,37,0.35)' : 'rgba(255,255,255,0.08)'}`, fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: action === k ? 'var(--red)' : 'var(--text2)', transition: 'all 0.15s' }}>
                                            {l}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <label style={lS}>NOTES (AUDIT TRAIL)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for update..." rows={2}
                            style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 24 }} />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Cancel</button>
                            <button onClick={handleSubmit} disabled={!group || loading || !newUnits} style={{ flex: 2, background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', opacity: (!group || loading || !newUnits) ? 0.5 : 1 }}>
                                {loading ? 'Updating...' : 'Update Stock →'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
