import React from 'react';
import { Box, Container, Typography, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">Home</MuiLink>
        <Typography color="text.primary">Privacy Policy</Typography>
      </Breadcrumbs>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          Privacy Policy
        </Typography>
        
        <Typography variant="body1" paragraph>
          Last updated: June 28, 2025
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          1. Introduction
        </Typography>
        <Typography variant="body1" paragraph>
          Alagappa Academy of Excellence ("we", "our", or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and safeguard your information when you use our 
          student registration application and website (the "Service").
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing or using our Service, you agree to the collection and use of information in 
          accordance with this Privacy Policy.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          2. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Personal Information:</strong> When you register for an account, we collect personal information 
          such as your name, email address, phone number, address, date of birth, and gender.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Academic Information:</strong> We collect information about your educational background, 
          including class enrolled, section, and organization.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Usage Data:</strong> We collect information on how you interact with our Service, 
          including log data, device information, and analytics.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          3. How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use the information we collect to:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Box component="li"><Typography variant="body1">Provide, maintain, and improve our Service</Typography></Box>
          <Box component="li"><Typography variant="body1">Process your registration and manage your account</Typography></Box>
          <Box component="li"><Typography variant="body1">Send you administrative information and updates</Typography></Box>
          <Box component="li"><Typography variant="body1">Respond to your inquiries and provide support</Typography></Box>
          <Box component="li"><Typography variant="body1">Monitor the usage of our Service and prevent fraud</Typography></Box>
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          4. Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          The security of your data is important to us. We implement appropriate security measures to protect your 
          personal information. However, no method of transmission over the Internet or electronic storage is 
          100% secure, and we cannot guarantee absolute security.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          5. Data Retention
        </Typography>
        <Typography variant="body1" paragraph>
          We will retain your personal information only for as long as necessary to fulfill the purposes outlined 
          in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          6. Your Rights
        </Typography>
        <Typography variant="body1" paragraph>
          You have the right to:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Box component="li"><Typography variant="body1">Access and receive a copy of your personal data</Typography></Box>
          <Box component="li"><Typography variant="body1">Rectify inaccurate or incomplete information</Typography></Box>
          <Box component="li"><Typography variant="body1">Request deletion of your personal data</Typography></Box>
          <Box component="li"><Typography variant="body1">Object to the processing of your personal data</Typography></Box>
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          7. Changes to This Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
          the new Privacy Policy on this page and updating the "Last updated" date.
        </Typography>
        <Typography variant="body1" paragraph>
          You are advised to review this Privacy Policy periodically for any changes.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          8. Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us at:
        </Typography>
        <Typography variant="body1" paragraph>
          Email: privacy@alagappa.org<br />
          Phone: +91 9941925769<br />
          Address: No:49, Gangadeeswarar Koil Street, Purasawalkam, Chennai - 84.
        </Typography>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
