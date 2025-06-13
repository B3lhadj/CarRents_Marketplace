
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CircularProgress, Chip, Divider, Button, Tooltip, Card, CardContent, Typography,
  Badge, Avatar, Paper, Box, Stack, Grid, IconButton, useTheme, useMediaQuery,
  Skeleton, Switch
} from '@mui/material';
import {
  HourglassEmpty, CheckCircle, Cancel, CreditCard, Check, Block, Info,
  ExpandMore, ExpandLess, DirectionsCar, CalendarToday, AttachMoney, Bookmark,
  EventAvailable, Receipt, CarRental, Payment, AccessTime,
  Refresh, Star, LocalGasStation, Air, Person, Luggage, Speed, ColorLens,
  Today, Event, ArrowForward, DarkMode, LightMode
} from '@mui/icons-material';
import { initiatePayment, fetchUserBookings, updateBookingStatus } from '../../store/reducers/bookingReducer';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { styled } from '@mui/material/styles';

// Styled Components
const StatusBadge = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'pending' ? theme.palette.warning.light :
    status === 'accepted' ? theme.palette.success.light :
    status === 'paid' ? theme.palette.info.light :
    status === 'completed' ? theme.palette.success.main :
    status === 'cancelled' ? theme.palette.error.light :
    theme.palette.grey[100],
  color: 
    status === 'pending' ? theme.palette.warning.dark :
    status === 'accepted' ? theme.palette.success.dark :
    status === 'paid' ? theme.palette.info.dark :
    status === 'completed' ? theme.palette.success.contrastText :
    status === 'cancelled' ? theme.palette.error.dark :
    theme.palette.grey[800],
  fontWeight: 600,
  textTransform: 'capitalize',
  padding: theme.spacing(0.5, 1),
  fontSize: theme.typography.pxToRem(12),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.05)',
    backgroundColor: 
      status === 'pending' ? theme.palette.warning.main :
      status === 'accepted' ? theme.palette.success.main :
      status === 'paid' ? theme.palette.info.main :
      status === 'completed' ? theme.palette.success.dark :
      status === 'cancelled' ? theme.palette.error.main :
      theme.palette.grey[200],
  },
  '& .MuiChip-icon': {
    marginLeft: 0,
    color: 'inherit',
    fontSize: 16,
  },
}));

const BookingCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-4px)',
  },
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  fontSize: theme.typography.pxToRem(12),
  height: 28,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
    fontSize: 16,
  },
  transition: theme.transitions.create(['background-color'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const Orders = ({ setThemeMode }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { bookings = [], loading, error } = useSelector((state) => state.bookings || {});
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === 'dark');

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (setThemeMode) {
      setThemeMode(!isDarkMode ? 'dark' : 'light');
    }
  };

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  const handleInitiatePayment = (bookingId, totalPrice) => {
    dispatch(initiatePayment({ bookingId, amount: totalPrice, currency: 'EUR' }))
      .unwrap()
      .then(() => toast.success('Paiement initié avec succès'))
      .catch((err) => toast.error(err || 'Échec du lancement du paiement'));
  };

  const handleCancelBooking = (bookingId) => {
    dispatch(updateBookingStatus({ bookingId, status: 'cancelled' }))
      .unwrap()
      .then(() => toast.success('Réservation annulée avec succès'))
      .catch((err) => toast.error(err || 'Échec de l\'annulation'));
  };

  const toggleDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const filteredBookings = safeBookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status.toLowerCase() === activeTab.toLowerCase();
  });

  const statusCounts = safeBookings.reduce((acc, booking) => {
    const status = booking.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { all: safeBookings.length });

  const getStatusIcon = (status) => {
    const iconStyle = { fontSize: 16 };
    switch (status.toLowerCase()) {
      case 'pending': return <HourglassEmpty sx={{ ...iconStyle, color: theme.palette.warning.main }} />;
      case 'accepted': return <CheckCircle sx={{ ...iconStyle, color: theme.palette.success.main }} />;
      case 'declined': return <Cancel sx={{ ...iconStyle, color: theme.palette.error.main }} />;
      case 'paid': return <CreditCard sx={{ ...iconStyle, color: theme.palette.info.main }} />;
      case 'completed': return <Check sx={{ ...iconStyle, color: theme.palette.success.dark }} />;
      case 'cancelled': return <Block sx={{ ...iconStyle, color: theme.palette.grey[500] }} />;
      default: return <Info sx={{ ...iconStyle, color: theme.palette.text.secondary }} />;
    }
  };

  const getFutureBookingsCount = () => {
    const today = new Date();
    return safeBookings.filter(booking => new Date(booking.dates.start) > today).length;
  };

  const getActiveBookingsCount = () => {
    const today = new Date();
    return safeBookings.filter(booking =>
      new Date(booking.dates.start) <= today &&
      new Date(booking.dates.end) >= today &&
      !['cancelled', 'declined'].includes(booking.status.toLowerCase())
    ).length;
  };

  const getCarFeatures = (car) => {
    return [
      { icon: <LocalGasStation />, label: 'Essence' },
      { icon: <Air />, label: 'Climatisation' },
      { icon: <Person />, label: '5 Places' },
      { icon: <Luggage />, label: '2 Valises' },
      { icon: <Speed />, label: 'Automatique' },
      { icon: <ColorLens />, label: 'Bleu métallisé' },
    ];
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        p: 4,
      }}>
        <Stack alignItems="center" spacing={3}>
          <CircularProgress size={60} thickness={4} color="primary" />
          <Typography variant="h6" color="text.secondary">
            Chargement de vos réservations...
          </Typography>
          <Stack spacing={2} width="100%" maxWidth={600}>
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          </Stack>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        p: 4,
      }}>
        <Card sx={{ p: 4, maxWidth: 500, textAlign: 'center', boxShadow: 4, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} justifyContent="center" mb={2}>
            <Cancel color="error" sx={{ fontSize: 30 }} />
            <Typography variant="h6" color="error">
              Erreur lors du chargement
            </Typography>
          </Stack>
          <Typography color="text.secondary" mb={3}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => dispatch(fetchUserBookings())}
            startIcon={<Refresh />}
            size="large"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: 3,
            }}
            aria-label="Retry fetching bookings"
          >
            Réessayer
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      p: { xs: 2, md: 4 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '40%',
        height: '40%',
        background: `radial-gradient(circle, ${theme.palette.primary.light} 0%, transparent 70%)`,
        zIndex: 0,
        opacity: 0.3,
      },
    }}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Card sx={{ 
          mb: 4, 
          color: '#333333',
          padding: '3px',
          marginBottom: '2rem',
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
          boxShadow: 4,
          position: 'relative',
          overflow: 'hidden',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 200,
            height: 200,
            backgroundImage: 'url("/car_silhouette.png")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom right',
            opacity: 0.05,
          },
        }}>
          <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" p={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56,
                boxShadow: 2,
              }}>
                <CarRental sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  Mes Réservations
                </Typography>
                <Typography color="text.secondary">
                  Gérez et suivez toutes vos réservations de véhicules
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">Mode sombre</Typography>
              <Switch
                checked={isDarkMode}
                onChange={handleToggleDarkMode}
                icon={<LightMode fontSize="small" />}
                checkedIcon={<DarkMode fontSize="small" />}
                aria-label="Toggle dark mode"
              />
            </Stack>
          </Stack>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ p: 3, pt: 0 }}>
            <Grid item xs={12} sm={4}>
              <StatCard
                icon={<Receipt />}
                title="Total des Réservations"
                value={safeBookings.length}
                color="primary"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                icon={<CalendarToday />}
                title="Voyages à Venir"
                value={getFutureBookingsCount()}
                color="warning"
                trend={getFutureBookingsCount() > 0 ? 'up' : 'down'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                icon={<CheckCircle />}
                title="Réservations Actives"
                value={getActiveBookingsCount()}
                color="success"
                trend={getActiveBookingsCount() > 0 ? 'up' : 'down'}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Filter Tabs */}
        <Paper sx={{ 
          mb: 3, 
          p: 1.5, 
          borderRadius: 3, 
          overflowX: 'auto',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right, #121212, #1e1e1e)'
            : 'linear-gradient(to right, #f5f5f5, #fafafa)',
          boxShadow: 2,
        }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'nowrap' }}>
            <FilterTab
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              icon={<Bookmark />}
              label="Toutes"
              count={statusCounts.all}
            />
            {['pending', 'accepted', 'paid', 'completed', 'declined', 'cancelled'].map(status => (
              <FilterTab
                key={status}
                active={activeTab === status}
                onClick={() => setActiveTab(status)}
                icon={getStatusIcon(status)}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                count={statusCounts[status] || 0}
                status={status}
              />
            ))}
          </Stack>
        </Paper>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <Stack spacing={3}>
            <AnimatePresence>
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookingCard elevation={2}>
                    <Box sx={{ p: 3 }}>
                      <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={2}>
                        <Stack direction={isMobile ? 'column' : 'row'} spacing={3} alignItems="center" sx={{ flex: 1 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              <Avatar sx={{ 
                                width: 24, 
                                height: 24,
                                bgcolor: 'background.paper',
                                border: '2px solid',
                                borderColor: 'background.paper',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              }}>
                                {getStatusIcon(booking.status)}
                              </Avatar>
                            }
                          >
                            <Avatar
                              src={booking.car?.images?.[0]}
                              sx={{ 
                                width: 80, 
                                height: 80,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              }}
                              variant="rounded"
                            >
                              <DirectionsCar />
                            </Avatar>
                          </Badge>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                              <Box>
                                <Typography variant="h6" fontWeight="bold" color="text.primary">
                                  {booking.car?.brand} {booking.car?.name}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                                  <Star sx={{ color: '#F59E0B', fontSize: 18 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    4.8 (124 avis)
                                  </Typography>
                                </Stack>
                              </Box>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {booking.totalPrice?.toFixed(2)} €
                              </Typography>
                            </Stack>
                            <Stack direction={isMobile ? 'column' : 'row'} spacing={2} mt={2} flexWrap="wrap" rowGap={1}>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <CalendarToday sx={{ color: 'action.active', fontSize: 16 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(booking.dates.start).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </Typography>
                                <ArrowForward sx={{ color: 'action.active', fontSize: 16 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(booking.dates.end).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <AccessTime sx={{ color: 'action.active', fontSize: 16 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {calculateDays(booking.dates.start, booking.dates.end)} jours
                                </Typography>
                              </Stack>
                            </Stack>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StatusBadge
                            icon={getStatusIcon(booking.status)}
                            label={booking.status}
                            status={booking.status.toLowerCase()}
                          />
                          <IconButton
                            onClick={() => toggleDetails(booking._id)}
                            sx={{
                              transform: expandedBooking === booking._id ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease-in-out',
                            }}
                            aria-label={expandedBooking ? 'Collapse booking details' : 'Expand booking details'}
                          >
                            <ExpandMore />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Box>

                    <AnimatePresence>
                      {expandedBooking === booking._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Divider />
                          <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={5} lg={4}>
                                <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
                                  <Box sx={{ 
                                    height: 200,
                                    color: '#333333',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                    <img 
                                      src={booking.car?.images?.[0] || '/car-placeholder.png'} 
                                      alt={`${booking.car?.brand} ${booking.car?.name}`}
                                      style={{ 
                                        maxHeight: '100%', 
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                      }}
                                    />
                                  </Box>
                                  <CardContent>
                                    <Typography variant="h6" color="text.primary" fontWeight="bold">
                                      Caractéristiques
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                      {getCarFeatures(booking.car).map((feature, index) => (
                                        <FeatureChip
                                          key={index}
                                          icon={feature.icon}
                                          label={feature.label}
                                          size="small"
                                        />
                                      ))}
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                              <Grid item xs={12} md={7} lg={8}>
                                <Grid container spacing={3}>
                                  <Grid item xs={12} md={6}>
                                    <DetailBlock
                                      icon={<DirectionsCar sx={{ color: 'primary.main' }} />}
                                      title="Détails du Véhicule"
                                      items={[
                                        { icon: <Info sx={{ color: 'action.active' }} />, 
                                          label: 'Modèle', value: `${booking.car?.brand} ${booking.car?.name}` },
                                        { icon: <AttachMoney sx={{ color: 'action.active' }} />, 
                                          label: 'Prix par jour', value: `${booking.car?.pricePerDay?.toFixed(2)} €` },
                                        { icon: <LocalGasStation sx={{ color: 'action.active' }} />, 
                                          label: 'Carburant', value: 'Essence' },
                                        { icon: <Speed sx={{ color: 'action.active' }} />, 
                                          label: 'Transmission', value: 'Automatique' },
                                      ]}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <DetailBlock
                                      icon={<Receipt sx={{ color: 'primary.main' }} />}
                                      title="Informations de Réservation"
                                      items={[
                                        { 
                                          icon: <Today sx={{ color: 'action.active' }} />,
                                          label: 'Date de départ', 
                                          value: formatFullDate(booking.dates.start)
                                        },
                                        { 
                                          icon: <Event sx={{ color: 'action.active' }} />,
                                          label: 'Date de retour', 
                                          value: formatFullDate(booking.dates.end)
                                        },
                                        { 
                                          icon: <AccessTime sx={{ color: 'action.active' }} />,
                                          label: 'Durée', 
                                          value: `${calculateDays(booking.dates.start, booking.dates.end)} jours (${calculateDays(booking.dates.start, booking.dates.end) * 24} heures)`
                                        },
                                        { 
                                          icon: <Payment sx={{ color: 'action.active' }} />,
                                          label: 'Paiement', 
                                          value: booking.status === 'paid' ? 'Payé' : 'À payer'
                                        },
                                      ]}
                                    />
                                  </Grid>
                                  <Grid item xs={12}>
                                    <DetailBlock
                                      icon={<AttachMoney sx={{ color: 'primary.main' }} />}
                                      title="Détails de Prix"
                                      items={[
                                        { 
                                          label: 'Prix de base', 
                                          value: `${(booking.car?.pricePerDay * calculateDays(booking.dates.start, booking.dates.end)).toFixed(2)} €`
                                        },
                                        { 
                                          label: 'Assurance', 
                                          value: '150.00 €'
                                        },
                                        { 
                                          label: 'Frais de service', 
                                          value: '45.00 €'
                                        },
                                        { 
                                          label: 'Taxes', 
                                          value: '75.00 €'
                                        },
                                        { 
                                          label: 'Total', 
                                          value: `${booking.totalPrice?.toFixed(2)} €`,
                                          bold: true
                                        },
                                      ]}
                                    />
                                  </Grid>
                                </Grid>

                                <Box sx={{ 
                                  mt: 3, 
                                  display: 'flex', 
                                  justifyContent: 'flex-end',
                                  gap: 2,
                                  flexWrap: 'wrap',
                                }}>
                                  {booking.status.toLowerCase() === 'accepted' && (
                                    <>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleCancelBooking(booking._id)}
                                        startIcon={<Cancel />}
                                        sx={{ borderRadius: 2 }}
                                        aria-label="Cancel booking"
                                      >
                                        Annuler
                                      </Button>
                                      <Button
                                        variant="contained"
                                        onClick={() => handleInitiatePayment(booking._id, booking.totalPrice)}
                                        startIcon={<CreditCard />}
                                        sx={{
                                          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                          boxShadow: 2,
                                          borderRadius: 2,
                                          '&:hover': {
                                            boxShadow: 4,
                                          },
                                        }}
                                        aria-label="Initiate payment"
                                      >
                                        Payer maintenant
                                      </Button>
                                    </>
                                  )}
                                  {booking.status.toLowerCase() === 'pending' && (
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleCancelBooking(booking._id)}
                                      startIcon={<Cancel />}
                                      sx={{ borderRadius: 2 }}
                                      aria-label="Cancel booking"
                                    >
                                      Annuler la réservation
                                    </Button>
                                  )}
                                  {booking.status.toLowerCase() === 'paid' && (
                                    <Button
                                      variant="outlined"
                                      startIcon={<Receipt />}
                                      sx={{ borderRadius: 2 }}
                                      aria-label="Download invoice"
                                    >
                                      Télécharger la facture
                                    </Button>
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </BookingCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, color, trend }) => {
  const theme = useTheme();
  return (
    <Card sx={{ 
      p: 3, 
      borderRadius: 2, 
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
        : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
      boxShadow: 2,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
      },
    }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ 
          bgcolor: `${color}.main`, 
          width: 48, 
          height: 48,
          color: theme.palette.getContrastText(theme.palette[color].main),
        }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
          <Typography 
            variant="caption" 
            color={trend === 'up' ? 'success.main' : 'error.main'}
            sx={{ display: 'flex', alignItems: 'center', mt: '0.5rem' }}
          >
            {trend === 'up' ? '↑ 12% ce mois' : '↓ 5% ce mois'}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const FilterTab = ({ active, onClick, icon, label, count, status }) => {
  const theme = useTheme();
  const statusColors = {
    pending: theme.palette.warning,
    accepted: theme.palette.success,
    paid: theme.palette.info,
    completed: theme.palette.success,
    cancelled: theme.palette.error,
    declined: theme.palette.error,
  };

  return (
    <Button
      variant={active ? 'contained' : 'text'}
      onClick={onClick}
      startIcon={React.cloneElement(icon, { 
        sx: { 
          color: active ? 'common.white' : 
                status ? statusColors[status]?.main : 
                theme.palette.text.secondary,
        } 
      })}
      sx={{
        borderRadius: 2,
        px: 2,
        py: 1,
        minWidth: 'auto',
        bgcolor: active 
          ? (status ? statusColors[status]?.main : theme.palette.primary.main)
          : 'transparent',
        color: active ? 'common.white' : 'text.primary',
        '&:hover': {
          bgcolor: active 
            ? (status ? statusColors[status]?.dark : theme.palette.primary.dark)
            : 'action.hover',
        },
        boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.2s ease-in-out',
      }}
      aria-label={`Filter by ${label}`}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" fontWeight="medium">{label}</Typography>
        <Chip 
          label={count} 
          size="small" 
          sx={{ 
            bgcolor: active ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            color: active ? 'common.white' : 'text.secondary',
            height: 20,
            fontSize: '0.65rem',
          }}
        />
      </Stack>
    </Button>
  );
};

const DetailBlock = ({ icon, title, items }) => {
  const theme = useTheme();
  return (
    <Paper sx={{ 
      p: 3, 
      height: '100%',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(to bottom, #1e1e1e, #2a2a2a)'
        : 'linear-gradient(to bottom, #fafafa, #f5f5f5)',
      borderRadius: 2,
      boxShadow: 1,
    }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        {icon}
        <Typography variant="h6" fontWeight="bold" color="text.primary">{title}</Typography>
      </Stack>
      <Stack spacing={2}>
        {items.map((item, index) => (
          <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
            <Box sx={{ pt: 0.5, color: 'action.active' }}>{item.icon || <Info sx={{ color: 'action.active' }} />}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              <Typography variant="body1" fontWeight={item.bold ? 'bold' : 'normal'} color="text.primary">
                {item.value}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

const EmptyState = ({ activeTab }) => {
  const theme = useTheme();
  return (
    <Card sx={{ 
      p: 6, 
      textAlign: 'center',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)'
        : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      boxShadow: 4,
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <DirectionsCar sx={{ 
          fontSize: 100, 
          color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
        }} />
      </Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
        {activeTab === 'all' ? 'Aucune réservation trouvée' : `Aucune réservation ${activeTab}`}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
        {activeTab === 'all'
          ? "Vous n'avez pas encore effectué de réservation. Commencez par parcourir nos véhicules disponibles."
          : `Vous n'avez aucune réservation ${activeTab} pour le moment.`}
      </Typography>
      <Button
        variant="contained"
        startIcon={<DirectionsCar />}
        href="/vehicles"
        size="large"
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: 4,
          borderRadius: 2,
          '&:hover': {
            boxShadow: 6,
          },
        }}
        aria-label="Browse vehicles"
      >
        Parcourir les véhicules
      </Button>
    </Card>
  );
};

// Helper Functions
function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return duration > 0 ? duration : 1;
}

function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default Orders;
