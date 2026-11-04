# Campus Resource Booking System

A full-stack web application that allows students to explore campus resources, book available facilities, and manage their bookings. Administrators can manage resources, monitor bookings, and view booking analytics through an admin dashboard.

## Project Overview

The Campus Resource Booking System simplifies the process of reserving campus facilities such as classrooms, laboratories, and other shared resources.

It provides separate experiences for regular users and administrators, with secure authentication and role-based access control.

## Key Features

### User Features
- User registration and login.
- Secure password hashing.
- JWT-based authentication.
- Browse and search campus resources.
- Filter and sort available resources.
- Check resource availability.
- Book resources by selecting dates and time slots.
- View personal booking history.
- Update and cancel bookings.

### Admin Features
- Admin dashboard with booking statistics.
- View total, active, and cancelled bookings.
- Monitor resource usage analytics.
- Add, update, and delete campus resources.
- View and manage booking information.
- Control resource availability.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| API | REST APIs |
| Development Tools | VS Code, Git, GitHub, npm |

## Application Architecture

The application follows a frontend-backend architecture.

- **Frontend:** React.js provides the user interface.
- **Backend:** Node.js and Express.js handle business logic and REST API requests.
- **Database:** SQLite stores users, resources, and bookings.
- **Authentication:** JWT verifies authenticated requests, while role-based middleware protects administrator routes.

## Project Structure

```text
CampusResourceBookingSystem/
│
├── backend/
│   ├── authentication/
│   ├── bookings/
│   ├── resources/
│   ├── database/
│   ├── app.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

## Database Design

The application uses SQLite with the following main tables:

- **users:** Stores user details, email, hashed password, role, and creation date.
- **resources:** Stores resource names, types, locations, capacities, and availability status.
- **bookings:** Stores user-resource relationships, booking dates, time slots, and booking status.

Foreign key relationships maintain consistency between users, resources, and bookings.

## Installation and Setup

### Prerequisites

- Node.js and npm
- Git
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/Hanookviswa/CampusResourceBookingSystem.git
cd CampusResourceBookingSystem
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a template.

Configure the environment variables:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
```

Start the backend using the available development script in `package.json`.

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## API Overview

The backend exposes REST APIs for authentication, resource management, bookings, and administration.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/protected` | Test authenticated access |
| GET | `/api/resources` | Retrieve resources |
| GET | `/api/resources/:id` | Retrieve resource details |
| GET | `/api/resources/search` | Search resources |
| GET | `/api/resources/availability` | Check resource availability |
| POST | `/api/resources/book` | Create a booking |
| GET | `/api/my-bookings` | Retrieve personal bookings |
| PUT | `/api/bookings/:id` | Update a booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking |
| GET | `/api/analytics/bookings` | View booking statistics |
| GET | `/api/analytics/bookings/date-range` | View date-range analytics |
| GET | `/api/analytics/resources` | View resource usage |
| POST | `/api/admin/resources` | Create a resource |
| PUT | `/api/admin/resources/:id` | Update a resource |
| DELETE | `/api/admin/resources/:id` | Delete a resource |
| GET | `/api/admin/bookings` | View all bookings |

Administrator APIs require authentication and administrator authorization.

## Security

- Passwords are hashed using bcryptjs.
- JWT-based authentication protects private routes.
- Role-based authorization restricts administrative operations.
- Environment variables are used for sensitive configuration.
- Parameterized SQL queries help prevent SQL injection.

## Screenshots

Screenshots of the application will be added here.

Suggested screenshots:
- Home page
- Login and Signup pages
- Resources listing
- Booking interface
- My Bookings page
- Admin Dashboard
- Admin Resource Management

## Future Enhancements

- Email notifications for booking confirmations.
- Calendar-based booking interface.
- Improved booking conflict management.
- Production database integration.
- Deployment with a live demo.

## Author

**Hanook Viswa**

- GitHub: [Hanookviswa](https://github.com/Hanookviswa)
- LinkedIn: [Hanook Viswa](https://www.linkedin.com/in/hanook-viswa/)

---

*Built as a full-stack software development project to simplify campus resource management and booking.*