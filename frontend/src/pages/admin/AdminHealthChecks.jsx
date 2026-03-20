import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';


function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

export default function AdminHealthChecks() {
     const [data, setData] = useState([]);

useEffect(() => {
    fetch("http://localhost:5000/health-checks")
        .then(res => res.json())
        .then(data => setData(data))
        .catch(err => console.error(err));
}, []);
const total = data.length;

const eligible = data.filter(
    d => d.eligibility_status === 'Eligible'
).length;

const deferred = data.filter(
    d => d.eligibility_status !== 'Eligible'
).length;

const thisMonth = data.filter(d => {
    const now = new Date();
    const date = new Date(d.check_date);

    return date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
}).length;
    return (
        <AdminLayout title="Health Checks" page="HEALTH CHECKS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
 { l: 'TOTAL CHECKS', v: total },
 { l: 'ELIGIBLE', v: eligible, c: '#22c55e' },
 { l: 'DEFERRED', v: deferred, c: 'var(--red)' },
 { l: 'THIS MONTH', v: thisMonth }
].map(({ l, v, c }, i) => (
                        <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: c || '#fff', lineHeight: 1 }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 80px 50px 80px 80px 80px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['ID', 'DONOR', 'BLOOD BANK', 'DATE', 'WT', 'HB', 'BP', 'RESULT'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {data.map(hc => {
    const ok = hc.eligibility_status === 'Eligible';
    return (
        <div key={hc.check_id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 80px 50px 80px 80px 80px', gap: 10, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>
                HC-{hc.check_id}
            </div>

            <div>
                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13, color: '#fff' }}>
                    {hc.donor}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                    DNR-{hc.donor_id}
                </div>
            </div>

            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>
                {hc.blood_group}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                {fmt(hc.check_date)}
            </div>

            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>
                {hc.weight}<span style={{ fontSize: 10, color: 'var(--text3)' }}>kg</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>
                    {hc.hemoglobin}
                </span>
                {hc.hemoglobin >= 12.5
                    ? <CheckCircle size={12} color="#22c55e" />
                    : <AlertCircle size={12} color="#f59e0b" />}
            </div>

            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>
                {hc.blood_pressure}
            </div>

            <span style={{
                background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(217,0,37,0.1)',
                border: `1px solid ${ok ? 'rgba(34,197,94,0.3)' : 'rgba(217,0,37,0.3)'}`,
                borderRadius: 100,
                padding: '2px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: ok ? '#22c55e' : 'var(--red)'
            }}>
                {hc.eligibility_status.toUpperCase()}
            </span>
        </div>
    );
})}
                </motion.div>
            </div>
        </AdminLayout>
    );
}
