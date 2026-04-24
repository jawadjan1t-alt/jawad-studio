# Jawad Group - AI Creative Studio Web App

A fully functional, production-grade AI creative studio web application built with React, Tailwind CSS, and the Replicate API. Generate stunning images and videos using real AI models with a premium dark-themed interface. Part of the Jawad Group ecosystem.

## Features

### 🎬 Video Generation
- **Text to Video**: Describe any scene and generate a video using Zeroscope V2 XL
- **Image to Video**: Upload an image and animate it with motion using Stable Video Diffusion
- Both support 16:9 (landscape) and 9:16 (portrait) aspect ratios
- Costs 10 credits per video for regular users

### 🎨 Image Generation
- Generate stunning images from text prompts using SDXL
- Completely FREE - no credits required
- Instant generation with real AI

### 📸 Personal Gallery
- All generated images and videos automatically saved to your gallery
- Beautiful responsive grid layout
- Download any item directly to your device
- Delete items you no longer need

### 👤 Authentication & Credits
- Complete login and signup system
- 100 daily credits for regular users (resets every day)
- Admin account (jawadjan1t@gmail.com) with unlimited free access
- Real-time credit tracking and deduction

### 📊 Admin Dashboard
- Access only for admin account
- Platform-wide statistics:
  - Total registered users
  - Total videos generated
  - Total images generated
  - Total credits consumed
- User management with credit balances

### ⭐ Reviews & Testimonials
- Showcase of 5-star reviews from creators
- Beautiful testimonial cards with user avatars

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with glass-morphism effects
- **Build**: Webpack 5 with Babel
- **API**: Replicate API for AI generation
- **Storage**: localStorage for all user data and gallery
- **Fonts**: Google Font "Sora"

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:3000`

## Usage

### For Regular Users

1. **Sign Up**: Create an account with email and password
2. **Generate Content**:
   - **Image Generation**: Enter a prompt and generate for free
   - **Text to Video**: Enter a prompt, select aspect ratio, and generate (10 credits)
   - **Image to Video**: Upload an image, optionally add motion prompt, and generate (10 credits)
3. **Manage Gallery**: View, download, or delete your generations
4. **Track Credits**: Monitor your daily credit balance

### For Admin

1. **Login** with: `jawadjan1t@gmail.com` (any password)
2. **Access Admin Panel**: View platform statistics and user list
3. **Unlimited Access**: Generate unlimited content at no cost

## API Integration

The app uses the **Replicate API** for all AI generation:

- **Image Generation**: `stability-ai/sdxl`
- **Text to Video**: `anotherjesse/zeroscope-v2-xl`
- **Image to Video**: `stability-ai/stable-video-diffusion-img2vid-xt`

The API key is hardcoded in the app for seamless user experience.

## Design Features

- **Premium Dark Theme**: Dark backgrounds (#0a0a0a, #111111) with gold accents
- **Glass Morphism**: Frosted glass effect on all cards
- **Smooth Animations**: 0.3s ease transitions throughout
- **Gold Glow Effects**: Hover effects on buttons with glowing shadows
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Touch-Friendly**: All buttons are at least 48px for easy mobile interaction

## Data Storage

All data is stored in localStorage:
- User accounts and passwords
- Credit balances and reset timestamps
- Gallery items (URLs only, not actual files)
- Generation history

## Project Structure

```
jawad-studio-web/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx          # Main React component with all features
│   ├── index.tsx        # React entry point
│   └── index.css        # Global styles and Tailwind directives
├── webpack.config.js    # Webpack configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── .babelrc             # Babel configuration
└── package.json         # Dependencies and scripts
```

## Testing Credentials

### Admin Account
- Email: `jawadjan1t@gmail.com`
- Password: Any password (just use "admin" or anything)
- Access: Unlimited, free, unrestricted

### Regular User
- Create a new account with any email and password
- Receive 100 daily credits
- Credits reset at midnight

## Features Checklist

- ✅ Real Replicate API integration
- ✅ Complete authentication system
- ✅ Daily credit system with auto-reset
- ✅ Admin account with unlimited access
- ✅ Image generation (free)
- ✅ Text-to-video generation (10 credits)
- ✅ Image-to-video generation (10 credits)
- ✅ Personal gallery with download
- ✅ Admin dashboard with statistics
- ✅ Reviews and testimonials
- ✅ Premium dark theme with glass-morphism
- ✅ Responsive mobile-first design
- ✅ localStorage persistence
- ✅ Real-time progress indicators
- ✅ Smooth animations and transitions

## Limitations

- localStorage has a ~5-10MB limit per domain
- Video generation can take 1-2 minutes
- Image generation typically takes 30-60 seconds
- All data is stored locally and not synced across devices

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Support

For issues or feature requests, please contact the development team.

---

**Jawad Group** - Empowering creators with AI-powered content generation.
