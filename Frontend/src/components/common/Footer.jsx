import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <Heart className={styles.logoIcon} />
              <span>MediConnect</span>
            </div>
            <p className={styles.description}>
              Digital healthcare platform connecting patients, doctors, and laboratories across Nepal.
            </p>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>About</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/about" className={styles.link}>Company</Link>
              </li>
              <li>
                <a href="#how-it-works" className={styles.link}>How it works</a>
              </li>
              <li>
                <a href="#trust" className={styles.link}>Trust & security</a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Services</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#find-doctors" className={styles.link}>Find doctors</a>
              </li>
              <li>
                <a href="#lab-tests" className={styles.link}>Lab tests</a>
              </li>
              <li>
                <a href="#prescriptions" className={styles.link}>Prescriptions</a>
              </li>
              <li>
                <a href="#reports" className={styles.link}>View reports</a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Support</h4>
            <ul className={styles.linkList}>
              <li className={styles.contactItem}>
                Email: <a href="mailto:support@mediconnect.np" className={styles.link}>support@mediconnect.np</a>
              </li>
              <li className={styles.contactItem}>
                Phone: <a href="tel:+9771XXXXXXX" className={styles.link}>+977-1-XXXXXXX</a>
              </li>
              <li className={styles.contactItem}>Kathmandu, Nepal</li>
              <li>
                <a href="#faq" className={styles.link}>Help Center</a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Legal</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>Privacy Policy</a>
              </li>
              <li>
                <a href="#" className={styles.link}>Terms</a>
              </li>
              <li>
                <a href="#contact" className={styles.link}>Contact</a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Follow Us</h4>
            <div className={styles.social}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">Facebook</a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">Twitter</a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} MediConnect. Digital healthcare platform for Nepal.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
