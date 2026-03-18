const API_URL = '/api';

export const fetchDonors = async () => {
    const res = await fetch(`${API_URL}/donors`);
    if (!res.ok) throw new Error('Failed to fetch donors');
    return res.json();
};

export const fetchBloodStock = async () => {
    const res = await fetch(`${API_URL}/blood-bank/stock`);
    if (!res.ok) throw new Error('Failed to fetch blood stock');
    return res.json();
};

export const fetchBloodRequests = async () => {
    const res = await fetch(`${API_URL}/blood-requests`);
    if (!res.ok) throw new Error('Failed to fetch blood requests');
    return res.json();
};

export const fetchDonationsByDonor = async (donorId) => {
    const res = await fetch(`${API_URL}/donations/donor/${donorId}`);
    if (!res.ok) throw new Error('Failed to fetch donations');
    return res.json();
};

export const fetchHealthChecksByDonor = async (donorId) => {
    const res = await fetch(`${API_URL}/health-checks/donor/${donorId}`);
    if (!res.ok) throw new Error('Failed to fetch health checks');
    return res.json();
};
