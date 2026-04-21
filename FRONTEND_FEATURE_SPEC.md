# Frontend Feature Specification: CampusBook (MERN)
**Version:** 2.0  
**Reference:** CampusBook PRD v3  
**Stack:** React + Vite  

---

## Global Conventions

### Token Storage & Auth Headers
- On successful login, store the JWT in `localStorage` under the key `campusbook_token`.
- Attach it to every protected request as `Authorization: Bearer <token>`.
- On `401` response from any protected endpoint, clear the token and redirect to `/login`.

### Role-Based Route Guards
- After login, redirect to the role-appropriate dashboard:
  - `admin` → `/admin/dashboard`
  - `dsw` → `/dsw/dashboard`
  - `hod` → `/hod/dashboard`
  - `faculty` → `/dashboard`
- Unauthenticated users attempting any protected route are redirected to `/login`.

### Booking Hours Client-Side Validation
- When a venue is selected in any booking form, fetch its `booking_open_time` and `booking_close_time` from the venue object (already loaded via `GET /api/venues/`).
- Apply these as min/max constraints on the `startTime` and `endTime` time pickers to prevent selecting out-of-window times before submission.
- Still rely on server-side rejection as the authoritative check.

### Advance Notice Client-Side Validation
- On mount of any booking form (and whenever the Admin updates config), fetch `min_advance_hours` via `GET /api/config`.
- Disable date picker dates where `date + startTime < NOW() + min_advance_hours`.
- Display a helper label on the date picker: *"Bookings must be submitted at least X hours in advance."*

### Booking Status Display
All booking status values and their UI treatment:

| Status | Badge Color | Actions Available |
|---|---|---|
| `pending_hod` | Yellow | Withdraw (requester only, if before event start) |
| `pending_dsw` | Blue | Withdraw (requester only, if before event start) |
| `approved` | Green | Withdraw (requester only, if before event start) |
| `rejected` | Red | None (terminal) |
| `withdrawn` | Grey | None (terminal) |

### Notification Polling
- Poll `GET /api/notifications/` every **30 seconds** on all authenticated pages.
- Display unread count badge on the notification bell icon in the header/sidebar.
- On bell click, open a dropdown listing the 20 most recent unread notifications (title, message, createdAt).
- Mark individual as read via `PUT /api/notifications/:id/read`.
- Provide a "Mark all as read" control calling `PUT /api/notifications/read-all`.

---

## 1. Authentication Module (All Roles)

### → Login Page (`/login`)
- **Components**
  - **Login Form**
    - **API endpoints used:** `POST /api/auth/login`
    - **Data fields required:** `email`, `password`
    - **UI Workflows:**
      1. User submits credentials.
      2. On success: store JWT in `localStorage` as `campusbook_token`, decode role from token payload, redirect to role-appropriate dashboard.
      3. On failure: display server error message inline (do not clear the email field).

---

## 2. Faculty

### → Dashboard Page (`/dashboard`)
- **Components**
  - **Department Metrics Overview**
    - **API endpoints used:** `GET /api/analytics/department`
    - **Data fields required:**
      - `totalBookings` — department booking count over time
      - `utilizationPercent` — venue utilization % for venues the department uses
      - `statusBreakdown` — counts of pending / approved / rejected bookings
  - **Notification Bell / Dropdown** *(Global — see Global Conventions)*
    - **API endpoints used:** `GET /api/notifications/`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`
    - **Data fields required:** `title`, `message`, `type`, `isRead`, `createdAt`, `relatedId`

---

### → My Bookings Page (`/bookings`)
- **Components**
  - **New Booking Form / Modal**
    - **API endpoints used:** `POST /api/bookings/`, `GET /api/venues/`, `GET /api/config`
    - **Data fields required:**
      - `venueId` — dropdown populated from `GET /api/venues/` (Faculty sees `status: available` only, filtered server-side); display venue `name`, `category`, `capacity`, `booking_open_time`, `booking_close_time` as helper text after selection
      - `date` — date picker; disable dates within `min_advance_hours` of now (fetched from `GET /api/config`)
      - `startTime` — time picker; constrain min/max to selected venue's `booking_open_time` / `booking_close_time`
      - `endTime` — time picker; must be after `startTime`; same venue-hour constraints
      - `purpose` — textarea, required
      - `attachmentUrl` — optional text input (URL string)
    - **UI Workflows:**
      - On venue selection: update time picker constraints from venue's booking hours.
      - On submit: call `POST /api/bookings/`; on success close modal and refresh the bookings table; on failure display server error message (e.g. conflict, advance notice violation).

  - **My Bookings Table**
    - **API endpoints used:** `GET /api/bookings/my`, `PATCH /api/bookings/:id/withdraw`
    - **Columns:** Venue Name, Date, Start Time, End Time, Purpose, Status, Attachment, Actions
    - **Data fields required:** `venueId` (populated name), `date`, `startTime`, `endTime`, `purpose`, `status`, `attachmentUrl`
    - **UI Workflows:**
      - Display status as a colored badge per the Global Status Display table.
      - Show **Withdraw** button only when `status` is not `withdrawn` or `rejected` AND current datetime is before the booking's `date` + `startTime`.
      - On Withdraw: confirm with a modal dialog, then call `PATCH /api/bookings/:id/withdraw`; refresh table on success.
      - `attachmentUrl`: if present, render as a clickable link in the Attachment column.

---

### → Venues Directory Page (`/venues`)
- **Components**
  - **Available Venues Grid / Table**
    - **API endpoints used:** `GET /api/venues/`
    - **Note:** Server returns only `status: available` venues for Faculty role — no client-side status filter needed.
    - **Columns / Fields displayed:** `name`, `category` (display as a readable label, e.g. "Seminar Hall"), `type`, `capacity`, `booking_open_time`, `booking_close_time`
    - **UI Workflows:** Read-only directory. No create/edit/delete actions.

---

### → Profile Settings Page (`/profile`)
- **Components**
  - **Profile Update Form**
    - **API endpoints used:** `PUT /api/auth/profile`
    - **Data fields required:** `name`, `email`, `password` (optional — only sent if user fills the password field)

---

## 3. HOD (Head of Department)

### → Dashboard Page (`/hod/dashboard`)
- **Components**
  - **Department Metrics Overview**
    - **API endpoints used:** `GET /api/analytics/department`
    - **Data fields required:** Same as Faculty dashboard — scoped automatically by JWT `departmentId`.
  - **Notification Bell / Dropdown** *(Global — see Global Conventions)*
    - **API endpoints used:** `GET /api/notifications/`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`
    - **Data fields required:** `title`, `message`, `type`, `isRead`, `createdAt`, `relatedId`

---

### → Approval Queue Page (`/hod/approvals`)
- **Components**
  - **Pending Approval Table**
    - **API endpoints used:** `GET /api/bookings/all`, `PUT /api/bookings/hod-approve/:id`, `PUT /api/bookings/reject/:id`
    - **Client-side filter:** Display only bookings where `status === 'pending_hod'` and `departmentId` matches the HOD's own department (use JWT-decoded `departmentId` for this filter on the fetched results).
    - **Columns:** Requester Name, Venue Name, Date, Start Time, End Time, Purpose, Status, Actions
    - **Data fields required:** `userId` (populated name), `venueId` (populated name), `date`, `startTime`, `endTime`, `purpose`, `status`
    - **UI Workflows:**
      - **Approve:** Call `PUT /api/bookings/hod-approve/:id`; on success update row status in-place and remove from queue.
      - **Reject:** Show a confirm dialog, then call `PUT /api/bookings/reject/:id`; on success remove row from queue.

  - **All Department Bookings Table**
    - **API endpoints used:** `GET /api/bookings/all`
    - **Client-side filter:** Bookings where `departmentId` matches HOD's own department — all statuses.
    - **Columns:** Requester Name, Venue Name, Date, Start Time, End Time, Purpose, Status
    - **UI Workflows:** Read-only view for HOD situational awareness (no approval actions here).

---

### → My Bookings Page (`/hod/bookings`)
- **Components**
  - **New Booking Form / Modal** — identical to Faculty New Booking Form (see §2).
  - **My Bookings Table** — identical to Faculty My Bookings Table (see §2).

---

### → Venues Directory Page (`/hod/venues`)
- **Components**
  - **Available Venues Grid / Table**
    - **API endpoints used:** `GET /api/venues/`
    - **Note:** Server returns only `status: available` venues for HOD role — no client-side filter needed.
    - **Columns / Fields displayed:** `name`, `category`, `type`, `departmentId` (populated department name for departmental venues), `capacity`, `booking_open_time`, `booking_close_time`
    - **UI Workflows:** Read-only directory. No create/edit/delete actions.

---

### → Timetable Management Page (`/hod/timetable`)
- **Components**
  - **Department Timetable Table**
    - **API endpoints used:** `GET /api/timetable/`
    - **Client-side filter:** Entries where `departmentId` matches HOD's own department.
    - **Columns:** Venue, Day, Start Time, End Time, Subject, Faculty Name

  - **Add Timetable Entry Form**
    - **API endpoints used:** `POST /api/timetable/`, `GET /api/venues/`, `GET /api/users/` *(for faculty dropdown — HOD's dept faculty only)*
    - **Data fields required:**
      - `venueId` — dropdown from `GET /api/venues/` (available venues)
      - `day` — select from enum: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
      - `startTime` — time picker (HH:mm)
      - `endTime` — time picker (HH:mm, must be after startTime)
      - `subject` — text input, required
      - `facultyId` — dropdown populated from department's faculty users
    - **Note:** `departmentId` is set server-side from the HOD's JWT — do not expose it as a UI field.
    - **UI Workflows:** On submit, call `POST /api/timetable/`; on conflict error display server message; on success refresh the timetable table.

---

### → Profile Settings Page (`/hod/profile`)
- Identical to Faculty Profile Settings (see §2).

---

## 4. DSW (Dean of Student Welfare)

### → Dashboard Page (`/dsw/dashboard`)
- **Components**
  - **Campus-Wide Metrics Overview**
    - **API endpoints used:** `GET /api/analytics/overall`
    - **Data fields required:**
      - `totalBookings` — this week / this month / all time
      - `bookingsByVenue` — count and utilization % per venue
      - `bookingsByDepartment` — booking counts per department
      - `approvalFunnel` — pending (pending_hod + pending_dsw), approved, rejected counts
      - `venueUtilizationPercent` — (total booked hours ÷ total available hours) × 100
      - `topVenues` — top 3 most-booked venues
  - **Notification Bell / Dropdown** *(Global — see Global Conventions)*
    - **API endpoints used:** `GET /api/notifications/`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`

---

### → Approval Queue Page (`/dsw/approvals`)
- **Components**
  - **Campus Approval Queue Table**
    - **API endpoints used:** `GET /api/bookings/all`, `PUT /api/bookings/dsw-approve/:id`, `PUT /api/bookings/reject/:id`
    - **Client-side filter:** Display only bookings where `status === 'pending_dsw'`.
    - **Columns:** Requester Name, Department, Venue Name, Venue Type (central / departmental), Date, Start Time, End Time, Purpose, HOD Approved, Status, Actions
    - **Data fields required:** `userId` (populated name + department), `venueId` (populated name + type), `date`, `startTime`, `endTime`, `purpose`, `approvedByHod`, `status`
    - **UI Workflows:**
      - Display `approvedByHod` as a Yes/No indicator — informational only; server enforces the gate.
      - **Approve:** Call `PUT /api/bookings/dsw-approve/:id`; on success update row status.
      - **Reject:** Confirm dialog, then call `PUT /api/bookings/reject/:id`; on success update row status.

---

### → Venues Directory Page (`/dsw/venues`) — Read-Only
- **Components**
  - **All Venues Table**
    - **API endpoints used:** `GET /api/venues/`
    - **Note:** Server returns ALL venues for DSW role, including `status: maintenance`. Display `status` as a column so DSW can see which venues are unavailable.
    - **Columns:** Name, Category, Type, Department, Capacity, Status, Booking Open Time, Booking Close Time
    - **UI Workflows:** Read-only. No create/edit/delete actions.

---

### → Profile Settings Page (`/dsw/profile`)
- Identical to Faculty Profile Settings (see §2).

---

## 5. Admin

### → Dashboard Page (`/admin/dashboard`)
- **Components**
  - **Campus-Wide Metrics Overview**
    - **API endpoints used:** `GET /api/analytics/overall`
    - **Data fields required:** Same as DSW dashboard metrics.

---

### → Users Management Page (`/admin/users`)
- **Components**
  - **User List Table**
    - **API endpoints used:** `GET /api/users/`, `DELETE /api/users/:id`
    - **Columns:** Name, Email, Role, Department, Actions (Edit, Delete)
    - **UI Workflows:**
      - **Delete:** Confirm dialog before calling `DELETE /api/users/:id`.

  - **Create User Form / Modal**
    - **API endpoints used:** `POST /api/auth/register`, `GET /api/departments/`
    - **Data fields required:**
      - `name` — text input, required
      - `email` — email input, required, unique
      - `password` — password input, required
      - `role` — select from enum: `admin`, `dsw`, `hod`, `faculty`
      - `departmentId` — department dropdown (populated from `GET /api/departments/`); **show only when role is `hod` or `faculty`**; hidden for `admin` and `dsw`

  - **Edit User Form / Modal**
    - **API endpoints used:** `PUT /api/users/:id`, `GET /api/departments/`
    - **Data fields required:** `name`, `email`, `role`, `departmentId` (same conditional visibility as Create form)

---

### → Venues Management Page (`/admin/venues`)
- **Components**
  - **Venue List Table**
    - **API endpoints used:** `GET /api/venues/`, `DELETE /api/venues/:id`
    - **Note:** Admin receives all venues including `status: maintenance`.
    - **Columns:** Name, Category, Type, Department, Capacity, Status, Open Time, Close Time, Actions (Edit, Delete)
    - **UI Workflows:**
      - **Delete:** Confirm dialog before calling `DELETE /api/venues/:id`.

  - **Venue Form (Create / Edit)**
    - **API endpoints used:** `POST /api/venues/` or `PUT /api/venues/:id`, `GET /api/departments/`
    - **Data fields required:**
      - `name` — text input, required
      - `category` — select from enum: `seminar_hall`, `auditorium`, `laboratory`, `classroom`, `conference_room`, `sports_facility`; display as human-readable labels (e.g. "Seminar Hall", "Auditorium")
      - `type` — select from enum: `central`, `departmental`
      - `departmentId` — department dropdown; **required and visible only when `type === 'departmental'`**; hidden for `central`
      - `capacity` — number input, required
      - `status` — select from enum: `available`, `maintenance`
      - `booking_open_time` — time input (HH:mm), default `08:00`
      - `booking_close_time` — time input (HH:mm), default `20:00`; must be after `booking_open_time`

---

### → Departments Management Page (`/admin/departments`)
- **Components**
  - **Department List Table**
    - **API endpoints used:** `GET /api/departments/`
    - **Columns:** Name, HOD Name
    - **UI Workflows:** Read-only list for the pilot. No edit or delete actions (out of scope per PRD §10).

  - **Create Department Form / Modal**
    - **API endpoints used:** `POST /api/departments/`, `GET /api/users/` *(for HOD dropdown)*
    - **Data fields required:**
      - `name` — text input, required, unique
      - `hodId` — dropdown populated from users with `role === 'hod'`

---

### → Timetable Management Page (`/admin/timetable`) — System-Wide
- **Components**
  - **All Timetables Table**
    - **API endpoints used:** `GET /api/timetable/`
    - **Columns:** Department, Venue, Day, Start Time, End Time, Subject, Faculty Name

  - **Add Timetable Entry Form**
    - **API endpoints used:** `POST /api/timetable/`, `GET /api/departments/`, `GET /api/venues/`, `GET /api/users/`
    - **Data fields required:**
      - `departmentId` — department dropdown
      - `venueId` — venue dropdown (all venues)
      - `day` — select from enum: Sunday through Saturday
      - `startTime` — time picker (HH:mm)
      - `endTime` — time picker (HH:mm, must be after startTime)
      - `subject` — text input, required
      - `facultyId` — user dropdown filtered to `role === 'faculty'`

---

### → All Bookings Page (`/admin/bookings`) — Read-Only Audit
- **Components**
  - **All Bookings Table**
    - **API endpoints used:** `GET /api/bookings/all`
    - **Columns:** Requester Name, Department, Venue Name, Date, Start Time, End Time, Purpose, Status, HOD Approved, DSW Approved, Attachment
    - **Data fields required:** `userId` (populated name + department), `venueId` (populated name), `date`, `startTime`, `endTime`, `purpose`, `status`, `approvedByHod`, `approvedByDsw`, `attachmentUrl`
    - **UI Workflows:**
      - Display `attachmentUrl` as a clickable link if present, otherwise show "—".
      - Display `approvedByHod` and `approvedByDsw` as Yes/No indicators.
      - No approve/reject/withdraw actions — Admin has audit-only access to bookings.
    - **Filters (client-side):** Allow filtering by `status`, `date range`, and `department` to make the audit view navigable.

---

### → System Configuration Page (`/admin/config`)
- **Components**
  - **Configuration Settings Form**
    - **API endpoints used:** `GET /api/config`, `PUT /api/config`
    - **Data fields required:** `min_advance_hours` — number input (positive integer)
    - **UI Workflows:**
      1. On page load, call `GET /api/config` and populate the `min_advance_hours` field.
      2. Admin edits the value and clicks **Save Configuration**.
      3. Call `PUT /api/config` with `{ min_advance_hours }`.
      4. On success: show a confirmation toast and update the in-memory config value used by booking forms across the app.
      5. On failure: show server error inline.

---

### → Profile Settings Page (`/admin/profile`)
- Identical to Faculty Profile Settings (see §2).

---

## 6. Global Common Components

### → App Shell / Navigation
- **Sidebar / Header Navigation**
  - Link visibility is bound strictly to the authenticated user's `role`.
  - Role → visible nav items:
    - `faculty`: Dashboard, My Bookings, Venues, Profile
    - `hod`: Dashboard, Approvals, My Bookings, Venues, Timetable, Profile
    - `dsw`: Dashboard, Approvals, Venues, Profile
    - `admin`: Dashboard, Users, Venues, Departments, Timetable, All Bookings, System Config, Profile
  - **Notification Bell** present on all authenticated pages (see Global Conventions).

### → 404 / Unauthorized Page
- Render a generic error page for unknown routes or role-unauthorized access attempts.
- Provide a redirect link back to the user's role-appropriate dashboard.
