# Frontend/backend compatibility (server(7).zip)

This frontend targets the existing KAD Marketplace backend without modifying its routes or database. Set `VITE_API_SERVER` to the backend origin (without `/api`), for example `https://your-api-host`. The shared Axios client appends `/api` and sends the existing JWT as `Authorization: Bearer <token>`.

## Confirmed API routes used
- `POST /api/auth/register` — requires `name`, `email`, `password`; optional `phone`, `ghanaCard`, `region`, `city`, `address`.
- `POST /api/auth/login` — existing password login.
- `GET /api/auth/me` — current token session.
- `GET /api/categories` — public database categories; children are records with `parentId` referencing a parent category.
- `GET /api/home-builder/banners` — active public hero banners.
- `GET /api/home-builder/featured`, `/trending`, `/recommended` — public paid/approved/homepage-visible promotion collections.
- `GET /api/products/seller/my-products`; `PATCH /api/products/:id/seller-status` with `Active`, `Inactive`, `Sold`, or `Out of Stock`.
- `GET/PUT /api/users/profile`; `DELETE /api/users/me`.
- Chat endpoints remain `/api/messages/...` and require the existing JWT.

## Important limits of the supplied backend
The supplied `server(7).zip` does **not** expose passwordless email OTP registration/login routes, nor does its User model have a `username` column. Its `/api/auth/register` requires a full name, email, and password; seller fields are optional at registration and the backend's `sellerProfileComplete` middleware requires name, phone, Ghana Card, region, city, and address before creating a store or listing products. Therefore this frontend keeps the API-supported account flow and optional seller details. A “Continue with email” no-password option or username-only account cannot be made functional solely in the frontend without backend API changes.

The uploaded frontend archive contains `src/` only (no package.json, lockfile, or dependencies), so this bundle is source-level; run the existing website's build after replacing its `src` directory.
