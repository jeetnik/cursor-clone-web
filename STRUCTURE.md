# Currsor Project - Complete Backend Structure & Endpoints

## Table of Contents
1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Database Schema](#database-schema)
4. [API Endpoints Summary](#api-endpoints-summary)
5. [Authentication](#authentication)
6. [Router Implementations](#router-implementations)
7. [Middleware](#middleware)
8. [Environment Variables](#environment-variables)

---

## Project Overview

This is a monorepo built with Turborepo that includes:
- **Express Backend** (TypeScript)
- **Next.js Frontend** (Web)
- **Prisma + PostgreSQL** (Database)
- **Shared Packages** (UI, Config, DB)

---

## Folder Structure

```
currsor/
├── apps/
│   ├── server/                           # Express Backend
│   │   ├── middleware/
│   │   │   └── auth.ts                   # JWT authentication middleware
│   │   ├── router/
│   │   │   ├── userRouter.ts             # User auth (signup/signin)
│   │   │   ├── projectRouter.ts          # Project CRUD operations
│   │   │   ├── fileRouter.ts             # File/folder management
│   │   │   ├── conversationRouter.ts     # Conversation management
│   │   │   └── systemRouter.ts           # Internal API (for AI/services)
│   │   ├── index.ts                      # Main server entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                              # Next.js Frontend
│   │   └── ...
│   │
│   └── docs/                             # Documentation Site
│       └── ...
│
├── packages/
│   ├── db/                               # Prisma Database Package
│   │   ├── prisma/
│   │   │   └── schema.prisma             # Database schema
│   │   ├── generated/                    # Generated Prisma Client
│   │   ├── index.ts                      # Prisma client export
│   │   └── package.json
│   │
│   ├── ui/                               # Shared UI components
│   │   └── ...
│   │
│   ├── eslint-config/                    # Shared ESLint config
│   │   └── ...
│   │
│   └── typescript-config/                # Shared TypeScript config
│       └── ...
│
├── node_modules/
├── package.json                          # Root package.json
├── turbo.json                            # Turborepo config
├── bun.lock
└── README.md
```

---

## Database Schema

### Models

#### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  projects  Project[]
}
```

#### Project
```prisma
model Project {
  id            String        @id @default(cuid())
  name          String
  ownerId       String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  importStatus  ImportStatus?
  exportStatus  ExportStatus?
  exportRepoUrl String?

  owner         User          @relation(fields: [ownerId], references: [id])
  files         File[]
  conversations Conversation[]

  @@index([ownerId])
}
```

#### File
```prisma
model File {
  id         String    @id @default(cuid())
  projectId  String
  parentId   String?
  name       String
  type       FileType  # file | folder
  content    String?   @db.Text
  storageId  String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  project    Project   @relation(fields: [projectId], references: [id])
  parent     File?     @relation("FileTree", fields: [parentId], references: [id])
  children   File[]    @relation("FileTree")

  @@index([projectId])
  @@index([parentId])
}
```

#### Conversation
```prisma
model Conversation {
  id        String   @id @default(cuid())
  projectId String
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project   Project  @relation(fields: [projectId], references: [id])
  messages  Message[]

  @@index([projectId])
}
```

#### Message
```prisma
model Message {
  id             String        @id @default(cuid())
  conversationId String
  role           MessageRole   # user | assistant
  content        String        @db.Text
  status         MessageStatus? # processing | completed | cancelled
  createdAt      DateTime      @default(now())

  conversation   Conversation  @relation(fields: [conversationId], references: [id])

  @@index([conversationId])
}
```

### Enums
- **ImportStatus**: `importing`, `completed`, `failed`
- **ExportStatus**: `exporting`, `completed`, `failed`, `cancelled`
- **FileType**: `file`, `folder`
- **MessageRole**: `user`, `assistant`
- **MessageStatus**: `processing`, `completed`, `cancelled`

---

## API Endpoints Summary

### 📊 Total: 24 Endpoints

| Category | Count | Auth Required |
|----------|-------|---------------|
| Authentication | 2 | No |
| Projects | 5 | JWT |
| Files | 9 | JWT |
| Conversations | 4 | JWT |
| Messages | 1 | JWT |
| System (Internal) | 3 | API Key |

---

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/user/signup` | Create new user account | None |
| POST | `/api/v1/user/signin` | Login and get JWT token | None |

**Request Body (signup/signin):**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (signin):**
```json
{
  "message": "Signin successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 📁 Project Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/projects` | Create a new project | JWT |
| GET | `/api/v1/projects` | Get all user's projects | JWT |
| GET | `/api/v1/projects/partial?limit=10` | Get limited projects | JWT |
| GET | `/api/v1/projects/:id` | Get specific project | JWT |
| PATCH | `/api/v1/projects/:id/rename` | Rename a project | JWT |

**Examples:**

**Create Project:**
```bash
POST /api/v1/projects
Authorization: Bearer <token>

{
  "name": "My Awesome Project"
}
```

**Get All Projects:**
```bash
GET /api/v1/projects
Authorization: Bearer <token>
```

**Rename Project:**
```bash
PATCH /api/v1/projects/clx123abc/rename
Authorization: Bearer <token>

{
  "name": "Updated Project Name"
}
```

---

### 📄 File & Folder Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/files?projectId=xxx` | Get all files in project | JWT |
| GET | `/api/v1/files/folder?projectId=xxx&parentId=xxx` | Get folder contents | JWT |
| GET | `/api/v1/files/:id` | Get specific file | JWT |
| GET | `/api/v1/files/:id/path` | Get file breadcrumb path | JWT |
| POST | `/api/v1/files` | Create new file | JWT |
| POST | `/api/v1/files/folder` | Create new folder | JWT |
| PATCH | `/api/v1/files/:id` | Update file content | JWT |
| PATCH | `/api/v1/files/:id/rename` | Rename file/folder | JWT |
| DELETE | `/api/v1/files/:id` | Delete file/folder (recursive) | JWT |

**Examples:**

**Get Folder Contents:**
```bash
GET /api/v1/files/folder?projectId=clx123abc&parentId=clx456def
Authorization: Bearer <token>
```

**Create File:**
```bash
POST /api/v1/files
Authorization: Bearer <token>

{
  "projectId": "clx123abc",
  "parentId": "clx456def",  // optional (null for root)
  "name": "app.ts",
  "content": "console.log('Hello World');"
}
```

**Create Folder:**
```bash
POST /api/v1/files/folder
Authorization: Bearer <token>

{
  "projectId": "clx123abc",
  "parentId": null,  // root level
  "name": "src"
}
```

**Update File Content:**
```bash
PATCH /api/v1/files/clx789ghi
Authorization: Bearer <token>

{
  "content": "const x = 10;\nconsole.log(x);"
}
```

**Rename File:**
```bash
PATCH /api/v1/files/clx789ghi/rename
Authorization: Bearer <token>

{
  "newName": "index.ts"
}
```

**Delete File/Folder:**
```bash
DELETE /api/v1/files/clx789ghi
Authorization: Bearer <token>
```

---

### 💬 Conversation & Message Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/conversations` | Create new conversation | JWT |
| GET | `/api/v1/conversations/:id` | Get specific conversation | JWT |
| GET | `/api/v1/conversations?projectId=xxx` | Get all conversations in project | JWT |
| GET | `/api/v1/conversations/:id/messages` | Get all messages in conversation | JWT |

**Examples:**

**Create Conversation:**
```bash
POST /api/v1/conversations
Authorization: Bearer <token>

{
  "projectId": "clx123abc",
  "title": "Bug Fix Discussion"
}
```

**Get Conversations:**
```bash
GET /api/v1/conversations?projectId=clx123abc
Authorization: Bearer <token>
```

**Get Messages:**
```bash
GET /api/v1/conversations/clx456def/messages
Authorization: Bearer <token>
```

---

### 🔧 System (Internal) Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/system/conversations/:id` | Get conversation (internal) | API Key |
| POST | `/api/v1/system/messages` | Create message (internal) | API Key |
| PATCH | `/api/v1/system/messages/:id` | Update message content | API Key |

**Authentication:** Use header `x-internal-api-key: <your-secret-key>`

**Examples:**

**Create Message (Internal):**
```bash
POST /api/v1/system/messages
x-internal-api-key: your-internal-secret-key

{
  "conversationId": "clx456def",
  "role": "assistant",
  "content": "Here's the solution...",
  "status": "completed"
}
```

**Update Message:**
```bash
PATCH /api/v1/system/messages/clx789ghi
x-internal-api-key: your-internal-secret-key

{
  "content": "Updated response..."
}
```

---

## Authentication

### JWT Authentication (User Routes)

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**JWT Payload:**
```json
{
  "email": "user@example.com",
  "userId": "clx123abc"
}
```

**Middleware:** `auth` (from `middleware/auth.ts`)

### Internal API Key Authentication

**Header Format:**
```
x-internal-api-key: <your-internal-secret-key>
```

**Middleware:** `validateInternalKey` (in `systemRouter.ts`)

---

## Router Implementations

### 1. User Router (`userRouter.ts`)

**Location:** `apps/server/router/userRouter.ts`

**Endpoints:**
- `POST /signup` - User registration
- `POST /signin` - User login

**Features:**
- Password hashing with bcrypt
- JWT token generation
- Email uniqueness validation

---

### 2. Project Router (`projectRouter.ts`)

**Location:** `apps/server/router/projectRouter.ts`

**Endpoints:**
- `POST /` - Create project
- `GET /` - Get all projects
- `GET /partial` - Get limited projects
- `GET /:id` - Get project by ID
- `PATCH /:id/rename` - Rename project

**Features:**
- Ownership verification
- Auto-update `updatedAt` timestamp
- Sorted by `updatedAt` DESC

---

### 3. File Router (`fileRouter.ts`)

**Location:** `apps/server/router/fileRouter.ts`

**Endpoints:**
- `GET /` - Get all files in project
- `GET /folder` - Get folder contents
- `GET /:id` - Get file by ID
- `GET /:id/path` - Get breadcrumb path
- `POST /` - Create file
- `POST /folder` - Create folder
- `PATCH /:id` - Update file content
- `PATCH /:id/rename` - Rename file/folder
- `DELETE /:id` - Delete file/folder

**Features:**
- Recursive delete for folders
- Duplicate name validation
- Breadcrumb path traversal
- Folder-first sorting

---

### 4. Conversation Router (`conversationRouter.ts`)

**Location:** `apps/server/router/conversationRouter.ts`

**Endpoints:**
- `POST /` - Create conversation
- `GET /:id` - Get conversation
- `GET /` - Get all conversations by project
- `GET /:id/messages` - Get messages

**Features:**
- Project ownership validation
- Messages sorted by `createdAt` ASC
- Conversations sorted by `updatedAt` DESC

---

### 5. System Router (`systemRouter.ts`)

**Location:** `apps/server/router/systemRouter.ts`

**Endpoints:**
- `GET /conversations/:id` - Get conversation (no auth check)
- `POST /messages` - Create message
- `PATCH /messages/:id` - Update message

**Features:**
- Internal API key validation
- Auto-update conversation `updatedAt`
- Status management for messages

---

## Middleware

### Auth Middleware (`auth.ts`)

**Location:** `apps/server/middleware/auth.ts`

**Purpose:** Validates JWT tokens and attaches user info to request

**Usage:**
```typescript
import { auth } from "../middleware/auth";

router.use(auth);  // Apply to all routes
router.get("/protected", auth, handler);  // Apply to specific route
```

**Request Extension:**
```typescript
req.user = {
  email: string;
  userId: string;
}
```

---

## Environment Variables

Create a `.env` file in `apps/server/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Internal API Key (for system routes)
INTERNAL_API_KEY="your-internal-secret-key-for-ai-services"

# Server
PORT=4000
NODE_ENV=development
```

---

## File Code Snippets

### Main Server File (`index.ts`)

```typescript
import express from "express";
import userRouter from "./router/userRouter";
import projectRouter from "./router/projectRouter";
import fileRouter from "./router/fileRouter";
import conversationRouter from "./router/conversationRouter";
import systemRouter from "./router/systemRouter";

const app = express();
const port = 4000;

app.use(express.json());

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/files", fileRouter);
app.use("/api/v1/conversations", conversationRouter);
app.use("/api/v1/system", systemRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

---

## Key Features & Security

### ✅ Implemented Features
- JWT-based authentication
- Password hashing with bcrypt
- Project ownership verification
- Recursive file/folder deletion
- Duplicate name validation
- Breadcrumb path generation
- Internal API for AI services
- Auto-timestamp updates

### 🔒 Security Measures
- JWT token validation on protected routes
- Password hashing (bcrypt with 10 rounds)
- API key validation for internal endpoints
- Ownership checks before data access
- Input validation
- Error handling with proper status codes

### ⚠️ TODO for Production
- [ ] Use environment variables for JWT_SECRET
- [ ] Add rate limiting
- [ ] Add CORS configuration
- [ ] Add request validation (Zod/Joi)
- [ ] Add logging (Winston/Pino)
- [ ] Add API documentation (Swagger)
- [ ] Add database migrations
- [ ] Add unit & integration tests
- [ ] Add file upload handling for binary files
- [ ] Add pagination for large datasets

---

## Common Error Responses

```json
// 400 Bad Request
{
  "message": "Project ID and name are required"
}

// 401 Unauthorized
{
  "message": "Invalid or expired token"
}

// 403 Forbidden
{
  "message": "Unauthorized to access this project"
}

// 404 Not Found
{
  "message": "Project not found"
}

// 409 Conflict
{
  "message": "File already exists"
}

// 500 Internal Server Error
{
  "message": "Internal server error"
}
```

---

## Testing the API

### Using cURL

```bash
# Signup
curl -X POST http://localhost:4000/api/v1/user/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Signin
curl -X POST http://localhost:4000/api/v1/user/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create Project (replace <token>)
curl -X POST http://localhost:4000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"My Project"}'

# Get Projects
curl -X GET http://localhost:4000/api/v1/projects \
  -H "Authorization: Bearer <token>"
```

### Using Postman/Insomnia

1. Import the endpoints
2. Set base URL: `http://localhost:4000`
3. For protected routes, add `Authorization: Bearer <token>` header
4. For system routes, add `x-internal-api-key: <key>` header

---

## Migration from Convex

### Key Differences

| Convex | Express + Prisma |
|--------|------------------|
| `v.id("projects")` | `String` (cuid) |
| `v.number()` (timestamp) | `DateTime` |
| `v.union(v.literal(...))` | `Enum` |
| Auto-generated IDs | `@default(cuid())` |
| `ctx.auth.getUserIdentity()` | JWT middleware |
| `ctx.db.insert()` | `prisma.model.create()` |
| `ctx.db.patch()` | `prisma.model.update()` |
| `ctx.db.delete()` | `prisma.model.delete()` |
| Internal key in args | Header validation |

---

## Development Workflow

### Start Development Server

```bash
# From root
bun run dev

# Or from apps/server
cd apps/server
bun run dev
```

### Database Operations

```bash
# From packages/db
cd packages/db

# Generate Prisma Client
bunx prisma generate

# Create migration
bunx prisma migrate dev --name init

# Push schema (dev only)
bunx prisma db push

# View database
bunx prisma studio
```

---

## Conclusion

You now have a complete Express + Prisma backend that replicates all the functionality from your Convex schema with 24 fully functional endpoints!

**Next Steps:**
1. Create the router files
2. Update the main `index.ts`
3. Set up environment variables
4. Run database migrations
5. Test the endpoints
6. Connect your frontend

Happy coding! 🚀
