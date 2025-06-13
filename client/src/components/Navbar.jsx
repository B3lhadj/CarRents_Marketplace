import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { user_reset, messageClear } from '../store/reducers/authReducer';
import {
  Car,
  Menu as MenuIcon,
  LogIn,
  User,
  ArrowDown,
  LogOut,
  Search as SearchIcon,
  Bell,
  X,
  Check
} from 'lucide-react';
import {
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Button,
  Avatar,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
  Badge,
  Divider,
  Box,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État d'authentification depuis Redux
  const {
    userInfo,
    loading: authLoading,
    error: authError,
    success: authSuccess
  } = useSelector((state) => state.auth);
  
  const isAuthenticated = !!userInfo;

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElMobile, setAnchorElMobile] = useState(null);
  const [notificationCount] = useState(3); // Vous pouvez le rendre dynamique
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Gestion des messages
  useEffect(() => {
    if (authError || authSuccess) {
      const timer = setTimeout(() => {
        dispatch(messageClear());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError, authSuccess, dispatch]);

  // Items de navigation
  const navItems = [
    { label: 'Home', path: '/', icon: <Car size={18} /> },
    { label: 'Cars', path: '/cars' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
{ label: 'Partner', path: 'http://localhost:3001/register' }  ];

  // Handlers
  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleMobileMenuOpen = (event) => {
    setAnchorElMobile(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorElMobile(null);
  };

  const handleLogout = () => {
    dispatch(user_reset());
    localStorage.removeItem('customerToken');
    handleUserMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  };

  const handleLogin = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleSignup = () => {
    navigate('/register');
  };

  if (authLoading) {
    return (
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'center' }}>
          <CircularProgress color="inherit" size={24} />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ maxWidth: 'xl', mx: 'auto', width: '100%', px: { xs: 1, sm: 2 } }}>
          {/* Logo et menu mobile */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ mr: 1, display: { lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  p: 1,
                  borderRadius: 1,
                  mr: 1
                }}
              >
                <Car size={24} />
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Rent<span style={{ color: '#2563EB' }}>Cars</span>
              </Typography>
            </Link>
          </Box>

          {/* Navigation principale (desktop) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, ml: 3 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  mx: 0.5
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Barre de recherche (mobile) */}
          {showMobileSearch && (
            <Box sx={{ flexGrow: 1, display: { lg: 'none' }, mx: 1 }}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon size={18} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchQuery('')}
                        >
                          <X size={16} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </Box>
          )}

          {/* Actions utilisateur */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Bouton recherche mobile */}
            <IconButton
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              sx={{ display: { lg: 'none' } }}
            >
              {showMobileSearch ? <X size={20} /> : <SearchIcon size={20} />}
            </IconButton>

            {/* Barre de recherche desktop */}
            <form onSubmit={handleSearch} style={{ display: { xs: 'none', lg: 'block' } }}>
              <TextField
                size="small"
                placeholder="Search cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size={18} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 220, mr: 1 }}
              />
            </form>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <IconButton color="inherit">
                  <Badge badgeContent={notificationCount} color="error">
                    <Bell size={20} />
                  </Badge>
                </IconButton>

                {/* Menu utilisateur */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    onClick={handleUserMenuOpen}
                    startIcon={
                      <Avatar
                        src={userInfo?.image}
                        alt={userInfo?.name}
                        sx={{ width: 28, height: 28 }}
                      />
                    }
                    endIcon={<ArrowDown size={16} />}
                    sx={{ textTransform: 'none', color: 'text.primary' }}
                  >
                    <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                      {userInfo?.name || 'My Account'}
                    </Typography>
                  </Button>

                  <Menu
                    anchorEl={anchorElUser}
                    open={Boolean(anchorElUser)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        py: 0.5,
                        borderRadius: 2
                      }
                    }}
                  >
                    <MenuItem onClick={() => { navigate('/dashboard'); handleUserMenuClose(); }}>
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                      My Profile
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/bookings'); handleUserMenuClose(); }}>
                      My Bookings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <LogOut size={16} style={{ marginRight: 8 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            ) : (
              <>
                {/* Boutons login/signup */}
                <Button
                  variant="outlined"
                  startIcon={<LogIn size={16} />}
                  onClick={handleLogin}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  startIcon={<User size={16} />}
                  onClick={handleSignup}
                  sx={{ ml: 1 }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>

        {/* Menu mobile */}
        <Menu
          anchorEl={anchorElMobile}
          open={Boolean(anchorElMobile)}
          onClose={handleMobileMenuClose}
          PaperProps={{
            sx: {
              width: '100%',
              maxWidth: 'calc(100% - 32px)',
              mt: 1,
              mx: 2
            }
          }}
        >
          {navItems.map((item) => (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleMobileMenuClose}
              selected={location.pathname === item.path}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {item.icon}
                {item.label}
              </Box>
            </MenuItem>
          ))}

          <Divider />

          {isAuthenticated ? (
            <>
              <MenuItem onClick={() => { navigate('/dashboard'); handleMobileMenuClose(); }}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogOut size={16} style={{ marginRight: 8 }} />
                Logout
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => { handleLogin(); handleMobileMenuClose(); }}>
                <LogIn size={16} style={{ marginRight: 8 }} />
                Login
              </MenuItem>
              <MenuItem onClick={() => { handleSignup(); handleMobileMenuClose(); }}>
                <User size={16} style={{ marginRight: 8 }} />
                Sign Up
              </MenuItem>
            </>
          )}
        </Menu>
      </AppBar>

      {/* Messages d'erreur/succès */}
      <Snackbar
        open={!!authError}
        autoHideDuration={5000}
        onClose={() => dispatch(messageClear())}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => dispatch(messageClear())}>
          {authError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!authSuccess}
        autoHideDuration={5000}
        onClose={() => dispatch(messageClear())}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => dispatch(messageClear())}>
          {authSuccess}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;