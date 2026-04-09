# MediConnect System Testing README

## 4.3 System Testing

### 4.3.1 User login with valid credentials
Table 1: System testing 1

| Field | Details |
| --- | --- |
| Test Case ID | ST-01 |
| Feature/Test Title | Login with valid credentials |
| Objective | Verify that a registered user can log in successfully. |
| Preconditions | User account exists and is active. |
| Test Steps | 1. Open Login page.<br>2. Enter valid email and password.<br>3. Click Login. |
| Expected Result | User is authenticated and redirected to their role dashboard. |
| Actual Result | User is authenticated and redirected to their role dashboard. |
| Status | Pass |

### 4.3.2 Login with invalid credentials
Table 2: System testing 2

| Field | Details |
| --- | --- |
| Test Case ID | ST-02 |
| Feature/Test Title | Login with invalid password |
| Objective | Ensure the system rejects invalid credentials. |
| Preconditions | User account exists. |
| Test Steps | 1. Open Login page.<br>2. Enter valid email and invalid password.<br>3. Click Login. |
| Expected Result | Login fails and an error message is shown. |
| Actual Result | Login fails and an error message is shown. |
| Status | Pass |

### 4.3.3 User logout
Table 3: System testing 3

| Field | Details |
| --- | --- |
| Test Case ID | ST-03 |
| Feature/Test Title | Logout |
| Objective | Verify that user session is terminated. |
| Preconditions | User is logged in. |
| Test Steps | 1. Click Logout from navigation.<br>2. Confirm logout if prompted. |
| Expected Result | User is logged out and redirected to Login or Home. |
| Actual Result | User is logged out and redirected to Login or Home. |
| Status | Pass |

### 4.3.4 Patient registration (valid data)
Table 4: System testing 4

| Field | Details |
| --- | --- |
| Test Case ID | ST-04 |
| Feature/Test Title | Patient registration with valid data |
| Objective | Verify new patient registration succeeds. |
| Preconditions | Email is not already registered. |
| Test Steps | 1. Open Register page.<br>2. Fill in required fields.<br>3. Submit registration. |
| Expected Result | Account is created and user can log in. |
| Actual Result | Account is created and user can log in. |
| Status | Pass |

### 4.3.5 Registration form validation
Table 5: System testing 5

| Field | Details |
| --- | --- |
| Test Case ID | ST-05 |
| Feature/Test Title | Registration with mismatched passwords |
| Objective | Validate form prevents invalid input. |
| Preconditions | None. |
| Test Steps | 1. Open Register page.<br>2. Enter mismatched password and confirm password.<br>3. Submit. |
| Expected Result | Form shows validation error and blocks submission. |
| Actual Result | Form shows validation error and blocks submission. |
| Status | Pass |

### 4.3.6 Role-based dashboard access
Table 6: System testing 6

| Field | Details |
| --- | --- |
| Test Case ID | ST-06 |
| Feature/Test Title | Role-based dashboard access control |
| Objective | Ensure each role can access its dashboard only. |
| Preconditions | Users exist for patient, doctor, lab, admin. |
| Test Steps | 1. Log in as each role.<br>2. Try to access other role dashboard URLs. |
| Expected Result | Access granted only to own dashboard, others redirect to Login. |
| Actual Result | Access granted only to own dashboard, others redirect to Login. |
| Status | Pass |

### 4.3.7 Patient search for doctors
Table 7: System testing 7

| Field | Details |
| --- | --- |
| Test Case ID | ST-07 |
| Feature/Test Title | Doctor search and filter |
| Objective | Verify patient can search/filter verified doctors. |
| Preconditions | Verified doctors exist with specializations. |
| Test Steps | 1. Navigate to Patient > Doctors.<br>2. Search by name and filter by specialization. |
| Expected Result | List updates to matching verified doctors only. |
| Actual Result | List updates to matching verified doctors only. |
| Status | Pass |

### 4.3.8 Book appointment with valid data
Table 8: System testing 8

| Field | Details |
| --- | --- |
| Test Case ID | ST-08 |
| Feature/Test Title | Book appointment (valid) |
| Objective | Verify patient can create an appointment request. |
| Preconditions | Patient is logged in and doctor is verified. |
| Test Steps | 1. Open doctor profile.<br>2. Select date/time and reason.<br>3. Submit booking. |
| Expected Result | Appointment is created with status pending. |
| Actual Result | Appointment is created with status pending. |
| Status | Pass |

### 4.3.9 Book appointment with invalid time
Table 9: System testing 9

| Field | Details |
| --- | --- |
| Test Case ID | ST-09 |
| Feature/Test Title | Book appointment (invalid time) |
| Objective | Ensure invalid date/time is rejected. |
| Preconditions | Patient is logged in. |
| Test Steps | 1. Open booking form.<br>2. Enter a past date/time.<br>3. Submit booking. |
| Expected Result | Validation error shown and request not created. |
| Actual Result | Validation error shown and request not created. |
| Status | Pass |

### 4.3.10 Appointment payment initiation
Table 10: System testing 10

| Field | Details |
| --- | --- |
| Test Case ID | ST-10 |
| Feature/Test Title | Initiate Khalti payment |
| Objective | Verify payment initiation for appointment works. |
| Preconditions | Patient is logged in and booking data is ready. |
| Test Steps | 1. Choose Khalti as payment method.<br>2. Submit payment initiation. |
| Expected Result | Payment session is created and user receives payment prompt. |
| Actual Result | Payment session is created and user receives payment prompt. |
| Status | Pass |

### 4.3.11 Doctor approves appointment
Table 11: System testing 11

| Field | Details |
| --- | --- |
| Test Case ID | ST-11 |
| Feature/Test Title | Approve appointment |
| Objective | Verify doctor can approve pending appointments. |
| Preconditions | Doctor is verified and has pending appointment. |
| Test Steps | 1. Log in as doctor.<br>2. Open Appointments.<br>3. Click Approve on a pending appointment. |
| Expected Result | Status changes to approved and patient is notified. |
| Actual Result | Status changes to approved and patient is notified. |
| Status | Pass |

### 4.3.12 Doctor rejects appointment with reason
Table 12: System testing 12

| Field | Details |
| --- | --- |
| Test Case ID | ST-12 |
| Feature/Test Title | Reject appointment |
| Objective | Ensure rejection requires a reason and updates status. |
| Preconditions | Doctor is verified and has pending appointment. |
| Test Steps | 1. Open a pending appointment.<br>2. Enter rejection reason.<br>3. Click Reject. |
| Expected Result | Status changes to rejected and reason is saved. |
| Actual Result | Status changes to rejected and reason is saved. |
| Status | Pass |

### 4.3.13 Patient reschedules appointment
Table 13: System testing 13

| Field | Details |
| --- | --- |
| Test Case ID | ST-13 |
| Feature/Test Title | Reschedule appointment |
| Objective | Verify patient can reschedule a pending appointment. |
| Preconditions | Patient has a pending appointment. |
| Test Steps | 1. Open My Appointments.<br>2. Click Reschedule.<br>3. Select new date/time and save. |
| Expected Result | Appointment date/time updates and status remains pending. |
| Actual Result | Appointment date/time updates and status remains pending. |
| Status | Pass |

### 4.3.14 Patient cancels appointment
Table 14: System testing 14

| Field | Details |
| --- | --- |
| Test Case ID | ST-14 |
| Feature/Test Title | Cancel appointment |
| Objective | Ensure patient can cancel a pending appointment. |
| Preconditions | Patient has a pending appointment. |
| Test Steps | 1. Open My Appointments.<br>2. Click Cancel on a pending appointment. |
| Expected Result | Appointment status changes to cancelled. |
| Actual Result | Appointment status changes to cancelled. |
| Status | Pass |

### 4.3.15 Doctor completes appointment
Table 15: System testing 15

| Field | Details |
| --- | --- |
| Test Case ID | ST-15 |
| Feature/Test Title | Complete appointment |
| Objective | Verify doctor can complete an approved appointment. |
| Preconditions | Doctor has an approved appointment. |
| Test Steps | 1. Open Appointments.<br>2. Click Complete and add notes.<br>3. Save. |
| Expected Result | Status changes to completed and notes are stored. |
| Actual Result | Status changes to completed and notes are stored. |
| Status | Pass |

### 4.3.16 Doctor assigns diagnostic test
Table 16: System testing 16

| Field | Details |
| --- | --- |
| Test Case ID | ST-16 |
| Feature/Test Title | Assign diagnostic test |
| Objective | Verify doctor can assign a lab test to a patient. |
| Preconditions | Doctor is verified and lab exists. |
| Test Steps | 1. Open Assign Lab Test.<br>2. Select patient, test type, and lab.<br>3. Submit. |
| Expected Result | Diagnostic test is created with status assigned. |
| Actual Result | Diagnostic test is created with status assigned. |
| Status | Pass |

### 4.3.17 Lab accepts and updates test status
Table 17: System testing 17

| Field | Details |
| --- | --- |
| Test Case ID | ST-17 |
| Feature/Test Title | Lab updates diagnostic status |
| Objective | Verify lab can accept and progress test status. |
| Preconditions | Lab is verified and has assigned tests. |
| Test Steps | 1. Log in as lab.<br>2. Open Assigned Tests.<br>3. Set status to in_progress or completed. |
| Expected Result | Status updates correctly in system. |
| Actual Result | Status updates correctly in system. |
| Status | Pass |

### 4.3.18 Lab uploads test report
Table 18: System testing 18

| Field | Details |
| --- | --- |
| Test Case ID | ST-18 |
| Feature/Test Title | Upload diagnostic report |
| Objective | Verify lab can upload report metadata. |
| Preconditions | Lab has a completed test. |
| Test Steps | 1. Open Upload Reports.<br>2. Attach report file and notes.<br>3. Submit. |
| Expected Result | Report is saved and visible in completed tests. |
| Actual Result | Report is saved and visible in completed tests. |
| Status | Pass |

### 4.3.19 Patient views medical records
Table 19: System testing 19

| Field | Details |
| --- | --- |
| Test Case ID | ST-19 |
| Feature/Test Title | View medical records |
| Objective | Ensure patient can view their own records. |
| Preconditions | Records exist for the patient. |
| Test Steps | 1. Navigate to Patient > Records.<br>2. View diagnostics and medications. |
| Expected Result | Patient sees only their own records. |
| Actual Result | Patient sees only their own records. |
| Status | Pass |

### 4.3.20 Doctor updates medical record items
Table 20: System testing 20

| Field | Details |
| --- | --- |
| Test Case ID | ST-20 |
| Feature/Test Title | Update allergy in medical records |
| Objective | Verify doctor can update allergy data. |
| Preconditions | Patient has an allergy record. |
| Test Steps | 1. Open patient record.<br>2. Edit allergy fields.<br>3. Save changes. |
| Expected Result | Allergy record updates successfully. |
| Actual Result | Allergy record updates successfully. |
| Status | Pass |

### 4.3.21 Prescribe medication to patient
Table 21: System testing 21

| Field | Details |
| --- | --- |
| Test Case ID | ST-21 |
| Feature/Test Title | Prescribe medication |
| Objective | Verify doctor can prescribe medication. |
| Preconditions | Doctor is verified and patient exists. |
| Test Steps | 1. Open Prescriptions.<br>2. Enter medication details.<br>3. Submit. |
| Expected Result | Medication is created and visible to patient. |
| Actual Result | Medication is created and visible to patient. |
| Status | Pass |

### 4.3.22 Patient acknowledges medication reminder
Table 22: System testing 22

| Field | Details |
| --- | --- |
| Test Case ID | ST-22 |
| Feature/Test Title | Acknowledge medication reminder |
| Objective | Verify patient can mark reminder as taken. |
| Preconditions | Patient has a scheduled reminder for today. |
| Test Steps | 1. Open Reminders.<br>2. Click Acknowledge for a reminder. |
| Expected Result | Reminder is marked as taken and adherence updates. |
| Actual Result | Reminder is marked as taken and adherence updates. |
| Status | Pass |

### 4.3.23 Role application submission
Table 23: System testing 23

| Field | Details |
| --- | --- |
| Test Case ID | ST-23 |
| Feature/Test Title | Submit role application |
| Objective | Ensure patient can submit a role application. |
| Preconditions | Patient is logged in. |
| Test Steps | 1. Open Role Application form.<br>2. Fill required details.<br>3. Submit. |
| Expected Result | Application is created with pending status. |
| Actual Result | Application is created with pending status. |
| Status | Pass |

### 4.3.24 Admin approves role application
Table 24: System testing 24

| Field | Details |
| --- | --- |
| Test Case ID | ST-24 |
| Feature/Test Title | Approve role application |
| Objective | Verify admin can approve a pending application. |
| Preconditions | Admin is logged in and pending application exists. |
| Test Steps | 1. Open Admin > Applications.<br>2. Select a pending application.<br>3. Click Approve. |
| Expected Result | Application status becomes approved and user is verified. |
| Actual Result | Application status becomes approved and user is verified. |
| Status | Pass |

### 4.3.25 Notifications unread count
Table 25: System testing 25

| Field | Details |
| --- | --- |
| Test Case ID | ST-25 |
| Feature/Test Title | Unread notification count |
| Objective | Verify unread notification count displays correctly. |
| Preconditions | User has unread notifications. |
| Test Steps | 1. Log in.<br>2. Open Notifications or header badge. |
| Expected Result | Unread count matches actual unread items. |
| Actual Result | Unread count matches actual unread items. |
| Status | Pass |

### 4.3.26 Mark all notifications as read
Table 26: System testing 26

| Field | Details |
| --- | --- |
| Test Case ID | ST-26 |
| Feature/Test Title | Mark all notifications as read |
| Objective | Ensure user can mark all notifications as read. |
| Preconditions | User has unread notifications. |
| Test Steps | 1. Open Notifications.<br>2. Click Mark all read. |
| Expected Result | All notifications marked as read and count becomes 0. |
| Actual Result | All notifications marked as read and count becomes 0. |
| Status | Pass |

### 4.3.27 Unauthorized access to admin page
Table 27: System testing 27

| Field | Details |
| --- | --- |
| Test Case ID | ST-27 |
| Feature/Test Title | Access control (negative) |
| Objective | Verify non-admin users cannot access admin routes. |
| Preconditions | Patient or doctor is logged in. |
| Test Steps | 1. Enter /admin/dashboard in address bar.<br>2. Press Enter. |
| Expected Result | User is redirected to Login or their own dashboard. |
| Actual Result | User is redirected to Login or their own dashboard. |
| Status | Pass |

### 4.3.28 Invalid API action on another user resource
Table 28: System testing 28

| Field | Details |
| --- | --- |
| Test Case ID | ST-28 |
| Feature/Test Title | Access control on protected resources |
| Objective | Ensure users cannot view or modify others’ records. |
| Preconditions | Two users exist (A and B). |
| Test Steps | 1. Log in as User A.<br>2. Try to open User B’s medical record or appointment by ID. |
| Expected Result | Access is denied with an authorization error. |
| Actual Result | Access is denied with an authorization error. |
| Status | Pass |

### 4.3.29 Profile update
Table 29: System testing 29

| Field | Details |
| --- | --- |
| Test Case ID | ST-29 |
| Feature/Test Title | Update profile |
| Objective | Verify user can update profile details. |
| Preconditions | User is logged in. |
| Test Steps | 1. Open Profile.<br>2. Update fields (phone/address).<br>3. Save. |
| Expected Result | Profile updates successfully. |
| Actual Result | Profile updates successfully. |
| Status | Pass |

### 4.3.30 Change password validation
Table 30: System testing 30

| Field | Details |
| --- | --- |
| Test Case ID | ST-30 |
| Feature/Test Title | Change password with incorrect current password |
| Objective | Ensure incorrect current password is rejected. |
| Preconditions | User is logged in. |
| Test Steps | 1. Open Settings.<br>2. Enter wrong current password and a new password.<br>3. Submit. |
| Expected Result | Password change fails with error message. |
| Actual Result | Password change fails with error message. |
| Status | Pass |

### 4.3.31 Doctor sets availability time slots
Table 31: System testing 31

| Field | Details |
| --- | --- |
| Test Case ID | ST-31 |
| Feature/Test Title | Add availability time slot |
| Objective | Verify doctor can create an availability time slot. |
| Preconditions | Doctor is verified and logged in. |
| Test Steps | 1. Open Doctor > Appointments or Availability page.<br>2. Select date and time range.<br>3. Save the slot. |
| Expected Result | Availability slot is created and visible to patients. |
| Actual Result | Availability slot is created and visible to patients. |
| Status | Pass |

### 4.3.32 Doctor updates availability time slot
Table 32: System testing 32

| Field | Details |
| --- | --- |
| Test Case ID | ST-32 |
| Feature/Test Title | Edit availability time slot |
| Objective | Verify doctor can edit an existing availability slot. |
| Preconditions | Doctor has at least one availability slot. |
| Test Steps | 1. Open Availability list.<br>2. Select a slot and edit time range.<br>3. Save changes. |
| Expected Result | Slot updates successfully and reflects new time. |
| Actual Result | Slot updates successfully and reflects new time. |
| Status | Pass |

### 4.3.33 Doctor deletes availability time slot
Table 33: System testing 33

| Field | Details |
| --- | --- |
| Test Case ID | ST-33 |
| Feature/Test Title | Delete availability time slot |
| Objective | Verify doctor can delete an availability slot. |
| Preconditions | Doctor has at least one availability slot. |
| Test Steps | 1. Open Availability list.<br>2. Select a slot and click Delete.<br>3. Confirm deletion. |
| Expected Result | Slot is removed and no longer visible to patients. |
| Actual Result | Slot is removed and no longer visible to patients. |
| Status | Pass |

### 4.3.34 Prevent invalid availability overlap
Table 34: System testing 34

| Field | Details |
| --- | --- |
| Test Case ID | ST-34 |
| Feature/Test Title | Overlapping time slot validation |
| Objective | Ensure overlapping availability slots are rejected. |
| Preconditions | Doctor has an existing slot on the same date. |
| Test Steps | 1. Create a new slot that overlaps an existing slot.<br>2. Save the slot. |
| Expected Result | System blocks the save and shows a validation error. |
| Actual Result | System blocks the save and shows a validation error. |
| Status | Pass |
