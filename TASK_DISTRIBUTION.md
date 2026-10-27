# Smart EV Charging Station Reservation System

## Team

- **Sriniket Deeduvanu** (`PES2UG24CS521`) — Database design and implementation, core SQL-backed API endpoints, and SQL demonstrations.
- **Surya R Naik** (`PES2UG24CS540`) — Complete Next.js user interface, frontend workflows, MongoDB activity logs, and UI testing.

Both members will contribute to integration, testing, documentation, and the final demonstration. This division identifies a primary owner for each task; it does not remove the requirement for both members to understand the complete system.

## 1. Project Goal

Build a web application that lets customers view EV charging stations and charging points, manage their EV details, and create or cancel charging reservations. Administrators can manage stations and charging points. The application will demonstrate relational database design, SQL operations and advanced features, a second database paradigm, authentication, validation, and database-backed workflows.

The project must go beyond basic CRUD. The key business rule is that **the same charging point must not have overlapping active reservations**.

## 2. Technology Stack

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS
- **Backend/API:** Next.js Route Handlers
- **Relational database:** MySQL
- **NoSQL database:** MongoDB Atlas
- **Database clients:** `mysql2` and the official `mongodb` Node.js driver
- **Authentication:** Hashed passwords and secure server-managed sessions or signed tokens; access control must be checked by the backend
- **Version control:** Git and GitHub

### Why two databases?

MySQL stores structured, related records that need keys, constraints, joins, and transactions: users, EVs, stations, charging points, reservations, sessions, tariffs, and payments. MongoDB stores flexible application activity events in an `activity_logs` collection. The MongoDB use must be functional and demonstrated; it must not be included only as an unused connection.

A vector database is **not** required because this project uses the SQL + NoSQL option.

## 3. Responsibilities — Sriniket

### A. Database design

1. Prepare the ER diagram from the agreed relational schema, showing entities, attributes, primary keys, foreign keys, cardinalities, and important constraints.
2. Convert the ER diagram into a consistent relational schema and prepare a data dictionary.
3. Create and maintain the MySQL schema and idempotent sample-data/seed scripts.

### B. MySQL implementation

1. Implement tables for:
   - `users`
   - `evs`
   - `charging_stations`
   - `charging_points`
   - `reservations`
   - `charging_sessions`
   - `tariff_plans`
   - `payments`
2. Implement primary keys, foreign keys, unique constraints, check constraints where supported, and appropriate nullability/defaults.
3. Include a `role` field for at least `customer` and `admin`; store password hashes rather than plaintext passwords.
4. Add appropriate uniqueness and integrity rules, including unique email, unique vehicle number, unique station/point number, positive tariff/power values, valid statuses, and reservation end time later than start time.
5. Demonstrate the required DDL operations: `CREATE`, `ALTER`, and a safe `DROP` example (for example, dropping a development view). Do not use a destructive command against production or shared data.

### C. Advanced SQL and query demonstrations

Implement and document at least four advanced SQL concepts:

1. **Transactions:** reservation creation and associated pending payment insertion must commit or roll back together.
2. **Views:** create a useful view such as `reservation_details` or `station_summary` and show where it is useful.
3. **Triggers:** implement a suitable database trigger and document the event and rule it enforces. Coordinate the exact design with the MySQL version and schema.
4. **Indexes:** add appropriate indexes for common station, reservation, and activity-related lookups; explain the queries they support.

Also provide working examples of `INSERT`, `SELECT`, `UPDATE`, `DELETE`, `JOIN`, `GROUP BY`, `HAVING`, `ORDER BY`, aggregate functions, and a subquery in `db/advanced_queries.sql`.

### D. Core SQL-backed API

1. Maintain the MySQL connection helper and keep database access on the server side.
2. Implement and test the core SQL-backed endpoints in agreement with Surya, prioritizing station/charging-point listing and CRUD, EV CRUD, and reservation retrieval/creation/cancellation.
3. Validate request bodies and return consistent success/error responses.
4. Enforce customer/admin authorization in the backend. Do not rely only on hiding buttons in the frontend.
5. Prevent overlapping active reservations for the same charging point. Perform the availability check and reservation insert safely within a transaction, using suitable locking/constraints for the chosen MySQL implementation. Document and test the conflict case.

### E. Sriniket's deliverables

- ER diagram source and exported image
- `db/schema.sql`
- `db/seed.sql`
- `db/advanced_queries.sql`
- MySQL connection helper and agreed core API endpoints
- SQL feature and query test results
- Database section of the README and data dictionary

## 4. Responsibilities — Surya

### A. Complete Next.js interface

Build and style the user-facing pages using Next.js and TypeScript:

1. Login and registration pages
2. Main dashboard with useful database-backed summary information
3. Charging station list/details with city and charger-type filtering
4. EV management page
5. Charging-point availability display
6. Reservation creation form and reservation history
7. Reservation cancellation/status display
8. Charging-session and payment-status views using project/demo data
9. Admin screens for station and charging-point CRUD, connected to protected APIs
10. Clear loading, empty, validation, success, and error states

### B. Frontend integration

1. Connect the screens to Sriniket's agreed API contracts.
2. Implement client-side form validation for user experience; server-side and database validation remain authoritative.
3. Display availability, reservation status, and helpful messages when a booking conflicts or a request fails.
4. Do not put database credentials or privileged business logic in client-side code.

### C. MongoDB activity logs

1. Set up MongoDB Atlas and coordinate the connection/environment variable with Sriniket.
2. Define an `activity_logs` collection with fields such as `userId`, `action`, `entityType`, `entityId`, `timestamp`, and `metadata`.
3. Implement a server-side API/helper that records meaningful events, such as successful login, station changes, reservation creation, and cancellation. Do not log passwords, tokens, or other secrets.
4. Add an appropriate index, such as a compound index on `userId` and `timestamp` or an index on `timestamp`.
5. Implement retrieval of recent activity and at least one useful MongoDB query or aggregation, for example activity counts by action.
6. Display activity logs or a small activity summary on a relevant page and document how the NoSQL feature is used.

### D. Testing and deliverables

- All frontend pages and form states
- API integration for the main user journeys
- MongoDB activity-log collection, index, retrieval, and aggregation
- UI screenshots and frontend test notes
- Descriptive Git commits for Surya's work

## 5. Shared Responsibilities

1. Agree on the final schema, table/column names, route names, request/response formats, and error format before integration.
2. Ensure the application has at least two roles: `customer` and `admin`.
3. Test the complete customer journey: register/login, view stations, manage an EV, book a slot, view the saved reservation, and cancel it.
4. Test the admin journey: log in as admin and create, update, view, and delete a station or charging point where database relationships permit deletion.
5. Test invalid data, unauthorized requests, database failures, and overlapping reservations.
6. Review each other's changes and maintain visible GitHub contributions from both members.
7. Complete the README, architecture description, screenshots, test results, and final demo together.

## 6. API Contract to Agree on Before Integration

Use consistent JSON responses and route naming. The final route list may be adjusted to match the implementation, but it must cover these capabilities:

| Method | Route | Purpose | Main permission |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a customer | Public |
| `POST` | `/api/auth/login` | Authenticate a user | Public |
| `GET` | `/api/stations` | List/search stations | Authenticated or public, as agreed |
| `GET` | `/api/stations/[id]` | Get station details | Authenticated or public, as agreed |
| `POST` | `/api/stations` | Create a station | Admin |
| `PATCH` | `/api/stations/[id]` | Update a station | Admin |
| `DELETE` | `/api/stations/[id]` | Delete a station when permitted | Admin |
| `GET` / `POST` | `/api/evs` | List/add the current user's EVs | Customer; admin access as defined |
| `PATCH` / `DELETE` | `/api/evs/[id]` | Update/delete an EV owned by the user | Owner or admin |
| `GET` | `/api/reservations` | List reservations allowed for the current user | Customer sees own; admin may see all |
| `POST` | `/api/reservations` | Create a reservation | Authenticated customer |
| `PATCH` | `/api/reservations/[id]` | Cancel/update a permitted reservation | Owner or admin |
| `GET` | `/api/activity-logs` | Retrieve recent activity | Authenticated; restrict records appropriately |

Confirm the API contracts together before building against them. Do not expose admin-only information or let a customer read or modify another customer's records.

## 7. Minimum Database and Application Requirements Checklist

- [ ] ER diagram and relational schema match the implemented MySQL tables.
- [ ] Every main table has a primary key and necessary foreign keys.
- [ ] Unique constraints and validation rules protect data integrity.
- [ ] DDL examples include `CREATE`, `ALTER`, and a safe `DROP` demonstration.
- [ ] DML demonstrations include `INSERT`, `SELECT`, `UPDATE`, and `DELETE`.
- [ ] SQL scripts demonstrate joins, grouping, `HAVING`, ordering, aggregates, and a subquery.
- [ ] At least four advanced SQL concepts are implemented and demonstrated: transaction, view, trigger, and index.
- [ ] MongoDB stores real activity-log documents and demonstrates an index plus a query/aggregation.
- [ ] The Next.js interface calls the backend/API; no database is accessed directly from the browser.
- [ ] Authentication works and the backend enforces at least two roles.
- [ ] Overlapping active reservations for a charging point are rejected and tested.
- [ ] The application supports meaningful CRUD beyond static/mock-only UI.
- [ ] `.env.local` and credentials are excluded from Git; `.env.example` documents required variable names.
- [ ] README contains setup/run instructions and database configuration guidance.
- [ ] Screenshots, test cases/results, architecture, database justification, data dictionary, and conclusion are ready.
- [ ] Git history shows meaningful contributions from both members.

## 8. Suggested Repository Structure

```text
smart-ev-charging-reservation/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── stations/
│   │   ├── evs/
│   │   ├── reservations/
│   │   ├── admin/
│   │   └── api/
│   └── lib/
│       ├── mysql.ts
│       ├── mongodb.ts
│       └── auth.ts
├── db/
│   ├── schema.sql
│   ├── seed.sql
│   └── advanced_queries.sql
├── docs/
│   ├── er-diagram.png
│   ├── data-dictionary.md
│   ├── architecture.md
│   ├── test-cases.md
│   └── screenshots/
├── .env.example
├── .gitignore
├── README.md
└── TASK_DISTRIBUTION.md
```

Adapt filenames to the actual project structure if it already exists. Do not create duplicate files just to match this suggested tree.

## 9. GitHub Working Rules

1. Pull the latest `main` changes before starting new work.
2. Use separate branches for substantial features; avoid editing the same file simultaneously without coordination.
3. Commit in small, meaningful units with descriptive messages.
4. Never commit `.env.local`, passwords, database URLs, JWT secrets, or other credentials.
5. Keep `.env.example` populated only with placeholder values.
6. Use dummy data only. Do not integrate real payment processing or physical charging hardware.
7. Open pull requests where practical and review each other's changes before merging.
8. Push regularly so both members' contributions are visible in GitHub history.

## 10. Suggested Milestones

1. **Foundation:** agree on schema and API contracts; create the repository and environment-variable template.
2. **Database:** implement tables, constraints, seed data, ER diagram, and data dictionary.
3. **Core backend:** implement database connections, authentication/roles, and SQL-backed endpoints.
4. **Frontend:** build the pages and connect them to the agreed API routes.
5. **NoSQL:** integrate MongoDB activity logs, retrieval, and aggregation.
6. **Advanced DBMS:** finish transactions, view, trigger, indexes, and required SQL queries.
7. **Integration/testing:** test CRUD, role access, validation, reservation conflicts, and failure cases.
8. **Finalization:** complete documentation, screenshots, README, GitHub review, and demonstration rehearsal.

## 11. Scope Limits for the MVP

To keep the project achievable, use simulated charging sessions and dummy payment statuses. Do not build real payment processing, connect to physical charging hardware, or add a vector database unless the instructor specifically requires it. Prioritize a working end-to-end reservation workflow and correct database behavior over optional visual polish.

## 12. Final Demonstration Order

1. Explain the problem, objectives, ER diagram, and relational schema.
2. Explain why MySQL stores structured transactional data and MongoDB stores activity events.
3. Demonstrate login and customer/admin permissions.
4. Browse stations, manage an EV, and create a reservation.
5. Demonstrate that an overlapping booking is rejected; then show the saved reservation and cancellation.
6. Demonstrate station/charging-point CRUD and the MongoDB activity logs.
7. Run the important SQL queries and show the transaction, view, trigger, and indexes.
8. Show test results, screenshots, README instructions, and each member's GitHub contributions.

---

**Working agreement:** Sriniket owns the primary SQL/database and core backend deliverables; Surya owns the complete frontend and MongoDB activity-log feature. Both members are responsible for understanding the full system and jointly completing integration, testing, documentation, and the final demonstration.
