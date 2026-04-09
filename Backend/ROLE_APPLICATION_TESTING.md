# Role Application Testing Guide

Complete testing guide for the **Role Application System** - allowing patients to apply for professional roles (Doctor/Lab) and admins to review/approve applications.

---

## Prerequisites

1. **Server Running**: `npm start` in Backend directory
2. **Admin Account**: Use existing admin account from AUTH_TESTING.md
3. **Patient Account**: Create or use existing patient account

---

## Test Execution Order

### Phase 1: Setup Test Accounts

#### 1.1 Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mediconnect.com",
    "password": "AdminPass@123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "...",
      "name": "System Admin",
      "email": "admin@mediconnect.com",
      "role": "admin"
    }
  }
}
```

**Save**: `ADMIN_TOKEN=<token from response>`

---

#### 1.2 Create/Login as Patient
```bash
# Register new patient
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Ramesh Sharma",
    "email": "ramesh.sharma@gmail.com",
    "password": "Doctor@123",
    "role": "patient",
    "contactNumber": "9876543210",
    "address": "Kathmandu, Nepal"
  }'

# Then login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ramesh.sharma@gmail.com",
    "password": "Doctor@123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "...",
      "name": "Dr. Ramesh Sharma",
      "email": "ramesh.sharma@gmail.com",
      "role": "patient"
    }
  }
}
```

**Save**: `PATIENT_TOKEN=<token from response>`

---

### Phase 2: Patient Submits Application

#### 2.1 Submit Doctor Application
```bash
curl -X POST http://localhost:5000/api/role-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "requestedRole": "doctor",
    "professionalDetails": {
      "licenseNumber": "NMC-12345",
      "specialization": "Cardiology",
      "clinicName": "Heart Care Clinic",
      "clinicAddress": "Maharajgunj, Kathmandu",
      "yearsOfExperience": 10,
      "qualifications": ["MBBS", "MD Cardiology"],
      "consultationFee": 1500
    },
    "documents": [
      {
        "type": "license",
        "url": "https://cloudinary.com/uploads/license.pdf",
        "uploadedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "type": "certificate",
        "url": "https://cloudinary.com/uploads/md-certificate.pdf",
        "uploadedAt": "2024-01-15T10:35:00.000Z"
      }
    ]
  }'
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Application submitted successfully. Admin will review your application.",
  "data": {
    "application": {
      "_id": "...",
      "userId": "...",
      "requestedRole": "doctor",
      "professionalDetails": {
        "licenseNumber": "NMC-12345",
        "specialization": "Cardiology",
        "clinicName": "Heart Care Clinic",
        "clinicAddress": "Maharajgunj, Kathmandu",
        "yearsOfExperience": 10,
        "qualifications": ["MBBS", "MD Cardiology"],
        "consultationFee": 1500
      },
      "documents": [...],
      "status": "pending",
      "createdAt": "2024-01-15T10:40:00.000Z"
    }
  }
}
```

**Save**: `APPLICATION_ID=<_id from response>`

---

#### 2.2 Submit Lab Application (Alternative)
```bash
curl -X POST http://localhost:5000/api/role-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "requestedRole": "lab",
    "professionalDetails": {
      "licenseNumber": "NHRC-67890",
      "labName": "Nepal Diagnostic Center",
      "labAddress": "Baneshwor, Kathmandu",
      "accreditation": "ISO 15189:2012",
      "servicesOffered": ["Blood Test", "X-Ray", "CT Scan", "MRI"],
      "operatingHours": "24/7",
      "contactNumber": "01-4567890"
    },
    "documents": [
      {
        "type": "license",
        "url": "https://cloudinary.com/uploads/lab-license.pdf",
        "uploadedAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  }'
```

---

#### 2.3 Try Duplicate Submission (Should Fail)
```bash
curl -X POST http://localhost:5000/api/role-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "requestedRole": "doctor",
    "professionalDetails": {
      "licenseNumber": "NMC-12345",
      "specialization": "Cardiology"
    }
  }'
```

**Expected Response** (409):
```json
{
  "success": false,
  "message": "You already have a pending application"
}
```

---

### Phase 3: Patient Views Own Applications

#### 3.1 Get All My Applications
```bash
curl -X GET http://localhost:5000/api/role-applications \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [
      {
        "_id": "...",
        "userId": {
          "_id": "...",
          "name": "Dr. Ramesh Sharma",
          "email": "ramesh.sharma@gmail.com"
        },
        "requestedRole": "doctor",
        "status": "pending",
        "createdAt": "2024-01-15T10:40:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

#### 3.2 Get Application by ID
```bash
curl -X GET http://localhost:5000/api/role-applications/$APPLICATION_ID \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "application": {
      "_id": "...",
      "requestedRole": "doctor",
      "professionalDetails": { ... },
      "documents": [ ... ],
      "status": "pending",
      "submittedAt": "..."
    }
  }
}
```

---

### Phase 4: Patient Updates Application

#### 4.1 Update Pending Application
```bash
curl -X PUT http://localhost:5000/api/role-applications/$APPLICATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "professionalDetails": {
      "licenseNumber": "NMC-12345",
      "specialization": "Interventional Cardiology",
      "clinicName": "Advanced Heart Care Clinic",
      "clinicAddress": "Maharajgunj, Kathmandu",
      "yearsOfExperience": 12,
      "qualifications": ["MBBS", "MD Cardiology", "Fellowship in Interventional Cardiology"],
      "consultationFee": 2000
    },
    "documents": [
      {
        "type": "license",
        "url": "https://cloudinary.com/uploads/license-updated.pdf",
        "uploadedAt": "2024-01-16T09:00:00.000Z"
      },
      {
        "type": "certificate",
        "url": "https://cloudinary.com/uploads/fellowship-cert.pdf",
        "uploadedAt": "2024-01-16T09:05:00.000Z"
      }
    ]
  }'
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    "application": {
      "_id": "...",
      "professionalDetails": {
        "specialization": "Interventional Cardiology",
        "consultationFee": 2000,
        "yearsOfExperience": 12,
        ...
      }
    }
  }
}
```

---

### Phase 5: Admin Reviews Applications

#### 5.1 Get All Pending Applications (Admin)
```bash
curl -X GET "http://localhost:5000/api/role-applications?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [
      {
        "_id": "...",
        "userId": {
          "name": "Dr. Ramesh Sharma",
          "email": "ramesh.sharma@gmail.com"
        },
        "requestedRole": "doctor",
        "status": "pending",
        "professionalDetails": { ... },
        "documents": [ ... ],
        "submittedAt": "..."
      }
    ],
    "count": 1
  }
}
```

---

#### 5.2 Get Pending Count (Dashboard Stats)
```bash
curl -X GET http://localhost:5000/api/role-applications/statistics/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Pending count retrieved successfully",
  "data": {
    "count": 1
  }
}
```

---

#### 5.3 Filter Applications by Role
```bash
curl -X GET "http://localhost:5000/api/role-applications?requestedRole=doctor" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Phase 6: Admin Approves Application

#### 6.1 Approve Application
```bash
curl -X PUT http://localhost:5000/api/role-applications/$APPLICATION_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Application approved successfully. User role updated.",
  "data": {
    "application": {
      "_id": "...",
      "status": "approved",
      "reviewedBy": "...",
      "reviewedAt": "2024-01-16T10:00:00.000Z"
    },
    "user": {
      "_id": "...",
      "name": "Dr. Ramesh Sharma",
      "role": "doctor",
      "isVerified": true,
      "professionalDetails": {
        "licenseNumber": "NMC-12345",
        "specialization": "Interventional Cardiology",
        ...
      }
    }
  }
}
```

**Critical**: User's role is now updated from `patient` → `doctor`

---

### Phase 7: Verify Role Upgrade

#### 7.1 Patient Logs In Again (Now as Doctor)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ramesh.sharma@gmail.com",
    "password": "Doctor@123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "...",
      "name": "Dr. Ramesh Sharma",
      "email": "ramesh.sharma@gmail.com",
      "role": "doctor",
      "isVerified": true,
      "professionalDetails": {
        "licenseNumber": "NMC-12345",
        "specialization": "Interventional Cardiology",
        "consultationFee": 2000
      }
    }
  }
}
```

**Save**: `DOCTOR_TOKEN=<new token>`

---

#### 7.2 Access Doctor-Only Endpoints
```bash
# Now can access doctor appointment endpoints
curl -X GET http://localhost:5000/api/appointments \
  -H "Authorization: Bearer $DOCTOR_TOKEN"
```

**Expected**: 200 OK (previously would have been 403 Forbidden)

---

### Phase 8: Admin Rejects Application (Alternative Flow)

#### 8.1 Reject Application
```bash
curl -X PUT http://localhost:5000/api/role-applications/$APPLICATION_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "rejectionReason": "Invalid license number. Please upload certified documents from Nepal Medical Council."
  }'
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "application": {
      "_id": "...",
      "status": "rejected",
      "rejectionReason": "Invalid license number. Please upload certified documents from Nepal Medical Council.",
      "reviewedBy": "...",
      "reviewedAt": "2024-01-16T11:00:00.000Z"
    }
  }
}
```

---

### Phase 9: Patient Deletes Application

#### 9.1 Delete Pending/Rejected Application
```bash
curl -X DELETE http://localhost:5000/api/role-applications/$APPLICATION_ID \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

**Note**: Can only delete `pending` or `rejected` applications.

---

## Access Control Tests

### Test 1: Patient Cannot Approve Application
```bash
curl -X PUT http://localhost:5000/api/role-applications/$APPLICATION_ID/approve \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

**Expected Response** (403):
```json
{
  "success": false,
  "message": "Access denied. Allowed roles: admin"
}
```

---

### Test 2: Doctor Cannot Submit Application
```bash
curl -X POST http://localhost:5000/api/role-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{
    "requestedRole": "lab",
    "professionalDetails": { ... }
  }'
```

**Expected Response** (403):
```json
{
  "success": false,
  "message": "Only patients can submit role applications"
}
```

---

### Test 3: Patient Cannot View Other's Applications
```bash
# Login as Patient 2
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sita Thapa",
    "email": "sita.thapa@gmail.com",
    "password": "Patient@123",
    "role": "patient"
  }'

# Get Patient 2 token, then try to access Patient 1's application
curl -X GET http://localhost:5000/api/role-applications/$APPLICATION_ID \
  -H "Authorization: Bearer $PATIENT2_TOKEN"
```

**Expected Response** (403):
```json
{
  "success": false,
  "message": "Access denied. You can only view your own applications."
}
```

---

## Error Scenario Tests

### Test 1: Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/role-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "requestedRole": "doctor"
  }'
```

**Expected Response** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "professionalDetails",
      "message": "Professional details are required"
    }
  ]
}
```

---

### Test 2: Invalid Role
```bash
curl -X POST http://localhost:5000/api/role-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "requestedRole": "superadmin",
    "professionalDetails": { ... }
  }'
```

**Expected Response** (400):
```json
{
  "success": false,
  "message": "Invalid role. Allowed: doctor, lab"
}
```

---

### Test 3: Reject Without Reason
```bash
curl -X PUT http://localhost:5000/api/role-applications/$APPLICATION_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{}'
```

**Expected Response** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "rejectionReason",
      "message": "Rejection reason is required"
    }
  ]
}
```

---

### Test 4: Update Approved Application
```bash
# After approval, try to update
curl -X PUT http://localhost:5000/api/role-applications/$APPLICATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "professionalDetails": { ... }
  }'
```

**Expected Response** (400):
```json
{
  "success": false,
  "message": "Cannot update application. Only pending applications can be modified."
}
```

---

## Complete Workflow Summary

```
1. Patient registers account (role: patient)
2. Patient submits role application (requestedRole: doctor/lab)
3. Admin reviews pending applications
4. Admin approves application
5. User's role automatically updates (patient → doctor/lab)
6. User logs in again with new privileges
7. User can now access professional endpoints
```

---

## Key Features Tested

✅ **Application Submission**: Patients can apply for doctor/lab roles  
✅ **Duplicate Prevention**: One pending application per user  
✅ **Update Capability**: Edit pending applications  
✅ **Admin Review**: View and filter all applications  
✅ **Approval Flow**: Automatic role upgrade on approval  
✅ **Rejection Flow**: Provide feedback to applicants  
✅ **Access Control**: Role-based permissions enforced  
✅ **Data Transfer**: Professional details migrate to user profile  
✅ **Verification Status**: Auto-verify on approval  

---

## Database Verification

```javascript
// In MongoDB shell or Compass

// Check user role upgrade
db.users.findOne({ email: "ramesh.sharma@gmail.com" })
// Should show: role: "doctor", isVerified: true, professionalDetails: {...}

// Check application status
db.roleapplications.find({ status: "approved" })
// Should show reviewedBy, reviewedAt fields

// Check pending count
db.roleapplications.countDocuments({ status: "pending" })
```

---

## Troubleshooting

### Issue: "Duplicate pending application" error but I don't see any
**Solution**: Check database directly
```javascript
db.roleapplications.find({ userId: ObjectId("..."), status: "pending" })
```

### Issue: User role not updating after approval
**Solution**: Check service logs for errors. Verify User.model.js allows role updates.

### Issue: 403 Forbidden on admin routes
**Solution**: Verify admin token is valid and contains role: "admin"

### Issue: Cannot upload documents
**Solution**: Use Cloudinary URLs in documents array. File upload not yet implemented in this phase.

---

**Testing Complete**! 🎉

All 7 role application endpoints tested with proper access control and error handling.
