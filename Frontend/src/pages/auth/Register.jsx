import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Info, Phone, Calendar } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/feedback/ToastProvider';
import useAuth from '../../hooks/useAuth';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
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

    return newErrors;
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
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        dob: formData.dob,
        gender: formData.gender,
      };

      await register(registrationData);

      showToast({
        type: 'success',
        title: 'Registration successful',
        message: 'Your account has been created successfully. Please log in.',
      });

      navigate('/login');
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
          <div className={styles.inputGroup}>
            <p className={styles.label}>Account Information</p>
          </div>

          <AuthInput
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            icon={User}
            error={errors.fullName}
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

          <AuthInput
            label="Phone Number"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="98XXXXXXXX"
            icon={Phone}
            error={errors.phone}
            autoComplete="tel"
            required
          />

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

          <button
            type="button"
            className={styles.optionalToggle}
            onClick={() => setShowOptional((prev) => !prev)}
          >
            {showOptional ? 'Hide optional details' : 'Add optional details (DOB, Gender)'}
          </button>

          {showOptional && (
            <>
              <div className={styles.inputGroup}>
                <p className={styles.label}>Optional Personal Information</p>
              </div>

              <AuthInput
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                icon={Calendar}
                error={errors.dob}
              />

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="gender">Gender</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.iconWrap}><Info size={18} /></span>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.gender && <p className={styles.errorText}>{errors.gender}</p>}
              </div>
            </>
          )}

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

          <SocialLoginButtons
            intent="register"
            onError={setApiError}
            showUnavailable
          />
        </form>

        <div className={styles.infoBox}>
          <Info size={16} className={styles.infoIcon} />
          <div>
            <p className={styles.infoTitle}>Patient Registration</p>
            <p className={styles.infoText}>
              This form is only for patient signup in MediConnect hospital.
              Doctors, lab staff, and admins are created by Super Admin. You can
              complete additional profile details after login.
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
    </AuthLayout>
  );
};

export default Register;
