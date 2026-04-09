import { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import styles from './UploadReportForm.module.css';

const UploadReportForm = ({
  completedTests = [],
  onSubmit,
  loading,
}) => {
  const [selectedTestId, setSelectedTestId] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (f) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(f.type)) {
      alert('Only PDF, JPG, and PNG files are allowed.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }
    setFile(f);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTestId || !file) return;
    onSubmit && onSubmit({
      testId: selectedTestId,
      file,
      notes,
      findings,
      recommendations,
    });
  };

  const handleClear = () => {
    setSelectedTestId('');
    setFile(null);
    setNotes('');
    setFindings('');
    setRecommendations('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Select Test <span className={styles.required}>*</span>
        </label>
        <select
          className={styles.select}
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          required
        >
          <option value="">Choose a test ready for report upload</option>
          {completedTests.map((test) => (
            <option key={test._id} value={test._id}>
              {test.patientId?.name || 'Unknown'} — {test.testName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Findings</label>
        <textarea
          className={styles.textarea}
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          placeholder="Summarize key findings from the test results..."
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Recommendations</label>
        <textarea
          className={styles.textarea}
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="Add any follow-up recommendations for the doctor..."
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Upload Report (PDF/Image) <span className={styles.required}>*</span>
        </label>
        <div
          className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''} ${file ? styles.hasFile : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          {file ? (
            <div className={styles.filePreview}>
              <FileText size={24} />
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                type="button"
                className={styles.removeFile}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.dropContent}>
              <Upload size={32} className={styles.dropIcon} />
              <span className={styles.dropText}>Click to upload file</span>
              <span className={styles.dropHint}>PDF or Image (Max 10MB)</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Lab Notes (Optional)</label>
        <textarea
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional observations or remarks about the test results..."
          rows={4}
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!selectedTestId || !file || loading}
        >
          <Upload size={16} />
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
        >
          Clear Form
        </button>
      </div>
    </form>
  );
};

export default UploadReportForm;
