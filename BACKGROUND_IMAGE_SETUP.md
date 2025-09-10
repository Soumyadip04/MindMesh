# Background Image Setup Instructions

## Adding Your Background Image

Since the Google Drive link couldn't be accessed directly, please follow these steps to add your background image:

### Step 1: Download the Image
1. Go to your Google Drive link: https://share.google/images/rO0M6GMSi9NSjeX1b
2. Download the image to your computer
3. Rename the image to `background.jpg` (or adjust the filename in the code if different)

### Step 2: Add to Project
1. Place the downloaded image in the `public/images/` directory
2. The file should be located at: `public/images/background.jpg`

### Step 3: Verify Implementation
The background image has been configured to appear on:
- Login page (`/login`)
- Dashboard pages (`/admin`, `/faculty`, `/student`)

### What's Already Done
✅ Created `public/images/` directory
✅ Updated login page to use background image
✅ Updated dashboard layout to use background image
✅ Added responsive CSS styling with overlay effects
✅ Configured proper background sizing (cover, center positioning)

### Styling Features
- **Responsive**: Works on all screen sizes
- **Overlay**: Blue gradient overlay for better text readability
- **Fallback**: Original gradient backgrounds as fallback
- **Performance**: Optimized background positioning and sizing

### Alternative Image Formats
If your image is not a JPG, update the filename in these files:
- `src/app/(auth)/login/page.tsx` (line 10)
- `src/app/(dashboard)/layout.tsx` (line 35)

Change `background.jpg` to your actual filename (e.g., `background.png`, `background.webp`, etc.)

### Testing
After adding the image:
1. Run your development server: `npm run dev`
2. Visit `/login` to see the background on the login page
3. Login and navigate to dashboard pages to see the background there too

The background will have a subtle blue overlay to ensure text remains readable while showcasing your image.
