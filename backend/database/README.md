# Database Documentation

This directory contains database-related files and scripts for the Student Registration Application.

## Directory Structure

```
database/
├── scripts/
│   ├── schema.sql       # Database schema definition
│   └── full_dump.sql    # Complete database dump including data
└── README.md           # This file
```

## Database Schema

The application uses SQLite as the default database. The main entities and their relationships are as follows:

### Core Tables

1. **Users**
   - Stores user account information
   - Fields: id, email, password, first_name, last_name, is_staff, is_active, date_joined

2. **Profiles**
   - Extended user information
   - Fields: user (FK), phone_number, address, date_of_birth, gender, role, organization (FK)

3. **Registration Requests**
   - Tracks user registration requests
   - Fields: email, first_name, last_name, phone_number, address, date_of_birth, gender, role, status, created_at, processed_at, processed_by (FK)

4. **Organizations**
   - Represents educational institutions
   - Fields: name, address, contact_email, contact_phone

5. **Classes**
   - Academic classes/grades
   - Fields: name, organization (FK)

6. **Sections**
   - Class sections
   - Fields: name, class (FK), organization (FK)

7. **Students**
   - Student-specific information
   - Fields: user (FK), student_id, class_enrolled (FK), section (FK), admission_date

## Database Scripts

1. **schema.sql**
   - Contains only the database schema (tables, indexes, triggers)
   - Use this to create a new empty database with the correct structure

2. **full_dump.sql**
   - Complete database dump including schema and data
   - Use this to restore the database with all existing data

## Setup Instructions

1. **Initialize a new database**:
   ```bash
   sqlite3 db.sqlite3 < database/scripts/schema.sql
   ```

2. **Restore from dump**:
   ```bash
   sqlite3 db.sqlite3 < database/scripts/full_dump.sql
   ```

## Backup and Maintenance

To create a backup of the current database:
```bash
sqlite3 db.sqlite3 ".backup 'backup_$(date +%Y%m%d).db'"
```

## Security Notes

- The database file (`db.sqlite3`) contains sensitive information and should not be committed to version control
- Database credentials should be managed through environment variables in production
- Regular backups are recommended
