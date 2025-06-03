# Logo Implementation Guide

## Logo Files
Two logo files need to be added to the project:

1. `aae-logo.png` - The circular "ALAGAPPA ACADEMY OF EXCELLENCE" logo
2. `alagappa-group-logo.png` - The "Alagappa Group of Educational Institutions" logo

## Logo Placement

### 1. Navbar
- The Navbar currently displays the text "ALAGAPPA ACADEMY OF EXCELLENCE"
- This should be replaced with the `aae-logo.png`
- The logo should be sized appropriately for the navbar (recommended height: 40px)

### 2. Landing Page
- The landing page should display both logos in the header section
- The main logo (`aae-logo.png`) should be prominently displayed at the top
- The group logo (`alagappa-group-logo.png`) should be placed below it
- Both logos should be responsive and maintain their aspect ratios

### 3. Footer
- The footer should include the group logo (`alagappa-group-logo.png`) in the contact/social media section
- The logo should link to the main Alagappa Group website

## Implementation Notes
- The logos should be placed in `/frontend/web/public/logos/`
- Update the image paths in the components accordingly
- Ensure the logos are optimized for web use
- Maintain the aspect ratio of the logos when resizing
- Add appropriate alt text for accessibility

## Required Updates
1. Add logo files to `/frontend/web/public/logos/`
2. Update `Navbar.jsx` to use the logo
3. Update `LandingPage.jsx` to include both logos
4. Update any other components that reference the old text-based logo

## Styling
- The logos should be responsive and look good on all screen sizes
- Add appropriate spacing around the logos
- Consider adding a subtle hover effect on interactive logos

## Accessibility
- Always include descriptive alt text for the logos
- Ensure sufficient contrast between the logos and their background
- Make sure the logos are keyboard-navigable if they are links
