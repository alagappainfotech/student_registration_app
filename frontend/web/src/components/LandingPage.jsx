import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  styled,
  keyframes,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
  IconButton,
  Drawer,
  ListSubheader,
  Paper,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RegistrationDialog from './RegistrationDialog'; // Assuming this exists
import MainFooter from './MainFooter'; // Import the new MainFooter component
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import SchoolIcon from '@mui/icons-material/School'; // General education
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly'; // For KG
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload'; // For Boards
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Achievements/Competitive Exams
import CastForEducationIcon from '@mui/icons-material/CastForEducation'; // Modern Learning
import GroupIcon from '@mui/icons-material/Group'; // Small Batches
import AssessmentIcon from '@mui/icons-material/Assessment'; // Assessments
import ScienceIcon from '@mui/icons-material/Science'; // JEE/NEET
import GavelIcon from '@mui/icons-material/Gavel'; // CLAT
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // TNPSC/UPSC
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'; // NDA
import ArchitectureIcon from '@mui/icons-material/Architecture'; // NATA


import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WebIcon from '@mui/icons-material/Language';


// --- KEYFRAMES & STYLED COMPONENTS ---
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const MainLogoImg = styled('img')({
  height: '50px',
  verticalAlign: 'middle',
  cursor: 'pointer'
});

const HeroMainLogo = styled('img')(({ theme }) => ({
  height: '150px',
  width: 'auto',
  maxWidth: '100%',
  marginBottom: theme.spacing(2),
  animation: `${pulse} 3s ease-in-out infinite`,
  objectFit: 'contain',
  display: 'block',
  margin: '0 auto',
  [theme.breakpoints.down('md')]: {
    height: '120px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '100px',
  },
  '&:hover': {
    opacity: 0.9,
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  color: '#fff',
  overflow: 'hidden',
  padding: theme.spacing(12, 2, 6), // Added more bottom padding for scroll indicator
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'url(/logos/aae-logo.png) center/cover', // Assuming this image exists
    opacity: 0.05,
    zIndex: 1,
  },
}));

const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: '3.5rem',
  fontWeight: 900,
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(90deg, #fff 0%, #84ffff 50%, #00e5ff 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  lineHeight: 1.2,
  [theme.breakpoints.down('lg')]: { fontSize: '3rem' },
  [theme.breakpoints.down('md')]: { fontSize: '2.6rem' },
  [theme.breakpoints.down('sm')]: { fontSize: '2rem' },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 400,
  maxWidth: '800px',
  margin: `${theme.spacing(1)} auto ${theme.spacing(4)} auto`,
  opacity: 0.9,
  lineHeight: 1.6,
  [theme.breakpoints.down('md')]: { fontSize: '1.25rem' },
  [theme.breakpoints.down('sm')]: { fontSize: '1.1rem' },
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  flexWrap: 'wrap',
  justifyContent: 'center',
  '& .MuiButton-root': {
    minWidth: '180px',
    padding: '12px 24px',
    borderRadius: '30px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    width: '100%',
    '& > *': { width: '100%', maxWidth: '300px', margin: `${theme.spacing(1)} auto` },
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.spacing(2.5),
  marginTop: theme.spacing(5),
  padding: theme.spacing(0, 1),
  maxWidth: '900px', width: '100%',
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  minWidth: '140px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: theme.shape.borderRadius * 1.5,
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#fff',
}));

const ScrollIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(3), // Adjusted position
  left: '50%',
  transform: 'translateX(-50%)',
  textAlign: 'center',
  zIndex: 3, cursor: 'pointer',
  animation: `${float} 2.5s ease-in-out infinite`,
  '&:hover svg': { color: theme.palette.primary.light },
  [theme.breakpoints.down('md')]: { display: 'none' },
}));

const StyledSection = React.forwardRef(({ bgColor = 'transparent', ...props }, ref) => (
  <Paper 
    ref={ref}
    {...props}
    sx={(theme) => ({
      padding: theme.spacing(8, 0),
      backgroundColor: bgColor === 'alternate' 
        ? theme.palette.grey[100] 
        : (bgColor === 'paper' 
          ? theme.palette.background.paper 
          : bgColor),
      borderRadius: 0,
      boxShadow: 'none',
      [theme.breakpoints.down('md')]: {
        padding: theme.spacing(6, 0),
      },
      ...(props.sx ? (typeof props.sx === 'function' ? props.sx(theme) : props.sx) : {})
    })}
  />
));

StyledSection.displayName = 'StyledSection';


const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[6],
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const BaseStyledCard = styled(Card)(({ theme }) => ({ // Renamed to avoid conflict, for program/faculty cards
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
}));


// --- DATA ---
const navLinks = [
  { title: 'Why Us', href: '#why-us' },
  { title: 'Programs', href: '#programs' },
  { title: 'Faculty', href: '#faculty' },
  { title: 'Contact', href: '#contact' },
];

// Updated features based on documents
const featuresData = [
  { icon: <ChildFriendlyIcon sx={{ fontSize: 'inherit' }} />, title: 'Experienced Educators', description: 'Our team consists of experienced and passionate educators dedicated to student success.' },
  { icon: <AssuredWorkloadIcon sx={{ fontSize: 'inherit' }} />, title: 'Strong Conceptual Foundation', description: 'We focus on building a strong understanding of core concepts for long-term learning.' },
  { icon: <GroupIcon sx={{ fontSize: 'inherit' }} />, title: 'Individual Attention', description: 'Small batch sizes ensure personalized attention for every student.' },
  { icon: <AssessmentIcon sx={{ fontSize: 'inherit' }} />, title: 'Regular Assessments', description: 'Weekly tests and progress reports help track and improve performance.' },
  { icon: <CastForEducationIcon sx={{ fontSize: 'inherit' }} />, title: 'Modern Learning Environment', description: 'A safe, supportive, and modern environment conducive to learning.' },
];

// Updated programsData based on documents
const programsData = [
  {
    id: "kg", title: "KG Early Learning Program",
    icon: <ChildFriendlyIcon color="primary" sx={{ fontSize: 50 }} />,
    description: "Nurturing young minds with Montessori-based activities that align with school curriculum.",
    points: [
      "Sensorial Play", 
      "Number Work & Phonics", 
      "Practical Life Skills", 
      <Box key="timing-kg" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
        <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} /> 4 PM - 5 PM
      </Box>
    ],
    category: "Foundation"
  },
  {
    id: "school", title: "School Tuition (Std I - XII)",
    icon: <SchoolIcon color="primary" sx={{ fontSize: 50 }} />,
    description: "Comprehensive academic support for Matriculation, CBSE, and ICSE boards.",
    points: [
      "All core subjects covered", 
      "Focus on Board Exam Readiness", 
      "Subject-wise question papers (VI-XII)", 
      <Box key="timing-school" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
        <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} /> Mon-Sat, 4 PM - 6 PM
      </Box>
    ],
    category: "Academics"
  },
  {
    id: "neetjee", title: "NEET & JEE Coaching",
    icon: <ScienceIcon color="primary" sx={{ fontSize: 50 }} />,
    description: "Expert coaching for medical and engineering entrance examinations.",
    points: [
      "Experienced Faculty", 
      "Comprehensive Syllabus Coverage", 
      "Regular Mock Tests & Analysis", 
      <Box key="timing-neet" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
        <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} /> Mon-Sat, 4 PM - 6:30 PM
      </Box>
    ],
    category: "Competitive Exams"
  },
  {
    id: "clatnda", title: "CLAT, NDA, NATA Coaching",
    icon: <GavelIcon color="primary" sx={{ fontSize: 50 }} />, // Gavel for CLAT, could be generic
    description: "Specialized coaching for law, defense, and architecture entrance tests.",
    points: [
      "Expert Guidance", 
      "Targeted Study Materials", 
      "Mock Tests Simulating Exam Patterns", 
      <Box key="timing-clat" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
        <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} /> Mon-Sat, 4 PM - 6:30 PM
      </Box>
    ],
    category: "Competitive Exams"
  },
  {
    id: "civilservices", title: "TNPSC & UPSC Coaching",
    icon: <AccountBalanceIcon color="primary" sx={{ fontSize: 50 }} />,
    description: "Dedicated coaching for Tamil Nadu public services and Union civil services exams.",
    points: [
      "GS Foundation & Current Affairs", 
      "Answer Writing Practice", 
      "Mock Interviews", 
      <Box key="timing-civil" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
        <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} /> Mon-Sat, 4 PM - 6:30 PM
      </Box>
    ],
    category: "Competitive Exams"
  }
];

// Faculty data from AAE staff list.pdf (selected examples)
const facultyData = [
  { 
    name: 'Ms. Divya Jayashree', 
    image: '/logos/faculty/jayasree-s.jpg', 
    qualification: 'B.Sc, B.Ed', 
    experience: '12 Years', 
    role: 'Std I Teacher (All Subjects)' 
  },
  { 
    name: 'Ms. Priyanka V', 
    image: '/logos/faculty/priyanka-v.jpg', 
    qualification: 'M.Sc, Montessori', 
    experience: '4 Years', 
    role: 'Std III Teacher (All Subjects)' 
  },
  { 
    name: 'Ms. Mary Rajamani', 
    image: '/logos/faculty/mary-rajamani.jpg', 
    qualification: 'M.Sc, B.Ed', 
    experience: '22 Years', 
    role: 'Social Science (VI-VIII)' 
  },
  { name: 'Ms. U. Jayamala', image: '/logos/faculty/u.jayamala.jpg', qualification: 'M.Sc, M.Ed', experience: '20 Years', role: 'Mathematics (XI & XII - Science)' },
  // { name: 'Mr. Eshwar', image: '/logos/logo-placeholder.svg', qualification: 'M.Sc, B.Ed', experience: '7 Years', role: 'Commerce (XI & XII)' } // Example of a male teacher
];

const testimonialsData = [ // Kept placeholder structure, update with real testimonials
  { id: 1, name: 'Satisfied Parent', role: 'Parent of Grade X Student', quote: 'AAE has provided excellent support for my child. The teachers are very dedicated.', rating: 5, image: '/logos/logo-placeholder.svg' },
  { id: 2, name: 'Successful Aspirant', role: 'NEET Qualifier', quote: 'The focused coaching and regular tests at AAE were instrumental in my success.', rating: 5, image: '/logos/logo-placeholder.svg' },
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
  emails: ["preethika@alagappa.org"],
  person: "Ms. Preethika M"
};

const contactLocations = [chennaiContact, karaikudiContact];

const globalSocialLinks = [
  { icon: <InstagramIcon />, name: 'Instagram', url: 'https://www.instagram.com/alg_academy_of_excellence/' },
  { icon: <FacebookIcon />, name: 'Facebook', url: 'https://www.facebook.com/algacademyofexcellence' },
  { icon: <TwitterIcon />, name: 'Twitter', url: 'https://twitter.com/alg_academy' },
  { icon: <LinkedInIcon />, name: 'LinkedIn', url: 'https://www.linkedin.com/company/alagappa-academy-of-excellence' },
];

// --- HELPER COMPONENTS ---
const AnimatedText = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  useEffect(() => {
    if (inView) controls.start({ opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] } });
  }, [controls, inView, delay]);
  return <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={controls}>{children}</motion.div>;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const SectionTitle = ({ children, subtitle, ...props }) => (
    <Box sx={{ mb: {xs: 4, md: 6}, textAlign: 'center' }}>
        <Typography
            variant="h2"
            component="h2"
            gutterBottom={!subtitle}
            sx={{
            fontWeight: 700,
            color: 'primary.main',
            textTransform: 'capitalize',
            ...props.sx
            }}
            {...props}
        >
            {children}
        </Typography>
        {subtitle && <Typography variant="h6" color="text.secondary" sx={{maxWidth: '700px', margin: '0 auto'}}>{subtitle}</Typography>}
    </Box>
);

const ProgramCard = ({ icon, title, description, points = [] }) => (
  <BaseStyledCard sx={{ textAlign: 'center' }}>
    <CardContent sx={{ p: {xs: 2.5, md:3.5}, display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
      <Box sx={{ fontSize: {xs:40, md:50}, color: 'primary.main', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" component="h3" gutterBottom fontWeight="600" sx={{minHeight: {xs: 'auto', md: '64px'} /* approx 2 lines */ }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph sx={{minHeight: {xs: 'auto', md:'72px'} /* approx 3 lines */, flexGrow: 1}}>
        {description}
      </Typography>
      <List dense sx={{ textAlign: 'left', width: '100%', mt: 'auto', pt: 1, borderTop: points.length > 0 ? '1px solid #eee' : 'none' }}>
        {points.map((point, i) => (
          <ListItem key={i} disablePadding sx={{py: 0.3}}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleIcon color="success" sx={{fontSize: '1.1rem'}} />
            </ListItemIcon>
            <ListItemText primary={point} primaryTypographyProps={{variant: 'caption'}} />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </BaseStyledCard>
);

const FacultyMemberCard = ({ name, image, qualification, experience, role }) => {
  const theme = useTheme();
  return (
    <BaseStyledCard sx={{ textAlign: 'center' }}>
      <CardMedia
        component="img"
        height="240"
        image={image || '/logos/faculty/default-avatar.png'}
        alt={name}
        onError={(e) => { e.target.onerror = null; e.target.src = '/logos/faculty/default-avatar.png'; }}
        sx={{ objectFit: 'cover', borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" fontWeight="600" fontSize="1.1rem">
          {name}
        </Typography>
        <Typography variant="body2" color="primary.main" gutterBottom sx={{fontSize: '0.85rem'}}>
          {role}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {qualification}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Experience: {experience}
        </Typography>
      </CardContent>
    </BaseStyledCard>
  );
};

const AppBarComponent = ({ onRegisterClick, onScrollTo }) => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    // Throttled scroll handler to improve performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 10;
          if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250, pt:2 }}>
      <IconButton onClick={handleDrawerToggle} sx={{position:'absolute', top: 8, right: 8}}><CloseIcon /></IconButton>
      <Box 
        component="img" 
        src={"/logos/aae-logo.png"} 
        alt="Alagappa Academy Logo" 
        onClick={() => onScrollTo('#hero')} 
        sx={{
          mb: 2, 
          height: '40px',
          width: 'auto',
          minWidth: '40px',
          // No filter needed for drawer as it has a light background
          filter: 'none',
          '&:hover': { 
            cursor: 'pointer',
            opacity: 0.9
          },
          objectFit: 'contain',
          display: 'block'
        }}
        onLoad={(e) => {
          console.log('Drawer logo loaded successfully:', e.target.src);
          console.log('Drawer logo dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
        }}
        onError={(e) => {
          console.error('Failed to load drawer logo. Current src:', e.target.src);
          e.target.onerror = null;
          e.target.src = '/logo192.png';
        }}
      />
      <List>
        {navLinks.map((link) => (
          <ListItem button key={link.title} onClick={() => onScrollTo(link.href)}>
            <ListItemText primary={link.title} primaryTypographyProps={{fontWeight: 500}}/>
          </ListItem>
        ))}
        <ListItem sx={{justifyContent: 'center', mt:1}}>
            <Button variant="contained" color="primary" onClick={onRegisterClick}>Register Now</Button>
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <>
      <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: theme.zIndex.drawer + 1 }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: scrolled ? 'rgba(255, 255, 255, 0.98)' : theme.palette.primary.main,
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease-in-out',
            py: scrolled ? 1 : 1.5,
            width: '100%',
            '&.MuiAppBar-root': {
              padding: 0,
              margin: 0
            }
          }}
        >
          <Container maxWidth={false} disableGutters sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
            <Toolbar 
              disableGutters 
              sx={{ 
                width: '100%',
                maxWidth: theme.breakpoints.values.lg,
                margin: '0 auto',
                px: { xs: 0, sm: 0, md: 0 },
              justifyContent: 'space-between', 
              minHeight: { xs: 60, md: 70 },
              height: '100%',
              transition: 'all 0.3s ease-in-out',
              opacity: 1
            }}
          >
            <Box 
              component="a" 
              onClick={() => onScrollTo('#hero')} 
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 }
              }}
            >
              <Box 
                component="img"
                src={"/logos/aae-logo.png"} 
                alt="Alagappa Academy Logo" 
                sx={{
                  height: scrolled ? '40px' : '44px',
                  width: 'auto',
                  minWidth: '40px',
                  transition: 'all 0.3s ease-in-out',
                  // Show colored logo on white background, white logo on colored background
                  filter: 'none', /* Removed filter that was making logo invisible */
                  backgroundColor: 'transparent',
                  objectFit: 'contain',
                  display: 'block',
                  padding: scrolled ? '2px' : '0',
                  borderRadius: scrolled ? '4px' : '0',
                  boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    opacity: 0.9
                  }
                }}
                onLoad={(e) => {
                  console.log('Logo loaded successfully:', e.target.src);
                  console.log('Logo dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                }}
                onError={(e) => {
                  console.error('Failed to load logo. Current src:', e.target.src);
                  e.target.onerror = null;
                  e.target.src = '/logo192.png';
                }}
              />
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  ml: 2, 
                  color: scrolled ? theme.palette.primary.main : 'common.white',
                  fontWeight: 700,
                  fontSize: scrolled ? '1.15rem' : '1.25rem',
                  display: { xs: 'none', sm: 'block' },
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    opacity: 0.9
                  }
                }}
              >
                Alagappa Academy of Excellence
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center',
              gap: 1
            }}>
              {navLinks.map((link) => (
                <Button 
                  key={link.title} 
                  onClick={() => onScrollTo(link.href)} 
                  sx={{ 
                    color: scrolled ? theme.palette.text.primary : 'common.white',
                    fontWeight: 500, 
                    px: 2,
                    py: 1,
                    fontSize: '0.9375rem',
                    '&:hover': { 
                      backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)'
                    },
                    transition: 'all 0.2s ease',
                    textTransform: 'none',
                    borderRadius: '4px'
                  }}
                >
                  {link.title}
                </Button>
              ))}
              <Button 
                variant="contained" 
                color={scrolled ? 'primary' : 'secondary'}
                onClick={onRegisterClick} 
                sx={{ 
                  ml: 1,
                  borderRadius: '4px', 
                  px: 3,
                  py: 1,
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  backgroundColor: scrolled ? theme.palette.primary.main : 'common.white',
                  color: scrolled ? 'common.white' : theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: scrolled ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.9)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Register Now
              </Button>
            </Box>
            
            <IconButton 
              color="inherit" 
              aria-label="open drawer" 
              edge="end" 
              onClick={handleDrawerToggle} 
              sx={{ 
                display: { md: 'none' }, 
                color: scrolled ? 'text.primary' : 'common.white',
                backgroundColor: scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: scrolled ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
              </Toolbar>
            </Container>
          </AppBar>
        </Box>
      <Drawer variant="temporary" open={drawerOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} anchor="right">
        {drawer}
      </Drawer>
    </>
  );
};

// --- MAIN LANDING PAGE COMPONENT ---
const LandingPage = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  // ... (rest of the code remains the same)
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  
  const handleScrollTo = (selector) => {
    const element = selector === '#hero' ? document.body : document.querySelector(selector);
    if (element) {
      const yOffset = -70; // Offset for sticky AppBar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  const heroStats = [
    { value: 'KG-XII', label: 'Coaching Levels' },
    { value: 'Expert', label: 'Faculty' },
    { value: 'Multiple', label: 'Exam Preps' },
    { value: 'Proven', label: 'Foundation Building' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBarComponent onRegisterClick={handleOpenDialog} onScrollTo={handleScrollTo}/>
      <Box component="main" sx={{ pt: { xs: 8, md: 10 } }}>

      <HeroSection component="section" id="hero">
        <HeroContent>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 2,
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              maxWidth: '240px',
              margin: '0 auto',
              boxShadow: theme => theme.shadows[4]
            }}>
              <Box 
                component="img"
                src={"/logos/aae-logo.png"} 
                alt="Alagappa Academy of Excellence Logo"
                sx={{
                  height: 'auto',
                  maxWidth: '200px',
                  width: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onLoad={(e) => {
                  console.log('Hero logo loaded successfully:', e.target.src);
                  console.log('Hero logo dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                }}
                onError={(e) => {
                  console.error('Failed to load hero logo. Current src:', e.target.src);
                  e.target.onerror = null;
                  e.target.src = '/logo192.png';
                }}
              />
            </Box>
            <Typography variant="overline" sx={{ display: 'block', color: 'rgba(255,255,255,0.9)', letterSpacing: '1px', mb: 0.5, fontWeight: 500 }}>
              Alagappa Academy of Excellence
            </Typography>
          </Box>
          
          <AnimatedText delay={0.1}>
            <HeroTitle variant="h1">
              Empowering Future Achievers
            </HeroTitle>
          </AnimatedText>
          
          <AnimatedText delay={0.3}>
            <HeroSubtitle variant="h5" component="p">
              Premier coaching for KG to Grade 12 (CBSE, Matric, ICSE) and competitive exams including NEET, JEE, CLAT, TNPSC & UPSC.
            </HeroSubtitle>
          </AnimatedText>
          
          <AnimatedText delay={0.5}>
            <ButtonGroup>
              <Button variant="contained" color="primary" size="large" onClick={handleOpenDialog}>Enroll Now</Button>
              <Button variant="outlined" color="inherit" size="large" onClick={() => handleScrollTo('#programs')}>Explore Programs</Button>
            </ButtonGroup>
          </AnimatedText>

          <StatsContainer component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            {heroStats.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp}>
                <StatItem>
                  <Typography variant="h5" component="div" fontWeight={700} sx={{ mb: 0.5, background: 'linear-gradient(90deg, #fff 0%, #64f0ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" textTransform="uppercase" letterSpacing="0.5px" fontWeight={500} sx={{ opacity: 0.85, fontSize: '0.65rem' }}>
                    {stat.label}
                  </Typography>
                </StatItem>
              </motion.div>
            ))}
          </StatsContainer>
        </HeroContent>
        <ScrollIndicator onClick={() => handleScrollTo('#why-us')}>
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        </ScrollIndicator>
      </HeroSection>
      
      <Box component="main">
        <StyledSection id="why-us" bgColor="paper" elevation={0}>
          <Container maxWidth="lg">
            <SectionTitle subtitle="Discover the AAE advantage that sets students on the path to success.">Why Choose AAE?</SectionTitle>
            <Grid container spacing={{xs: 2.5, md:3.5}}>
              {featuresData.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index} sx={{display: 'flex'}}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp} transition={{delay: index * 0.05}} style={{width: '100%'}}>
                        <FeatureCard sx={{display: 'flex', flexDirection:'column', justifyContent:'space-between'}}>
                        <CardContent sx={{ p: {xs: 2, sm: 3}, flexGrow: 1 }}>
                            <FeatureIcon>{feature.icon}</FeatureIcon>
                            <Typography variant="h6" component="h3" fontWeight="600" gutterBottom sx={{fontSize: '1.2rem'}}>
                            {feature.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                            {feature.description}
                            </Typography>
                        </CardContent>
                        </FeatureCard>
                    </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </StyledSection>

        <StyledSection id="programs" bgColor="alternate" elevation={0}>
            <Container maxWidth="lg">
                <SectionTitle subtitle="From foundational learning to competitive exam preparation, we have a program for every student.">Our Programs</SectionTitle>
                <Grid container spacing={{xs: 2.5, md:3.5}}>
                    {programsData.map((program, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={program.id} sx={{display: 'flex'}}> {/* Added lg={3} for potentially 4 cards in a row */}
                             <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp} transition={{delay: index * 0.05}} style={{width: '100%'}}>
                                <ProgramCard {...program} />
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </StyledSection>
        
        <StyledSection id="philosophy" bgColor="paper" elevation={0}>
          <Container maxWidth="md">
            <SectionTitle subtitle="Our approach to education goes beyond academics, focusing on holistic development.">Our Educational Philosophy</SectionTitle>
            <AnimatedText>
              <Typography variant="h6" color="text.secondary" paragraph textAlign="center" sx={{mb:3, fontSize: '1.1rem'}}>
                At Alagappa Academy of Excellence, our mission is to empower students with knowledge, skills, and confidence to thrive in school, ace competitive exams, and excel in their future professions.
              </Typography>
            </AnimatedText>
            <Box sx={{ textAlign: 'center', mt:3 }}>
              {[
                "Nurturing talent and guiding students toward academic and career success.",
                "Offering a wide range of programs from foundational school support to high-level competitive exam coaching - all under one roof.",
                "Belief in a value-based teaching approach in a safe and supportive atmosphere.",
              ].map((text, index) => (
                <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeInUp} transition={{ delay: index * 0.15 }}>
                  <Paper elevation={2} sx={{ fontStyle: 'italic', my: 2, p: 2, borderLeft: '4px solid', borderColor: 'primary.light', bgcolor: 'background.default', borderRadius: '8px' }}>
                    <Typography variant="h6" component="p" sx={{fontSize: '1.05rem'}}> "{text}" </Typography>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Container>
        </StyledSection>
        
        {/* Chairman's Message */}
        <StyledSection id="chairman-message" bgColor="alternate" elevation={0}>
          <Container maxWidth="lg">
            <SectionTitle>Chairman Speaks</SectionTitle>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Box 
                    component="img"
                    src="/logos/vairavan.jpg"
                    alt="Dr. Ramanathan Vairavan - Chairman"
                    sx={{
                      width: '100%',
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      boxShadow: theme.shadows[4],
                      border: `4px solid ${theme.palette.primary.main}`
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/logos/logo-placeholder.svg';
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Typography variant="h6" component="div" sx={{ 
                    color: 'text.primary', 
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    mb: 3,
                    '& p': { mb: 2 }
                  }}>
                    <p>At the Alagappa Academy of Excellence, our vision is to empower future achievers by building a strong foundation of knowledge and character. As our late founder, Dr. Alagappa Chettiar, wisely said, "Education is not merely the accumulation of facts, but the cultivation of the mind and spirit to serve society with wisdom and compassion." This profound insight continues to inspire us. We believe that starting early and maintaining unwavering focus are key to unlocking every student's full potential.</p>
                    
                    <p>Our journey is guided by core values—excellence, integrity, and dedication. These are not just words, but the pillars upon which we build our mission and shape the leaders of tomorrow. Dr. Alagappa's enduring legacy reminds us that true education transforms individuals into agents of positive change. It is this transformation we strive to nurture each day at AAE.</p>
                    
                    <p>With commitment and passion, we are shaping not only academic achievers, but also responsible, visionary citizens—individuals who will lead with courage, wisdom, and compassion in every sphere of life.</p>
                    
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, color: 'primary.main' }}>
                      - Dr. Ramanathan Vairavan - Chairman
                    </Typography>
                  </Typography>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </StyledSection>

        <StyledSection id="faculty" bgColor="paper" elevation={0}>
          <Container maxWidth="lg">
            <SectionTitle subtitle="Our dedicated team of qualified and experienced teachers are the backbone of our academy.">Meet Our Esteemed Faculty</SectionTitle>
            <Grid container spacing={{xs: 2.5, md:3.5}} justifyContent="center">
              {facultyData.map((faculty, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{display: 'flex'}}>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp} transition={{delay: index * 0.05}} style={{width: '100%'}}>
                    <FacultyMemberCard {...faculty} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </StyledSection>

      </Box>
      
      <MainFooter onScrollTo={handleScrollTo}/>
      <RegistrationDialog open={openDialog} onClose={handleCloseDialog} /> {/* Assuming RegistrationDialog component exists */}
      </Box>
    </Box>
  );
};

export default LandingPage;