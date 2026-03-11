# Marketplace & Community Platform

A comprehensive social and marketplace web application built with **React**, **Vite**, and **Firebase**. This platform integrates social networking, ride-sharing, and a peer-to-peer marketplace into a single, unified experience.

---

## 🚀 Features

### 1. Social Feed
- **Posts**: Create and share updates, including "confessions" and images.
- **Interactions**: Like, comment, and reply to posts in real-time.
- **Media Support**: Integrated image cropping using `react-image-crop` for high-quality backgrounds and parallax effects.

### 2. Marketplace
- **Listings**: Post items for sale with detailed descriptions and images.
- **Categorization**: Browse and filter items across various categories.
- **Seller Contacts**: Direct communication between buyers and sellers.

### 3. Ride-Sharing System
- **Ride Creation**: Organize or join rides for commuting or travel.
- **Gender Preference**: Indicators for male-only (blue) or female-only (pink) rides.
- **Contact Sharing**: Mobile number visibility for ride participants to facilitate coordination.
- **Ride Chat**: Dedicated real-time chat for every ride.

### 4. Real-time Messaging
- **Personal Chat**: Private messaging between users.
- **Group/Ride Chat**: Coordination chats for specific activities.
- **Activity Status**: Real-time message timestamps and delivery states.

### 5. Multi-User Roles
- **Founders**: Full administrative access plus the ability to promote/demote admins.
- **Admins**: Content moderation, report management, and event organization.
- **Users**: Standard access to social and marketplace features.

### 6. Additional Modules
- **Events**: Manage and discover community events.
- **Feature Requests**: User-driven feedback loop for platform improvements.
- **Profile Customization**: Detailed user profiles with profile pictures and role badges.

---

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS with modern animations ([GSAP](https://gsap.com/) & [Framer Motion](https://www.framer.com/motion/))
- **Backend-as-a-Service**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting, Storage)
- **Extra Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (via AWS S3 SDK) for large media uploads.
- **Mobile Support**: [Capacitor](https://capacitorjs.com/) for deploying as a native Android app.

---

## 📊 Database & Storage

### Firestore Collections
- `users`: Stores user profiles, roles (`user`, `admin`, `founder`), and settings.
- `listings`: Marketplace items with seller data.
- `posts`: Social feed content, including metadata for parallax effects.
- `rides`: Ride details, participant lists, and nested `messages`.
- `conversations`: Private chat threads.
- `reports`: User-flagged content for admin review.
- `events`: Community-wide events managed by admins.

### Firebase Storage
- Used for user profile pictures and post images.
- Implements strict file type and size validation.

---

## 🔒 Security Rules

### Firestore Search/Access Logic
The security layer is built on the following principles:
1.  **Authentication**: Most write operations require `isAuthenticated()`.
2.  **Ownership**: Users can only edit/delete their own posts (`isOwner(userId)`).
3.  **Role-Based Access (RBAC)**:
    - **Founders/Admins**: Can delete any content, manage reports, and update roles.
    - **Founders ONLY**: Can perform specific system-level overrides and role promotions.
4.  **Data Integrity**: Rules enforce that only valid images are uploaded and specific fields are populated.

### Storage Rules
- **Public Read**: All community/marketplace images are publicly readable for performance.
- **Secure Write**: 
  - Must be authenticated.
  - File size restricted to **5MB**.
  - Content type restricted to **images only** (`image/.*`).

---

## 💻 How to Replicate (Setup Guide)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase Account
- Cloudflare R2 Bucket (optional, for media features)

### 1. Clone & Install
```bash
git clone <repository-url>
cd market
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory and add your Firebase and R2 credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudflare R2 (for media)
VITE_R2_ACCESS_KEY_ID=your_access_key
VITE_R2_SECRET_ACCESS_KEY=your_secret_key
VITE_R2_BUCKET_NAME=your_bucket_name
VITE_R2_ENDPOINT=your_r2_endpoint
```

### 3. Firebase Setup
1.  Initialize Firebase in the project:
    ```bash
    npx firebase-tools login
    npx firebase-tools init
    ```
2.  Deploy Security Rules & Indexes:
    ```bash
    firebase deploy --only firestore:rules,storage:rules,firestore:indexes
    ```

### 4. Running Locally
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### 5. Mobile (Android) Build
1.  Sync Capacitor:
    ```bash
    npm run cap:sync
    ```
2.  Open in Android Studio:
    ```bash
    npm run cap:open
    ```

---

## 📂 Project Structure

- `src/components`: Reusable UI elements (Layout, Navbar, Chat).
- `src/pages`: Main application views (Home, Marketplace, Rides, Admin).
- `src/firebase`: Firebase configuration and custom hooks/services.
- `src/contexts`: React Contexts for global state (Auth, UI).
- `firestore.rules`: Security configuration for the database.
- `storage.rules`: Security configuration for file uploads.
- `capacitor.config.json`: Mobile bridge configuration.

---

## ⚖️ License
Privately developed for community use. See `Privacy.jsx` and `Terms.jsx` for legal details.
