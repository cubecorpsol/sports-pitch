import React, { useState, useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3004' : 'https://sports-pitch-2-ootl.onrender.com');
const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL || API_BASE_URL;

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              An error occurred while loading the application. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details style={{ marginBottom: '20px' }}>
                <summary style={{ cursor: 'pointer', color: '#007bff' }}>Error Details</summary>
                <pre style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  marginTop: '10px'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// API Service
const api = {
  getAllBookings: async () => {
    console.log('Fetching all bookings from:', `${API_BASE_URL}/api/bookings`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },
  updateBookingStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },
  updateBookingPaymentStatus: async (id, paymentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating booking payment status:', error);
      throw error;
    }
  },
  deleteBooking: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },
  // Payment API
  getCustomersWithPayments: async (filter, month) => {
    try {
      const url = `${PAYMENT_API_URL}/api/payment/customers?filter=${filter || ''}&month=${month || ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching customers with payments:', error);
      throw error;
    }
  },
  createOrUpdateCustomer: async (customerData) => {
    try {
      const url = `${API_BASE_URL}/api/payment/customer`;
      console.log('Creating customer at URL:', url);
      console.log('Customer data:', customerData);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
        mode: 'cors',
        cache: 'no-cache',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      throw error;
    }
  },
  updatePaymentStatus: async (customerId, status, month) => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/payment/payment/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, status, month }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },
  createMonthlyRecords: async (month) => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/payment/payment/create-monthly-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating monthly records:', error);
      throw error;
    }
  },
  sendReminder: async (customerId, month, phone) => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/payment/payment/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, month, phone }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  },
  deleteCustomer: async (customerId) => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/payment/customer/${customerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },
  updatePaymentAmount: async (customerId, amount, month) => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/payment/payment/update-amount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, amount, month }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating payment amount:', error);
      throw error;
    }
  },
  getPaymentStats: async () => {
    try {
      const url = `${PAYMENT_API_URL}/api/payment/payment/stats`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },
  getRevenueStats: async (month, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const url = `${PAYMENT_API_URL}/api/payment/payment/revenue-stats?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  },
  recordPayment: async (paymentData) => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/payment/payment/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },
  getPaymentHistory: async (customerId) => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/payment/payment/history/${customerId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },
  // Sport Fees API
  getAllSportFees: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sport-fees`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sport fees:', error);
      throw error;
    }
  },
  getSportFee: async (sport) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sport-fees/${sport}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sport fee:', error);
      throw error;
    }
  },
  updateSportFee: async (sport, monthlyFee) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sport-fees/${sport}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyFee }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating sport fee:', error);
      throw error;
    }
  },
  // WhatsApp API
  sendFeeReminder: async (customerId, month, year) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, month, year }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending fee reminder:', error);
      throw error;
    }
  },
  getBulkReminders: async (month, year) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/bulk-reminders?month=${month}&year=${year}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bulk reminders:', error);
      throw error;
    }
  },
  sendPaymentSuccessNotification: async (customerId, amount, month, year) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/payment-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, amount, month, year }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending payment success notification:', error);
      throw error;
    }
  },
  sendPendingPaymentNotification: async (customerId, month, year) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/pending-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, month, year }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending pending payment notification:', error);
      throw error;
    }
  },
  sendPartialPaymentNotification: async (customerId, pendingAmount, month, year) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/partial-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, pendingAmount, month, year }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending partial payment notification:', error);
      throw error;
    }
  },
  // Announcements API
  getAnnouncements: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },
  createAnnouncement: async (announcementData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },
  updateAnnouncement: async (id, announcementData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },
  deleteAnnouncement: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },
  // Reports API
  getMonthlyCollectionReport: async (month, year) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      const url = `${PAYMENT_API_URL}/api/payment/reports/monthly-collection?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly collection report:', error);
      throw error;
    }
  },
  getPendingFeeReport: async () => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/payment/reports/pending-fees`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending fee report:', error);
      throw error;
    }
  },
  getSportWiseRevenueReport: async (month, year) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      const url = `${PAYMENT_API_URL}/api/payment/reports/sport-wise-revenue?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sport-wise revenue report:', error);
      throw error;
    }
  },
};

// Login Component
function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.username === 'sportspitch' && credentials.password === 'new2580') {
      localStorage.setItem('adminAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use sportspitch / new2580');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      
      <div className="admin-login-form" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '50px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '450px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Sports Booking Admin
          </h1>
          <p style={{ color: '#666', marginTop: '10px', fontSize: '14px' }}>Welcome back! Please login to continue</p>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            borderLeft: '4px solid #c33'
          }}>{error}</div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600', fontSize: '14px' }}>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="admin-input"
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              placeholder="Enter username"
              required
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600', fontSize: '14px' }}>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="admin-input"
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              placeholder="Enter password"
              required
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Login
          </button>
        </form>
        
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalPaymentsReceived: 0
  });
  const [paymentStats, setPaymentStats] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    totalAmount: 0,
    monthlyStats: []
  });
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    currentMonthRevenue: 0,
    currentYearRevenue: 0,
    allTimeRevenue: 0,
    monthlyRevenue: [],
    yearlyRevenue: [],
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchPaymentStats();
    fetchRevenueStats();
    const interval = setInterval(() => {
      fetchStats();
      fetchPaymentStats();
      fetchRevenueStats();
    }, 5000); // Auto-update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Listen for payment updates from payment section
  useEffect(() => {
    const handlePaymentUpdate = () => {
      console.log('Payment update event received, refreshing stats');
      fetchPaymentStats();
      fetchRevenueStats();
    };
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    return () => window.removeEventListener('paymentUpdated', handlePaymentUpdate);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.getAllBookings();
      if (response?.success && response?.bookings) {
        const bookings = response.bookings;
        setStats({
          totalBookings: bookings?.length || 0,
          pendingBookings: bookings?.filter(b => b?.status === 'Pending')?.length || 0,
          approvedBookings: bookings?.filter(b => b?.status === 'Approved')?.length || 0,
          totalPaymentsReceived: bookings?.filter(b => b?.paymentStatus === 'Paid')?.reduce((sum, b) => sum + (b?.amount || 500), 0) || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await api.getPaymentStats();
      if (response?.success && response?.stats) {
        setPaymentStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const response = await api.getRevenueStats(null);
      if (response?.success && response?.stats) {
        setRevenueStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    }
  };

  const downloadToGoogleSheets = async () => {
    try {
      const response = await api.getAllBookings();
      if (response?.success && response?.bookings) {
        const bookings = response.bookings;
        
        // Create CSV content
        const headers = ['Customer Name', 'Sport', 'Date', 'Time', 'Status', 'Payment Status', 'Amount'];
        const rows = bookings?.map(b => [
          b?.name || '',
          b?.sport || '',
          b?.date || '',
          b?.time || '',
          b?.status || '',
          b?.paymentStatus || '',
          b?.amount || 500
        ]) || [];
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/login');
  };

  if (loading) return <div className="admin-container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="admin-container" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header onLogout={handleLogout} />
      <Nav navigate={navigate} currentPage="dashboard" />
      <main className="admin-container" style={{ padding: '40px' }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Dashboard Overview</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={downloadToGoogleSheets}
              className="admin-button"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
              }}
            >
              📥 Download to Google Sheets
            </button>
          </div>
        </div>
        
        {/* Booking Stats */}
        <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <StatCard title="Total Bookings" value={stats.totalBookings} color="#007bff" />
          <StatCard title="Pending Bookings" value={stats.pendingBookings} color="#ffc107" />
          <StatCard title="Approved Bookings" value={stats.approvedBookings} color="#28a745" />
        </div>

      </main>
    </div>
  );
}

// Booking Management Component
function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000); // Auto-update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings from API_BASE_URL:', API_BASE_URL);
      const response = await api.getAllBookings();
      console.log('Bookings response:', response);
      if (response?.success && response?.bookings) {
        setBookings(response.bookings);
        console.log('Bookings updated successfully, count:', response.bookings.length);
      } else {
        console.warn('Bookings response invalid:', response);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      console.error('API_BASE_URL being used:', API_BASE_URL);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await api.updateBookingStatus(id, 'Approved');
      if (response.success) {
        fetchBookings();
        // Open WhatsApp if URL is returned
        if (response.whatsappUrl) {
          window.open(response.whatsappUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error approving booking');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await api.updateBookingStatus(id, 'Rejected');
      if (response.success) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error rejecting booking');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.deleteBooking(id);
      if (response.success) {
        fetchBookings();
        // Trigger dashboard refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('paymentUpdated'));
      }
    } catch (error) {
      console.error('Error deleting booking');
    }
  };

  const downloadBookingsToGoogleSheets = async () => {
    try {
      const response = await api.getAllBookings();
      if (response?.success && response?.bookings) {
        const bookings = response.bookings;
        
        // Create CSV content
        const headers = ['Customer Name', 'Sport', 'Date', 'Time', 'Status', 'Payment Status', 'Amount'];
        const rows = bookings?.map(b => [
          b?.name || '',
          b?.sport || '',
          b?.date || '',
          b?.time || '',
          b?.status || '',
          b?.paymentStatus || '',
          b?.amount || 500
        ]) || [];
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookings_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading bookings:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/login');
  };

  if (loading) return <div className="admin-container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="admin-container" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header onLogout={handleLogout} />
      <Nav navigate={navigate} currentPage="bookings" />
      <main className="admin-container" style={{ padding: '40px' }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Booking Management</h2>
          <button
            onClick={downloadBookingsToGoogleSheets}
            className="admin-button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
            }}
          >
            📥 Download to Google Sheets
          </button>
        </div>
        {bookings.length === 0 ? (
          <div className="admin-card" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            No bookings found
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-container" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Customer Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Sport</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Time</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}>{booking.name}</td>
                      <td style={{ padding: '15px' }}>{booking.sport}</td>
                      <td style={{ padding: '15px' }}>{booking.date}</td>
                      <td style={{ padding: '15px' }}>{booking.time}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          backgroundColor: booking.status === 'Approved' ? '#28a745' : booking.status === 'Rejected' ? '#dc3545' : '#ffc107',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>{booking.status}</span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {booking.status === 'Pending' && (
                            <>
                              <button onClick={() => handleApprove(booking._id)} style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>Approve</button>
                              <button onClick={() => handleReject(booking._id)} style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>Reject</button>
                            </>
                          )}
                          <button onClick={() => handleDelete(booking._id)} style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="admin-booking-cards">
              {bookings.map((booking) => (
                <div key={booking._id} className="admin-booking-card">
                  <div className="admin-booking-card-header">
                    <div className="admin-booking-card-customer">{booking.name}</div>
                    <div 
                      className="admin-booking-card-status"
                      style={{
                        backgroundColor: booking.status === 'Approved' ? '#28a745' : booking.status === 'Rejected' ? '#dc3545' : '#ffc107'
                      }}
                    >
                      {booking.status}
                    </div>
                  </div>
                  <div className="admin-booking-card-details">
                    <div className="admin-booking-card-detail">
                      <span className="admin-booking-card-label">Sport:</span>
                      <span className="admin-booking-card-value">{booking.sport}</span>
                    </div>
                    <div className="admin-booking-card-detail">
                      <span className="admin-booking-card-label">Date:</span>
                      <span className="admin-booking-card-value">{booking.date}</span>
                    </div>
                    <div className="admin-booking-card-detail">
                      <span className="admin-booking-card-label">Time:</span>
                      <span className="admin-booking-card-value">{booking.time}</span>
                    </div>
                    {booking.phone && (
                      <div className="admin-booking-card-detail">
                        <span className="admin-booking-card-label">Phone:</span>
                        <span className="admin-booking-card-value">{booking.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="admin-booking-card-actions">
                    {booking.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(booking._id)}
                          style={{ backgroundColor: '#28a745' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(booking._id)}
                          style={{ backgroundColor: '#dc3545' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDelete(booking._id)}
                      style={{ backgroundColor: '#6c757d' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Fee Collection Component
function FeeCollection() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ totalCustomers: 0, totalPaid: 0, totalUnpaid: 0, month: 0, year: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showReceivePayment, setShowReceivePayment] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', sports: [], batch: '', monthlyFee: 500 });
  const [sportFees, setSportFees] = useState({});
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchSportFees();
  }, [filter, selectedMonth]);

  const fetchSportFees = async () => {
    try {
      const response = await api.getAllSportFees();
      if (response?.success && response?.sportFees) {
        const feesMap = {};
        response.sportFees.forEach(fee => {
          feesMap[fee.sport] = fee.monthlyFee;
        });
        setSportFees(feesMap);
      }
    } catch (error) {
      console.error('Error fetching sport fees:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.getCustomersWithPayments(filter, selectedMonth);
      if (response?.success && response?.customers) {
        setCustomers(response.customers);
        setStats(response?.stats || { totalCustomers: 0, totalPaid: 0, totalUnpaid: 0, month: 0, year: 0 });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    // Update local state immediately for instant feedback
    setCustomers(customers.map(c => c._id === customerId ? { ...c, paymentStatus: newStatus } : c));
    try {
      const response = await api.updatePaymentStatus(customerId, newStatus, selectedMonth);
      if (response.success) {
        fetchCustomers();
        // Trigger dashboard refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('paymentUpdated'));
      } else {
        // Revert if API call fails
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error updating payment status');
      fetchCustomers();
    }
  };

  const handleUpdateAmount = async (customerId, amount) => {
    try {
      const response = await api.updatePaymentAmount(customerId, amount, selectedMonth);
      if (response.success) {
        fetchCustomers();
        // Trigger dashboard refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('paymentUpdated'));
      }
    } catch (error) {
      console.error('Error updating amount');
    }
  };

  const handleUpdateMonthlyFee = async (customerId, monthlyFee) => {
    try {
      const response = await api.updateCustomer(customerId, { monthlyFee });
      if (response.success) {
        fetchCustomers();
      } else {
        alert('Error updating monthly fee: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating monthly fee:', error);
      alert('Error updating monthly fee: ' + error.message);
    }
  };

  const handleSendReminder = async (customerId, phone, paymentStatus, amountPaid) => {
    try {
      let response;
      const currentYear = new Date().getFullYear();

      if (paymentStatus === 'Unpaid' || amountPaid === 0) {
        // No payment made - send pending payment notification
        response = await api.sendPendingPaymentNotification(customerId, selectedMonth, currentYear);
      } else {
        // Partial payment - send fee reminder with pending amount
        response = await api.sendFeeReminder(customerId, selectedMonth, currentYear);
      }

      if (response.success && response.whatsappUrl) {
        window.open(response.whatsappUrl, '_blank');
      } else if (response.success && !response.reminderSent) {
        alert('No outstanding balance to remind');
      } else {
        alert('Error sending reminder: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error sending reminder: ' + error.message);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', newCustomer);
    
    // Validate form data
    if (!newCustomer.name || !newCustomer.name.trim()) {
      alert('Please enter a valid name');
      return;
    }
    if (!newCustomer.phone || !newCustomer.phone.trim()) {
      alert('Please enter a valid phone number');
      return;
    }
    if (!newCustomer.sports || newCustomer.sports.length === 0) {
      alert('Please select a sport');
      return;
    }
    
    try {
      console.log('Sending API request with:', newCustomer);
      const response = await api.createOrUpdateCustomer(newCustomer);
      console.log('API response:', response);
      
      if (response.success) {
        console.log('Customer added successfully');
        setShowAddCustomer(false);
        setNewCustomer({ name: '', phone: '', sports: [], batch: '', monthlyFee: 500 });
        fetchCustomers();
        alert('Player added successfully!');
      } else {
        console.error('API returned error:', response);
        alert('Error adding player: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error adding player: ' + error.message);
    }
  };

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    console.log('handleReceivePayment called');
    console.log('selectedCustomer:', selectedCustomer);
    console.log('paymentAmount:', paymentAmount);
    console.log('paymentMethod:', paymentMethod);
    console.log('paymentRemarks:', paymentRemarks);
    console.log('selectedMonth:', selectedMonth);
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    
    if (!selectedCustomer || !selectedCustomer._id) {
      alert('No customer selected');
      return;
    }
    
    try {
      console.log('Calling api.recordPayment with:', {
        customerId: selectedCustomer._id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        remarks: paymentRemarks,
        month: selectedMonth
      });
      
      const response = await api.recordPayment({
        customerId: selectedCustomer._id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        remarks: paymentRemarks,
        month: selectedMonth
      });
      
      console.log('Response from recordPayment:', response);

      if (response.success) {
        const paymentStatus = response.paymentStatus;
        const totalAmountPaid = response.totalAmountPaid;
        const balance = response.balance;
        const monthlyFee = selectedCustomer.monthlyFee || 500;

        // Send WhatsApp notification based on payment status
        if (paymentStatus === 'Paid') {
          // Full payment - send success notification
          try {
            const whatsappResponse = await api.sendPaymentSuccessNotification(
              selectedCustomer._id,
              totalAmountPaid,
              selectedMonth,
              new Date().getFullYear()
            );
            if (whatsappResponse.success && whatsappResponse.whatsappUrl) {
              window.open(whatsappResponse.whatsappUrl, '_blank');
            }
          } catch (error) {
            console.error('Error sending payment success notification:', error);
          }
        } else if (paymentStatus === 'Partially Paid') {
          // Partial payment - send partial payment notification
          try {
            const whatsappResponse = await api.sendPartialPaymentNotification(
              selectedCustomer._id,
              balance,
              selectedMonth,
              new Date().getFullYear()
            );
            if (whatsappResponse.success && whatsappResponse.whatsappUrl) {
              window.open(whatsappResponse.whatsappUrl, '_blank');
            }
          } catch (error) {
            console.error('Error sending partial payment notification:', error);
          }
        }

        setShowReceivePayment(false);
        setPaymentAmount('');
        setPaymentRemarks('');
        setSelectedCustomer(null);
        alert('Payment recorded successfully!');

        // Force refresh with a small delay to ensure backend updates
        setTimeout(() => {
          fetchCustomers();
        }, 500);
      } else {
        alert('Error recording payment: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment: ' + error.message);
    }
  };

  const handleViewPaymentHistory = async (customer) => {
    console.log('handleViewPaymentHistory called for customer:', customer);
    setSelectedCustomer(customer);
    try {
      console.log('Calling api.getPaymentHistory with customerId:', customer._id);
      const response = await api.getPaymentHistory(customer._id);
      console.log('Response from getPaymentHistory:', response);
      if (response?.success) {
        setPaymentHistory({
          history: response.history || [],
          customerDetails: response.customerDetails || {},
          summary: response.summary || {}
        });
        setShowPaymentHistory(true);
      } else {
        alert('Error fetching payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      alert('Error fetching payment history');
    }
  };

  const handleCreateMonthlyRecords = async () => {
    try {
      console.log('Downloading monthly report for month:', selectedMonth);
      const response = await api.getCustomersWithPayments('', selectedMonth);
      console.log('Response:', response);
      
      if (response?.success && response?.customers) {
        const customers = response.customers;
        const monthName = new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' });
        
        // Calculate totals
        const totalPaid = customers?.filter(c => c?.paymentStatus === 'Paid')?.reduce((sum, c) => sum + (c?.amount || 500), 0) || 0;
        const totalUnpaid = customers?.filter(c => c?.paymentStatus === 'Unpaid')?.reduce((sum, c) => sum + (c?.amount || 500), 0) || 0;
        const totalAmount = customers?.reduce((sum, c) => sum + (c?.amount || 500), 0) || 0;
        
        // Create CSV content
        const headers = ['Customer Name', 'Phone', 'Sports', 'Amount', 'Payment Status'];
        const rows = customers?.map(c => [
          c?.name || '',
          c?.phone || '',
          c?.sports?.join(', ') || '',
          c?.amount || 500,
          c?.paymentStatus || ''
        ]) || [];
        
        // Add totals row
        rows.push([]);
        rows.push(['', '', '', 'Total Paid', `₹${totalPaid}`]);
        rows.push(['', '', '', 'Total Unpaid', `₹${totalUnpaid}`]);
        rows.push(['', '', '', 'Total Amount', `₹${totalAmount}`]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly_report_${monthName}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        alert(`Monthly report for ${monthName} downloaded successfully!`);
      } else {
        alert('Error: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error downloading monthly report:', error);
      alert('Error downloading monthly report: ' + error?.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await api.deleteCustomer(customerId);
        if (response.success) {
          fetchCustomers();
          // Trigger dashboard refresh by dispatching a custom event
          window.dispatchEvent(new CustomEvent('paymentUpdated'));
        }
      } catch (error) {
        console.error('Error deleting customer');
      }
    }
  };

  const handleSportToggle = (sport) => {
    setNewCustomer(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/login');
  };

  if (loading) return <div className="admin-container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="admin-container" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header onLogout={handleLogout} />
      <Nav navigate={navigate} currentPage="fees" />
      <main className="admin-container" style={{ padding: '40px' }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Fee Collection Management</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="admin-button"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              + Add Player
            </button>
            <button
              onClick={handleCreateMonthlyRecords}
              className="admin-button"
              style={{
                padding: '10px 20px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Download Monthly Report
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Customers</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#007bff' }}>{stats.totalCustomers}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Paid This Month</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#28a745' }}>{stats.totalPaid}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Unpaid This Month</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#dc3545' }}>{stats.totalUnpaid}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ marginRight: '10px', fontWeight: '600', color: '#333' }}>Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ marginRight: '10px', fontWeight: '600', color: '#333' }}>Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Player Modal */}
        {showAddCustomer && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Add New Player</h3>
              <form onSubmit={handleAddCustomer}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Name:</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => {
                      console.log('Name input changed:', e.target.value);
                      setNewCustomer({ ...newCustomer, name: e.target.value });
                    }}
                    required
                    autoComplete="name"
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Phone:</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => {
                      console.log('Phone input changed:', e.target.value);
                      setNewCustomer({ ...newCustomer, phone: e.target.value });
                    }}
                    required
                    autoComplete="tel"
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Sports:</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['Badminton', 'Karate', 'Cricket', 'Kabaddi'].map(sport => (
                      <label key={sport} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="sport"
                          checked={newCustomer.sports?.length === 1 && newCustomer.sports[0] === sport}
                          onChange={() => {
                            console.log('Sport selected:', sport);
                            const monthlyFee = sportFees[sport] || 500;
                            setNewCustomer({ ...newCustomer, sports: [sport], monthlyFee });
                          }}
                        />
                        {sport}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Batch:</label>
                  <select
                    value={newCustomer.batch}
                    onChange={(e) => setNewCustomer({ ...newCustomer, batch: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                  >
                    <option value="">Select Batch</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Monthly Fee (₹):</label>
                  <input
                    type="number"
                    value={newCustomer.monthlyFee}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewCustomer({ ...newCustomer, monthlyFee: value === '' ? '' : parseInt(value) || 500 });
                    }}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Auto-set based on sport, but editable</small>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(false)}
                    style={{ padding: '12px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '12px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
                  >
                    Add Player
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Customer Table */}
        {customers.length === 0 ? (
          <div className="admin-card" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            No customers found
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-container" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Sport</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Batch</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Monthly Fee</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Amount Paid</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Balance</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    // Use backend-calculated values
                    const monthlyFee = customer.monthlyFee || 500;
                    const amountPaid = customer.amountPaid || 0;
                    const balance = customer.balance || (monthlyFee - amountPaid);
                    const paymentStatus = customer.paymentStatus || 'Unpaid';
                    
                    return (
                      <tr key={customer._id} style={{ borderBottom: '1px solid #eee', backgroundColor: paymentStatus === 'Unpaid' ? '#fff5f5' : paymentStatus === 'Partially Paid' ? '#fff8e1' : 'white' }}>
                        <td style={{ padding: '15px', fontWeight: paymentStatus === 'Unpaid' ? '600' : 'normal', color: paymentStatus === 'Unpaid' ? '#dc3545' : 'inherit' }}>{customer.name}</td>
                        <td style={{ padding: '15px' }}>{customer.sports?.join(', ') || '-'}</td>
                        <td style={{ padding: '15px' }}>{customer.batch || '-'}</td>
                        <td style={{ padding: '15px' }}>
                          <span>₹{monthlyFee}</span>
                        </td>
                        <td style={{ padding: '15px' }}>₹{amountPaid}</td>
                        <td style={{ padding: '15px', fontWeight: '600', color: balance > 0 ? '#dc3545' : '#28a745' }}>₹{balance}</td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            backgroundColor: paymentStatus === 'Paid' ? '#28a745' : paymentStatus === 'Partially Paid' ? '#ffc107' : '#dc3545',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>{paymentStatus}</span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowReceivePayment(true);
                              }}
                              style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              Receive
                            </button>
                            <button
                              onClick={() => handleViewPaymentHistory(customer)}
                              style={{
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              History
                            </button>
                            {(paymentStatus === 'Unpaid' || paymentStatus === 'Partially Paid') && (
                              <button
                                onClick={() => handleSendReminder(customer._id, customer.phone, paymentStatus, amountPaid)}
                                style={{
                                  backgroundColor: '#ffc107',
                                  color: '#333',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                Reminder
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCustomer(customer._id)}
                              style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="admin-payment-cards">
              {customers.map((customer) => {
                // Use backend-calculated values
                const monthlyFee = customer.monthlyFee || 500;
                const amountPaid = customer.amountPaid || 0;
                const balance = customer.balance || (monthlyFee - amountPaid);
                const paymentStatus = customer.paymentStatus || 'Unpaid';
                
                return (
                  <div key={customer._id} className="admin-payment-card" style={{ backgroundColor: paymentStatus === 'Unpaid' ? '#fff5f5' : paymentStatus === 'Partially Paid' ? '#fff8e1' : 'white' }}>
                    <div className="admin-payment-card-header">
                      <div className="admin-payment-card-customer" style={{ color: paymentStatus === 'Unpaid' ? '#dc3545' : '#333' }}>{customer.name}</div>
                      <div 
                        className="admin-payment-card-status"
                        style={{
                          backgroundColor: paymentStatus === 'Paid' ? '#28a745' : paymentStatus === 'Partially Paid' ? '#ffc107' : '#dc3545'
                        }}
                      >
                        {paymentStatus}
                      </div>
                    </div>
                    <div className="admin-payment-card-details">
                      <div className="admin-payment-card-detail">
                        <span className="admin-payment-card-label">Sport:</span>
                        <span className="admin-payment-card-value">{customer.sports?.join(', ') || '-'}</span>
                      </div>
                      <div className="admin-payment-card-detail">
                        <span className="admin-payment-card-label">Batch:</span>
                        <span className="admin-payment-card-value">{customer.batch || '-'}</span>
                      </div>
                      <div className="admin-payment-card-detail">
                        <span className="admin-payment-card-label">Monthly Fee:</span>
                        <span className="admin-payment-card-value">₹{monthlyFee}</span>
                      </div>
                      <div className="admin-payment-card-detail">
                        <span className="admin-payment-card-label">Amount Paid:</span>
                        <span className="admin-payment-card-value">₹{amountPaid}</span>
                      </div>
                      <div className="admin-payment-card-detail">
                        <span className="admin-payment-card-label">Balance:</span>
                        <span className="admin-payment-card-value" style={{ color: balance > 0 ? '#dc3545' : '#28a745', fontWeight: '600' }}>₹{balance}</span>
                      </div>
                    </div>
                    <div className="admin-payment-card-actions">
                      <button 
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowReceivePayment(true);
                        }}
                        style={{ backgroundColor: '#28a745' }}
                      >
                        Receive
                      </button>
                      <button 
                        onClick={() => handleViewPaymentHistory(customer)}
                        style={{ backgroundColor: '#17a2b8' }}
                      >
                        History
                      </button>
                      {(paymentStatus === 'Unpaid' || paymentStatus === 'Partially Paid') && (
                        <button
                          onClick={() => handleSendReminder(customer._id, customer.phone, paymentStatus, amountPaid)}
                          style={{ backgroundColor: '#ffc107', color: '#333' }}
                        >
                          Reminder
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteCustomer(customer._id)}
                        style={{ backgroundColor: '#6c757d' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Receive Payment Modal */}
            {showReceivePayment && selectedCustomer && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Receive Payment - {selectedCustomer.name}</h3>
                  <form onSubmit={handleReceivePayment}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Monthly Fee:</label>
                      <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '16px', fontWeight: '600' }}>₹{selectedCustomer.monthlyFee || 500}</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Amount Paid:</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        required
                        placeholder="Enter amount"
                        style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Payment Method:</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReceivePayment(false);
                          setPaymentAmount('');
                          setSelectedCustomer(null);
                        }}
                        style={{ padding: '12px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ padding: '12px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
                      >
                        Record Payment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Payment History Modal */}
            {showPaymentHistory && selectedCustomer && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Payment History - {selectedCustomer.name}</h3>
                  
                  {/* Customer Details */}
                  {paymentHistory.customerDetails && (
                    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                      <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Customer Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div>
                          <strong style={{ color: '#666', fontSize: '13px' }}>Name:</strong>
                          <div style={{ marginTop: '5px' }}>{paymentHistory.customerDetails.name}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#666', fontSize: '13px' }}>Phone:</strong>
                          <div style={{ marginTop: '5px' }}>{paymentHistory.customerDetails.phone}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#666', fontSize: '13px' }}>Sports:</strong>
                          <div style={{ marginTop: '5px' }}>{paymentHistory.customerDetails.sports?.join(', ') || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#666', fontSize: '13px' }}>Batch:</strong>
                          <div style={{ marginTop: '5px' }}>{paymentHistory.customerDetails.batch || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#666', fontSize: '13px' }}>Monthly Fee:</strong>
                          <div style={{ marginTop: '5px' }}>₹{paymentHistory.customerDetails.monthlyFee}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#666', fontSize: '13px' }}>Join Date:</strong>
                          <div style={{ marginTop: '5px' }}>{paymentHistory.customerDetails.joinDate ? new Date(paymentHistory.customerDetails.joinDate).toLocaleDateString() : '-'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {paymentHistory.summary && (
                    <div style={{ backgroundColor: '#e7f3ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                      <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Payment Summary</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{paymentHistory.summary.totalMonthsPaid}</div>
                          <div style={{ color: '#666', fontSize: '13px', marginTop: '5px' }}>Months Paid</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{paymentHistory.summary.totalMonthsNotPaid}</div>
                          <div style={{ color: '#666', fontSize: '13px', marginTop: '5px' }}>Months Pending</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{paymentHistory.summary.monthsSinceJoin}</div>
                          <div style={{ color: '#666', fontSize: '13px', marginTop: '5px' }}>Months Since Join</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Filters and Search */}
                  <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Search by month..."
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', flex: '1', minWidth: '200px' }}
                    />
                    <select style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}>
                      <option value="">All Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>

                  {/* Payment History Table */}
                  {!paymentHistory.history || paymentHistory.history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No payment history found</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Month</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Monthly Fee</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Amount Paid</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Balance</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Transactions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.history.map((payment, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: '600' }}>{payment.monthName} {payment.year}</div>
                            </td>
                            <td style={{ padding: '12px' }}>₹{payment.monthlyFee}</td>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#28a745' }}>₹{payment.amountPaid}</td>
                            <td style={{ padding: '12px', fontWeight: '600', color: payment.balance > 0 ? '#dc3545' : '#28a745' }}>₹{payment.balance}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                backgroundColor: payment.paymentStatus === 'Paid' ? '#28a745' : payment.paymentStatus === 'Partially Paid' ? '#ffc107' : '#dc3545',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {payment.paymentStatus}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {payment.transactions?.length || 0} transaction(s)
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setShowPaymentHistory(false);
                        setPaymentHistory([]);
                        setSelectedCustomer(null);
                      }}
                      style={{ padding: '12px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Announcements Component
function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    description: '',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Active'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.getAnnouncements();
      if (response?.success && response?.announcements) {
        setAnnouncements(response.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    console.log('handleAddAnnouncement called');
    console.log('newAnnouncement:', newAnnouncement);
    try {
      console.log('Calling api.createAnnouncement with:', newAnnouncement);
      const response = await api.createAnnouncement(newAnnouncement);
      console.log('Response from createAnnouncement:', response);
      if (response.success) {
        setShowAddAnnouncement(false);
        setNewAnnouncement({
          title: '',
          description: '',
          publishDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          status: 'Active'
        });
        fetchAnnouncements();
        alert('Announcement created successfully!');
      } else {
        alert('Error creating announcement: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Error creating announcement: ' + error.message);
    }
  };

  const handleEditAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await api.updateAnnouncement(editingAnnouncement._id, newAnnouncement);
      if (response.success) {
        setShowAddAnnouncement(false);
        setEditingAnnouncement(null);
        setNewAnnouncement({
          title: '',
          description: '',
          publishDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          status: 'Active'
        });
        fetchAnnouncements();
        alert('Announcement updated successfully!');
      } else {
        alert('Error updating announcement: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Error updating announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const response = await api.deleteAnnouncement(id);
        if (response.success) {
          fetchAnnouncements();
          alert('Announcement deleted successfully!');
        } else {
          alert('Error deleting announcement');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Error deleting announcement');
      }
    }
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      description: announcement.description,
      publishDate: announcement.publishDate,
      expiryDate: announcement.expiryDate,
      status: announcement.status
    });
    setShowAddAnnouncement(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/login');
  };

  if (loading) return <div className="admin-container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="admin-container" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header onLogout={handleLogout} />
      <Nav navigate={navigate} currentPage="announcements" />
      <main className="admin-container" style={{ padding: '40px' }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Announcements Management</h2>
          <button
            onClick={() => {
              setEditingAnnouncement(null);
              setNewAnnouncement({
                title: '',
                description: '',
                publishDate: new Date().toISOString().split('T')[0],
                expiryDate: '',
                status: 'Active'
              });
              setShowAddAnnouncement(true);
            }}
            className="admin-button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            + Add Announcement
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="admin-card" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            No announcements found
          </div>
        ) : (
          <div className="admin-table-container" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Publish Date</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Expiry Date</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>{announcement.title}</td>
                    <td style={{ padding: '15px' }}>{new Date(announcement.publishDate).toLocaleDateString()}</td>
                    <td style={{ padding: '15px' }}>{announcement.expiryDate ? new Date(announcement.expiryDate).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        backgroundColor: announcement.status === 'Active' ? '#28a745' : '#6c757d',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>{announcement.status}</span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditClick(announcement)}
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Announcement Modal */}
        {showAddAnnouncement && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h3>
              <form onSubmit={editingAnnouncement ? handleEditAnnouncement : handleAddAnnouncement}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Title:</label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Description:</label>
                  <textarea
                    value={newAnnouncement.description}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px', minHeight: '120px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Publish Date:</label>
                  <input
                    type="date"
                    value={newAnnouncement.publishDate}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, publishDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Expiry Date:</label>
                  <input
                    type="date"
                    value={newAnnouncement.expiryDate}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Status:</label>
                  <select
                    value={newAnnouncement.status}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, status: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAnnouncement(false);
                      setEditingAnnouncement(null);
                      setNewAnnouncement({
                        title: '',
                        description: '',
                        publishDate: new Date().toISOString().split('T')[0],
                        expiryDate: '',
                        status: 'Active'
                      });
                    }}
                    style={{ padding: '12px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '12px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
                  >
                    {editingAnnouncement ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Reports Component
function Reports() {
  const [selectedReport, setSelectedReport] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchReport = async () => {
    setLoading(true);
    try {
      let response;
      switch (selectedReport) {
        case 'monthly':
          response = await api.getMonthlyCollectionReport(selectedMonth, selectedYear);
          break;
        case 'pending':
          response = await api.getPendingFeeReport();
          break;
        case 'sport':
          response = await api.getSportWiseRevenueReport(selectedMonth, selectedYear);
          break;
        default:
          response = { success: false, data: null };
      }
      
      if (response?.success) {
        setReportData(response.data || response);
      } else {
        alert('Error fetching report');
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Error fetching report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedReport, selectedMonth, selectedYear]);

  const exportToCSV = (data, filename) => {
    if (!data) return;
    
    let csvContent = '';
    
    if (selectedReport === 'monthly' && data.customers) {
      csvContent = 'Customer Name,Phone,Sports,Amount,Payment Status\n';
      data.customers.forEach(c => {
        csvContent += `${c.name},${c.phone},${c.sports?.join(', ') || ''},${c.amount || 500},${c.paymentStatus}\n`;
      });
      csvContent += `\nTotal Collection: ₹${data.totalCollection || 0}\n`;
      csvContent += `Paid Fees: ₹${data.paidFees || 0}\n`;
      csvContent += `Pending Fees: ₹${data.pendingFees || 0}\n`;
    } else if (selectedReport === 'pending' && data.customers) {
      csvContent = 'Customer Name,Phone,Sports,Pending Amount\n';
      data.customers.forEach(c => {
        csvContent += `${c.name},${c.phone},${c.sports?.join(', ') || ''},${c.pendingAmount || 0}\n`;
      });
      csvContent += `\nTotal Pending: ₹${data.totalPending || 0}\n`;
    } else if (selectedReport === 'sport' && data.sportRevenue) {
      csvContent = 'Sport,Revenue\n';
      data.sportRevenue.forEach(s => {
        csvContent += `${s.sport},${s.revenue || 0}\n`;
      });
      csvContent += `\nTotal Revenue: ₹${data.totalRevenue || 0}\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/login');
  };

  return (
    <div className="admin-container" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header onLogout={handleLogout} />
      <Nav navigate={navigate} currentPage="reports" />
      <main className="admin-container" style={{ padding: '40px' }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Reports</h2>
        </div>

        {/* Report Filters */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ marginRight: '10px', fontWeight: '600', color: '#333' }}>Report Type:</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="monthly">Monthly Collection Report</option>
                <option value="pending">Pending Fee Report</option>
                <option value="sport">Sport-wise Revenue Report</option>
              </select>
            </div>
            {(selectedReport === 'monthly' || selectedReport === 'sport') && (
              <>
                <div>
                  <label style={{ marginRight: '10px', fontWeight: '600', color: '#333' }}>Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ marginRight: '10px', fontWeight: '600', color: '#333' }}>Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    {[2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <button
              onClick={() => exportToCSV(reportData, `${selectedReport}_report_${selectedMonth}_${selectedYear}`)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading report...</div>
        ) : !reportData ? (
          <div className="admin-card" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            No data available for this report
          </div>
        ) : (
          <div className="admin-table-container" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {selectedReport === 'monthly' && reportData.customers && (
              <>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>Monthly Collection Report - {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}</h3>
                </div>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Customer Name</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Sports</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.customers.map((customer, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '15px' }}>{customer.name}</td>
                        <td style={{ padding: '15px' }}>{customer.phone}</td>
                        <td style={{ padding: '15px' }}>{customer.sports?.join(', ') || '-'}</td>
                        <td style={{ padding: '15px' }}>₹{customer.amount || 500}</td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            backgroundColor: customer.paymentStatus === 'Paid' ? '#28a745' : '#dc3545',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>{customer.paymentStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                  <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    <div><strong>Total Collection:</strong> ₹{reportData.totalCollection || 0}</div>
                    <div><strong>Paid Fees:</strong> ₹{reportData.paidFees || 0}</div>
                    <div><strong>Pending Fees:</strong> ₹{reportData.pendingFees || 0}</div>
                  </div>
                </div>
              </>
            )}
            
            {selectedReport === 'pending' && reportData.customers && (
              <>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>Pending Fee Report</h3>
                </div>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#dc3545', color: 'white' }}>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Customer Name</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Sports</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Pending Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.customers.map((customer, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '15px' }}>{customer.name}</td>
                        <td style={{ padding: '15px' }}>{customer.phone}</td>
                        <td style={{ padding: '15px' }}>{customer.sports?.join(', ') || '-'}</td>
                        <td style={{ padding: '15px', fontWeight: '600', color: '#dc3545' }}>₹{customer.pendingAmount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                  <div><strong>Total Pending:</strong> ₹{reportData.totalPending || 0}</div>
                </div>
              </>
            )}
            
            {selectedReport === 'sport' && reportData.sportRevenue && (
              <>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>Sport-wise Revenue Report - {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}</h3>
                </div>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Sport</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Revenue</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.sportRevenue.map((sport, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '15px' }}>{sport.sport}</td>
                        <td style={{ padding: '15px', fontWeight: '600' }}>₹{sport.revenue || 0}</td>
                        <td style={{ padding: '15px' }}>{sport.percentage || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                  <div><strong>Total Revenue:</strong> ₹{reportData.totalRevenue || 0}</div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components
function Header({ onLogout }) {
  return (
    <header style={{
      backgroundColor: '#007bff',
      color: 'white',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ margin: 0, fontSize: '24px' }}>Sports Booking Admin</h1>
      <button
        onClick={onLogout}
        style={{
          backgroundColor: 'white',
          color: '#007bff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Logout
      </button>
    </header>
  );
}

function Nav({ navigate, currentPage }) {
  const getButtonStyle = (page) => {
    const isActive = currentPage === page;
    let backgroundColor, gradient, icon;
    
    switch(page) {
      case 'dashboard':
        backgroundColor = isActive ? '#28a745' : '#f8f9fa';
        gradient = isActive ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 'none';
        icon = '📊';
        break;
      case 'bookings':
        backgroundColor = isActive ? '#007bff' : '#f8f9fa';
        gradient = isActive ? 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)' : 'none';
        icon = '📅';
        break;
      case 'fees':
        backgroundColor = isActive ? '#ffc107' : '#f8f9fa';
        gradient = isActive ? 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)' : 'none';
        icon = '💰';
        break;
      case 'announcements':
        backgroundColor = isActive ? '#17a2b8' : '#f8f9fa';
        gradient = isActive ? 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' : 'none';
        icon = '📢';
        break;
      case 'reports':
        backgroundColor = isActive ? '#6f42c1' : '#f8f9fa';
        gradient = isActive ? 'linear-gradient(135deg, #6f42c1 0%, #563d7c 100%)' : 'none';
        icon = '📈';
        break;
      default:
        backgroundColor = isActive ? '#007bff' : '#f8f9fa';
        gradient = 'none';
        icon = '📋';
    }
    
    return {
      backgroundColor,
      background: gradient,
      color: isActive ? 'white' : '#495057',
      border: isActive ? 'none' : '2px solid #e9ecef',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxShadow: isActive ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    };
  };

  return (
    <nav className="admin-nav" style={{ 
      backgroundColor: 'white', 
      padding: '25px 40px', 
      borderBottom: '2px solid #e9ecef',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="admin-nav-button"
          style={getButtonStyle('dashboard')}
          onMouseEnter={(e) => {
            if (currentPage !== 'dashboard') {
              e.target.style.backgroundColor = '#e9ecef';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 'dashboard') {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          <span style={{ fontSize: '18px' }}>📊</span>
          Dashboard
        </button>
        <button
          onClick={() => navigate('/bookings')}
          className="admin-nav-button"
          style={getButtonStyle('bookings')}
          onMouseEnter={(e) => {
            if (currentPage !== 'bookings') {
              e.target.style.backgroundColor = '#e9ecef';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 'bookings') {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          <span style={{ fontSize: '18px' }}>📅</span>
          Bookings
        </button>
        <button
          onClick={() => navigate('/fees')}
          className="admin-nav-button"
          style={getButtonStyle('fees')}
          onMouseEnter={(e) => {
            if (currentPage !== 'fees') {
              e.target.style.backgroundColor = '#e9ecef';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 'fees') {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          <span style={{ fontSize: '18px' }}>💰</span>
          Fee Collection
        </button>
      </div>
    </nav>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>{title}</h3>
      <p style={{ fontSize: '48px', fontWeight: 'bold', color, margin: 0 }}>{value}</p>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <BookingManagement />
            </ProtectedRoute>
          } />
          <Route path="/fees" element={
            <ProtectedRoute>
              <FeeCollection />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
