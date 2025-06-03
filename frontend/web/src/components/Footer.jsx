import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 2, 
        backgroundColor: 'primary.dark',
        color: 'common.white',
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            &copy; {new Date().getFullYear()} Alagappa Academy of Excellence. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link 
              href="#" 
              variant="body2" 
              sx={{ 
                color: 'inherit', 
                opacity: 0.8,
                textDecoration: 'none',
                '&:hover': { 
                  color: 'primary.light',
                  opacity: 1
                } 
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              variant="body2" 
              sx={{ 
                color: 'inherit', 
                opacity: 0.8,
                textDecoration: 'none',
                '&:hover': { 
                  color: 'primary.light',
                  opacity: 1
                } 
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
