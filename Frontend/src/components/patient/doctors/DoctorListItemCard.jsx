import { BriefcaseMedical, GraduationCap, Languages, MapPin, ShieldCheck, Wallet } from 'lucide-react';
import DoctorAvailabilityBadge from './DoctorAvailabilityBadge';
import QuickSlotPreview from './QuickSlotPreview';
import DoctorCardActions from './DoctorCardActions';
import { UserAvatar } from '../../common/avatar';
import styles from './DoctorListItemCard.module.css';

const DoctorListItemCard = ({ doctor, availabilitySnapshot, onAvailabilityChange, onBook, onViewProfile }) => {
  const details = doctor.professionalDetails || {};

  const name = doctor.name || 'Doctor';
  const specialization = details.specialization || 'General Medicine';
  const qualifications = Array.isArray(details.qualifications) ? details.qualifications : [];
  const experience = details.experience || 0;
  const fee = Number(details.consultationFee || doctor.consultationFee || 0);
  const department = details.department || details.hospital || 'Hospital Department';
  const languages = Array.isArray(doctor.languages) ? doctor.languages.slice(0, 3) : [];
  const bio = details.bio || 'Experienced clinician focused on patient-centered treatment and evidence-based care.';

  const qualificationsLabel =
    qualifications.length > 0 ? qualifications.slice(0, 2).join(' • ') : 'Board Certified';

  return (
    <article className={styles.card}>
      <div className={styles.profileCol}>
        <UserAvatar
          src={doctor.profileImageUrl}
          name={name}
          size="xl"
          shape="rounded"
          className={styles.avatarNode}
          imageClassName={styles.avatarImage}
          fallbackClassName={styles.avatarFallback}
        />

        {doctor.isVerified && (
          <span className={styles.verifiedBadge}>
            <ShieldCheck size={13} />
            Verified Doctor
          </span>
        )}
      </div>

      <div className={styles.contentCol}>
        <div className={styles.topRow}>
          <div>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.specialization}>{specialization}</p>
          </div>
          <DoctorAvailabilityBadge snapshot={availabilitySnapshot} />
        </div>

        <div className={styles.metaRow}>
          <span>
            <GraduationCap size={14} />
            {qualificationsLabel}
          </span>
          <span>
            <BriefcaseMedical size={14} />
            {experience} years experience
          </span>
          <span>
            <MapPin size={14} />
            {department}
          </span>
          {languages.length > 0 && (
            <span>
              <Languages size={14} />
              {languages.join(', ')}
            </span>
          )}
        </div>

        <p className={styles.bio}>{bio}</p>

        <div className={styles.footerRow}>
          <div className={styles.leftFooter}>
            <p className={styles.feeLabel}>Consultation Fee</p>
            <p className={styles.feeValue}>
              <Wallet size={14} /> NPR {fee > 0 ? fee.toLocaleString() : 'N/A'}
            </p>
            <div>
              <p className={styles.slotLabel}>Quick Slot Preview</p>
              <QuickSlotPreview
                doctorId={doctor._id}
                onStatusChange={onAvailabilityChange}
                onSlotClick={(slot) => onBook(doctor, slot)}
              />
            </div>
          </div>
          <DoctorCardActions
            onViewProfile={() => onViewProfile(doctor)}
            onBookAppointment={() => onBook(doctor)}
          />
        </div>
      </div>
    </article>
  );
};

export default DoctorListItemCard;
