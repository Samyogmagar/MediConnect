import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import styles from './OAuthCallback.module.css';

const roleRouteMap = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  lab: '/lab/dashboard',
  admin: '/admin/dashboard',
};

const OAuthCallback = () => {
  const { provider } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthSession } = useAuth();

  const code = useMemo(() => searchParams.get('code') || '', [searchParams]);
  const state = useMemo(() => searchParams.get('state') || '', [searchParams]);
  const oauthError = useMemo(() => searchParams.get('error') || '', [searchParams]);
  const oauthErrorDescription = useMemo(
    () => searchParams.get('error_description') || '',
    [searchParams]
  );

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Completing secure sign-in...');

  useEffect(() => {
    const run = async () => {
      if (oauthError) {
        setStatus('error');
        setMessage(oauthErrorDescription || 'Social sign-in was cancelled or denied.');
        return;
      }

      if (!provider || !code || !state) {
        setStatus('error');
        setMessage('Missing social login callback parameters. Please try again.');
        return;
      }

      try {
        const response = await authService.completeSocialProviderAuth(provider, { code, state });
        const user = response?.data?.user;
        const token = response?.data?.token;

        if (!user || !token) {
          throw new Error('Invalid social login response from server.');
        }

        setAuthSession(user, token);

        const targetPath = roleRouteMap[user.role] || '/patient/dashboard';
        navigate(targetPath, { replace: true });
      } catch (error) {
        setStatus('error');
        setMessage(
          error?.response?.data?.message ||
            error?.message ||
            'Unable to complete social login. Please try again.'
        );
      }
    };

    run();
  }, [provider, code, state, oauthError, oauthErrorDescription, navigate, setAuthSession]);

  return (
    <AuthLayout
      title="Secure social sign-in"
      subtitle="We are finalizing your account authentication and redirecting you."
    >
      <div className={styles.panel}>
        {status === 'loading' ? (
          <>
            <LoaderCircle className={styles.spinner} size={28} />
            <h2 className={styles.title}>Signing you in</h2>
            <p className={styles.message}>{message}</p>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Could not complete social login</h2>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <Button variant="primary" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
              <Link to="/register" className={styles.link}>
                Create account manually
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default OAuthCallback;
