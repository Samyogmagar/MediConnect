import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ImagePlus, LoaderCircle, Trash2, Upload, X } from 'lucide-react';
import authService from '../../../services/authService';
import { useToast } from '../feedback/ToastProvider';
import { useModal } from '../feedback/ModalProvider';
import UserAvatar from './UserAvatar';
import styles from './ProfilePhotoUploader.module.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ProfilePhotoUploader = ({
  currentImage,
  name,
  onUploaded,
  onRemoved,
  size = 'lg',
  shape = 'rounded',
  className = '',
}) => {
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const activeImage = useMemo(() => {
    if (previewUrl) return previewUrl;
    return currentImage || '';
  }, [previewUrl, currentImage]);

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, and WEBP images are allowed.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'Image size must be 5MB or smaller.';
    }
    return '';
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    const validationError = validateFile(file);
    if (validationError) {
      setFeedback({ type: 'error', text: validationError });
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setSelectedFile(file);
    setFeedback({ type: '', text: '' });
  };

  const clearPending = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setFeedback({ type: '', text: '' });

    try {
      const response = await authService.uploadProfilePhoto(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      clearPending();
      setFeedback({ type: 'success', text: 'Profile photo updated successfully.' });

      if (onUploaded) {
        await onUploaded(response?.data?.user);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to upload profile photo. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!activeImage || previewUrl) {
      clearPending();
      return;
    }

    const { confirmed } = await showConfirm({
      title: 'Remove profile photo?',
      message: 'Remove your profile photo and use initials instead?',
      confirmText: 'Remove',
      cancelText: 'Keep photo',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;

    setRemoving(true);
    setFeedback({ type: '', text: '' });

    try {
      const response = await authService.removeProfilePhoto();
      setFeedback({ type: 'success', text: 'Profile photo removed.' });
      showToast({
        type: 'success',
        title: 'Photo removed',
        message: 'Your profile photo has been removed.',
      });
      if (onRemoved) {
        await onRemoved(response?.data?.user);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to remove profile photo. Please try again.';
      setFeedback({
        type: 'error',
        text: message,
      });
      showToast({
        type: 'error',
        title: 'Remove failed',
        message,
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      <div className={styles.previewArea}>
        <div className={styles.avatarShell}>
          <UserAvatar src={activeImage} name={name} size={size} shape={shape} />
          <span className={styles.cameraBadge}>
            <Camera size={12} />
          </span>
        </div>

        <div className={styles.meta}>
          <h4 className={styles.heading}>Profile Photo</h4>
          <p className={styles.helper}>JPG, PNG, WEBP up to 5MB. Use a clear headshot for best visibility.</p>

          <div className={styles.actions}>
            <button type="button" className={styles.primaryBtn} onClick={handlePickFile} disabled={uploading || removing}>
              <ImagePlus size={14} />
              {currentImage ? 'Change Photo' : 'Upload Photo'}
            </button>

            {selectedFile && (
              <>
                <button type="button" className={styles.saveBtn} onClick={handleUpload} disabled={uploading || removing}>
                  {uploading ? <LoaderCircle size={14} className={styles.spin} /> : <Upload size={14} />}
                  {uploading ? `Uploading ${uploadProgress}%` : 'Save Photo'}
                </button>
                <button type="button" className={styles.ghostBtn} onClick={clearPending} disabled={uploading || removing}>
                  <X size={14} />
                  Cancel
                </button>
              </>
            )}

            {!selectedFile && currentImage && (
              <button type="button" className={styles.dangerBtn} onClick={handleRemove} disabled={uploading || removing}>
                {removing ? <LoaderCircle size={14} className={styles.spin} /> : <Trash2 size={14} />}
                {removing ? 'Removing...' : 'Remove Photo'}
              </button>
            )}
          </div>

          {feedback.text && (
            <p className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`.trim()}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />
    </div>
  );
};

export default ProfilePhotoUploader;
