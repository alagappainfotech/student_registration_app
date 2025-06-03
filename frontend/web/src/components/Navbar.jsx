import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Person as PersonIcon, Logout as LogoutIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const LogoImage = styled('img')(({ theme }) => ({
  height: '40px',
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    height: '32px',
  },
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  '&:hover': {
    opacity: 0.9,
  },
});

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user');
    
    // Redirect to login
    navigate('/login');
    handleClose();
  };

  const handleDashboard = () => {
    const userRole = localStorage.getItem('user_role')?.toLowerCase();
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'faculty') {
      navigate('/faculty/dashboard');
    } else if (userRole === 'student') {
      navigate('/student/dashboard');
    }
    handleClose();
  };

  const userRole = localStorage.getItem('user_role')?.toLowerCase();
  const isLoginPage = location.pathname === '/login';

  // Don't show navbar on login page
  if (isLoginPage) {
    return null;
  }

  return (
    <AppBar position="static" sx={{ zIndex: 1100, bgcolor: '#1a237e' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <LogoContainer component="a" href="/">
          <LogoImage 
            src="/logos/aae-logo.png" 
            alt="Alagappa Academy of Excellence Logo"
            style={{ height: '40px', width: 'auto' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logos/logo-placeholder.svg';
            }}
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{
              fontWeight: 700,
              fontSize: '1.2rem',
              display: { xs: 'none', sm: 'block' },
              color: '#ffffff',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              ml: 2,
              letterSpacing: '0.5px'
            }}
          >
            ALAGAPPA ACADEMY OF EXCELLENCE
          </Typography>
        </LogoContainer>

        {userRole && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/about')}
              sx={{ 
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              About Us
            </Button>
            {!user && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Login
              </Button>
            )}
            {/* Dashboard Button */}
            <Button 
              color="inherit" 
              onClick={handleDashboard}
              startIcon={<DashboardIcon />}
              sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }}
            >
              Dashboard
            </Button>
            
            {/* Logout Button */}
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Logout
            </Button>
            
            {/* Mobile Menu */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <PersonIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleDashboard}>
                <DashboardIcon sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
