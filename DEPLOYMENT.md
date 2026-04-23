# 🚀 Deployment Guide: ChatWave

This document provides step-by-step instructions to deploy your full-stack chat application.

## 1. Backend Deployment (Render)

Render will host your Spring Boot backend and a PostgreSQL database.

### Steps:
1. **Prepare Repository**: Ensure your code is pushed to a GitHub or GitLab repository.
2. **Create a New Blueprint**:
   - Go to [dashboard.render.com](https://dashboard.render.com/).
   - Click **New +** and select **Blueprint**.
   - Connect your repository.
   - Render will automatically detect the `render.yaml` file and set up:
     - A PostgreSQL database (`chat-db`).
     - A Web Service (`chat-backend`) using the Dockerfile.
3. **Update Environment Variables** (In Render Dashboard):
   - The `render.yaml` already sets up the database connection strings.
   - You only need to update `CORS_ALLOWED_ORIGINS` with your Vercel URL once the frontend is deployed.

---

## 2. Frontend Deployment (Vercel)

Vercel will host your React/Vite frontend.

### Steps:
1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com/).
   - Click **Add New** -> **Project**.
   - Connect the same repository.
2. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   Add the following variables in the Vercel dashboard:
   - `VITE_API_URL`: `https://your-backend-name.onrender.com/api`
   - `VITE_WS_URL`: `https://your-backend-name.onrender.com/ws` (Note: Use `https` as `sockjs-client` handles the switch to `wss`).
4. **Deploy**: Click **Deploy**.

---

## 🔧 Post-Deployment Checklist

1. **Update CORS**:
   Once your Vercel URL is generated (e.g., `https://chat-wave.vercel.app`), go to your Render Dashboard -> `chat-backend` -> **Environment** and update `CORS_ALLOWED_ORIGINS` to that URL.
2. **Restart Backend**: Render will auto-redeploy when environment variables change.
3. **Test**: Open your Vercel URL and try creating an account!

---

## 📦 Local Production Test
To test the production build locally before deploying:
```bash
cd frontend
npm run build
npm run preview
```
