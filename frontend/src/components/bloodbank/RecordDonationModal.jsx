import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { getDonors, recordDonation } from '../../api/bloodBankApi';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
function initials(name) { return name.split(' ').slice(0, 2).map(n => n[0]).join(''); }

export default function RecordDonationModal({ onClose, donors: propDonors }) {
    const [donorId, setDonorId] = useState('');
    const [weight, setWeight] = useState('');
    const [hemo, setHemo] = useState('');
    const [bp, setBp] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [qty, setQty] = useState(450);
    const [donDate, setDonDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState(null);
    const [donors, setDonors] = useState(propDonors || []);

    useState(() => {
        if (!propDonors || propDonors.length === 0) {
            getDonors().then(setDonors).catch(() => {});
        }
    });

    const donor = donors.find(d => String(d.donor_id) === String(donorId));
    const eligible = parseFloat(hemo) >= 12.5 && parseFloat(weight) >= 50;
    const checkedEligibility = hemo !== '' && weight !== '';

    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 16 };

    const handleSubmit = () => {
        if (!donorId || !bloodGroup) return setErr('Select a donor and blood group');
        if (checkedEligibility && !eligible) return setErr('Donor is not eligible');
        setLoading(true); setErr(null);
        recordDonation({
            donor_id: parseInt(donorId),
            check_id: null,
            donation_date: donDate,
            quantity: qty,
        }).then(() => { setLoading(false); setDone(true); })
          .catch(e => { setLoading(false); setErr(e.message); });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Check size={32} color="#22c55e" />
                        </motion.div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>Donation Recorded!</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Stock updated automatically.</div>
                        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Close</button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 6 }}>Record New Donation</div>
                        {err && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>{err}</div>}

                        <label style={lS}>SELECT DONOR</label>
                        <select value={donorId} onChange={e => { setDonorId(e.target.value); const d = donors.find(x => String(x.donor_id) === e.target.value); if (d) setBloodGroup(d.blood_group); }}
                            style={{ ...iS, cursor: 'pointer' }}>
                            <option value="" style={{ background: '#0F0F17' }}>Select donor...</option>
                            {donors.map(d => <option key={d.donor_id} value={d.donor_id} style={{ background: '#0F0F17' }}>{d.name} · {d.blood_group} · {d.status}</option>)}
                        </select>

                        {donor && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                {[['Donor', donor.name], ['Blood Group', donor.blood_group], ['Last Donation', donor.last_donation_date || '—']].map(([l, v]) => (
                                    <div key={l}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}>{l}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{v}</div></div>
                                ))}
                            </motion.div>
                        )}

                        <div style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>HEALTH CHECK (REQUIRED)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={{ ...lS, marginTop: 0 }}>WEIGHT (KG)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65" style={iS} /></div>
                            <div><label style={{ ...lS, marginTop: 0 }}>HEMOGLOBIN (G/DL)</label><input type="number" step="0.1" value={hemo} onChange={e => setHemo(e.target.value)} placeholder="e.g. 13.5" style={iS} /></div>
                            <div><label style={{ ...lS, marginTop: 0 }}>BLOOD PRESSURE</label><input value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80" style={iS} /></div>
                            <div><label style={{ ...lS, marginTop: 0 }}>ELIGIBILITY</label>
                                <div style={{ height: 46, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A12', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: checkedEligibility ? (eligible ? '#22c55e' : 'var(--red)') : 'var(--text3)' }}>
                                    {!checkedEligibility ? '—' : eligible ? '✓ ELIGIBLE' : '✕ DEFERRED'}
                                </div>
                            </div>
                        </div>

                        <label style={lS}>BLOOD GROUP</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {BLOOD_TYPES.map(b => <button key={b} onClick={() => setBloodGroup(b)} style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer', background: bloodGroup === b ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${bloodGroup === b ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 12, color: '#fff' }}>{b}</button>)}
                        </div>

                        <label style={lS}>QUANTITY (ML)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button onClick={() => setQty(q => Math.max(100, q - 50))} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 16 }}>−</button>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff', minWidth: 60, textAlign: 'center' }}>{qty}</div>
                            <button onClick={() => setQty(q => Math.min(450, q + 50))} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 16 }}>+</button>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>ml</span>
                        </div>

                        <label style={lS}>DONATION DATE</label>
                        <input type="date" value={donDate} onChange={e => setDonDate(e.target.value)} style={iS} />

                        <label style={lS}>NOTES (OPTIONAL)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2}
                            style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 24 }} />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Cancel</button>
                            <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', opacity: loading ? 0.5 : 1 }}>
                                {loading ? 'Recording...' : 'Record Donation →'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}