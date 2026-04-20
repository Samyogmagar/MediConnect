import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const navigateMock = jest.fn();
const loginMock = jest.fn();
const logoutMock = jest.fn();

jest.unstable_mockModule('lucide-react', () => ({
  Mail: () => <span data-testid="icon-mail" />,
  Lock: () => <span data-testid="icon-lock" />,
  Info: () => <span data-testid="icon-info" />,
}));

jest.unstable_mockModule('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: '/login', state: null }),
}));

jest.unstable_mockModule('../hooks/useAuth', () => ({
  default: () => ({ login: loginMock, logout: logoutMock }),
}));

jest.unstable_mockModule('../components/auth/AuthLayout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

jest.unstable_mockModule('../components/auth/AuthInput', () => ({
  default: ({ label, name, value, onChange, error, type }) => (
    <label>
      <span>{label}</span>
      <input name={name} value={value} onChange={onChange} type={type} aria-label={label} />
      {error ? <span>{error}</span> : null}
    </label>
  ),
}));

jest.unstable_mockModule('../components/common/Button', () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

jest.unstable_mockModule('../components/auth/SocialLoginButtons', () => ({
  default: () => <div>Social Login Buttons</div>,
}));

jest.unstable_mockModule('../pages/auth/Login.module.css', () => ({
  default: {},
}));

const { default: Login } = await import('../pages/auth/Login.jsx');

describe('Login page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-34: shows validation errors for empty submit', async () => {
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Email or phone is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  test('UT-35: redirects patient to dashboard on success', async () => {
    loginMock.mockResolvedValue({
      data: {
        user: { role: 'patient' },
        isVerified: true,
      },
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email or Phone'), {
      target: { value: 'patient@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/patient/dashboard');
    });
  });

  test('UT-36: unverified doctor shows warning and logs out', async () => {
    loginMock.mockResolvedValue({
      data: {
        user: { role: 'doctor' },
        isVerified: false,
      },
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email or Phone'), {
      target: { value: 'doctor@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Account Verification Pending/i)).toBeInTheDocument();
      expect(logoutMock).toHaveBeenCalled();
    });
  });
});
