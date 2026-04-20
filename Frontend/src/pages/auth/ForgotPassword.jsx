import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Info } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import styles from './AuthRecovery.module.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevOtp('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email: email.trim() });
      setSuccess(response.message || 'If your account exists, an OTP has been sent.');
      if (response?.data?.devOtp) {
        setDevOtp(response.data.devOtp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToReset = () => {
    const params = new URLSearchParams({ email: email.trim() });
    navigate(`/reset-password?${params.toString()}`, {
      state: devOtp ? { devOtp } : undefined,
    });
  };

  return (
    <AuthLayout
      title="Recover your MediConnect account"
      subtitle="Request a one-time verification code to reset your password securely."
    >
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Forgot Password</h2>
        <p className={styles.formSubtitle}>Enter your account email to receive an OTP code.</p>

        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        {success ? <div className={styles.successBanner}>{success}</div> : null}

        <form onSubmit={handleSubmit} noValidate>
          <AuthInput
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            icon={Mail}
            autoComplete="email"
            required
          />

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Send OTP
          </Button>
        </form>

        {devOtp ? (
          <div className={styles.infoBox}>
            <Info size={16} className={styles.infoIcon} />
            <p className={styles.infoText}>Development OTP: <strong>{devOtp}</strong></p>
          </div>
        ) : null}

        <div className={styles.actionsRow}>
          <Button type="button" variant="secondary" fullWidth onClick={goToReset} disabled={!email.trim()}>
            I have an OTP
          </Button>
        </div>

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

export default ForgotPassword;
