# LabelStock Project

## Overview

LabelStock is a full-stack web application designed for managing product inventory and generating labels. The project is structured as a monorepo with:

- **Frontend**: Built with Next.js (React) for the user interface, including components for authentication, product listing, and form handling.
- **Backend**: Built with NestJS (TypeScript) for API services, including user authentication (JWT), product CRUD operations, and label generation using PDFKit.

The application supports user registration/login, product creation/updating, and label generation for products.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm (version 8 or higher) or yarn
- Git
- A code editor like VS Code
- For backend: SQLite is used (no additional setup needed, as it uses a local `labelstock.db` file)

## Project Structure

```
.
├── labelstock/          # Frontend (Next.js)
│   ├── src/             # Source code
│   │   ├── app/         # App router pages and layout
│   │   ├── components/  # React components (AuthForm, ProductList, ProductForm, LabelGenerator)
│   │   ├── hooks/       # Custom hooks (useLocalStorage)
│   │   └── utils/       # Utilities (api.ts)
│   ├── public/          # Static assets
│   ├── package.json     # Dependencies and scripts
│   └── tsconfig.json    # TypeScript configuration
├── labelstock-backend/  # Backend (NestJS)
│   ├── src/             # Source code
│   │   ├── auth/        # Authentication module (controllers, services, DTOs, entities, guards, strategies)
│   │   ├── product/     # Product module (controllers, services, DTOs, entities)
│   │   ├── app.module.ts # Main application module
│   │   └── main.ts      # Entry point
│   ├── package.json     # Dependencies and scripts
│   ├── tsconfig.json    # TypeScript configuration
│   └── labelstock.db    # SQLite database file
├── README.md            # This file
├── index.html           # Simple static page (optional)
├── script.js            # Simple script (optional)
└── style.css            # Simple styles (optional)
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Cherkasant/labelstock.git
cd labelstock
```

### 2. Install Dependencies

#### Backend
```bash
cd labelstock-backend
npm install
cd ..
```

#### Frontend
```bash
cd labelstock
npm install
cd ..
```

### 3. Database Setup

The backend uses SQLite with a local database file (`labelstock-backend/labelstock.db`). No additional setup is required; it will be created/updated on first run.

If you want to use PostgreSQL instead, update the database configuration in the backend's ORM setup (e.g., TypeORM config in `app.module.ts`).

### 4. Environment Configuration

#### Backend
Create a `.env` file in `labelstock-backend/` if needed for sensitive data (e.g., JWT secret). Example:

```
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=sqlite:./labelstock.db  # Default is local SQLite
PORT=3000
```

Update `src/auth/strategies/jwt.strategy.ts` and other configs with your secret.

#### Frontend
The frontend uses API calls to the backend (configured in `labelstock/src/utils/api.ts`). Update the base URL if the backend runs on a different port:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### 5. Run the Application

#### Backend
In a terminal:
```bash
cd labelstock-backend
npm run start:dev  # Development mode with hot reload
```

The backend will run on `http://localhost:3000`. The API endpoints include:
- `/auth/register` - User registration
- `/auth/login` - User login
- `/product` - Product CRUD operations
- `/product/generate-labels` - Generate PDF labels

#### Frontend
In another terminal:
```bash
cd labelstock
npm run dev
```

The frontend will run on `http://localhost:3001` (or the default Next.js port). Open your browser to view the app.

### 6. Building for Production

#### Backend
```bash
cd labelstock-backend
npm run build
npm run start:prod
```

#### Frontend
```bash
cd labelstock
npm run build
npm start  # Or use a production server like Vercel
```

## Features

- **Authentication**: JWT-based login/register with protected routes.
- **Product Management**: Create, read, update, delete products via API.
- **Label Generation**: Generate PDF labels for products using backend service.
- **Local Storage**: Frontend uses hooks for persisting data locally.
- **Responsive UI**: Built with React components and Tailwind CSS (via globals.css).

## Usage

1. Start the backend server.
2. Start the frontend server.
3. Access the frontend in your browser.
4. Register a new user or log in.
5. Add products using the ProductForm.
6. View products in ProductList.
7. Generate labels for selected products.

## Troubleshooting

- **Port Conflicts**: Change ports in `package.json` scripts or `.env`.
- **Database Errors**: Ensure write permissions for `labelstock.db`.
- **CORS Issues**: Backend has CORS enabled for frontend origin; update if needed in `main.ts`.
- **JWT Errors**: Verify JWT secret matches in backend config.
- **Build Errors**: Run `npm install` again or check Node version.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (add one if needed).

## Contact

For questions, open an issue on GitHub.