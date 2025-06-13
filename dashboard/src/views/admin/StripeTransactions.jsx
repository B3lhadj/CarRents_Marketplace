import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { BsCurrencyDollar, BsArrowLeft, BsGraphUp } from 'react-icons/bs';
import moment from 'moment';
import { Chart, registerables } from 'chart.js';
import { get_stripe_revenue_data, messageClear } from '../../store/Reducers/dashboardIndexReducer';

// Register Chart.js components
Chart.register(...registerables);

const StripeTransactions = () => {
  const dispatch = useDispatch();
  const { stripeData, errorMessage, successMessage, loader } = useSelector((state) => state.dashboardIndex);
  const chartRef = useRef(null);

  useEffect(() => {
    dispatch(get_stripe_revenue_data());
    return () => {
      dispatch(messageClear());
    };
  }, [dispatch]);

  // Calculate totals
  const calculatedTotal = stripeData.transactions?.reduce((sum, txn) => sum + txn.amount, 0) || 0;

  // Chart initialization and update
  useEffect(() => {
    if (!stripeData.revenueByDay || stripeData.revenueByDay.length === 0) return;

    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Destroy previous chart instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Prepare data
    const labels = stripeData.revenueByDay.map((day) => moment(day.date).format('MMM D'));
    const data = stripeData.revenueByDay.map((day) => day.amount / 100); // Convert cents to dollars
    const maxValue = Math.max(...data, 1) * 1.2; // Add 20% padding

    // Create chart
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily Revenue ($)',
            data,
            backgroundColor: 'rgba(79, 70, 229, 0.7)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(79, 70, 229, 0.9)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: maxValue,
            title: { display: true, text: 'Amount ($)' },
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
          },
          x: { grid: { display: false } },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `$${context.raw.toFixed(2)}`,
            },
          },
          legend: { display: false },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [stripeData.revenueByDay]);

  if (loader) {
    return <div className="min-h-screen bg-gray-50 p-4 md:p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mb-6">
        <Link to="/admin/dashboard" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <BsArrowLeft className="mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Stripe Revenue & Transactions</h1>
        {errorMessage && <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">{errorMessage}</div>}
        {successMessage && <div className="mt-2 p-2 bg-green-100 text-green-700 rounded">{successMessage}</div>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <SummaryCard
            icon={<BsCurrencyDollar className="text-green-500 mr-2" />}
            title="Total Revenue"
            value={(stripeData.totalRevenue / 100).toFixed(2)}
          />
          <SummaryCard
            icon={<BsCurrencyDollar className="text-blue-500 mr-2" />}
            title="Calculated Total"
            value={(calculatedTotal / 100).toFixed(2)}
          />
          <SummaryCard
            icon={<BsCurrencyDollar className="text-yellow-500 mr-2" />}
            title="Available"
            value={(stripeData.available / 100).toFixed(2)}
          />
          <SummaryCard
            icon={<BsCurrencyDollar className="text-orange-500 mr-2" />}
            title="Pending"
            value={(stripeData.pending / 100).toFixed(2)}
          />
        </div>
        <RevenueChart revenueByDay={stripeData.revenueByDay} />
        <TransactionsTable transactions={stripeData.transactions} />
      </div>
    </div>
  );
};

// Sub-components
const SummaryCard = ({ icon, title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
    <div className="flex items-center">
      {icon}
      <h3 className="text-gray-500 text-sm">{title}</h3>
    </div>
    <p className="text-2xl font-bold mt-1">${value}</p>
  </div>
);

const RevenueChart = ({ revenueByDay }) => (
  <div className="mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
    <div className="flex items-center mb-4">
      <BsGraphUp className="text-indigo-500 mr-2" />
      <h2 className="text-lg font-semibold">Daily Revenue</h2>
    </div>
    <div className="relative h-80">
      {revenueByDay?.length > 0 ? (
        <canvas id="revenueChart"></canvas>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          No revenue data available
        </div>
      )}
    </div>
  </div>
);

const TransactionsTable = ({ transactions }) => {
  console.log('TransactionsTable transactions:', transactions); // Debug transactions
  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader>Date</TableHeader>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Details</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions?.length > 0 ? (
              transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <TableCell>{moment.unix(txn.created).format('MMM D, YYYY h:mm A')}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">{txn.billing_details?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{txn.billing_details?.email || ''}</div>
                  </TableCell>
                  <TableCell className="font-semibold">${(txn.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge status={txn.status} />
                  </TableCell>
                  <TableCell>{txn.receipt_url ? <ReceiptLink url={txn.receipt_url} /> : 'N/A'}</TableCell>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}>{children}</td>
);

const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-1 text-xs font-semibold rounded-full ${
      status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}
  >
    {status}
  </span>
);

const ReceiptLink = ({ url }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
    Receipt
  </a>
);

export default StripeTransactions;