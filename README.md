#  Healthcare Backend API

A secure, modular, production-ready RESTful API for healthcare patient and doctor management, built with **Node.js**, **Express**, **PostgreSQL (Neon Cloud)**, and **Prisma ORM**.

---

##  Features

- **JWT Authentication**: Secure user registration & login with password hashing via `bcryptjs`.
- **Role & Record Ownership Security**: Patients are scoped strictly to the authenticated user who created them.
- **Doctor Management**: Full CRUD operations for medical doctor records.
- **Patient-Doctor Mapping**: Assign doctors to patients, view assigned doctors per patient, and remove doctor assignments.
- **Relational Integrity**: Foreign key and unique constraint enforcement backed by PostgreSQL & Prisma.
- **Modular MVC Architecture**: Clean separation into `controllers`, `routes`, `middlewares`, `config`, and `utils`.
- **Automated Test Suite**: End-to-end tests covering all endpoints and edge cases (`npm test`).
- **Postman Ready**: Preconfigured collection file `Healthcare_API.postman_collection.json` included for one-click testing.

---

##  Project Structure

```
HealthCare_Backend/
├── prisma/
│   └── schema.prisma          
├── src/
│   ├── config/
│   │   ├── db.js              
│   │   └── env.js              
│   ├── controllers/
│   │   ├── authController.js   
│   │   ├── patientController.js
│   │   ├── doctorController.js 
│   │   └── mappingController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js   
│   │   └── errorMiddleware.js  
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth endpoints
│   │   ├── patientRoutes.js    # /api/patients endpoints
│   │   ├── doctorRoutes.js     # /api/doctors endpoints
│   │   ├── mappingRoutes.js    # /api/mappings endpoints
│   │   └── index.js            # Main route aggregator
│   ├── utils/
│   │   └── apiResponse.js      
│   └── app.js                  
├── tests/
│   └── test_api.js            
├── Healthcare_API.postman_collection.json
├── server.js                  
├── package.json               
└── .env                        
```

---

##  Environment Configuration

Ensure your `.env` file contains the following:

```env
PORT=5000
DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="your_secure_jwt_secret"
JWT_EXPIRES_IN="24h"
```

---

##  Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Sync Database
```bash
npm run prisma:generate
npm run prisma:push
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Run Automated Test Suite
```bash
npm test
```

---

##  API Endpoints Reference

All endpoints accept standard JSON payloads and work seamlessly with or without trailing slashes.

### 1. Authentication APIs (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Public | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login/` | Public | Log in user and receive JWT token |

#### Register Request Body:
```json
{
  "name": "Dr. John Watson",
  "email": "john.watson@example.com",
  "password": "password123"
}
```

---

### 2. Patient Management APIs (`/api/patients`)
> **Note**: Requires `Authorization: Bearer <token>` header. Patients are strictly scoped to the creator.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/patients/` | Private | Create a new patient |
| `GET` | `/api/patients/` | Private | Retrieve all patients created by the authenticated user |
| `GET` | `/api/patients/<id>/` | Private | Get details of a specific patient |
| `PUT` | `/api/patients/<id>/` | Private | Update patient details |
| `DELETE`| `/api/patients/<id>/` | Private | Delete a patient record |

#### Create Patient Request Body:
```json
{
  "name": "Abc",
  "age": 32,
  "gender": "Female",
  "address": "Delhi",
  "phone": "+91XXX7865432"
}
```

---

### 3. Doctor Management APIs (`/api/doctors`)
> **Note**: Requires `Authorization: Bearer <token>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/doctors/` | Private | Add a new doctor |
| `GET` | `/api/doctors/` | Private | Retrieve all doctors |
| `GET` | `/api/doctors/<id>/` | Private | Get details of a specific doctor |
| `PUT` | `/api/doctors/<id>/` | Private | Update doctor details |
| `DELETE`| `/api/doctors/<id>/` | Private | Delete a doctor record |

#### Create Doctor Request Body:
```json
{
  "name": "Dr. Ns",
  "specialty": "Diagnostic Medicine",
  "email": "dr.bb@hospital.com",
  "phone": "+91 XXX7654099"
}
```

---

### 4. Patient-Doctor Mapping APIs (`/api/mappings`)
> **Note**: Requires `Authorization: Bearer <token>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/mappings/` | Private | Assign a doctor to a patient |
| `GET` | `/api/mappings/` | Private | Retrieve all patient-doctor mappings |
| `GET` | `/api/mappings/<patient_id>/` | Private | Get all doctors assigned to a specific patient |
| `DELETE`| `/api/mappings/<id>/` | Private | Remove a doctor assignment (delete mapping by ID) |

#### Assign Doctor Request Body:
```json
{
  "patientId": 1,
  "doctorId": 1
}
```

---

## Testing with Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Select the file `Healthcare_API.postman_collection.json` located in the project root.
4. Execute **Register User** or **Login User**. The collection automatically stores the returned JWT token into the `{{token}}` variable.
5. All subsequent requests (Patients, Doctors, Mappings) will automatically authenticate using this token!
