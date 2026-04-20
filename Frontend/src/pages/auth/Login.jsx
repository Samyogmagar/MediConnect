import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Info } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import healthcareImg from '../../assets/healthcare-illustration.svg';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle registration success message
  useEffect(() => {
    if (location.state?.message) {
      if (location.state?.type === 'success') {
        setSuccessMessage(location.state.message);
      } else if (location.state?.type === 'info') {
        setApiError(location.state.message);
      }
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
    if (successMessage) setSuccessMessage('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      const payload = response?.data?.data || response?.data || response;

      // Check verification status
      const user = payload?.user;
      const isVerified = payload?.isVerified;

      if (!user?.role) {
        throw new Error('Invalid login response. Missing user role.');
      }

      const role = user.role;

      // Block unverified doctors and labs
      if ((role === 'doctor' || role === 'lab') && !isVerified) {
        setApiError(
          `⏳ Account Verification Pending\n\n` +
          `Your ${role} account is currently under review by our admin team. ` +
          `You will be able to log in and access all features once your account is verified. ` +
          `Please check your email for verification updates.`
        );
        // Logout to clear the token
        await logout();
        return;
      }

      // Redirect based on role from backend response
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        case 'lab':
          navigate('/lab/dashboard');
          break;
        case 'patient':
        default:
          navigate('/patient/dashboard');
          break;
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back to your digital healthcare platform"
      subtitle="Access your appointments, medical records, and healthcare services securely."
      imageSrc={healthcareImg}
      imageAlt="Healthcare illustration"
    >
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Sign in to MediConnect</h2>
        <p className={styles.formSubtitle}>
          Enter your credentials to access your account
        </p>

        {successMessage && (
          <div className={styles.successBanner}>
            {successMessage}
          </div>
        )}

        {apiError && (
          <div className={apiError.includes('⏳') ? styles.warningBanner : styles.errorBanner}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <AuthInput
            label="Email or Phone"
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="your.email@example.com or 98XXXXXXXX"
            icon={Mail}
            error={errors.identifier}
            autoComplete="username"
            required
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            icon={Lock}
            error={errors.password}
            autoComplete="current-password"
            required
          />

          <p className={styles.forgotText}>
            <Link to="/forgot-password" className={styles.switchLink}>
              Forgot your password?
            </Link>
          </p>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
          >
            Login
          </Button>

          <SocialLoginButtons
            intent="login"
            onError={setApiError}
            showUnavailable
          />
        </form>

        <div className={styles.infoBox}>
          <Info size={16} className={styles.infoIcon} />
          <p className={styles.infoText}>
            <strong>Hospital access:</strong> Patients can self-register.
            Doctors, lab staff, and administrators are created by Super Admin.
            All roles log in here and are redirected by role.
          </p>
        </div>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.switchLink}>
            Register here
          </Link>
        </p>

        <p className={styles.terms}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
