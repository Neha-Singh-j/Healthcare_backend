# Healthcare Backend 

A RESTful healthcare backend built with **Node.js, Express.js, PostgreSQL (Neon), and Prisma ORM**. It provides JWT-based authentication, patient and doctor management, and patient-doctor assignment APIs.

## Features

- **Authentication:** User registration and login using JWT.
- **Password Security:** Password hashing with `bcryptjs`.
- **Patient Management:** Create, view, update, and delete patient records.
- **Record Ownership:** Users can access only the patient records they own.
- **Doctor Management:** Create, retrieve, update, and delete doctor records.
- **Patient-Doctor Mapping:** Assign doctors to patients, view assignments, and remove mappings.
- **Database Integrity:** PostgreSQL relationships and constraints managed through Prisma ORM.
- **Modular Structure:** Separate routes, controllers, middleware, and database configuration.
- **API Testing:** A Postman collection is included for testing endpoints.

## Project Structure

```text
HealthCare_Backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── generated/
│   └── prisma/             # Generated Prisma Client
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   └── mappingController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── mappingRoutes.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── prisma7.config.ts
├── Healthcare_API.postman_collection.json
└── README.md
```

## Prerequisites

- Node.js and npm
- A PostgreSQL database (Neon or a local PostgreSQL instance)
- Postman (optional, for API testing)

## Environment Configuration

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secure_secret"
JWT_EXPIRES_IN="1d"
```

Keep `.env` private and never commit credentials to GitHub. Use `.env.example` to document the required variables without real secrets.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Apply database migrations

If migrations already exist:

```bash
npx prisma migrate deploy
```

For local development when creating a new migration:

```bash
npx prisma migrate dev --name init
```

Use the migration command appropriate to your current database setup. Do not run both commands blindly against an existing database.

### 4. Start the development server

```bash
npm run dev
```

The API should be available at:

`http://localhost:5000`

Check the health endpoint, if configured:

`GET http://localhost:5000/api/health`

## API Endpoints

Protected endpoints require this header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### 1. Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/login/` | Log in and receive a JWT |

Registration request:

```json
{
  "name": "John Watson",
  "email": "john.watson@example.com",
  "password": "password123"
}
```

Login request:

```json
{
  "email": "john.watson@example.com",
  "password": "password123"
}
```

### 2. Patients

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/patients/` | Create a patient |
| GET | `/api/patients/` | List the authenticated user's patients |
| GET | `/api/patients/:id/` | Retrieve a patient |
| PUT | `/api/patients/:id/` | Update a patient |
| DELETE | `/api/patients/:id/` | Delete a patient |

Example request:

```json
{
  "name": "Alex Morgan",
  "age": 32,
  "gender": "Female",
  "address": "Delhi",
  "phone": "+91XXXXXXXXXX"
}
```

### 3. Doctors

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/doctors/` | Create a doctor |
| GET | `/api/doctors/` | List doctors |
| GET | `/api/doctors/:id/` | Retrieve a doctor |
| PUT | `/api/doctors/:id/` | Update a doctor |
| DELETE | `/api/doctors/:id/` | Delete a doctor |

Example request:

```json
{
  "name": "Dr. Priya Sharma",
  "specialty": "Cardiology",
  "email": "priya.sharma@example.com",
  "phone": "+91XXXXXXXXXX"
}
```

### 4. Patient-Doctor Mappings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/mappings/` | Assign a doctor to a patient |
| GET | `/api/mappings/` | List mappings |
| GET | `/api/mappings/:patient_id/` | List doctors assigned to a patient |
| DELETE | `/api/mappings/:id/` | Remove a mapping |

Example request:

```json
{
  "patientId": 1,
  "doctorId": 1
}
```

Use the actual patient and doctor IDs returned by your API.

## Testing with Postman

1. Start the backend server.
2. Import `Healthcare_API.postman_collection.json` into Postman.
3. Register a user or log in using an existing account.
4. Copy the JWT from the response if it is not saved automatically.
5. For protected requests, select **Authorization → Bearer Token** and provide the JWT.
6. Test patient, doctor, and mapping endpoints.

The collection's automatic token-saving script must match the actual login response structure. If your API returns `token` at the top level, the script must read that field rather than assuming `data.token`.

## Security Notes

- Store credentials in environment variables.
- Hash passwords before saving them.
- Verify JWTs on protected routes.
- Enforce patient ownership checks in the backend.
- Validate request data and return appropriate HTTP status codes.
- Never commit `.env` or other files containing secrets.
 ```
By:Neha Singh
