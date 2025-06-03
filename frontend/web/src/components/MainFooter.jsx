import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link as MuiLink,
  List,
  ListItem,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const MainLogoImg = styled('img')({
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
});

const navLinks = [
  { title: 'Home', href: '#hero' },
  { title: 'Programs', href: '#programs' },
  { title: 'Why Us', href: '#why-us' },
  { title: 'Faculty', href: '#faculty' },
  { title: 'Contact', href: '#contact' },
];

const globalSocialLinks = [
  { icon: <InstagramIcon />, name: 'Instagram', url: 'https://www.instagram.com/alg_academy_of_excellence/' },
  { icon: <FacebookIcon />, name: 'Facebook', url: 'https://www.facebook.com/algacademyofexcellence' },
  { icon: <TwitterIcon />, name: 'Twitter', url: 'https://twitter.com/AlagappaAcademy' },
  { icon: <LinkedInIcon />, name: 'LinkedIn', url: 'https://www.linkedin.com/company/alagappa-academy-of-excellence' },
];

const chennaiContact = {
  city: "Chennai (Purasawalkam)",
  address: "No:49, Gangadeeswarar Koil Street, Purasawalkam, Chennai - 84.",
  phones: ["9941925769", "6383916070"],
  emails: ["firdouse@alagappa.org", "priyanga@alagappa.org"],
  person: "Ms. Firdouse T"
};

const karaikudiContact = {
  city: "Karaikudi",
  address: "Alagappa Group of Educational Institution, Alagappa Puram, Karaikudi.",
  phones: ["7708784364", "9789285627"],
  emails: ["nehru@alagappa.org.com"],
  person: "Mr. G. Nehru"
};

const MainFooter = ({ onScrollTo }) => {
  const theme = useTheme();
  
  const ContactInfo = ({ location }) => (
    <Box>
      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: 'primary.light', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {location.city}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <LocationOnIcon sx={{ mr: 1, mt: 0.25, color: 'primary.light', fontSize: '1rem', flexShrink: 0 }} />
        <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.5, fontSize: '0.9rem' }}>
          {location.address}
        </Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <PhoneIcon sx={{ mr: 1, color: 'primary.light', fontSize: '1rem', flexShrink: 0 }} />
          <Box>
            {location.phones.map((phone, i) => (
              <Typography key={i} variant="body2" component="div" sx={{ opacity: 0.8, lineHeight: 1.6, fontSize: '0.9rem' }}>
                {phone}
              </Typography>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 1, color: 'primary.light', fontSize: '0.95rem', flexShrink: 0 }} />
          <Box>
            {location.emails.map((email, i) => (
              <Typography key={i} variant="body2" component="div" sx={{ opacity: 0.8, lineHeight: 1.6, fontSize: '0.9rem' }}>
                {email}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
      <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, fontStyle: 'italic', mt: 0.5, fontSize: '0.8rem' }}>
        Contact: {location.person}
      </Typography>
    </Box>
  );

  return (
    <Box 
      component="footer" 
      id="contact"
      sx={{ 
        background: theme.palette.grey[900],
        color: theme.palette.common.white,
        pt: 6,
        pb: 4,
        position: 'relative',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 2,
                p: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                maxWidth: 'fit-content'
              }}>
                <MainLogoImg 
                  src="/logos/aae-logo.png" 
                  alt="Alagappa Academy Logo" 
                  sx={{ 
                    height: '50px',
                    width: 'auto',
                    objectFit: 'contain'
                  }} 
                />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, lineHeight: 1.6, fontSize: '0.95rem' }}>
                Premier educational institution providing quality education from KG to Grade 12 and competitive exam coaching.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                {globalSocialLinks.map((social) => (
                  <IconButton 
                    key={social.name} 
                    component="a" 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    size="small"
                    sx={{ 
                      color: 'common.white', 
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[2]
                      },
                      transition: 'all 0.2s ease',
                      width: 36,
                      height: 36
                    }}
                  >
                    {React.cloneElement(social.icon, { fontSize: 'small' })}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: 'primary.light', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Links
            </Typography>
            <List dense disablePadding>
              {navLinks.map((link) => (
                <ListItem key={link.title} disableGutters sx={{ py: 0.5 }}>
                  <MuiLink 
                    component="button" 
                    onClick={() => onScrollTo && onScrollTo(link.href)} 
                    sx={{
                      color: 'inherit',
                      opacity: 0.8,
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      py: 0.5,
                      '&:hover': {
                        color: 'primary.light',
                        opacity: 1,
                        transform: 'translateX(3px)'
                      }
                    }}
                  >
                    {link.title}
                  </MuiLink>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Contact Info - Chennai */}
          <Grid item xs={12} sm={6} md={3}>
            <ContactInfo location={chennaiContact} />
          </Grid>

          {/* Contact Info - Karaikudi */}
          <Grid item xs={12} sm={6} md={3}>
            <ContactInfo location={karaikudiContact} />
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box 
          sx={{ 
            mt: 6, 
            pt: 3, 
            borderTop: `1px solid ${theme.palette.grey[800]}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: { xs: 'center', sm: 'left' } }}>
            &copy; {new Date().getFullYear()} Alagappa Academy of Excellence. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <MuiLink 
              href="#" 
              variant="body2" 
              sx={{ 
                color: 'inherit', 
                opacity: 0.8,
                '&:hover': { 
                  color: 'primary.light',
                  opacity: 1
                } 
              }}
            >
              Privacy Policy
            </MuiLink>
            <MuiLink 
              href="#" 
              variant="body2" 
              sx={{ 
                color: 'inherit', 
                opacity: 0.8,
                '&:hover': { 
                  color: 'primary.light',
                  opacity: 1
                } 
              }}
            >
              Terms of Service
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MainFooter;
