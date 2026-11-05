# Test Cases and Verification Status

This matrix separates manually reported checks from tests that still need to be run after the latest activity/payment changes. Do not mark a pending test as passed without recording the actual result.

## Previously executed manual checks

| ID | Scenario | Expected result | Status / evidence |
|---|---|---|---|
| EV-01 | Register a valid EV | New row saved for signed-in owner | Passed manually; MySQL row verified |
| EV-02 | Edit an owned EV | Updated model/capacity saved | Passed manually; MySQL row verified |
| EV-03 | Register a duplicate vehicle number | API rejects duplicate with conflict response | Passed manually |
| EV-04 | Delete EV referenced by reservation history | API rejects deletion; historical EV remains | Passed manually; reservation join verified |
| EV-05 | Delete an EV without reservation history | EV row is removed | Passed manually; zero rows remained |
| EV-06 | Request EV list without a session | API returns 401 | Passed manually |
| EV-07 | Another customer edits an EV they do not own | API returns not found and original row is unchanged | Passed manually |
| RES-01 | Create a valid reservation | Reservation is stored in MySQL | Passed manually; reservation created |
| RES-02 | Cancel an eligible reservation | Reservation status becomes Cancelled and activity event is recorded | Passed manually for an earlier test reservation |
| AUTH-01 | Sign in successfully | User reaches the main dashboard | Passed manually |

The team should retain screenshots or SQL query output for these checks in the final submission.

## Tests required after the activity/payment updates

| ID | Scenario | Expected result | Status |
|---|---|---|---|
| AUTH-02 | Register a new customer | Registration succeeds and the UI shows the success state | Pending re-check |
| ACT-01 | Call activity-log endpoint without a session | HTTP 401; no activity data returned | Pending |
| ACT-02 | Customer retrieves activity | Only that customer's events are returned | Pending |
| ACT-03 | Admin retrieves activity | Recent application-wide events are returned | Pending |
| ACT-04 | Successful login with MongoDB available | An `auth.login` document is inserted | Pending |
| ACT-05 | Login while MongoDB is unavailable | Login still succeeds; logging error is isolated | Pending |
| PAY-01 | Create a valid reservation | Reservation and Pending payment row are both inserted | Pending |
| PAY-02 | Force payment-row insertion to fail in a local test database | Reservation insert rolls back with the transaction | Pending |
| RES-03 | Submit an overlapping active booking for the same point | API rejects it with HTTP 409 | Pending |
| SQL-01 | Run `db/advanced_queries.sql` after schema, seed, view and trigger setup | Safe DDL/DML demo runs; temporary test data is rolled back | Pending |
| ADMIN-01 | Customer attempts station-management write | Backend denies the operation | Pending; protected station CRUD API is not implemented |
| ADMIN-02 | Admin creates/updates/deletes station and charging point | Changes persist in MySQL and respect foreign keys | Pending; admin CRUD API is not implemented |

## Build checks

Before merging the activity branch, run locally:

```powershell
npm run lint
npm run build
```

Earlier, these commands passed on the EV/login working branch. They must be run again after pulling this activity branch because it adds new TypeScript and SQL changes.

## Database verification queries

After testing a reservation, inspect the reservation and associated pending payment:

```sql
SELECT
    r.reservation_id,
    r.status AS reservation_status,
    p.payment_id,
    p.amount,
    p.payment_method,
    p.payment_status
FROM reservations AS r
LEFT JOIN payments AS p
    ON p.reservation_id = r.reservation_id
WHERE r.reservation_id = <RESERVATION_ID>;
```

After testing MongoDB activity, inspect recent records:

```javascript
db.activity_logs.find().sort({ timestamp: -1 }).limit(10);
```

To verify customer data isolation, sign in as two different users and call `GET /api/activity-logs` with each session. Compare returned `userId` values. An admin session should return the all-user audit stream.
