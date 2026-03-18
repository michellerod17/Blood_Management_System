import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Building2, Package, TrendingUp
} from 'lucide-react';

import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

import AdminLayout from '../../components/admin/AdminLayout';
import { mockSystemStats } from '../../data/adminMockData';

export default function AdminDashboard() {

    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/admin/dashboard")
            .then(res => res.json())
            .then(data => setStats(data));

        fetch("http://localhost:5000/blood-requests")
            .then(res => res.json())
            .then(data => setRequests(data));

        fetch("http://localhost:5000/payments")
            .then(res => res.json())
            .then(data => setPayments(data));
    }, []);

    const s = stats
        ? { ...mockSystemStats, ...stats }
        : mockSystemStats;

    const fulfillRate = s.total_requests
        ? ((s.total_donations / s.total_requests) * 100).toFixed(1)
        : 0;

    const kpis = [
        { icon: Users, label: 'TOTAL DONORS', val: s.total_donors, sub: 'Across districts' },
        { icon: Building2, label: 'HOSPITALS', val: s.total_hospitals, sub: `${s.total_blood_banks} blood banks` },
        { icon: Package, label: 'UNITS IN SYSTEM', val: s.total_donations, sub: 'Live system data' },
        { icon: TrendingUp, label: 'FULFILLMENT RATE', val: `${fulfillRate}%`, sub: `${s.total_requests} requests` }
    ];

    // SAMPLE GRAPH DATA
    const activityData = [
        { day: "Mon", requests: 10 },
        { day: "Tue", requests: 15 },
        { day: "Wed", requests: 8 },
        { day: "Thu", requests: 20 },
        { day: "Fri", requests: 12 }
    ];

    return (
        <AdminLayout title="Dashboard" page="DASHBOARD">

            {/* KPI CARDS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: 20,
                marginBottom: 30
            }}>
                {kpis.map(({ icon: Icon, label, val, sub }) => (
                    <div key={label} style={{
                        background: '#0F0F17',
                        padding: 20,
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Icon size={18} />
                        <p style={{ fontSize: 12, color: '#aaa' }}>{label}</p>
                        <h2>{val}</h2>
                        <p style={{ fontSize: 12, color: '#777' }}>{sub}</p>
                    </div>
                ))}
            </div>

            {/* 🔥 GRAPH */}
            <div style={{
                background: '#0F0F17',
                padding: 20,
                borderRadius: 12,
                marginBottom: 20
            }}>
                <h3>System Activity</h3>

                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={activityData}>
                        <XAxis dataKey="day" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip />
                        <Line type="monotone" dataKey="requests" stroke="#4ade80" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* MAIN GRID */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: 20
            }}>

                {/* LEFT SIDE */}
                <div>

                    {/* REQUESTS */}
                    <div style={{
                        background: '#0F0F17',
                        padding: 20,
                        borderRadius: 12,
                        marginBottom: 20
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 15
                        }}>
                            <h3>Recent Requests</h3>

                            <button
                                onClick={() => navigate("/admin/approvals")}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #444',
                                    padding: '5px 10px',
                                    borderRadius: 6,
                                    color: '#aaa',
                                    cursor: 'pointer'
                                }}
                            >
                                View All
                            </button>
                        </div>

                        {requests.length === 0 ? (
                            <p>No requests in DB</p>
                        ) : (
                            [...requests]
                                .sort((a, b) =>
                                    new Date(b.created_at || b.createdAt) -
                                    new Date(a.created_at || a.createdAt)
                                )
                                .slice(0, 3)
                                .map(r => (
                                    <div key={r.request_id} style={{
                                        borderBottom: '1px solid #222',
                                        padding: '10px 0'
                                    }}>
                                        <strong>{r.hospital_name}</strong>
                                        <br />
                                        Units: {r.units_required}
                                        <br />
                                        Patient: {r.patient_name}
                                        <br />
                                        Bank: {r.bank_name}
                                        <br />

                                        Status: <span style={{
                                            color:
                                                r.status === "Approved" ? 'lightgreen' :
                                                r.status === "Rejected" ? 'red' :
                                                'orange'
                                        }}>
                                            {r.status}
                                        </span>
                                    </div>
                                ))
                        )}
                    </div>

                    {/* PAYMENTS */}
                    <div style={{
                        background: '#0F0F17',
                        padding: 20,
                        borderRadius: 12
                    }}>
                        <h3>Recent Payments</h3>

                        {payments.length === 0 ? (
                            <p>No payments</p>
                        ) : (
                            payments.slice(0, 3).map(p => (
                                <div key={p.payment_id} style={{
                                    borderBottom: '1px solid #222',
                                    padding: '10px 0'
                                }}>
                                    <strong>{p.payment_id}</strong>
                                    <br />
                                    Amount: ₹{p.amount}
                                    <br />
                                    Status: {p.payment_status}
                                </div>
                            ))
                        )}
                    </div>

                </div>

                {/* RIGHT SIDE (MAP) */}
                <div style={{
                    background: '#0F0F17',
                    padding: 20,
                    borderRadius: 12
                }}>
                    <h3>Kerala Network</h3>

                    <img
                        src="/kerala-map.png"
                        alt="Kerala Map"
                        style={{
                            width: '100%',
                            height: 300,
                            objectFit: 'contain'
                        }}
                    />

                    <p style={{ marginTop: 10, color: '#aaa' }}>
                        14 / 14 districts active
                    </p>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 15,
                        marginTop: 10,
                        fontSize: 12
                    }}>
                        <span style={{ color: 'lightgreen' }}>● Healthy</span>
                        <span style={{ color: 'orange' }}>● Low</span>
                        <span style={{ color: 'red' }}>● Critical</span>
                    </div>
                </div>

            </div>

        </AdminLayout>
    );
}