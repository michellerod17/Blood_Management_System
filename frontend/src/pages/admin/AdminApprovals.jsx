import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Check, X, FileText } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/hospital/StatusBadge';


function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

export default function AdminApprovals() {
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('Incomplete documentation');
    const [rejectNotes, setRejectNotes] = useState('');
    const [toast, setToast] = useState(null);
    const [approvals, setApprovals] = useState([]);
useEffect(() => {
    fetch("http://localhost:5000/blood-requests")
        .then(res => res.json())
        .then(data => {

            const mapped = data
    .filter(r => r.status === "pending")   // ✅ ONLY PENDING
    .map(r => ({
        id: r.request_id,
        type: "Hospital",
        org_name: r.hospital_name,
        city: "Kerala",
        submitted: r.request_date,
        ref: `REQ-${r.request_id}`,
        contact: r.patient_name,
        status: "Pending"
    }));

            setApprovals(mapped);
        });
}, []);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
   const handleApprove = async (id) => {
    await fetch(`http://localhost:5000/blood-requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" })
    });

    setApprovals(a => a.filter(x => x.id !== id));
    showToast('Application approved successfully');
};
   const handleReject = async () => {
    await fetch(`http://localhost:5000/blood-requests/${rejectModal}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" })
    });

    setApprovals(a => a.filter(x => x.id !== rejectModal));
    setRejectModal(null);
    showToast('Application rejected.', 'error');
};

    const filtered = approvals.filter(a => {
        if (typeFilter !== 'All' && a.type !== typeFilter) return false;
        if (statusFilter !== 'All' && a.status !== statusFilter) return false;
        if (search && !a.org_name.toLowerCase().includes(search.toLowerCase()) && !a.ref.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const pendingC = approvals.filter(a => a.status === 'Pending').length;
    const reviewC = approvals.filter(a => a.status === 'Approved').length;
    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' };

    return (
        <AdminLayout title="Pending Approvals" page="APPROVALS">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
                        style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 999, background: '#161622', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(217,0,37,0.3)'}`, borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                        {toast.type === 'success' ? <Check size={16} color="#22c55e" /> : <X size={16} color="var(--red)" />}
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {rejectModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget) setRejectModal(null); }}>
                        <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 460, position: 'relative' }}>
                            <button onClick={() => setRejectModal(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 20 }}>Reject Application</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>REASON</div>
                            {['Incomplete documentation', 'Invalid license number', 'Duplicate application', 'Other'].map(r => (
                                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${rejectReason === r ? 'var(--red)' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {rejectReason === r && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />}
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }} onClick={() => setRejectReason(r)}>{r}</span>
                                </label>
                            ))}
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 16, marginBottom: 8 }}>ADDITIONAL NOTES</div>
                            <textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} placeholder="Add notes..." rows={3} style={{ ...iS, resize: 'none', marginBottom: 20 }} />
                            <button onClick={handleReject} style={{ width: '100%', background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff' }}>Send Rejection →</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    {[{ l: 'PENDING', v: pendingC, c: 'var(--red)', pulse: true }, { l: 'UNDER REVIEW', v: reviewC, c: '#f59e0b' }, { l: 'APPROVED TODAY', v: 4, c: '#22c55e' }].map(({ l, v, c, pulse }, i) => (
                        <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: c, lineHeight: 1, animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none' }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {['All', 'Hospital', 'Blood Bank'].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)} style={{ background: typeFilter === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${typeFilter === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: typeFilter === t ? '#fff' : 'var(--text2)' }}>{t}</button>
                    ))}
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                    {['All', 'Pending', 'Under Review'].map(t => (
                        <button key={t} onClick={() => setStatusFilter(t)} style={{ background: statusFilter === t ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${statusFilter === t ? 'rgba(217,0,37,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: statusFilter === t ? 'var(--red)' : 'var(--text3)' }}>{t}</button>
                    ))}
                    <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                        <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search org name, ref..." style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px 9px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                </div>

                {/* Approval Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <AnimatePresence>
                        {filtered.map(a => (
                            <motion.div key={a.id} layout exit={{ scale: 0.9, opacity: 0 }}
                                style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28, borderLeft: a.status === 'Pending' ? '3px solid #D90025' : '3px solid #f59e0b' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                    <div>
                                        <span style={{ background: a.type === 'Hospital' ? 'rgba(59,130,246,0.1)' : 'rgba(217,0,37,0.1)', border: `1px solid ${a.type === 'Hospital' ? 'rgba(59,130,246,0.3)' : 'rgba(217,0,37,0.3)'}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: a.type === 'Hospital' ? '#3b82f6' : 'var(--red)' }}>{a.type}</span>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginTop: 10 }}>{a.org_name}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{a.city}, Kerala</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{fmt(a.submitted)}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{a.ref}</div>
                                    </div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>{a.contact}</div>
                                <StatusBadge status={a.status} />

                                {/* Expanded details */}
                                <div style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginTop: 16 }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>REGISTRATION DETAILS</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {(a.type === 'Hospital' ? [['Beds', '250'], ['Departments', '12'], ['License', 'KL-MED-2024']] : [['Capacity', '800 units'], ['NACO', 'NACO-KL-2024-0045'], ['Blood Types', 'All 8']]).map(([l, v]) => (
                                            <div key={l}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{l}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{v}</div></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Documents */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    {['Registration Certificate', 'License Document'].map(doc => (
                                        <div key={doc} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
                                            <FileText size={12} color="var(--text3)" />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{doc}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <button onClick={() => handleApprove(a.id)} style={{ flex: 1, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#22c55e' }}>Approve ✓</button>
                                    <button onClick={() => setRejectModal(a.id)} style={{ flex: 1, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 10, padding: '10px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>Reject ✗</button>
                                    <button style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>Review →</button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </AdminLayout>
    );
}