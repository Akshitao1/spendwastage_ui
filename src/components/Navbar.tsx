import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { completeLogout } from '../utils/authUtils';

const Navbar: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await completeLogout(auth);
      navigate('/login');
    } catch (error) {
      // Failed logout
    }
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  // Get user info from the OIDC user profile
  const userProfile = auth.user?.profile;
  const userName = userProfile?.name || userProfile?.email;
  const userPicture = userProfile?.picture;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={handleLogoClick}
        >
          Joveo Spend Wastage Actions
        </Typography>
        
        {auth.isAuthenticated && userProfile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {userPicture && (
              <Avatar 
                src={userPicture} 
                alt={userName || 'User'}
                sx={{ marginRight: 1, width: 32, height: 32 }}
              />
            )}
            <Typography variant="body1" sx={{ marginRight: 2 }}>
              {userName || 'User'}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
        
        {!auth.isAuthenticated && !auth.isLoading && (
          <Button color="inherit" onClick={() => auth.signinRedirect()}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 