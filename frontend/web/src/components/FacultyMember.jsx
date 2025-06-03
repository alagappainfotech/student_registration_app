import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

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

const FacultyMember = ({ name, image, qualification, experience, role }) => {
  return (
    <StyledCard elevation={3}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          src={image}
          alt={name}
          sx={{
            width: 150,
            height: 150,
            mx: 'auto',
            mb: 2,
            border: '3px solid',
            borderColor: 'primary.main',
          }}
        />
        <Typography variant="h6" component="h3" gutterBottom>
          {name}
        </Typography>
        {role && (
          <Typography variant="subtitle1" color="primary" gutterBottom>
            {role}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" paragraph>
          {qualification}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Experience: {experience}
        </Typography>
      </Box>
    </StyledCard>
  );
};

export default FacultyMember;
