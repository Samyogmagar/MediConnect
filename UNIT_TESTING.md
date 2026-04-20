# Unit Testing Documentation

## 1.2 Unit Testing

MediConnect is a MERN-based healthcare system with critical workflows in authentication, appointment booking, notifications, diagnostics, and medication management. Unit testing focuses on backend API handlers (Express controllers/routes/services) and frontend logic (React pages/components and service modules). Tests use Jest, Supertest, and React Testing Library with mocks for external services, database access, and network calls to ensure deterministic results.

### 1.2.1 Unit Test Case for Authentication and User Management

A. Authentication and Registration

A.1 Login Validation

Table 1: Unit Test Cases for Login Validation

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-01 | Login with missing identifier | Password only | Bad request | Returned 400 Bad Request | Pass |
| UT-02 | Login with valid credentials | Identifier + password | Logged in | Returned 200 OK | Pass |
| UT-03 | Login with invalid credentials | Valid email + wrong password | Unauthorized | Returned 401 Unauthorized | Pass |
| UT-04 | Login as banned/inactive user | Inactive user login | Forbidden | Returned 403 Forbidden | Pass |
| UT-05 | Login as unverified doctor/lab | Unverified doctor/lab | Forbidden | Returned 403 Forbidden | Pass |
| UT-13 | Login with missing password | Identifier only | Bad request | Returned 400 Bad Request | Pass |

A.2 Registration Validation

Table 2: Unit Test Cases for Registration

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-06 | Register with empty fields | Empty payload | Bad request | Returned 400 Bad Request | Pass |
| UT-07 | Register patient account | Valid patient data | Created | Returned 201 Created | Pass |
| UT-08 | Register with invalid email | Invalid email format | Bad request | Returned 400 Bad Request | Pass |
| UT-09 | Register with mismatched passwords | Password and confirmPassword do not match | Bad request | Returned 400 Bad Request | Pass |
| UT-14 | Register with missing full name | Missing fullName | Bad request | Returned 400 Bad Request | Pass |
| UT-15 | Register with missing email | Missing email | Bad request | Returned 400 Bad Request | Pass |
| UT-16 | Register with missing phone | Missing phone | Bad request | Returned 400 Bad Request | Pass |
| UT-17 | Register with missing password | Missing password | Bad request | Returned 400 Bad Request | Pass |
| UT-18 | Register with missing confirmPassword | Missing confirmPassword | Bad request | Returned 400 Bad Request | Pass |

A.3 Password Reset

Table 3: Unit Test Cases for Password Reset

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-10 | Reset password valid OTP | correct OTP + new password | Reset | Returned 200 OK | Pass |
| UT-11 | Forgot password with empty email | Empty email | Bad request | Returned 400 Bad Request | Pass |
| UT-12 | Verify reset OTP missing | Email only | Bad request | Returned 400 Bad Request | Pass |
| UT-19 | Forgot password success | Valid email | OTP sent | Returned 200 OK | Pass |
| UT-20 | Verify reset OTP success | Valid email + otp | Verified | Returned 200 OK | Pass |

### 1.2.2 Unit Test Case for Appointment Booking and Management

A. Payment Initiation and Booking

Table 2: Unit Test Cases for Appointment Booking

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-21 | Initiate payment with missing fields | Empty payload | 400 Bad Request | 400 Bad Request | Pass |
| UT-22 | Initiate payment with valid data | Valid payload | 201 Created (Payment initialized) | 201 Created (Payment initialized) | Pass |
| UT-23 | Create appointment with missing payment method | Missing paymentMethod | 400 Bad Request | 400 Bad Request | Pass |
| UT-24 | Create appointment with Khalti but missing pidx | paymentMethod = Khalti without pidx | 400 Bad Request | 400 Bad Request | Pass |
| UT-25 | Create appointment with valid payment | Valid COD or verified Khalti payment | 201 Created (Appointment booked) | 201 Created (Appointment booked) | Pass |
| UT-29 | Create appointment with missing doctorId | Missing doctorId | 400 Bad Request | 400 Bad Request | Pass |
| UT-30 | Create appointment with missing dateTime | Missing dateTime | 400 Bad Request | 400 Bad Request | Pass |

B. Reschedule and Cancel

Table 3: Unit Test Cases for Appointment Updates

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-26 | Reschedule appointment with missing date | Empty payload | 400 Bad Request | 400 Bad Request | Pass |
| UT-27 | Cancel pending appointment | Valid appointment ID | 200 OK (Cancelled) | 200 OK (Cancelled) | Pass |
| UT-28 | Reschedule appointment success | Valid dateTime | 200 OK (Updated) | Returned 200 OK | Pass |
| UT-31 | Get appointments list | Authenticated user | 200 OK (Appointments listed) | Returned 200 OK | Pass |
| UT-32 | Get appointment by id | Valid appointment ID | 200 OK (Appointment returned) | Returned 200 OK | Pass |

### 1.2.3 Unit Test Case for Notifications

A. Notification Retrieval and Status

Table 4: Unit Test Cases for Notifications

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-33 | Get notifications list | Authenticated user | 200 OK (Notifications listed) | 200 OK (Notifications listed) | Pass |
| UT-34 | Get unread notification count | Authenticated user | 200 OK (Unread count returned) | 200 OK (Unread count returned) | Pass |
| UT-35 | Mark notification as read | Valid notification ID | 200 OK (Marked as read) | 200 OK (Marked as read) | Pass |
| UT-36 | Mark multiple notifications as read with missing IDs | notificationIds missing | 400 Bad Request | 400 Bad Request | Pass |
| UT-37 | Mark all notifications as read | Authenticated user | 200 OK (All marked as read) | 200 OK (All marked as read) | Pass |
| UT-38 | Mark many notifications as read | Valid notification IDs | 200 OK (Marked as read) | Returned 200 OK | Pass |
| UT-39 | Get notification by id | Valid notification ID | 200 OK (Notification returned) | Returned 200 OK | Pass |
| UT-40 | Delete notification | Valid notification ID | 200 OK (Deleted) | Returned 200 OK | Pass |
| UT-41 | Delete all read notifications | Authenticated user | 200 OK (Deleted) | Returned 200 OK | Pass |
| UT-42 | Get notifications with filters | Query params | 200 OK (Filtered) | Returned 200 OK | Pass |

### 1.2.4 Unit Test Case for Diagnostic Tests and Lab Reports

A. Diagnostic Tests and Status Updates

Table 5: Unit Test Cases for Diagnostics

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-43 | Assign diagnostic missing fields | Empty payload | Bad request | Returned 400 Bad Request | Pass |
| UT-44 | Update diagnostic status missing | Missing status | Bad request | Returned 400 Bad Request | Pass |
| UT-45 | Upload diagnostic report missing | Empty payload | Bad request | Returned 400 Bad Request | Pass |
| UT-46 | Cancel diagnostic missing reason | Missing reason | Bad request | Returned 400 Bad Request | Pass |
| UT-47 | List diagnostic tests | Authenticated user | Listed | Returned 200 OK | Pass |
| UT-48 | Update diagnostic status success | Valid status | Updated | Returned 200 OK | Pass |
| UT-49 | Upload diagnostic report success | Valid report URL | Report uploaded | Returned 200 OK | Pass |
| UT-50 | Assign diagnostic success | Valid payload | Assigned | Returned 201 Created | Pass |
| UT-51 | Cancel diagnostic success | Valid reason | Cancelled | Returned 200 OK | Pass |
| UT-52 | Get completed diagnostics | Authenticated user | Listed | Returned 200 OK | Pass |

### 1.2.5 Unit Test Case for Prescriptions and Medication Reminders

A. Medication Prescription and Active List

Table 6: Unit Test Cases for Prescriptions and Medications

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-53 | Prescribe medication missing fields | Empty payload | Bad request | Returned 400 Bad Request | Pass |
| UT-54 | Prescribe medication with valid data | Valid prescription data | Prescribed | Returned 201 Created | Pass |
| UT-55 | Discontinue medication missing reason | Missing reason | Bad request | Returned 400 Bad Request | Pass |
| UT-56 | Get active medications missing patientId | Doctor request without patientId | Bad request | Returned 400 Bad Request | Pass |
| UT-57 | Get active medications for patient | Patient role | Listed | Returned 200 OK | Pass |
| UT-58 | Discontinue medication success | Valid reason | Discontinued | Returned 200 OK | Pass |
| UT-59 | Get active medications for doctor | Doctor with patientId | Listed | Returned 200 OK | Pass |
| UT-60 | Get medications list | Authenticated user | Listed | Returned 200 OK | Pass |

### 1.2.6 Unit Test Case for Settings Page

A. Settings Update and Retrieval

Table 7: Unit Test Cases for Settings Page

| TestID | Test Scenario | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| UT-61 | Get settings returns data | admin user | 200 OK (Settings returned) | Returned 200 OK | Pass |
| UT-62 | Update settings returns updated data | updated settings payload | 200 OK (Settings updated) | Returned 200 OK | Pass |
