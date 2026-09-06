# StayOS PMS — Configuration Module Backend Architecture

A multi-tenant SaaS backend for hotel property management systems, powered by Node.js, Express, and PostgreSQL (Supabase).

---

## 1. Multi-Tenancy Architecture & Scoping

- **Tenancy Key**: Every table in the schema contains a `client_id VARCHAR(50)` referencing `property(client_id)`.
- **Tenant Middleware (`middleware/tenant.ts`)**:
  - Extracts tenant identifier from the `x-client-id` header (or optional fallback query param for local dev).
  - Validates format and binds to `req.clientId`.
  - Rejects unauthenticated requests with `HTTP 401 Unauthorized` (`UNAUTHORIZED_TENANT`).
- **Strict Query Scoping**: Repositories inject `client_id = $1` as the first parameter for all queries. The API never accepts or trusts `client_id` from request bodies or route params.

---

## 2. Standard Response Envelope

All API endpoints return a standardized JSON envelope:

```json
{
  "data": { ... } | [ ... ] | null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation",
    "details": { ... }
  } | null,
  "meta": {
    "timestamp": "2026-09-05T22:30:00.000Z",
    "clientId": "PROP_001",
    "count": 5
  }
}
```

### Standard HTTP Status Codes
- `200 OK`: Successful retrieval or update.
- `201 Created`: Successful creation of master record.
- `204 No Content`: Successful deletion.
- `400 Bad Request`: Input validation failed, or database CHECK constraint violated (`23514`).
- `401 Unauthorized`: Missing or invalid `x-client-id` header.
- `404 Not Found`: Entity does not exist for the current tenant.
- `409 Conflict`: Database Foreign Key violation (`23503`) or Unique constraint violation (`23505`).
- `500 Internal Server Error`: Unhandled database or system exception.

---

## 3. Singleton Provisioning: Database Trigger vs Application Function

### Decision: Database-Level `AFTER INSERT` Trigger
We implemented a PostgreSQL `AFTER INSERT` trigger (`trg_property_after_insert`) calling `fn_provision_property_singleton_settings_for_client()` (defined in `db/migrations/002_singleton_trigger.sql`).

### Why this approach was chosen:
1. **Unbreakable Data Integrity**: Whether a property is created via the REST API, an admin dashboard, a raw SQL migration script, or a background worker, all 10 child singleton tables are guaranteed to exist with valid default rows.
2. **Transactional Atomicity**: The provisioning occurs inside the same atomic database transaction as the `INSERT INTO property`. If any default fails or the transaction aborts, PostgreSQL rolls back cleanly without leaving orphan records.
3. **Zero Race Conditions**: Eliminates the window where a concurrent HTTP request queries a singleton table (e.g. `general_setting_rental`) before an asynchronous application event worker runs.
4. **Idempotency**: Using `ON CONFLICT (client_id) DO NOTHING` guarantees that if a property is updated or re-seeded, existing configurations are preserved and no duplicates are created.
5. **Standalone Utility**: We also exposed `fn_provision_property_singleton_settings_for_client(p_client_id)` as a callable function so existing legacy tenants can be backfilled anytime with `SELECT fn_provision_property_singleton_settings_for_client('CLIENT_ID');`.

---

## 4. PostgreSQL Error Mapping (23503 -> 409 Conflict)

In `middleware/errorHandler.ts`, PostgreSQL-specific error codes are intercepted:
- **`23503` (foreign_key_violation)**:
  - Mapped to **HTTP 409 Conflict** (`FOREIGN_KEY_CONFLICT`).
  - Example on `DELETE /buildings/:id` when floors reference it:
    ```json
    {
      "data": null,
      "error": {
        "code": "FOREIGN_KEY_CONFLICT",
        "message": "Cannot delete or update record because it is referenced by active dependent records (foreign key constraint 'floor_building_id_fkey').",
        "details": {
          "postgresCode": "23503",
          "table": "floor",
          "constraint": "floor_building_id_fkey"
        }
      },
      "meta": { "timestamp": "...", "clientId": "PROP_001" }
    }
    ```
- **`23505` (unique_violation)**:
  - Mapped to **HTTP 409 Conflict** (`UNIQUE_CONSTRAINT_CONFLICT`).
- **`23514` (check_violation)**:
  - Mapped to **HTTP 400 Bad Request** (`CHECK_CONSTRAINT_VIOLATION`).

---

## 5. Architectural Pattern by Entity Type

### Pattern A: Singleton Settings (`property`, `general_setting_*`, `guest_mandatory_data`, `listview_setting`)
- **Key Characteristics**: Exactly one row per property, enforced by `UNIQUE (client_id)`.
- **Routes Exposed**:
  - `GET /api/v1/configuration/{entity}`: Returns existing record, or a sensible empty default if not yet populated.
  - `PUT /api/v1/configuration/{entity}`: Upserts using `INSERT INTO ... ON CONFLICT (client_id) DO UPDATE SET ... RETURNING *`.
- **Forbidden**: No `POST`, `DELETE`, or `GET /:id` routes.

### Pattern B: Master Lists (All other tables: `building`, `room_type`, `floor`, `room`, `tax`, etc.)
- **Key Characteristics**: Many records per property.
- **Routes Exposed**:
  - `GET /api/v1/configuration/{entities}`: List records for tenant.
  - `GET /api/v1/configuration/{entities}/:id`: Retrieve record by ID (404 if not found or belongs to another tenant).
  - `POST /api/v1/configuration/{entities}`: Create new record (201 Created).
  - `PUT /api/v1/configuration/{entities}/:id`: Update record (200 OK).
  - `DELETE /api/v1/configuration/{entities}/:id`: Delete record (204 No Content, or 409 Conflict if FK violation).

---

## 6. Directory Structure

```
├── db/
│   ├── migrations/
│   │   ├── 001_configuration_tables.sql  # 35 tables from migration
│   │   └── 002_singleton_trigger.sql      # Pattern A auto-provisioning trigger
│   ├── pool.ts                           # pg connection pool & health checker
│   └── migrate.ts                        # Migration runner
├── middleware/
│   ├── tenant.ts                         # Scopes req.clientId via x-client-id
│   ├── errorHandler.ts                   # Centralized error handler (23503 -> 409)
│   └── validate.ts                       # Input validation runner
├── utils/
│   ├── errors.ts                         # AppError, NotFoundError, ValidationError
│   └── response.ts                       # { data, error, meta } envelope helpers
├── modules/
│   └── configuration/
│       ├── property/                     # Reference Pattern A (Singleton)
│       │   ├── property.types.ts
│       │   ├── property.repository.ts
│       │   ├── property.service.ts
│       │   ├── property.validation.ts
│       │   ├── property.controller.ts
│       │   └── property.routes.ts
│       ├── building/                     # Reference Pattern B (Master List)
│       │   ├── building.types.ts
│       │   ├── building.repository.ts
│       │   ├── building.service.ts
│       │   ├── building.validation.ts
│       │   ├── building.controller.ts
│       │   └── building.routes.ts
│       ├── room_type/                    # Reference Pattern B with Hierarchy Validation
│       │   ├── room_type.types.ts
│       │   ├── room_type.repository.ts
│       │   ├── room_type.service.ts
│       │   ├── room_type.validation.ts
│       │   ├── room_type.controller.ts
│       │   └── room_type.routes.ts
│       ├── floor/                        # Floor helper repository
│       └── index.ts                      # Mounts configuration submodules
└── server.ts                             # Express server entry point
```

---

## 7. How to Replicate for Remaining ~32 Entities

To implement any of the remaining 32 entities from the SQL migration:
1. Determine whether the entity is **Pattern A** (Singleton) or **Pattern B** (Master List).
2. Create `modules/configuration/{entity}/`:
   - `{entity}.types.ts`: Define TypeScript interface matching exact SQL column names and types.
   - `{entity}.repository.ts`: Write parameterized SQL queries always including `client_id = $1`.
   - `{entity}.service.ts`: Implement business logic, cross-field checks, and throw `NotFoundError` when record is missing.
   - `{entity}.validation.ts`: Validate lengths, required fields, and SQL `CHECK` constraints.
   - `{entity}.controller.ts`: Call service methods and format with `sendSuccess`, `sendCreated`, `sendNoContent`.
   - `{entity}.routes.ts`: Register GET/PUT (Pattern A) or GET/POST/PUT/DELETE (Pattern B).
3. Mount the router in `modules/configuration/index.ts`.
