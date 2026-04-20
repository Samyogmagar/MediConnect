import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, Lock, Mail } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import styles from './AuthRecovery.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const devOtp = location.state?.devOtp || '';

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
    if (name === 'otp') {
      setOtpVerified(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setSuccess('');

    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.otp.trim()) return setError('OTP is required');

    setVerifyingOtp(true);
    try {
      await authService.verifyResetOtp({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
      });
      setOtpVerified(true);
      setSuccess('OTP verified. You can now set a new password.');
    } catch (err) {
      setOtpVerified(false);
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.otp.trim()) return setError('OTP is required');
    if (!formData.newPassword) return setError('New password is required');
    if (formData.newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (!formData.confirmPassword) return setError('Confirm password is required');
    if (formData.newPassword !== formData.confirmPassword) return setError('Passwords do not match');

    setResetting(true);
    try {
      await authService.resetPassword({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      navigate('/login', {
        state: {
          type: 'success',
          message: 'Password reset successful. Please log in with your new password.',
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new account password"
      subtitle="Verify your OTP and choose a strong password to secure your account."
    >
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Reset Password</h2>
        <p className={styles.formSubtitle}>Use the OTP from your email to continue.</p>

        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        {success ? <div className={styles.successBanner}>{success}</div> : null}
        {devOtp ? <div className={styles.infoBanner}>Development OTP: <strong>{devOtp}</strong></div> : null}

        <form onSubmit={handleSubmit} noValidate>
          <AuthInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            icon={Mail}
            autoComplete="email"
            required
          />

          <div className={styles.inlineRow}>
            <div className={styles.growField}>
              <AuthInput
                label="OTP"
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="6-digit code"
                icon={KeyRound}
                required
              />
            </div>
            <div className={styles.verifyBtnWrap}>
              <Button
                type="button"
                variant={otpVerified ? 'success' : 'secondary'}
                onClick={handleVerifyOtp}
                loading={verifyingOtp}
              >
                {otpVerified ? 'Verified' : 'Verify OTP'}
              </Button>
            </div>
          </div>

          <AuthInput
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            icon={Lock}
            autoComplete="new-password"
            required
          />

          <AuthInput
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            icon={Lock}
            autoComplete="new-password"
            required
          />

          <Button type="submit" variant="primary" fullWidth size="lg" loading={resetting}>
            Reset Password
          </Button>
        </form>

        <p className={styles.switchText}>
          Back to{' '}
          <Link to="/login" className={styles.switchLink}>
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
