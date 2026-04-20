import { useEffect, useMemo, useState } from 'react';
import { Chrome, Github, Facebook } from 'lucide-react';
import authService from '../../services/authService';
import styles from './SocialLoginButtons.module.css';

const PROVIDERS = [
  { key: 'google', label: 'Google', Icon: Chrome },
  { key: 'github', label: 'GitHub', Icon: Github },
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
];

const SocialLoginButtons = ({ intent = 'login', onError, showUnavailable = false }) => {
  const [providerStates, setProviderStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingProvider, setLoadingProvider] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProviders = async () => {
      setLoadingStates(true);
      try {
        const response = await authService.getSocialProviders(intent);
        const providerMap = new Map(
          (response?.data?.providers || []).map((provider) => [provider.provider, provider])
        );

        const mergedProviders = PROVIDERS.map(({ key, label, Icon }) => {
          const availability = providerMap.get(key);
          return {
            key,
            label,
            Icon,
            enabled: Boolean(availability?.enabled),
            unavailableReason: availability?.unavailableReason || 'Provider status unavailable.',
          };
        });

        if (isMounted) {
          setProviderStates(mergedProviders);
        }
      } catch {
        // Compatibility fallback: if the providers endpoint is unavailable,
        // probe each provider start endpoint individually.
        const fallbackStates = await Promise.all(
          PROVIDERS.map(async ({ key, label, Icon }) => {
            try {
              const startResponse = await authService.getSocialProviderStart(key, intent);
              return {
                key,
                label,
                Icon,
                enabled: Boolean(startResponse?.data?.enabled),
                unavailableReason: '',
              };
            } catch (error) {
              return {
                key,
                label,
                Icon,
                enabled: false,
                unavailableReason:
                  error?.response?.data?.message ||
                  'This social login provider is not configured yet',
              };
            }
          })
        );

        if (isMounted) {
          setProviderStates(fallbackStates);
        }
      } finally {
        if (isMounted) {
          setLoadingStates(false);
        }
      }
    };

    loadProviders();

    return () => {
      isMounted = false;
    };
  }, [intent]);

  const visibleProviders = useMemo(() => {
    if (showUnavailable) {
      return providerStates;
    }
    return providerStates.filter((provider) => provider.enabled);
  }, [providerStates, showUnavailable]);

  if (!loadingStates && visibleProviders.length === 0 && !showUnavailable) {
    return null;
  }

  const handleSocialClick = async (provider) => {
    setLoadingProvider(provider);
    try {
      const response = await authService.getSocialProviderStart(provider, intent);
      const enabled = response?.data?.enabled;
      const authUrl = response?.data?.authUrl;
      if (!enabled) {
        throw new Error('Social sign-in is currently unavailable.');
      }

      if (!authUrl) {
        throw new Error('Unable to start social sign-in. Missing authorization URL.');
      }

      window.location.assign(authUrl);
    } catch (error) {
      if (onError) {
        onError(error.response?.data?.message || error.message || 'Social sign-in is unavailable right now.');
      }
    } finally {
      setLoadingProvider('');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      {loadingStates && (
        <p className={styles.statusText}>Checking social sign-in availability...</p>
      )}

      {!loadingStates && visibleProviders.length === 0 && (
        <p className={styles.statusText}>Social sign-in is currently unavailable.</p>
      )}

      <div className={styles.grid}>
        {visibleProviders.map(({ key, label, Icon, enabled, unavailableReason }) => (
          <button
            key={key}
            type="button"
            className={styles.providerButton}
            onClick={() => handleSocialClick(key)}
            disabled={Boolean(loadingProvider) || loadingStates || !enabled}
            title={!enabled ? unavailableReason : ''}
          >
            <Icon size={16} />
            {loadingProvider === key
              ? 'Checking...'
              : enabled
                ? `Continue with ${label}`
                : `${label} unavailable`}
          </button>
        ))}
      </div>

      {!loadingStates && visibleProviders.some((provider) => !provider.enabled) && (
        <p className={styles.unavailableNote}>Some providers are unavailable due to server OAuth configuration.</p>
      )}
    </div>
  );
};

export default SocialLoginButtons;