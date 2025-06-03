import React from 'react';
import { Box, Container, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Card, CardContent, Avatar } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import GavelIcon from '@mui/icons-material/Gavel';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import PublicIcon from '@mui/icons-material/Public';
import ScienceIcon from '@mui/icons-material/Science';
import EngineeringIcon from '@mui/icons-material/Engineering';
import Gavel from '@mui/icons-material/Gavel';
import Brush from '@mui/icons-material/Brush';
import Security from '@mui/icons-material/Security';

// Styled Components
const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(6, 0),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const AnimatedText = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 20 },
      }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

const AboutUs = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const examData = [
    {
      icon: <ScienceIcon fontSize="large" color="primary" />,
      title: 'NEET',
      subtitle: 'Gateway to a Noble Profession',
      points: [
        'Eligibility: 12th Grade with Physics, Chemistry, Biology',
        'Subjects: Physics, Chemistry, Biology',
        'Exam Duration: 3 hours 20 minutes',
      ],
    },
    {
      icon: <EngineeringIcon fontSize="large" color="primary" />,
      title: 'JEE',
      subtitle: 'Your First Step to the IITs',
      points: [
        'Eligibility: 12th Grade with PCM',
        'Levels: JEE Main and JEE Advanced',
        'Exam Pattern: MCQs and numerical questions',
      ],
    },
    {
      icon: <PublicIcon fontSize="large" color="primary" />,
      title: 'TNPSC',
      subtitle: 'Serve the State, Build the Future',
      points: [
        'Eligibility: SSLC to Graduation',
        'Subjects: Tamil/English, GK, Aptitude',
        'Exams Covered: Group I, II, IV, VAO',
      ],
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              ALAGAPPA ACADEMY OF EXCELLENCE
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
              We don't just teach subjects — we shape futures.
            </Typography>
            <Box mt={4}>
              {[
                'From tiny hands learning to grip a crayon…',
                'To confident minds cracking JEE and NEET.',
                'Welcome to the school where every stage matters.',
              ].map((text, index) => (
                <AnimatedText key={index} delay={index * 0.3}>
                  <Typography variant="h6" component="p" sx={{ mb: 1 }}>
                    {text}
                  </Typography>
                </AnimatedText>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Kindergarten Section */}
        <Section>
          <AnimatedText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Kindergarten (KG)
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Where Learning Begins with Wonder
            </Typography>
            <Typography variant="body1" paragraph>
              At the Kindergarten level, we go beyond traditional textbook learning. Our KG curriculum is thoughtfully integrated with Montessori activities, which promote hands-on experiential learning. Each child is encouraged to explore and discover through activities designed to support physical, emotional, and intellectual development.
            </Typography>
            <Typography variant="body1" paragraph>
              Tuition is entirely Montessori-based, fostering independence, critical thinking, and a strong foundation for lifelong learning.
            </Typography>
          </AnimatedText>
        </Section>

        {/* Standards 1-5 Section */}
        <Section>
          <AnimatedText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Standards 1 to 5
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Building Strong Foundations
            </Typography>
            <Typography variant="body1" paragraph>
              We follow the "Mother Teacher" concept for these foundational years. A single dedicated teacher handles all core subjects for each class, enabling personalized attention and building a strong student-teacher bond.
            </Typography>
            <Typography variant="body1" paragraph>
              This approach ensures:
            </Typography>
            <List>
              {[
                'A nurturing environment',
                'Consistency in teaching style',
                'Deeper understanding of each child\'s learning needs',
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </AnimatedText>
        </Section>

        {/* Why We Exist Section */}
        <Section>
          <AnimatedText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" textAlign="center">
              Why We Exist
            </Typography>
            <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
              {[
                "We're not just here to finish the syllabus.",
                "We're here to start futures.",
                "We believe in first benches and back benches — all equally.",
                "We believe education is not one-size-fits-all.",
                "We believe children can — and will — change the world.",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.2 }}
                >
                  <Typography
                    variant="h5"
                    component="p"
                    gutterBottom
                    sx={{
                      fontStyle: 'italic',
                      my: 2,
                      p: 2,
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(25, 118, 210, 0.05)',
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    {text}
                  </Typography>
                </motion.div>
              ))}
            </Box>
          </AnimatedText>
        </Section>

        {/* Standards 6+ Section */}
        <Section>
          <AnimatedText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Standard 6 and Above
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Subject-Wise Expertise for Strong Academic Foundations
            </Typography>
            <Typography variant="body1" paragraph>
              From Standard 6 onwards, we adopt a subject-wise teaching model. Each subject is taught by a specialized teacher with expertise in their domain, laying the groundwork for higher-order thinking and subject mastery.
            </Typography>
            <Typography variant="h6" gutterBottom>
              Focus Areas:
            </Typography>
            <List>
              {[
                'Concept clarity in core subjects: Mathematics, Science, English, and Social Studies',
                'Development of independent learning and critical thinking',
                'Regular assessments and remedial classes for consistent progress',
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <EmojiEventsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </AnimatedText>
        </Section>

        {/* Standards 8-10 Section */}
        <Section>
          <AnimatedText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Standards 8 to 10
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Foundation Years for Board Excellence
            </Typography>
            <Typography variant="body1" paragraph>
              As students enter their middle and high school years, we provide a focused academic structure to prepare them for the board exams, especially Class 10 (milestone public examination).
            </Typography>
            <Typography variant="h6" gutterBottom>
              Board-focused support includes:
            </Typography>
            <Grid container spacing={3}>
              {[
                'Senior faculty with years of experience in handling board exam syllabi',
                'Subject-specific enrichment classes for Maths, Science, and Languages',
                'Regular Unit Tests, Cycle Tests, Pre-Boards, and Board Pattern Mock Exams',
                'Answer-writing strategies, time management tips, and guided correction sessions',
                'Exclusive weekend workshops and holiday crash programs for revision and reinforcement',
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper elevation={0} sx={{ p: 2, height: '100%', bgcolor: 'rgba(25, 118, 210, 0.05)' }}>
                    <Box display="flex" alignItems="center">
                      <MilitaryTechIcon color="primary" sx={{ mr: 2 }} />
                      <Typography>{item}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AnimatedText>
        </Section>

        {/* Standards 11-12 Section */}
        <Section>
          <AnimatedText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Standards 11 and 12
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Expert Coaching for Career and Boards
            </Typography>
            <Typography variant="body1" paragraph>
              These two years are academically intensive and career-defining. We ensure students not only perform in boards but also align their efforts with future academic goals such as NEET, JEE, CLAT, NATA, and others.
            </Typography>
            <Typography variant="h6" gutterBottom>
              Special Features:
            </Typography>
            <Grid container spacing={3}>
              {[
                'Stream-specific faculty (Science, Commerce, Humanities) with proven board result records',
                'Regular interdisciplinary seminars, project work, and practical lab sessions',
                'Guest lectures and masterclasses by professionals, academicians, and exam toppers',
                'Personal mentoring system for academic planning and emotional support',
                'Board Exam Acceleration Program (BEAP) – A three-phase revision program with previous year question analysis, subject-wise crash courses, and stress management techniques',
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper elevation={0} sx={{ p: 2, height: '100%', bgcolor: 'rgba(25, 118, 210, 0.05)' }}>
                    <Box display="flex" alignItems="center">
                      <SchoolIcon color="primary" sx={{ mr: 2 }} />
                      <Typography>{item}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AnimatedText>
        </Section>

        {/* Competitive Exams Section */}
        <Section>
          <AnimatedText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" textAlign="center">
              Future-Ready Learners
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph textAlign="center">
              Preparing for Competitive Success
            </Typography>
            <Typography variant="body1" paragraph textAlign="center" sx={{ maxWidth: 800, mx: 'auto' }}>
              At our institution, we don't just prepare students for board exams — we shape aspirants for India's most prestigious competitive examinations. From foundational coaching to career guidance, our curriculum is aligned with the evolving demands of today's academic and professional landscape.
            </Typography>
            <Typography variant="h5" component="p" textAlign="center" fontStyle="italic" color="primary" sx={{ my: 4 }}>
              "The journey of a thousand miles begins with one step."
            </Typography>
            <Typography variant="h6" component="p" textAlign="center" fontWeight="bold">
              Take that step with us.
            </Typography>
          </AnimatedText>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {examData.map((exam, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.2 }}
                >
                  <StyledCard elevation={3}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box textAlign="center" mb={2}>
                        {exam.icon}
                      </Box>
                      <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                        {exam.title}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" textAlign="center" gutterBottom>
                        {exam.subtitle}
                      </Typography>
                      <List dense>
                        {exam.points.map((point, i) => (
                          <ListItem key={i}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <SchoolIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={point} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Success Stories */}
        <Section>
          <AnimatedText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" textAlign="center">
              They dreamed. They worked. They made it.
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph textAlign="center">
              Our Alumni Success Stories
            </Typography>
          </AnimatedText>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              { name: 'Rahul Sharma', role: 'IIT Bombay', image: '/logos/logo-placeholder.svg' },
              { name: 'Priya Patel', role: 'AIIMS Delhi', image: '/logos/logo-placeholder.svg' },
              { name: 'Arjun Kumar', role: 'NLSIU Bangalore', image: '/logos/logo-placeholder.svg' },
              { name: 'Ananya Reddy', role: 'NID Ahmedabad', image: '/logos/logo-placeholder.svg' },
            ].map((alum, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                    <Avatar
                      src={alum.image}
                      alt={alum.name}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        border: '3px solid',
                        borderColor: 'primary.main',
                      }}
                    />
                    <Typography variant="h6" component="h3" gutterBottom>
                      {alum.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {alum.role}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Section>
      </Container>
    </Box>
  );
};

export default AboutUs;
