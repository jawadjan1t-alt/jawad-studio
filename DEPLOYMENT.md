# Jawad Group - Deployment Guide

This guide covers how to deploy Jawad Group to various hosting platforms.

## Prerequisites

- Node.js 16+ installed locally
- npm or yarn package manager
- Git (optional, for version control)

## Local Development

### Setup

```bash
# Clone or download the project
cd jawad-studio-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

```bash
# Create production build
npm run build

# Output will be in the dist/ directory
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy React apps with zero configuration.

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the build settings
   - Click "Deploy"

3. **Custom Domain** (optional):
   - In Vercel dashboard, go to Settings > Domains
   - Add your custom domain

### Option 2: Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Or use Netlify UI**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Your site is live!

### Option 3: GitHub Pages

1. **Update package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/jawad-studio-web"
   }
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   npm install --save-dev gh-pages
   npx gh-pages -d dist
   ```

### Option 4: Self-Hosted (VPS/Dedicated Server)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload to server**:
   ```bash
   scp -r dist/* user@yourserver.com:/var/www/jawad-studio/
   ```

3. **Configure web server** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       root /var/www/jawad-studio;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Enable HTTPS** (recommended):
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

### Option 5: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:

```bash
docker build -t jawad-studio .
docker run -p 80:80 jawad-studio
```

## Environment Variables

The app uses a hardcoded Replicate API key. To change it:

1. Edit `src/App.tsx`
2. Find the line: `const REPLICATE_API_KEY = 'r8_2LS2Z4XfOxWDXyqHKEfUvqU7aQXvKKdHMKSXl';`
3. Replace with your own Replicate API key
4. Rebuild: `npm run build`

## Performance Optimization

### Build Size

The production build is approximately 218 KB (minified):
- React: ~42 KB
- React DOM: ~133 KB
- Tailwind CSS: ~25 KB
- App code: ~18 KB

### Caching

The dist folder contains versioned assets. Configure your server to:
- Cache `bundle.js` for 1 year (includes hash in filename)
- Cache `index.html` for 0 seconds (always fresh)

### CDN

For global distribution, use a CDN like:
- Cloudflare
- AWS CloudFront
- Fastly
- Bunny CDN

## Monitoring

### Error Tracking

Add Sentry for error monitoring:

```bash
npm install @sentry/react
```

Then in `src/App.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

### Analytics

Add Google Analytics:

```html
<!-- In public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Troubleshooting

### Build fails with "out of memory"

Increase Node memory:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### App not loading after deployment

Ensure your server is configured to serve `index.html` for all routes (SPA routing).

### API calls failing

Check that:
1. Replicate API key is valid
2. API key has sufficient credits
3. Network requests aren't blocked by CORS

### localStorage not persisting

Some browsers disable localStorage in private/incognito mode. This is expected behavior.

## Security Considerations

⚠️ **Important**: The Replicate API key is visible in the client-side code. This is acceptable for this demo but not recommended for production. For production:

1. Move API calls to a backend server
2. Use environment variables on the server
3. Implement proper authentication

## Rollback

If deployment goes wrong:

```bash
# Revert to previous build
git revert HEAD
npm run build
# Redeploy
```

## Support

For deployment issues, consult:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Docker Docs](https://docs.docker.com)

---

****Jawad Group is ready for production deployment!
