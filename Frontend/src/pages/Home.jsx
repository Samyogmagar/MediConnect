import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  FileText,
  Bell,
  Shield,
  Users,
  Stethoscope,
  FlaskConical,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  Search,
  MapPin,
  Clock,
  ClipboardCheck,
  Activity,
  UserCheck,
  Star,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import styles from './Home.module.css';
import heroImage from '../assets/healthcare-illustration.svg';

const features = [
  {
    icon: CalendarCheck,
    title: 'Book Doctor Appointments',
    description:
      'Schedule appointments with verified doctors at your convenience. Easy online booking system.',
  },
  {
    icon: FileText,
    title: 'Digital Lab Reports',
    description:
      'Access your diagnostic reports securely online. No more lost papers or clinic visits.',
  },
  {
    icon: Bell,
    title: 'Medication Reminders',
    description:
      'Never miss a dose. Get timely reminders for your medications and prescriptions.',
  },
  {
    icon: Shield,
    title: 'Secure Role-Based Access',
    description:
      'Your data is protected with enterprise-grade security and role-based permissions.',
  },
];

const quickServices = [
  {
    icon: Stethoscope,
    title: 'Find a Doctor',
    description: 'Search verified specialists by city and expertise.',
    cta: 'Search doctors',
  },
  {
    icon: CalendarCheck,
    title: 'Book Appointment',
    description: 'Pick a time that suits your schedule in minutes.',
    cta: 'Book now',
  },
  {
    icon: Users,
    title: 'Online Consultation',
    description: 'Connect with providers through secure messaging and follow-ups.',
    cta: 'Start consult',
  },
  {
    icon: FlaskConical,
    title: 'Lab Tests',
    description: 'Book diagnostics and track your test status in one place.',
    cta: 'Browse tests',
  },
  {
    icon: FileText,
    title: 'View Reports',
    description: 'Download lab reports instantly after verification.',
    cta: 'View reports',
  },
  {
    icon: Bell,
    title: 'Medicine Reminders',
    description: 'Timely alerts to help you stay on treatment.',
    cta: 'Set reminders',
  },
];

const journeySteps = [
  {
    title: 'Search & shortlist doctors',
    description: 'Find verified specialists and compare availability.',
  },
  {
    title: 'Book appointment',
    description: 'Confirm a slot with secure booking and instant updates.',
  },
  {
    title: 'Doctor assigns tests',
    description: 'Diagnostics are sent to verified labs for quick action.',
  },
  {
    title: 'Lab uploads reports',
    description: 'Results are published securely for both patient and doctor.',
  },
  {
    title: 'Prescription & reminders',
    description: 'Receive prescriptions and automated medicine follow-ups.',
  },
];

const roles = [
  {
    icon: Users,
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    tint: 'rgba(37, 99, 235, 0.08)',
    title: 'Patients',
    tag: 'Personal care',
    description:
      'Easy access to quality healthcare. Book appointments, view lab reports, and manage your health records — all from one platform.',
    highlights: ['Instant booking', 'Unified health records', 'Medication reminders'],
    cta: 'Register as Patient',
    ctaLink: '/register',
    ctaVariant: 'primary',
  },
  {
    icon: Stethoscope,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
    tint: 'rgba(37, 99, 235, 0.08)',
    title: 'Doctors',
    tag: 'Clinical workflow',
    description:
      'Streamline your practice with digital tools. Manage appointments, patient records, and provide quality care efficiently.',
    highlights: ['Smart scheduling', 'Patient history access', 'Team collaboration'],
    cta: 'Doctor Login',
    ctaLink: '/login',
    ctaVariant: 'secondary',
    note: 'Access provided after admin verification',
  },
  {
    icon: FlaskConical,
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    tint: 'rgba(37, 99, 235, 0.08)',
    title: 'Laboratories',
    tag: 'Diagnostics',
    description:
      'Digitize your diagnostic services. Upload reports securely and improve patient satisfaction with instant access.',
    highlights: ['Secure report uploads', 'Status notifications', 'Faster turnaround'],
    cta: 'Lab Login',
    ctaLink: '/login',
    ctaVariant: 'secondary',
    note: 'Access provided after admin verification',
  },
];

const stats = [
  { value: '18K+', label: 'Patients supported' },
  { value: '900+', label: 'Verified clinicians' },
  { value: '96%', label: 'Report delivery rate' },
  { value: '24/7', label: 'Access to records' },
];

const missionPoints = [
  'Digitize medical records with secure, instant access.',
  'Coordinate appointments, diagnostics, and prescriptions in one hub.',
  'Improve patient follow-up through automated reminders.',
  'Enable role-based workflows for every care team member.',
];

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

const featuredDoctors = [
  {
    name: 'Dr. Anisha Shrestha',
    specialty: 'Cardiology',
    experience: '12+ years',
    hospital: 'Norvic International Hospital',
    availability: 'Next slot: Tomorrow, 10:30 AM',
    badge: 'Verified',
  },
  {
    name: 'Dr. Prakash Koirala',
    specialty: 'Orthopedics',
    experience: '9+ years',
    hospital: 'Grande City Hospital',
    availability: 'Next slot: Today, 5:00 PM',
    badge: 'Top Rated',
  },
  {
    name: 'Dr. Sushmita Rai',
    specialty: 'Pediatrics',
    experience: '10+ years',
    hospital: 'Kanti Children Hospital',
    availability: 'Next slot: Friday, 9:00 AM',
    badge: 'Verified',
  },
];

const labHighlights = [
  {
    icon: FlaskConical,
    title: 'Book diagnostics in minutes',
    description: 'Choose tests, preferred lab, and available slots with transparent pricing.',
  },
  {
    icon: ClipboardCheck,
    title: 'Track test status',
    description: 'Assigned, in progress, and completed updates stay visible in your dashboard.',
  },
  {
    icon: FileText,
    title: 'Download verified reports',
    description: 'Reports are uploaded securely and shared with your doctor instantly.',
  },
  {
    icon: Bell,
    title: 'Doctor notified automatically',
    description: 'Doctors receive alerts when results are ready for review.',
  },
];

const trustItems = [
  {
    icon: BadgeCheck,
    title: 'Verified doctors',
    description: 'Clinical credentials are reviewed before onboarding.',
  },
  {
    icon: UserCheck,
    title: 'Admin-approved labs',
    description: 'Lab teams are verified to ensure report accuracy.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure patient data',
    description: 'Role-based access and audit-ready records protect privacy.',
  },
  {
    icon: Bell,
    title: 'Real-time notifications',
    description: 'Stay updated on appointments, tests, and prescriptions.',
  },
  {
    icon: FileText,
    title: 'Transparent records',
    description: 'Access your medical history anytime, anywhere.',
  },
  {
    icon: Shield,
    title: 'Role-based dashboards',
    description: 'Patients, doctors, labs, and admins see what they need.',
  },
];

const howSteps = [
  {
    icon: Users,
    title: 'Create patient account',
    description: 'Register as a patient and complete your profile.',
  },
  {
    icon: Search,
    title: 'Search and book',
    description: 'Find specialists and secure a time slot instantly.',
  },
  {
    icon: Activity,
    title: 'Consult and test',
    description: 'Consult your doctor and complete assigned lab tests.',
  },
  {
    icon: FileText,
    title: 'View reports & reminders',
    description: 'Access reports and receive prescription reminders.',
  },
];

const previewCards = [
  {
    title: 'Patient dashboard',
    description: 'Upcoming appointments, reminders, and reports at a glance.',
  },
  {
    title: 'Appointments timeline',
    description: 'Track approval, completion, and follow-up notes.',
  },
  {
    title: 'Diagnostics center',
    description: 'Status updates and downloadable lab reports.',
  },
  {
    title: 'Prescriptions & reminders',
    description: 'Medication schedules with acknowledgement tracking.',
  },
];

const testimonials = [
  {
    name: 'Rojina Shrestha',
    role: 'Patient, Kathmandu',
    quote:
      'Booking a cardiology appointment was quick, and my lab report was ready in the app the same day.',
  },
  {
    name: 'Dr. Manoj Adhikari',
    role: 'Orthopedic Specialist',
    quote:
      'MediConnect keeps my appointments and lab coordination in one workflow. It saves me hours every week.',
  },
  {
    name: 'Aayusha Lab Services',
    role: 'Lab Partner, Lalitpur',
    quote:
      'Uploading reports and notifying doctors is seamless, and patients can access results instantly.',
  },
];

const faqs = [
  {
    question: 'How do I book an appointment?',
    answer: 'Register as a patient, search for a doctor, and select a time slot to confirm your booking.',
  },
  {
    question: 'Can I reschedule or cancel?',
    answer: 'Yes. Patients can reschedule or cancel pending appointments from the dashboard.',
  },
  {
    question: 'How do I view my lab reports?',
    answer: 'Reports are available in your dashboard once the lab uploads and verifies them.',
  },
  {
    question: 'Are doctors verified?',
    answer: 'Yes. Doctors and labs are verified by administrators before they can access the platform.',
  },
  {
    question: 'Can doctors and labs self-register?',
    answer: 'No. Only patients can self-register. Provider access is granted after verification.',
  },
  {
    question: 'Is my data secure?',
    answer: 'MediConnect uses role-based access and secure storage to protect patient records.',
  },
];

const team = [
  { name: 'Clinical Director', role: 'Care Strategy', tag: 'Leadership' },
  { name: 'Health Systems Lead', role: 'Operations', tag: 'Workflow' },
  { name: 'Product Engineer', role: 'Platform', tag: 'Technology' },
  { name: 'Data Specialist', role: 'Insights', tag: 'Analytics' },
];

const vision = [
  {
    title: 'Telemedicine Ready',
    description: 'Video consultations and remote care built into the platform roadmap.',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Smart triage and decision support to speed up clinical decisions.',
  },
  {
    title: 'Unified Payments',
    description: 'Digital billing, receipts, and patient-friendly payment options.',
  },
  {
    title: 'Mobile Care Access',
    description: 'A companion mobile app so patients stay connected on the go.',
  },
  {
    title: 'Advanced Analytics',
    description: 'Dashboards that highlight operational and clinical performance.',
  },
  {
    title: 'Scalable Infrastructure',
    description: 'Designed to support regional clinics and national health systems.',
  },
];

const Home = () => {
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false);

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero} id="home">
        <div className={styles.heroContainer}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <span className={styles.badge}>Connected care platform</span>
              <h1 className={styles.heroTitle}>
                Nepal’s trusted
                <span> digital healthcare</span> network
              </h1>
              <p className={styles.heroDescription}>
                Book appointments, access lab reports, and manage prescriptions in a
                secure system trusted by verified doctors and labs across Nepal.
              </p>
              <div className={styles.heroCta}>
                <Link to="/login">
                  <Button variant="primary" size="lg">Book Appointment</Button>
                </Link>
                <a href="#lab-tests">
                  <Button variant="secondary" size="lg">Book Lab Test</Button>
                </a>
              </div>
              <div className={styles.heroSearch}>
                <div className={styles.searchField}>
                  <Search size={16} />
                  <input type="text" placeholder="Doctor, specialty, or hospital" />
                </div>
                <div className={styles.searchField}>
                  <MapPin size={16} />
                  <input type="text" placeholder="City in Nepal" />
                </div>
                <Button variant="primary" size="md">Search</Button>
              </div>
              <div className={styles.heroHighlights}>
                <div className={styles.heroHighlight}>
                  <ShieldCheck size={16} /> Secure role-based access
                </div>
                <div className={styles.heroHighlight}>
                  <HeartPulse size={16} /> Continuous patient follow-up
                </div>
                <div className={styles.heroHighlight}>
                  <Sparkles size={16} /> Verified doctors & labs
                </div>
              </div>
            </div>

            <div className={styles.heroMedia}>
              <img
                src={heroImage}
                alt="Healthcare illustration"
                className={styles.heroImg}
              />
              <div className={styles.heroCardPrimary}>
                <BadgeCheck size={20} />
                <div>
                  <p>Verified care teams</p>
                  <span>Clinicians, labs, and admins aligned</span>
                </div>
              </div>
              <div className={styles.heroCardSecondary}>
                <Clock size={18} />
                <div>
                  <p>Fast appointments</p>
                  <span>Flexible slots updated daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.quickServices}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderLeft}>
            <h2 className={styles.sectionTitleLeft}>Quick services for patients</h2>
            <p className={styles.sectionLead}>
              Everything you need to navigate appointments, labs, and prescriptions without delays.
            </p>
          </div>
          <div className={styles.quickGrid}>
            {quickServices.map((service) => (
              <div key={service.title} className={styles.quickCard}>
                <div className={styles.quickIcon}>
                  <service.icon size={22} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className={styles.quickCta}>{service.cta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.statsGrid}>
            {stats.map((item) => (
              <div key={item.label} className={styles.statCard}>
                <span className={styles.statValue}>{item.value}</span>
                <span className={styles.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.missionSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.missionGrid}>
            <div>
              <h2 className={styles.sectionTitleLeft}>Why MediConnect</h2>
              <p className={styles.sectionLead}>
                We are building a unified platform that reduces administrative delays,
                accelerates clinical decisions, and delivers a better experience for patients.
              </p>
              <div className={styles.missionList}>
                {missionPoints.map((point) => (
                  <div key={point} className={styles.missionItem}>
                    <CheckCircle2 size={18} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.missionCard}>
              <h3>Integrated care journey</h3>
              <p>
                MediConnect combines patient scheduling, diagnostics coordination,
                and communication into one secure workspace built for Nepal.
              </p>
              <div className={styles.journeyList}>
                {journeySteps.map((step) => (
                  <div key={step.title} className={styles.journeyItem}>
                    <span>{step.title}</span>
                    <p>{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="prescriptions" className={styles.features}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Core <span>Capabilities</span></h2>
          <p className={styles.sectionSubtitle}>
            Purpose-built modules that keep every stakeholder connected.
          </p>

          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <feature.icon className={styles.featureIcon} size={24} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className={styles.roles}>
        <div className={styles.sectionContainer}>
          <div className={styles.rolesHeader}>
            <span className={styles.sectionEyebrow}>For every stakeholder</span>
            <h2 className={styles.sectionTitle}>Who we serve with <span>MediConnect</span></h2>
            <p className={styles.sectionSubtitle}>
              Purpose-built journeys that support patients, clinicians, and diagnostic teams.
            </p>
          </div>

          <div className={styles.roleGrid}>
            {roles.map((role) => (
              <div
                key={role.title}
                className={styles.roleCard}
                style={{ '--role-gradient': role.gradient, '--role-tint': role.tint }}
              >
                <div className={styles.roleHeader}>
                  <div
                    className={styles.roleIconWrapper}
                    style={{ background: role.gradient }}
                  >
                    <role.icon size={30} />
                  </div>
                  <span className={styles.roleTag}>{role.tag}</span>
                </div>
                <h3 className={styles.roleTitle}>{role.title}</h3>
                <p className={styles.roleDescription}>{role.description}</p>
                <ul className={styles.roleHighlights}>
                  {role.highlights.map((highlight) => (
                    <li key={highlight} className={styles.roleHighlightItem}>
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className={styles.roleFooter}>
                  <Link to={role.ctaLink}>
                    <Button variant={role.ctaVariant} fullWidth>
                      {role.cta}
                    </Button>
                  </Link>
                  {role.note && (
                    <p className={styles.roleNote}>{role.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.doctorsSection} id="find-doctors">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderSplit}>
            <div>
              <h2 className={styles.sectionTitleLeft}>Featured doctors & specialties</h2>
              <p className={styles.sectionLead}>
                Connect with trusted specialists and see available slots before you book.
              </p>
            </div>
            <div className={styles.specialtyDropdownWrap}>
              <button
                type="button"
                className={styles.specialtyDropdownButton}
                onClick={() => setIsSpecialtyOpen((prev) => !prev)}
                aria-expanded={isSpecialtyOpen}
              >
                <span>Find doctor by specialty</span>
                <ChevronDown size={16} className={styles.specialtyDropdownIcon} />
              </button>
              {isSpecialtyOpen && (
                <div className={styles.specialtyDropdownList}>
                  {specializations.map((specialty) => (
                    <Link
                      key={specialty}
                      to={`/patient/doctors?specialization=${encodeURIComponent(specialty)}`}
                      className={styles.specialtyDropdownItem}
                    >
                      <span>{specialty}</span>
                      <ChevronDown size={16} className={styles.specialtyItemIcon} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.doctorGrid}>
            {featuredDoctors.map((doctor) => (
              <div key={doctor.name} className={styles.doctorCard}>
                <div className={styles.doctorHeader}>
                  <div>
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialty}</p>
                  </div>
                  <span className={styles.doctorBadge}>{doctor.badge}</span>
                </div>
                <div className={styles.doctorMeta}>
                  <span>{doctor.experience}</span>
                  <span>{doctor.hospital}</span>
                </div>
                <div className={styles.doctorAvailability}>
                  <Clock size={14} /> {doctor.availability}
                </div>
                <Link to="/login" className={styles.doctorCta}>Book now</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.labSection} id="lab-tests">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderSplit}>
            <div>
              <h2 className={styles.sectionTitleLeft}>Lab tests & digital reports</h2>
              <p className={styles.sectionLead}>
                Book diagnostics, track status, and download verified reports without visiting the lab.
              </p>
            </div>
            <div className={styles.labMeta}>
              <div>
                <span className={styles.labMetaValue}>120+</span>
                <p>Diagnostic partners</p>
              </div>
              <div>
                <span className={styles.labMetaValue}>6 hrs</span>
                <p>Average report turnaround</p>
              </div>
            </div>
          </div>
          <div className={styles.labGrid}>
            {labHighlights.map((item) => (
              <div key={item.title} className={styles.labCard}>
                <div className={styles.labIcon}>
                  <item.icon size={20} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.labCtaRow}>
            <Link to="/login">
              <Button variant="primary">Book Lab Test</Button>
            </Link>
            <span className={styles.labNote}>Optional home sample collection for selected labs.</span>
          </div>
        </div>
      </section>

      <section className={styles.trustSection} id="trust">
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Trusted by care teams in Nepal</h2>
          <p className={styles.sectionSubtitle}>
            Built with verification, security, and transparency at every step.
          </p>
          <div className={styles.trustGrid}>
            {trustItems.map((item) => (
              <div key={item.title} className={styles.trustCard}>
                <div className={styles.trustIcon}>
                  <item.icon size={20} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.howSection} id="how-it-works">
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>How MediConnect works</h2>
          <p className={styles.sectionSubtitle}>
            A simple patient journey that keeps doctors and labs coordinated.
          </p>
          <div className={styles.howGrid}>
            {howSteps.map((step) => (
              <div key={step.title} className={styles.howCard}>
                <div className={styles.howIcon}>
                  <step.icon size={20} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.previewSection} id="reports">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderSplit}>
            <div>
              <h2 className={styles.sectionTitleLeft}>Product preview</h2>
              <p className={styles.sectionLead}>
                A single workspace for appointments, reports, and prescriptions.
              </p>
            </div>
            <div className={styles.previewBadge}>
              <BadgeCheck size={18} /> Live role-based dashboards
            </div>
          </div>
          <div className={styles.previewGrid}>
            {previewCards.map((card) => (
              <div key={card.title} className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <span>{card.title}</span>
                  <div className={styles.previewDots}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testimonialSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderSplit}>
            <div>
              <h2 className={styles.sectionTitleLeft}>What care teams say</h2>
              <p className={styles.sectionLead}>
                Real feedback from patients, doctors, and lab partners across Nepal.
              </p>
            </div>
            <div className={styles.ratingBadge}>
              <Star size={18} /> 4.8 average satisfaction score
            </div>
          </div>
          <div className={styles.testimonialGrid}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className={styles.testimonialCard}>
                <p>“{testimonial.quote}”</p>
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.statRow}>
            {stats.map((item) => (
              <div key={item.label} className={styles.statMini}>
                <span>{item.value}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.faqSection} id="faq">
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to know before getting started.
          </p>
          <div className={styles.faqGrid}>
            {faqs.map((faq) => (
              <div key={faq.question} className={styles.faqCard}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.teamSection} id="prescriptions">
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Meet the core team</h2>
          <p className={styles.sectionSubtitle}>
            A multidisciplinary team shaping safer, smarter healthcare delivery.
          </p>
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.name} className={styles.teamCard}>
                <div className={styles.teamAvatar}>{member.name.charAt(0)}</div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
                <span>{member.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.visionSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.visionHeader}>
            <h2 className={styles.sectionTitleLeft}>Our vision forward</h2>
            <p className={styles.sectionLead}>
              We are evolving MediConnect to scale across clinics, labs, and national systems.
            </p>
          </div>
          <div className={styles.visionGrid}>
            {vision.map((item) => (
              <div key={item.title} className={styles.visionCard}>
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
                <Button variant="secondary" size="lg">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
