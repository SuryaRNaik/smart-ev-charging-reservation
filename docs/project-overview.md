# Project Overview

## Problem statement

EV drivers need a way to find charging locations, register their vehicles and reserve charging points for a selected time. A charging-point reservation system must protect booking data and prevent two active reservations from occupying the same point during overlapping time intervals.

## Objectives

1. Provide a Next.js interface for customer registration, login, EV management and charging reservations.
2. Store related operational records in a relational database with primary keys, foreign keys, constraints and indexes.
3. Validate reservation ownership, time ranges, charging-point availability and overlapping bookings on the server.
4. Demonstrate atomic database transactions for reservation and pending-payment creation.
5. Use MongoDB to store and query application activity events.
6. Demonstrate SQL queries and advanced database features through repeatable scripts.
7. Document the data model, architecture, tests and database technology choices.

## Functional requirements

- Customers can register and sign in with a password stored as a bcrypt hash.
- An authenticated customer can list, register, edit and delete their own EVs, subject to duplicate-number and reservation-history constraints.
- Authenticated customers can load booking options, create reservations, view allowed reservation history and cancel eligible reservations.
- Reservation creation validates that the selected EV belongs to the customer, the tariff belongs to the selected station, and the charging point is available.
- The same charging point cannot have overlapping active reservations.
- Reservation creation and its pending payment record are committed or rolled back together.
- Successful login, reservation creation and reservation cancellation are recorded in MongoDB.
- Customers can view their own recent activity; admins can view the application-wide activity stream.
- The application recognizes customer and admin roles. The admin station-management screen is still a prototype; protected MySQL CRUD for stations and charging points remains a known limitation.

## Database selection and justification

The project uses the **SQL + NoSQL** option.

**MySQL 8 / InnoDB** stores users, EVs, stations, charging points, tariffs, reservations, charging sessions and payments. These records are structured and related. Primary/foreign keys, unique and check constraints, indexes, joins and transactions help enforce consistency and support booking workflows.

**MongoDB** stores the `activity_logs` collection. Activity documents are append-oriented and can carry action-specific metadata without changing the relational schema for every event type. The project demonstrates document insertion, indexes, authenticated retrieval and aggregation by action.

A vector database is not used because semantic retrieval is not a requirement for the charging-reservation domain.

## Scope and limitations

The project simulates payment status and charging-session data. It does not connect to real payment gateways or physical charging hardware. Admin station/charging-point CRUD is not yet persisted to MySQL. The verification status and tests still required are recorded in [test-cases.md](./test-cases.md).

## Conclusion

The project demonstrates how a relational database and a document database can support different parts of one application. MySQL provides integrity and transactional behavior for charging reservations, while MongoDB stores application activity. The Next.js interface connects these capabilities through server-side APIs. The remaining work is to complete protected admin station/charging-point CRUD, run and record the pending tests, capture application/database screenshots, and finalize the submission report and demonstration.
