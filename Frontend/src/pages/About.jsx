import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Stethoscope,
  FlaskConical,
  CalendarCheck,
  FileText,
  Bell,
  Activity,
  HeartPulse,
  Lock,
  Sparkles,
  Rocket,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import styles from './About.module.css';

const roles = [
  {
    icon: Users,
    title: 'Admins',
    description:
      'Oversee system performance, manage users, and keep operations compliant and efficient.',
  },
  {
    icon: Stethoscope,
    title: 'Doctors',
    description:
      'Create records, manage appointments, and deliver care with fast access to patient history.',
  },
  {
    icon: HeartPulse,
    title: 'Patients',
    description:
      'Book visits, access results, and receive medication reminders from one trusted place.',
  },
  {
    icon: FlaskConical,
    title: 'Laboratory Technicians',
    description:
      'Handle test requests, upload reports securely, and support faster clinical decisions.',
  },
];

const features = [
  {
    icon: CalendarCheck,
    title: 'Appointment Management',
    description: 'Smart scheduling, availability controls, and real-time appointment updates.',
  },
  {
    icon: FileText,
    title: 'Medical Records',
    description: 'Centralized profiles with structured histories, prescriptions, and lab results.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Timely alerts for follow-ups, prescriptions, and role-specific updates.',
  },
  {
    icon: Activity,
    title: 'Diagnostics Workflow',
    description: 'Order, process, and track tests with clear lab coordination.',
  },
];

const stats = [
  { value: '4', label: 'Core roles supported' },
  { value: '6', label: 'Key healthcare modules' },
  { value: '24/7', label: 'Access to care tools' },
  { value: 'JWT', label: 'Secure authentication' },
];

const roadmap = [
  {
    icon: Sparkles,
    title: 'Telemedicine',
    description: 'Remote consultations and secure video visits for patients and doctors.',
  },
  {
    icon: Rocket,
    title: 'AI Assistance',
    description: 'Insight-driven diagnostics and care recommendations built into workflows.',
  },
  {
    icon: Lock,
    title: 'Payments',
    description: 'Integrated payment options and digital receipts for medical services.',
  },
];

const About = () => {
  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>About MediConnect</span>
            <h1 className={styles.heroTitle}>
              A connected platform for patient-centered healthcare
            </h1>
            <p className={styles.heroDescription}>
              MediConnect brings appointments, records, diagnostics, and notifications into
              one secure workspace so healthcare teams collaborate faster and patients stay
              informed.
            </p>
            <div className={styles.heroCta}>
              <Link to="/register">
                <Button variant="primary" size="lg">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">Contact Us</Button>
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <img
              className={styles.heroImage}
              src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=700&q=80"
              alt="Healthcare team collaborating"
            />
            <div className={styles.heroCard}>
              <ShieldCheck size={22} />
              <div>
                <p className={styles.heroCardTitle}>Secure by design</p>
                <p className={styles.heroCardText}>Role-based access and encrypted data flows.</p>
              </div>
            </div>
            <div className={`${styles.heroCard} ${styles.heroCardSecondary}`}>
              <Bell size={22} />
              <div>
                <p className={styles.heroCardTitle}>Real-time updates</p>
                <p className={styles.heroCardText}>Stay aligned across every care step.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.splitSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.splitGrid}>
            <div className={styles.splitCard}>
              <h2 className={styles.sectionTitle}>The challenge</h2>
              <p className={styles.sectionText}>
                Fragmented communication, manual records, and disconnected tools slow down
                patient care and add operational strain.
              </p>
              <ul className={styles.list}>
                <li>Appointments managed across multiple channels</li>
                <li>Paper records that delay access to critical data</li>
                <li>Limited visibility between clinics and labs</li>
              </ul>
            </div>
            <div className={`${styles.splitCard} ${styles.splitCardAccent}`}>
              <h2 className={styles.sectionTitle}>Our solution</h2>
              <p className={styles.sectionText}>
                MediConnect delivers a unified workflow with automation, centralized records,
                and secure collaboration for every role.
              </p>
              <ul className={styles.list}>
                <li>One platform for appointments, records, and diagnostics</li>
                <li>Instant notifications for every action</li>
                <li>Clear accountability through role-based access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.rolesSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitleCenter}>Who we serve</h2>
          <p className={styles.sectionSubtitle}>
            Built for every stakeholder in modern healthcare.
          </p>
          <div className={styles.roleGrid}>
            {roles.map((role) => (
              <div key={role.title} className={styles.roleCard}>
                <role.icon className={styles.roleIcon} size={30} />
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitleCenter}>Core features</h2>
          <p className={styles.sectionSubtitle}>
            Everything teams need to manage care in one place.
          </p>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <feature.icon className={styles.featureIcon} size={26} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.trustSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.trustCard}>
            <div>
              <h2 className={styles.sectionTitle}>Security and trust</h2>
              <p className={styles.sectionText}>
                We follow privacy-first practices with secure authentication, access control,
                and protected document storage.
              </p>
            </div>
            <div className={styles.trustList}>
              <div className={styles.trustItem}>
                <ShieldCheck size={20} />
                <span>JWT-based authentication and session security</span>
              </div>
              <div className={styles.trustItem}>
                <Lock size={20} />
                <span>Role-based access for clinical accountability</span>
              </div>
              <div className={styles.trustItem}>
                <FileText size={20} />
                <span>Encrypted storage for medical documents</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.sectionContainer}>
          <div className={styles.storyGrid}>
            <div>
              <h2 className={styles.sectionTitle}>Our story</h2>
              <p className={styles.sectionText}>
                MediConnect began as a final-year project focused on solving everyday
                healthcare inefficiencies. It blends full-stack engineering with practical
                workflow design for real clinical environments.
              </p>
            </div>
            <div className={styles.storyCards}>
              <div className={styles.storyCard}>
                <span className={styles.storyTag}>Research</span>
                <p>Designed from interviews and feedback across healthcare roles.</p>
              </div>
              <div className={styles.storyCard}>
                <span className={styles.storyTag}>Execution</span>
                <p>Built with scalable services, modern UI, and secure data handling.</p>
              </div>
              <div className={styles.storyCard}>
                <span className={styles.storyTag}>Impact</span>
                <p>Created to streamline workflows and improve patient experiences.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.roadmapSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitleCenter}>Future roadmap</h2>
          <p className={styles.sectionSubtitle}>
            Expanding access to care through smart, scalable features.
          </p>
          <div className={styles.roadmapGrid}>
            {roadmap.map((item) => (
              <div key={item.title} className={styles.roadmapCard}>
                <item.icon className={styles.roadmapIcon} size={26} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.ctaCard}>
            <div>
              <h2>Bring every healthcare workflow together</h2>
              <p>
                Join MediConnect and deliver faster, safer, and more connected patient care.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link to="/register">
                <Button variant="primary" size="lg">Create Account</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">Talk to Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
