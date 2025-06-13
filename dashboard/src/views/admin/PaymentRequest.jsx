import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllWithdrawals,
  getWithdrawalStats,
  processWithdrawal,
  clearMessages
} from '../../store/Reducers/PaymentReducer';
import { toast } from 'react-hot-toast';
import { 
  Table, Pagination, Spin, Tag, Button, Modal, 
  Statistic, Card, Row, Col, Input, Select 
} from 'antd';
import { 
  CheckOutlined, CloseOutlined, SearchOutlined,
  DollarOutlined, LoadingOutlined 
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const AdminPaymentDashboard = () => {
  const dispatch = useDispatch();
  const { 
    withdrawals, 
    loading, 
    error, 
    success,
    adminStats,
    pagination 
  } = useSelector(state => state.payment);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const statusColors = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    rejected: 'red',
    failed: 'red'
  };

  const fetchWithdrawals = useCallback(() => {
    dispatch(getAllWithdrawals({
      page: currentPage,
      status: statusFilter,
      search: searchTerm
    }));
  }, [dispatch, currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    dispatch(getWithdrawalStats());
    fetchWithdrawals();
  }, [dispatch, fetchWithdrawals]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
  }, [error, success, dispatch]);

  const handleProcess = (action) => {
    if (!selectedWithdrawal) return;
    
    dispatch(processWithdrawal({
      withdrawalId: selectedWithdrawal.id,    
       action,
      adminNote
    })).then(() => {
      setSelectedWithdrawal(null);
      setAdminNote('');
      fetchWithdrawals();
      dispatch(getWithdrawalStats());
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: 'id',
      render: (id) => id?.slice(-6) || 'N/A',
      width: 100
    },
    {
      title: 'Seller',
      dataIndex: 'sellerId',
      key: 'seller',
      render: (seller) => (
        <div className="flex items-center">
          {seller?.image ? (
            <img 
              src={seller.image} 
              alt={seller.name} 
              className="w-8 h-8 rounded-full mr-2" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-gray-500 text-xs">SL</span>
            </div>
          )}
          <div>
            <div className="font-medium">{seller?.name || 'Unknown'}</div>
            <div className="text-gray-500 text-xs">{seller?.email || ''}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${(amount || 0).toFixed(2)}`,
      align: 'right',
      width: 120,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'method',
      render: (method) => (
        <Tag color={method === 'stripe' ? 'purple' : method === 'paypal' ? 'blue' : 'cyan'}>
          {(method || '').toUpperCase()}
        </Tag>
      ),
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>
          {(status || '').toUpperCase()}
        </Tag>
      ),
      width: 120,
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Processing', value: 'processing' },
        { text: 'Completed', value: 'completed' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => date ? moment(date).format('MMM D, YYYY') : 'N/A',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        record.status === 'pending' && (
          <Button
            type="link"
            onClick={() => setSelectedWithdrawal(record)}
          >
            Process
          </Button>
        )
      ),
      width: 120
    }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Withdrawal Management</h1>
      
      <Row gutter={16} className="mb-6">
        {[
          { title: 'Total Withdrawals', value: adminStats?.totalCount || 0, prefix: <DollarOutlined /> },
          { title: 'Pending', value: adminStats?.pendingCount || 0, valueStyle: { color: '#faad14' } },
          { title: 'Completed', value: adminStats?.completedCount || 0, valueStyle: { color: '#52c41a' } },
          { title: 'Total Amount', value: adminStats?.totalAmount || 0, precision: 2, prefix: '$' }
        ].map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic {...stat} />
            </Card>
          </Col>
        ))}
      </Row>

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <Input.Search
          placeholder="Search by seller or ID"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={() => {
            setCurrentPage(1);
            fetchWithdrawals();
          }}
        />
        <Select
          placeholder="Filter by status"
          style={{ width: 150 }}
          allowClear
          value={statusFilter || undefined}
          onChange={(value) => {
            setStatusFilter(value || '');
            setCurrentPage(1);
          }}
        >
          <Option value="pending">Pending</Option>
          <Option value="processing">Processing</Option>
          <Option value="completed">Completed</Option>
          <Option value="rejected">Rejected</Option>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={withdrawals}
          rowKey="_id"
          pagination={false}
          scroll={{ x: true }}
          loading={loading}
          locale={{
            emptyText: (
              <div className="text-center p-8 text-gray-500">
                No withdrawal requests found
              </div>
            )
          }}
        />
        {!loading && withdrawals.length > 0 && (
          <div className="flex justify-end p-4">
            <Pagination
              current={currentPage}
              total={pagination?.total || 0}
              pageSize={pagination?.limit || 20}
              onChange={(page) => {
                setCurrentPage(page);
              }}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      <Modal
        title={`Process Withdrawal #${selectedWithdrawal?._id?.slice(-6) || ''}`}
        open={!!selectedWithdrawal}
        onCancel={() => setSelectedWithdrawal(null)}
        footer={[
          <Button 
            key="reject" 
            danger
            onClick={() => handleProcess('reject')}
            icon={<CloseOutlined />}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => handleProcess('approve')}
            icon={<CheckOutlined />}
          >
            Approve
          </Button>
        ]}
      >
        {selectedWithdrawal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Seller', value: selectedWithdrawal.sellerId?.name || 'Unknown' },
                { label: 'Amount', value: `$${(selectedWithdrawal.amount || 0).toFixed(2)}` },
                { label: 'Method', value: selectedWithdrawal.paymentMethod || 'N/A' },
                { 
                  label: 'Status', 
                  value: (
                    <Tag color={statusColors[selectedWithdrawal.status]}>
                      {(selectedWithdrawal.status || '').toUpperCase()}
                    </Tag>
                  ) 
                }
              ].map((item, index) => (
                <div key={index}>
                  <p className="font-semibold">{item.label}:</p>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
            
            <div>
              <p className="font-semibold">Admin Note:</p>
              <Input.TextArea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add note about this action..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPaymentDashboard;