import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { getBookingStatus, acceptSellerBooking, cancelSellerBooking, clearSellerBookingError } from '../../store/Reducers/bookingReducer';
import {
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import { DirectionsCar, Person, CalendarToday, AttachMoney } from '@mui/icons-material';

const OrderDetails = () => {
  const { bookingId } = useParams();
  const dispatch = useDispatch();

  const { 
    bookingDetails = {}, 
    loading = false, 
    error = null 
  } = useSelector((state) => state.booking || {});

  const booking = bookingDetails[bookingId] || {};

  const [status, setStatus] = useState(booking.status || 'pending');

  useEffect(() => {
    dispatch(getBookingStatus(bookingId));
  }, [dispatch, bookingId]);

  useEffect(() => {
    if (booking.status) {
      setStatus(booking.status.toLowerCase());
    }
  }, [booking.status]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSellerBookingError());
    }
  }, [error, dispatch]);

  const handleStatusUpdate = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    try {
      if (newStatus === 'accepted') {
        const result = await dispatch(acceptSellerBooking(bookingId)).unwrap();
        toast(
          ({ id }) => (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>Booking accepted! Payment link created.</Typography>
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<AttachMoney />}
                onClick={() => window.open(result.paymentUrl, '_blank')}
              >
                Open Payment Link
              </Button>
            </Box>
          ),
          {
            id: `accept-${bookingId}`,
            style: {
              background: '#10B981',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px'
            },
            icon: '✅',
            duration: 10000
          }
        );
      } else if (newStatus === 'cancelled') {
        await dispatch(cancelSellerBooking(bookingId)).unwrap();
        toast.success('Booking cancelled successfully', {
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px'
          },
          icon: '❌'
        });
      } else if (newStatus === 'completed' && booking.status === 'accepted') {
        toast.error('Completing bookings is not supported yet', {
          style: {
            background: '#F87171',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px'
          }
        });
        setStatus('accepted');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update status', {
        style: {
          background: '#F87171',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px'
        }
      });
      setStatus(booking.status || 'pending');
    }
  };

  if (loading && !booking._id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, bgcolor: '#283046' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" color="#d0d2d6">
            Booking Details #{bookingId}
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: '#d0d2d6' }}>Status</InputLabel>
            <Select
              value={status}
              onChange={handleStatusUpdate}
              disabled={loading}
              sx={{
                bgcolor: '#283046',
                color: '#d0d2d6',
                border: '1px solid #475569',
                borderRadius: 1,
                '& .MuiSvgIcon-root': { color: '#d0d2d6' }
              }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              {status === 'accepted' && <MenuItem value="completed">Completed</MenuItem>}
            </Select>
          </FormControl>
        </Box>
        <Divider sx={{ mb: 3, bgcolor: '#475569' }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: '#2196F3', mr: 2 }}>
                <Person />
              </Avatar>
              <Typography variant="h6" color="#d0d2d6">
                Customer: {booking.user?.name || 'N/A'}
              </Typography>
            </Box>
            <Typography color="#d0d2d6" mb={1}>
              Payment Status: {booking.paymentStatus || 'Unknown'}
            </Typography>
            <Typography color="#d0d2d6" mb={2}>
              Price: ${booking.totalPrice ? booking.totalPrice.toFixed(2) : '0.00'}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <img
                src={booking.car?.images?.[0] || '/placeholder-car.jpg'}
                alt="Car"
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
              />
              <Box>
                <Typography variant="subtitle1" color="#d0d2d6">
                  {booking.car?.brand || 'N/A'} {booking.car?.name || ''}
                </Typography>
                <Typography color="#d0d2d6">
                  Price per day: ${booking.car?.pricePerDay || '0'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarToday sx={{ color: '#2196F3', mr: 1 }} />
              <Typography color="#d0d2d6">
                Booked on: {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            {booking.payment?.url && (
              <Box mt={2}>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<AttachMoney />}
                  onClick={() => window.open(booking.payment.url, '_blank')}
                  size="small"
                >
                  View Payment Link
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default OrderDetails;