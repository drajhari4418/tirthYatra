# TirthYatra Firebase setup

The repository is currently a static HTML site. Firebase integration has been added without forcing a framework migration, so the existing design can continue to run on Vercel.

## What is implemented

- Firebase Authentication: email/password and Google sign-in.
- Cloud Firestore with realtime listeners.
- Firestore collections: users, services, places, posts, content, contactMessages, newsletter.
- Admin CMS page at admin.html.
- Homepage services load from Firestore and fall back to the current static service cards when the collection is empty/unavailable.
- Contact and newsletter forms write to Firestore.
- Firestore security rules are included in firestore.rules.

## Firebase Console steps

1. Create a Firebase project.
2. Add a Web App in Firebase Project Settings.
3. Enable Authentication: Email/Password and Google.
4. Create a Cloud Firestore database.
5. Deploy/copy the rules from firestore.rules.
6. Copy the Web App configuration into js/firebase-config.js.
7. Create one account through the website.
8. In Firestore, open users/<that-user-uid> and change role from user to admin.
9. Open https://tirth-yatra.vercel.app/admin.html after deployment and publish services/content.

## Firestore vs Realtime Database

Firestore is not the Firebase Realtime Database product. This implementation uses Cloud Firestore with realtime listeners, which provides live updates using the document/collection model. If you specifically want Firebase Realtime Database instead, the data layer should be changed to that product.

## Images / HD

The current repository contains many small/thumbnail images. Increasing CSS dimensions does not create real HD detail. True HD conversion requires higher-resolution source images or an image upscaling service.
The recommended production setup is to store high-resolution originals in Firebase Storage (or an image CDN), save image URLs and metadata in Firestore, serve responsive WebP/AVIF derivatives, and lazy-load below-the-fold images.
The existing local images have not been falsely upscaled; doing so would not improve their actual detail.

## Vercel

No server secret is required for Firebase's browser SDK configuration. The Firebase Web App config is intended to be public. Never put a Firebase service-account JSON/private key into this repository.
After these changes are pushed, Vercel should redeploy automatically from GitHub main.