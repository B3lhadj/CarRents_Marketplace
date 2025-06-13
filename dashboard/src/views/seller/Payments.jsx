import React, { forwardRef, useEffect, useState, useCallback } from 'react';
import { 
  BsCurrencyDollar, 
  BsArrowUpRight, 
  BsCheckCircle,
  BsCreditCard,
  BsPaypal,
  BsCurrencyBitcoin
} from 'react-icons/bs';
import { FiClock, FiChevronDown } from 'react-icons/fi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { SiBankofamerica, SiStripe } from 'react-icons/si';
import toast from 'react-hot-toast';
import moment from 'moment';
import { FixedSizeList as List } from 'react-window';
import { useSelector, useDispatch } from 'react-redux';
import { 
  getSellerPaymentDetails, 
  sendWithdrawalRequest, 
  clearMessages,
  fetchSellerBalance // Add this import
} from '../../store/Reducers/PaymentReducer';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { motion, AnimatePresence } from 'framer-motion';

const outerElementType = forwardRef((props, ref) => (
  <div ref={ref} {...props} />
));

const paymentMethods = [
  { id: 'stripe', name: 'Stripe', icon: <SiStripe className="text-indigo-600" />, minAmount: 10 },
  { id: 'paypal', name: 'PayPal', icon: <BsPaypal className="text-blue-500" />, minAmount: 5 },
  { id: 'bank', name: 'Bank Transfer', icon: <SiBankofamerica className="text-green-600" />, minAmount: 50 },
  { id: 'crypto', name: 'Crypto (BTC/ETH)', icon: <BsCurrencyBitcoin className="text-amber-500" />, minAmount: 20 },
];

const Payments = () => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth);
  const {
    requests = [],
    loading,
    error,
    success,
    stats = {
      total: 0,
      pending: 0,
      completed: 0,
      available: 0
    }
  } = useSelector((state) => state.payment);

  // Use the stats directly from Redux
  const totalAmount = stats.total || 0;
  const availableAmount = stats.available || 0;
  const pendingAmount = stats.pending || 0;
  const withdrawalAmount = stats.completed ;
  

  const pendingWithdrawals = requests.filter(req => req.status === 'pending');
  const successWithdrawals = requests.filter(req => req.status === 'completed');

  useEffect(() => {
    console.log('Payment component mounted, user ID:', userInfo?.id); // Add this line
    if (userInfo?.id) {
      console.log('Dispatching payment actions...'); // Add this line
      dispatch(getSellerPaymentDetails(userInfo.id));
      dispatch(fetchSellerBalance());
    }
  }, [dispatch, userInfo?.id]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [success, error, dispatch]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const selectPaymentMethod = (method) => {
    setSelectedMethod(method);
    setShowMethodDropdown(false);
    if (amount && parseFloat(amount) < method.minAmount) {
      setAmount('');
    }
  };

  const sendRequest = useCallback((e) => {
    e.preventDefault();
    const amountInDollars = parseFloat(amount) || 0;
    const amountInCents = Math.round(amountInDollars );

    if (amountInDollars <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (amountInDollars < selectedMethod.minAmount) {
      toast.error(`Minimum withdrawal for ${selectedMethod.name} is $${selectedMethod.minAmount}`);
      return;
    }

    if (amountInCents > availableAmount) {
      toast.error('Insufficient balance');
      return;
    }

    confirmAlert({
      title: 'Confirm Withdrawal',
      message: `Are you sure you want to withdraw $${amountInDollars.toFixed(2)} to ${selectedMethod.name}?`,
      buttons: [
        {
          label: 'Confirm',
          onClick: () => {
            dispatch(sendWithdrawalRequest({
              amount: amountInCents,
              sellerId: userInfo._id,
              method: selectedMethod.id
            }));
            setAmount('');
          }
        },
        { label: 'Cancel' }
      ],
      customUI: ({ onClose, title, message, buttons }) => (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={() => {
                  btn.onClick?.();
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  btn.label === 'Confirm'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      ),
    });
  }, [amount, availableAmount, dispatch, userInfo?._id, selectedMethod]);

  const PendingRow = useCallback(({ index, style }) => {
    const withdrawal = pendingWithdrawals[index];
    const method = paymentMethods.find(m => m.id === withdrawal.method) || paymentMethods[0];
    
    return (
      <motion.div
        style={style}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex text-sm items-center ${
          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
        } hover:bg-gray-100 transition-colors border-b border-gray-100`}
      >
        <div className="w-[20%] p-3 text-gray-500">{index + 1}</div>
        <div className="w-[20%] p-3 text-indigo-600 font-medium">
          ${(withdrawal.amount ).toFixed(2)}
        </div>
        <div className="w-[25%] p-3 flex items-center gap-2">
          <div className="text-lg">{method.icon}</div>
          <span className="text-gray-700">{method.name}</span>
        </div>
        <div className="w-[20%] p-3">
          <span className="py-1 px-3 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center gap-1 w-fit">
            <FiClock className="text-xs" /> Pending
          </span>
        </div>
        <div className="w-[15%] p-3 text-gray-500 text-sm">
          {moment(withdrawal.createdAt).format('MMM D')}
        </div>
      </motion.div>
    );
  }, [pendingWithdrawals]);

  const SuccessRow = useCallback(({ index, style }) => {
    const withdrawal = successWithdrawals[index];
    const method = paymentMethods.find(m => m.id === withdrawal.method) || paymentMethods[0];
    
    return (
      <motion.div
        style={style}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex text-sm items-center ${
          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
        } hover:bg-gray-100 transition-colors border-b border-gray-100`}
      >
        <div className="w-[20%] p-3 text-gray-500">{index + 1}</div>
        <div className="w-[20%] p-3 text-indigo-600 font-medium">
          ${(withdrawal.amount ).toFixed(2)}
        </div>
        <div className="w-[25%] p-3 flex items-center gap-2">
          <div className="text-lg">{method.icon}</div>
          <span className="text-gray-700">{method.name}</span>
        </div>
        <div className="w-[20%] p-3">
          <span className="py-1 px-3 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1 w-fit">
            <BsCheckCircle className="text-xs" /> Completed
          </span>
        </div>
        <div className="w-[15%] p-3 text-gray-500 text-sm">
          {moment(withdrawal.createdAt).format('MMM D')}
        </div>
      </motion.div>
    );
  }, [successWithdrawals]);

  const SkeletonRow = () => (
    <div className="flex text-sm items-center bg-gray-100 animate-pulse border-b border-gray-200">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-[20%] p-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payment Dashboard</h1>
            <p className="text-gray-500">Manage your earnings and withdrawal requests</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                title: 'Total Sales', 
                value: totalAmount / 100, 
                icon: <RiMoneyDollarCircleLine className="text-blue-500 text-2xl" />,
                color: 'blue',
                desc: 'All-time earnings'
              },
              { 
                title: 'Available', 
                value: availableAmount / 100, 
                icon: <BsCurrencyDollar className="text-green-500 text-2xl" />,
                color: 'green',
                desc: 'Ready for withdrawal'
              },
              { 
                title: 'Withdrawn', 
                value: withdrawalAmount , 
                icon: <BsArrowUpRight className="text-purple-500 text-2xl" />,
                color: 'purple',
                desc: 'Total withdrawn'
              },
              { 
                title: 'Pending', 
                value: pendingAmount / 100, 
                icon: <FiClock className="text-amber-500 text-2xl" />,
                color: 'amber',
                desc: 'Awaiting processing'
              }
            ].map((card, i) => (
              <motion.div
                key={card.title}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                    <h2 className="text-2xl font-bold text-gray-800">${card.value.toFixed(2)}</h2>
                  </div>
                  <div className={`p-3 rounded-lg bg-${card.color}-50 text-${card.color}-500`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Withdrawal Request</h2>

              <form onSubmit={sendRequest} className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Available: ${(availableAmount ).toFixed(2)} | Minimum: ${selectedMethod.minAmount}
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{selectedMethod.icon}</div>
                      <span>{selectedMethod.name}</span>
                    </div>
                    <FiChevronDown className={`transition-transform ${showMethodDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showMethodDropdown && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
                      >
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => selectPaymentMethod(method)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                              selectedMethod.id === method.id ? 'bg-indigo-50' : ''
                            }`}
                          >
                            <div className="text-lg">{method.icon}</div>
                            <div>
                              <div className="text-gray-800">{method.name}</div>
                              <div className="text-xs text-gray-500">Min: ${method.minAmount}</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center justify-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <BsCreditCard className="mr-2" />
                      Request Withdrawal via {selectedMethod.name}
                    </>
                  )}
                </button>
              </form>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Pending Requests</h3>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    {pendingWithdrawals.length} pending
                  </span>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <div className="flex bg-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                    <div className="w-[20%] p-3">No</div>
                    <div className="w-[20%] p-3">Amount</div>
                    <div className="w-[25%] p-3">Method</div>
                    <div className="w-[20%] p-3">Status</div>
                    <div className="w-[15%] p-3">Date</div>
                  </div>

                  {loading ? (
                    <div className="bg-white">
                      {[...Array(3)].map((_, i) => (
                        <SkeletonRow key={i} />
                      ))}
                    </div>
                  ) : pendingWithdrawals.length > 0 ? (
                    <List
                      height={Math.min(250, pendingWithdrawals.length * 60)}
                      itemCount={pendingWithdrawals.length}
                      itemSize={60}
                      width="100%"
                      outerElementType={outerElementType}
                    >
                      {PendingRow}
                    </List>
                  ) : (
                    <div className="p-6 text-center text-gray-500 bg-white">
                      No pending withdrawals
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Withdrawal History</h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {successWithdrawals.length} completed
                </span>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200">
                <div className="flex bg-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <div className="w-[20%] p-3">No</div>
                  <div className="w-[20%] p-3">Amount</div>
                  <div className="w-[25%] p-3">Method</div>
                  <div className="w-[20%] p-3">Status</div>
                  <div className="w-[15%] p-3">Date</div>
                </div>

                {loading ? (
                  <div className="bg-white">
                    {[...Array(3)].map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </div>
                ) : successWithdrawals.length > 0 ? (
                  <List
                    height={Math.min(350, successWithdrawals.length * 60)}
                    itemCount={successWithdrawals.length}
                    itemSize={60}
                    width="100%"
                    outerElementType={outerElementType}
                  >
                    {SuccessRow}
                  </List>
                ) : (
                  <div className="p-6 text-center text-gray-500 bg-white">
                    No withdrawal history
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;