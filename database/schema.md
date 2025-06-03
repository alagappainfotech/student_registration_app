# Database Schema (Managed by Django)

The backend uses Django ORM with SQLite by default.

## Entity Relationships

```
Organization (is_internal)
  └── Class
        └── Section
              └── Course (fees/budget)
                    ├── Faculty
                    ├── Enrollment (links Student, Course, Faculty, Section)
                    └── Grade (linked to Enrollment)
Student (belongs to Organization)
```

---

## Organization
| Field        | Type         | Notes                        |
|--------------|--------------|------------------------------|
| id           | Integer (PK) | Auto-increment               |
| name         | Char(100)    |                              |
| is_internal  | Boolean      | True = our org, False = ext. |

## Class
| Field         | Type         | Notes                 |
|---------------|--------------|-----------------------|
| id            | Integer (PK) | Auto-increment        |
| name          | Char(100)    |                       |
| organization  | FK           | To Organization       |

## Section
| Field         | Type         | Notes           |
|---------------|--------------|-----------------|
| id            | Integer (PK) |                 |
| name          | Char(100)    |                 |
| class_obj     | FK           | To Class        |

## Course
| Field         | Type         | Notes           |
|---------------|--------------|-----------------|
| id            | Integer (PK) |                 |
| name          | Char(100)    |                 |
| section       | FK           | To Section      |
| fees          | Decimal      | Course fee      |
| budget        | JSON/Object  | Cost breakdown  |

## Faculty
| Field         | Type         | Notes           |
|---------------|--------------|-----------------|
| id            | Integer (PK) |                 |
| user          | FK           | To User         |
| organization  | FK           | To Organization |
| name, email, phone, address, etc.             |

## Student
| Field         | Type         | Notes           |
|---------------|--------------|-----------------|
| id            | Integer (PK) |                 |
| user          | FK           | To User         |
| organization  | FK           | To Organization |
| name, email, phone, address, etc.             |

## Enrollment
| Field         | Type         | Notes           |
|---------------|--------------|-----------------|
| id            | Integer (PK) |                 |
| student       | FK           | To Student      |
| course        | FK           | To Course       |
| faculty       | FK           | To Faculty      |
| section       | FK           | To Section      |
| enrolled_at   | DateTime     |                 |

## Grade
| Field         | Type         | Notes           |
|---------------|--------------|-----------------|
| id            | Integer (PK) |                 |
| enrollment    | FK           | To Enrollment   |
| value         | Char/Decimal | Grade/Score     |

## Fees Module (per Course)
| Field           | Type         | Notes                        |
|-----------------|--------------|------------------------------|
| id              | Integer (PK) |                              |
| course          | FK           | To Course                    |
| base_cost       | Decimal      |                              |
| faculty_cost    | Decimal      |                              |
| materials_cost  | Decimal      |                              |
| admin_cost      | Decimal      |                              |
| profit_margin   | Decimal      | e.g. 0.15 for 15%            |
| final_fee       | Decimal      | Calculated (cost+profit)     |

---

Migrations are managed in the backend folder with `python manage.py makemigrations` and `migrate`.
