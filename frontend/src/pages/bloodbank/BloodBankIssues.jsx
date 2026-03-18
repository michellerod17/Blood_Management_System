// ── BloodBankIssues.jsx ──────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import BloodBankLayout from '../../components/bloodbank/BloodBankLayout';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import { getIssues } from '../../api/bloodBankApi';

function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

function IssueRow({ issue }) {
    const [open, setOpen] = useState(false);
    const payStatus = issue.payment_status || '—';
    const payColor = payStatus === 'Paid' ? '#22c55e' : payStatus === 'Pending' ? '#f59e0b' : 'var(--text3)';
    return (
        <>
            <div onClick={() => setOpen(v => !v)}
                style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr 90px 70px 120px 110px 28px', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>ISS-{String(issue.issue_id).padStart(3,'0')}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>REQ-{String(issue.request_id).padStart(3,'0')}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{issue.hospital_name}</div>
                <BloodGroupBadge group={issue.blood_group} small />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: '#fff', lineHeight: 1 }}>{issue.units_issued}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(issue.issue_date)}</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: payColor, background: 'rgba(0,0,0,0.3)', border: `1px solid ${payColor}40`, borderRadius: 100, padding: '2px 8px', display: 'inline-block' }}>{payStatus.toUpperCase()}</span>
                <div>{open ? <ChevronUp size={13} color="var(--text3)" /> : <ChevronDown size={13} color="var(--text3)" />}</div>
            </div>
            {open && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(217,0,37,0.03)', borderLeft: '3px solid rgba(217,0,37,0.3)', paddingLeft: 16, paddingTop: 12, paddingBottom: 12, marginBottom: 4, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>REQUEST DETAILS</div>
                            {[['Hospital', issue.hospital_name], ['Units Required', issue.units_required], ['Units Issued', issue.units_issued]].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{l}</span><span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{v}</span></div>
                            ))}
                        </div>
                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>STOCK IMPACT</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>— {issue.units_issued} units issued</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#22c55e' }}>Stock deducted from {issue.blood_group}</div>
                        </div>
                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>PAYMENT</div>
                            {issue.payment_id
                                ? [['Payment ID', `PAY-${String(issue.payment_id).padStart(3,'0')}`], ['Amount', '₹' + (issue.amount || 0)], ['Status', issue.payment_status]].map(([l, v]) => (
                                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{l}</span><span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{v}</span></div>
                                ))
                                : <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>No payment record</div>}
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}

export default function BloodBankIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getIssues()
            .then(data => { setIssues(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    if (loading) return <BloodBankLayout title="Blood Issues" page="ISSUES"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 13 }}>Loading issues...</div></BloodBankLayout>;
    if (error) return <BloodBankLayout title="Blood Issues" page="ISSUES"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 13 }}>Error: {error}</div></BloodBankLayout>;

    const totalUnits = issues.reduce((s, i) => s + i.units_issued, 0);

    return (
        <BloodBankLayout title="Blood Issues" page="ISSUES">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[{ label: 'TOTAL ISSUES', val: String(issues.length), color: '#fff' }, { label: 'UNITS ISSUED', val: String(totalUnits), color: 'var(--red)' }, { label: 'THIS MONTH', val: String(issues.length), color: '#fff' }, { label: 'AVG ISSUE TIME', val: '6 min', color: '#22c55e' }].map(({ label, val, color }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color, lineHeight: 1 }}>{val}</div>
                        </motion.div>
                    ))}
                </div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Blood Issue Records</div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}><Download size={13} /> Export</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr 90px 70px 120px 110px 28px', gap: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['ISSUE ID', 'REQUEST ID', 'HOSPITAL', 'BLOOD GRP', 'UNITS', 'DATE', 'PAYMENT', ''].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {issues.length === 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', padding: '20px 0' }}>No issues recorded yet.</div>}
                    {issues.map(issue => <IssueRow key={issue.issue_id} issue={issue} />)}
                </motion.div>
            </div>
        </BloodBankLayout>
    );
}
