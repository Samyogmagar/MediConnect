import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Info, Upload, X, CheckCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    licenseNumber: '',
    specialization: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [successModal, setSuccessModal] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'doctor') {
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'Medical license number is required';
      }
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
    }

    if (formData.role === 'lab') {
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'Lab license number is required';
      }
    }

    if (formData.role !== 'patient' && documents.length === 0) {
      newErrors.documents = 'Please upload supporting documents';
    }

    return newErrors;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setDocuments((prev) => [...prev, ...files]);
    if (errors.documents) {
      setErrors((prev) => ({ ...prev, documents: '' }));
    }
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSuccessModalClose = () => {
    setSuccessModal(null);
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        licenseNumber: formData.licenseNumber.trim() || undefined,
        specialization: formData.specialization.trim() || undefined,
      };

      await register(registrationData);

      if (formData.role === 'doctor' || formData.role === 'lab') {
        setSuccessModal({ role: formData.role, name: formData.name.trim() });
        return;
      }

      navigate('/login', {
        state: {
          message: 'Registration successful! Please log in.',
          type: 'success',
        },
      });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join Nepal's Digital Healthcare Platform"
      subtitle="Create your account to access quality healthcare services from anywhere, anytime."
      highlights={[
        'Book appointments with verified doctors',
        'Access your medical records anytime',
        'Receive lab test results digitally',
        'Track your health progress',
      ]}
      imageSrc="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80"
      imageAlt="Healthcare professional with stethoscope"
      imageCaption="Secure, reliable, and trusted by thousands"
    >
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Create Account</h2>
        <p className={styles.formSubtitle}>Get started with your healthcare journey</p>

        {apiError && (
          <div className={styles.errorBanner}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <AuthInput
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            icon={User}
            error={errors.name}
            autoComplete="name"
            required
          />

          <AuthInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            icon={Mail}
            error={errors.email}
            autoComplete="email"
            required
          />

          {/* Professional Details for Doctors */}
          {formData.role === 'doctor' && (
            <>
              <AuthInput
                label="Medical License Number"
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="NMC-12345"
                icon={Info}
                error={errors.licenseNumber}
                required
              />

              <AuthInput
                label="Specialization"
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g., Cardiology, Pediatrics"
                icon={Info}
                error={errors.specialization}
                required
              />

              {/* Document Upload */}
              <div className={styles.inputGroup}>
                <label htmlFor="documents" className={styles.label}>
                  Upload Documents <span className={styles.required}>*</span>
                </label>
                <p className={styles.helpText}>
                  Upload your medical license, certificates, or ID proof (Images or PDF, max 5MB each)
                </p>
                <div className={styles.fileUploadContainer}>
                  <label htmlFor="documents" className={styles.fileUploadLabel}>
                    <Upload size={20} />
                    <span>Click to upload or drag and drop</span>
                  </label>
                  <input
                    type="file"
                    id="documents"
                    name="documents"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                </div>
                {errors.documents && (
                  <span className={styles.errorText}>{errors.documents}</span>
                )}
                {documents.length > 0 && (
                  <div className={styles.fileList}>
                    {documents.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className={styles.removeBtn}
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Professional Details for Labs */}
          {formData.role === 'lab' && (
            <>
              <AuthInput
                label="Lab License Number"
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="LAB-12345"
                icon={Info}
                error={errors.licenseNumber}
                required
              />

              {/* Document Upload */}
              <div className={styles.inputGroup}>
                <label htmlFor="documents" className={styles.label}>
                  Upload Documents <span className={styles.required}>*</span>
                </label>
                <p className={styles.helpText}>
                  Upload your lab license, accreditation certificates, or registration documents (Images or PDF, max 5MB each)
                </p>
                <div className={styles.fileUploadContainer}>
                  <label htmlFor="documents" className={styles.fileUploadLabel}>
                    <Upload size={20} />
                    <span>Click to upload or drag and drop</span>
                  </label>
                  <input
                    type="file"
                    id="documents"
                    name="documents"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                </div>
                {errors.documents && (
                  <span className={styles.errorText}>{errors.documents}</span>
                )}
                {documents.length > 0 && (
                  <div className={styles.fileList}>
                    {documents.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className={styles.removeBtn}
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            icon={Lock}
            error={errors.password}
            autoComplete="new-password"
            required
          />

          <AuthInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            icon={Lock}
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className={styles.infoBox}>
          <Info size={16} className={styles.infoIcon} />
          <div>
            <p className={styles.infoTitle}>Professional Verification</p>
            <p className={styles.infoText}>
              Doctor and laboratory accounts require admin verification before
              full access is granted. You will be notified once your account is
              verified.
            </p>
          </div>
        </div>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>
            Login here
          </Link>
        </p>

        <p className={styles.terms}>
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Success Modal for Doctor/Lab Registration */}
      {successModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <CheckCircle size={48} />
            </div>
            <h3 className={styles.modalTitle}>Registration Successful!</h3>
            <p className={styles.modalMessage}>
              Thank you for registering as a <strong>{successModal.role}</strong>, {successModal.name}!
            </p>
            <p className={styles.modalMessage}>
              Your account has been created successfully. Your documents and credentials are
              currently being verified by our admin team.
            </p>
            <p className={styles.modalMessage}>
              <strong>✓</strong> You will receive a notification once your account is verified<br />
              <strong>✓</strong> Check your email for further updates<br />
              <strong>✓</strong> You'll be able to access all features after verification
            </p>
            <Button
              onClick={handleSuccessModalClose}
              variant="primary"
              fullWidth
              size="lg"
            >
              Continue to Login
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default Register;
