import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CircularProgress,
  Chip,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Box,
  Container,
  Paper,
  Grid,
  IconButton,
  Badge,
  Fade,
  useTheme
} from '@mui/material';
import {
  HourglassEmpty,
  CheckCircleOutline,
  Cancel,
  DirectionsCar,
  CalendarToday,
  AttachMoney,
  Refresh,
  NotificationsActive,
  Person,
  Link
} from '@mui/icons-material';
import { fetchSellerBookings, acceptSellerBooking, cancelSellerBooking, clearSellerBookingError } from '../../store/Reducers/bookingReducer';
import { toast } from 'react-hot-toast';

const SellerBookings = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Redux selectors
  const { 
    sellerBookings = [], 
    loading = false, 
    error = null, 
    pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }
  } = useSelector((state) => {
    if (!state.booking) {
      console.error('Redux state.booking is undefined');
      return {};
    }
    return state.booking;
  });

  const [processing, setProcessing] = useState(false);
  const [refreshAnimation, setRefreshAnimation] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchSellerBookings(page));
  }, [dispatch, page]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        style: {
          background: '#F87171',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px'
        }
      });
      dispatch(clearSellerBookingError());
    }
  }, [error, dispatch]);

  // Filter pending bookings
  const pendingBookings = sellerBookings.filter(booking => {
    if (!booking || !booking.status) return false;
    const normalizedStatus = booking.status.toString().trim().toLowerCase();
    return normalizedStatus === 'pending';
  });
  
  const handleAcceptBooking = async (bookingId) => {
    setProcessing(true);
    try {
      const result = await dispatch(acceptSellerBooking(bookingId)).unwrap();
      toast(
        ({ id }) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>Booking accepted! Payment link created.</Typography>
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<Link />}
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
      dispatch(fetchSellerBookings(page)); // Refresh the list
    } catch (err) {
      toast.error(err?.message || 'Failed to accept booking', {
        style: {
          background: '#F87171',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px'
        }
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setProcessing(true);
    try {
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
      dispatch(fetchSellerBookings(page)); // Refresh the list
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel booking', {
        style: {
          background: '#F87171',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px'
        }
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshAnimation(true);
    setPage(1); // Reset to first page
    dispatch(fetchSellerBookings(1));
    setTimeout(() => setRefreshAnimation(false), 1000);
  };

  const handleLoadMore = () => {
    if (page < pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  // Helper function to get date difference in days
  const getDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Format price safely
  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '0.00';
    return price.toFixed(2);
  };

  if (loading && page === 1) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 500, color: 'text.secondary' }}>
          Loading bookings...
        </Typography>
      </Box>
    );
  }

  if (error && page === 1) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: 'error.light',
            color: 'error.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" gutterBottom>Error Loading Bookings</Typography>
          <Typography paragraph sx={{ mb: 3 }}>{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<Refresh />}
            onClick={() => dispatch(fetchSellerBookings(1))}
            sx={{ px: 4 }}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          bgcolor: theme.palette.background.default,
          borderRadius: 2
        }}
      >
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
        >
          <Box display="flex" alignItems="center">
            <Badge 
              badgeContent={pendingBookings.length} 
              color="error" 
              max={99}
              sx={{ mr: 2 }}
            >
              <NotificationsActive fontSize="large" color="primary" />
            </Badge>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Pending Bookings
            </Typography>
          </Box>
          
          <IconButton 
            color="primary" 
            onClick={handleRefresh}
            aria-label="Refresh bookings"
            sx={{ 
              bgcolor: 'action.hover',
              transition: 'transform 0.5s',
              transform: refreshAnimation ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
        
        {pendingBookings.length === 0 ? (
          <Fade in={true} timeout={1000}>
            <Paper 
              elevation={2}
              sx={{ 
                py: 8, 
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <HourglassEmpty sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="textSecondary" gutterBottom>
                No Pending Bookings
              </Typography>
              <Typography variant="body1" color="textSecondary">
                All your bookings have been processed or you don't have any bookings yet.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                sx={{ mt: 3 }}
              >
                Refresh
              </Button>
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {pendingBookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking._id}>
                <Fade in={true} timeout={500}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        height: 140, 
                        position: 'relative',
                        bgcolor: 'primary.light',
                        backgroundImage: booking.car?.images?.[0] 
                          ? `url(${booking.car.images[0]})` 
                          : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!booking.car?.images?.[0] && (
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          justifyContent="center" 
                          height="100%"
                        >
                          <DirectionsCar sx={{ fontSize: 60, color: 'primary.contrastText' }} />
                        </Box>
                      )}
                      <Chip
                        icon={<HourglassEmpty />}
                        label="Pending Approval"
                        color="warning"
                        sx={{ 
                          position: 'absolute', 
                          bottom: 16, 
                          right: 16,
                          px: 1,
                          fontWeight: 500
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h5" 
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {booking.car?.brand || 'Car'} {booking.car?.name || 'Vehicle'}
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: 'primary.main'
                          }}
                        >
                          <Person />
                        </Avatar>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            ml: 1,
                            fontWeight: 500
                          }}
                        >
                          {booking.user?.name || 'Customer'}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12}>
                          <Box 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              p: 1.5,
                              bgcolor: 'action.hover',
                              borderRadius: 1
                            }}
                          >
                            <CalendarToday color="primary" sx={{ mr: 1.5 }} />
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                Booking Duration
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {booking.dates?.start 
                                  ? new Date(booking.dates.start).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    }) 
                                  : 'N/A'} - {booking.dates?.end 
                                    ? new Date(booking.dates.end).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      }) 
                                    : 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                                {getDaysDifference(booking.dates?.start, booking.dates?.end)} days
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 3,
                          p: 2,
                          bgcolor: 'success.light',
                          borderRadius: 1,
                          color: 'success.dark'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Total Price
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          ${formatPrice(booking.totalPrice)}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutline />}
                            onClick={() => handleAcceptBooking(booking._id)}
                            disabled={processing}
                            fullWidth
                            size="large"
                            sx={{ 
                              py: 1.5,
                              borderRadius: 2,
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                              '&:hover': {
                                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
                              }
                            }}
                          >
                            Accept
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={processing}
                            fullWidth
                            size="large"
                            sx={{ 
                              py: 1.5,
                              borderRadius: 2
                            }}
                          >
                            Cancel
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
        {pagination.totalPages > 1 && page < pagination.totalPages && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLoadMore}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ px: 4, py: 1.5 }}
            >
              Load More
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SellerBookings;