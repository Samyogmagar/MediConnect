import { Link, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const location = useLocation();

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Gynecology',
    'ENT',
    'General Medicine',
    'Neurology',
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Heart className={styles.logoIcon} />
          <span className={styles.logoText}>MediConnect</span>
        </Link>

        <div className={styles.navLinks}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            Home
          </Link>
          <div className={styles.navDropdown}>
            <Link
              to="/patient/doctors"
              className={`${styles.navLink} ${isActive('/patient/doctors') ? styles.active : ''}`}
            >
              Find Doctors
            </Link>
            <div className={styles.dropdownMenu}>
              {specializations.map((spec) => (
                <Link
                  key={spec}
                  to={`/patient/doctors?specialization=${encodeURIComponent(spec)}`}
                  className={styles.dropdownItem}
                >
                  {spec}
                </Link>
              ))}
            </div>
          </div>
          <a href="#lab-tests" className={styles.navLink}>
            Lab Tests
          </a>
          <a href="#how-it-works" className={styles.navLink}>
            How It Works
          </a>
          <Link
            to="/about"
            className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
          >
            About
          </Link>
          <a href="#contact" className={styles.navLink}>
            Contact / Support
          </a>
          <Link
            to="/login"
            className={`${styles.navLink} ${isActive('/login') ? styles.active : ''}`}
          >
            Login
          </Link>
          <Link to="/register" className={styles.registerBtn}>
            Register as Patient
          </Link>
          <div className={styles.roleLinks}>
            <Link to="/login" className={styles.roleLink}>Doctor Login</Link>
            <span className={styles.roleDivider}>•</span>
            <Link to="/login" className={styles.roleLink}>Lab Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
