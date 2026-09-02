# BareAya React + MySQL

## Run locally

1. Create the database and tables by running `server/schema.sql` in MySQL, or let the API create the tables after the database exists.
2. Copy `.env.example` to `.env` and add your MySQL username and password.
3. Start the frontend and backend together:

```bash
npm run dev:full
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:3001`.

## Backend endpoints

- `GET /api/health` checks the API and MySQL connection.
- `GET /api/products` returns products from MySQL.
- `POST /api/orders` validates and stores checkout orders in MySQL.
- `GET /api/orders/:orderId` returns one order and its items.

Orders are stored in the MySQL `orders` and `order_items` tables. Product prices are read from MySQL when an order is created, so the browser cannot change the order total.

## Database configuration

Set these values in `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bareaya
MAIL_USER=your_gmail_address@gmail.com
MAIL_APP_PASSWORD=your_gmail_app_password
NOTIFICATION_EMAIL=prabjitsinghmkcl@gmail.com
```

For Gmail, enable 2-Step Verification and create a Google App Password. Use that 16-character App Password as `MAIL_APP_PASSWORD`; do not use your normal Gmail password.

## Deploy with Vercel + Render

1. Push this project to GitHub.
2. In Render, create a new Blueprint from the repository. Render will read `render.yaml` and create the `bareaya-api` service.
3. Create a hosted MySQL database with a provider such as Aiven, Railway, or DigitalOcean. Create the `bareaya` database, then add its host, user, password, and port to the Render environment variables. Render cannot access your local MySQL server.
4. Add the Gmail variables from `.env.example` to Render. Use a Gmail App Password for `MAIL_APP_PASSWORD`.
5. Deploy the API and test `https://YOUR-RENDER-URL.onrender.com/api/health`.
6. In Vercel, import the same repository. Use `npm run build` as the build command and `dist` as the output directory.
7. In Vercel project settings, add `VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api`, then redeploy.
8. Add `bareaya.in` in Vercel's Domains settings and follow the DNS records Vercel provides.

The Vercel configuration in `vercel.json` supports the React routes `/shop/`, `/bag/`, `/checkout/`, `/new-product/`, and `/our-story/`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
