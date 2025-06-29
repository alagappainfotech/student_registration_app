import React from 'react';
import { Box, Container, Typography, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">Home</MuiLink>
        <Typography color="text.primary">Terms of Service</Typography>
      </Breadcrumbs>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          Terms of Service
        </Typography>
        
        <Typography variant="body1" paragraph>
          Last updated: June 28, 2025
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing or using the Alagappa Academy of Excellence Student Registration Application 
          ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not 
          agree to these Terms, please do not use the Service.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          2. Description of Service
        </Typography>
        <Typography variant="body1" paragraph>
          The Service provides an online platform for student registration, course enrollment, 
          and academic management for Alagappa Academy of Excellence. The features and functionality 
          of the Service may change from time to time without prior notice.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          3. User Accounts
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Registration:</strong> To use certain features of the Service, you must register for an account. 
          You agree to provide accurate and complete information during the registration process.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account 
          credentials and for all activities that occur under your account. You agree to notify us immediately of any 
          unauthorized use of your account.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account at our 
          discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users 
          of the Service, the institution, or third parties, or for any other reason.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          4. User Conduct
        </Typography>
        <Typography variant="body1" paragraph>
          You agree not to:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Box component="li"><Typography variant="body1">Use the Service in any way that violates any applicable laws or regulations</Typography></Box>
          <Box component="li"><Typography variant="body1">Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity</Typography></Box>
          <Box component="li"><Typography variant="body1">Upload, post, or otherwise transmit any content that is unlawful, harmful, threatening, abusive, or otherwise objectionable</Typography></Box>
          <Box component="li"><Typography variant="body1">Engage in any activity that could disable, overburden, damage, or impair the operation of the Service</Typography></Box>
          <Box component="li"><Typography variant="body1">Attempt to gain unauthorized access to any part of the Service</Typography></Box>
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          5. Intellectual Property
        </Typography>
        <Typography variant="body1" paragraph>
          The Service and its original content, features, and functionality are owned by Alagappa Academy of Excellence 
          and are protected by international copyright, trademark, patent, trade secret, and other intellectual 
          property or proprietary rights laws.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          6. Limitation of Liability
        </Typography>
        <Typography variant="body1" paragraph>
          To the fullest extent permitted by law, Alagappa Academy of Excellence shall not be liable for any indirect, 
          incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, 
          use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or 
          use the Service.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          7. Changes to Terms
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to modify or replace these Terms at any time at our discretion. If a revision is 
          material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
          a material change will be determined at our discretion.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          8. Governing Law
        </Typography>
        <Typography variant="body1" paragraph>
          These Terms shall be governed by and construed in accordance with the laws of India, without regard to its 
          conflict of law provisions.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
          9. Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about these Terms, please contact us at:
        </Typography>
        <Typography variant="body1" paragraph>
          Email: terms@alagappa.org<br />
          Phone: +91 9941925769<br />
          Address: No:49, Gangadeeswarar Koil Street, Purasawalkam, Chennai - 84.
        </Typography>
      </Paper>
    </Container>
  );
};

export default TermsOfService;
