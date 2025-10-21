# OriPro Backend

A comprehensive Express.js backend system for property and asset management with task scheduling, user management, and real-time tracking capabilities.

## 🚀 Features

### Core Modules

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user lifecycle management with role assignments
- **Asset Management**: Property and asset tracking with location-based services
- **Unit Management**: Property unit management with tenant assignments
- **Tenant Management**: Tenant lifecycle with category management
- **Task Management**: Scheduled task system with timezone support
- **User Task System**: Task assignment and completion tracking
- **Scan Information**: QR code scanning and location tracking
- **File Upload**: Secure file upload system with type validation
- **Audit Logging**: Comprehensive logging for all operations
- **Menu Management**: Dynamic menu system with permissions

### Advanced Features

- **Timezone Support**: Asia/Jakarta timezone for all time operations
- **Real-time Tracking**: GPS-based location tracking for assets
- **Task Scheduling**: Automated task generation based on schedules
- **Evidence Management**: Task completion evidence storage
- **Role-based Permissions**: Granular permission system
- **File Attachments**: Support for multiple file types per entity
- **Email Integration**: SMTP-based email notifications
- **Metrics & Monitoring**: Prometheus metrics integration
- **Database Migrations**: Automated database schema management

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL/PostgreSQL with Sequelize ORM
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer
- **Timezone**: Moment.js with timezone support
- **Validation**: Express-validator
- **Security**: Helmet, CORS
- **Monitoring**: Prometheus metrics
- **Testing**: Jest

## 📋 Prerequisites

- Node.js 18 or higher
- MySQL 8.0+ or PostgreSQL 12+
- SMTP server for email functionality

## ⚙️ Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oripro-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   
   # Database Configuration (Choose one)
   # MySQL
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=oripro_db
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   
   # PostgreSQL
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=oripro_db
   PGUSER=your_username
   PGPASSWORD=your_password
   PGSSL=false
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   SMTP_SECURE=true
   MAIL_FROM=your_email@gmail.com
   ```

4. **Database Configuration**
   
   Update `config/config.json`:
   ```json
   {
     "mysql": {
       "username": "your_username",
       "password": "your_password",
       "database": "oripro_db",
       "host": "localhost",
       "dialect": "mysql"
     }
   }
   ```

5. **Run Database Migrations**
   ```bash
   npm run migrate
   ```

6. **Seed Initial Data**
   ```bash
   npm run seed:all
   ```

7. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/logs` - Get user activity logs
- `GET /api/users/permissions` - Get user permissions
- `GET /api/users/menus` - Get user menu access
- `GET /api/users/sidebar` - Get user sidebar menu

### Asset Management
- `GET /api/assets` - List all assets
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/:id/logs` - Get asset activity logs

### Unit Management
- `GET /api/units` - List all units
- `GET /api/units/:id` - Get unit details
- `POST /api/units` - Create new unit
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit
- `GET /api/units/:id/logs` - Get unit activity logs

### Tenant Management
- `GET /api/tenants` - List all tenants
- `GET /api/tenants/:id` - Get tenant details
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant
- `GET /api/tenants/:id/logs` - Get tenant activity logs

### Task Management
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `GET /api/tasks/:id/logs` - Get task activity logs

### User Task System
- `POST /api/user-tasks/generate-upcoming` - Generate upcoming user tasks
- `GET /api/user-tasks` - List user tasks
- `GET /api/user-tasks/upcoming` - Get upcoming user tasks
- `PUT /api/user-tasks/:id/start` - Start a user task
- `PUT /api/user-tasks/:id/complete` - Complete a user task

### Scan Information
- `GET /api/scan-infos` - List scan information
- `GET /api/scan-infos/:id` - Get scan details
- `POST /api/scan-infos` - Create scan record
- `PUT /api/scan-infos/:id` - Update scan record
- `DELETE /api/scan-infos/:id` - Delete scan record
- `GET /api/scan-infos/scan-code/:scanCode` - Get scan by code

### Role Management
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get role details
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `GET /api/roles/:id/permissions` - Get role permissions
- `PUT /api/roles/:id/permissions` - Update role permissions

### Menu Management
- `GET /api/menus` - List all menus
- `GET /api/menus/:id` - Get menu details
- `POST /api/menus` - Create new menu
- `PUT /api/menus/:id` - Update menu
- `DELETE /api/menus/:id` - Delete menu

### File Upload
- `POST /api/uploads/:type` - Upload file by type
- `POST /api/uploads/simple-upload` - Simple file upload
- `GET /api/uploads/test` - Test upload endpoint

### System
- `GET /health` - Health check endpoint
- `GET /metrics` - Prometheus metrics

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema

### Core Entities
- **Users**: User accounts with role assignments
- **Roles**: Role definitions with permission levels
- **Assets**: Property and asset information
- **Units**: Property units within assets
- **Tenants**: Tenant information and assignments
- **Tasks**: Task definitions with schedules
- **UserTasks**: Task assignments to users
- **ScanInfos**: QR code scan records with GPS data

### Supporting Tables
- **TaskSchedules**: Task scheduling information
- **UserTaskEvidences**: Task completion evidence
- **Menus**: Dynamic menu system
- **RoleMenuPermissions**: Menu access permissions
- **Attachments**: File attachments for entities
- **Logs**: Audit logs for all operations

## 🌍 Timezone Support

The system uses Asia/Jakarta timezone for all time-related operations:
- Task scheduling
- User task generation
- Timestamp recording
- Time-based filtering

## 📁 Project Structure

```
src/
├── app.js                 # Application entry point
├── middleware/            # Custom middleware
├── models/               # Sequelize models
├── repositories/         # Data access layer
├── routes/              # API route definitions
├── usecases/            # Business logic layer
├── services/            # External services
└── scripts/             # Database scripts
    ├── migrations/      # Database migrations
    └── seeders/         # Database seeders
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📈 Monitoring

The application includes Prometheus metrics at `/metrics` endpoint for monitoring:
- Request counts
- Response times
- Error rates
- Custom business metrics

## 🚀 Deployment

### Production Build
```bash
npm start
```

### Environment Variables for Production
Ensure all environment variables are properly configured for production deployment.

## 📝 API Documentation

### Request/Response Format
All API responses follow a consistent format:
```json
{
  "data": {},
  "message": "Success message",
  "status": 200
}
```

### Error Handling
Error responses include detailed error information:
```json
{
  "data": null,
  "message": "Error description",
  "status": 400
}
```

### Pagination
List endpoints support pagination:
- `limit`: Number of items per page
- `offset`: Number of items to skip

### Filtering and Sorting
Most list endpoints support:
- Field-based filtering
- Multiple sort options
- Search functionality

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed demo data
- `npm run seed:all` - Seed all initial data
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage

### Code Style
- Repository pattern for data access
- Usecase pattern for business logic
- Consistent error handling
- Comprehensive logging
- Input validation with express-validator

## 📞 Support

For support and questions, please contact the development team.

## 📄 License

This project is proprietary software. All rights reserved.