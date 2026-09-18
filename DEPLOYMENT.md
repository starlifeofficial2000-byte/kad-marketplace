# KAD Marketplace — Production Deployment

## Architecture

The project is prepared to run as a single Node/Express service that serves both:
- the React/Vite build from `client/dist`
- the API under `/api`
- uploaded media under `/uploads`
- Socket.IO from the same origin

This avoids hard-coded localhost URLs and makes the first deployment simpler.

## Local production test

1. Install client dependencies: `cd client && npm ci`
2. Build client: `npm run build`
3. Install server dependencies: `cd ../server && npm ci`
4. Configure `server/.env` from `server/.env.example`.
5. Start: `npm start`
6. Open the server URL in a browser.

## Hosting environment variables

Set the variables in `server/.env.example` in the hosting provider's Environment Variables panel. Do not commit `.env` files or secrets.

## Important production notes

- A managed MySQL database is required.
- The current application stores uploaded files under `server/uploads`. On hosting platforms with ephemeral filesystems, move uploads to persistent object/image storage before relying on them for permanent marketplace media.
- Paystack callbacks must use the final HTTPS URL.
- Email credentials must be stored only as hosting environment variables.
- `FRONTEND_URL` must be set to the public HTTPS origin used by the browser so the existing CORS policy can allow it.

## Build command for a single service

From the repository root:

`npm --prefix client ci && npm --prefix client run build && npm --prefix server ci`

## Start command

`npm --prefix server start`
