import { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl.util';
import styles from './ReportUploadPanel.module.css';

const ReportUploadPanel = ({ test, onSubmit, loading }) => {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('Only PDF, JPG, and PNG files are allowed.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size must be less than 10MB.');
      return;
    }
    setFileError('');
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onSubmit?.({
      testId: test?._id,
      file,
      notes: notes.trim(),
      findings: findings.trim(),
      recommendations: recommendations.trim(),
    });
  };

  const handleClear = () => {
    setFile(null);
    setNotes('');
    setFindings('');
    setRecommendations('');
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Upload Final Report</h3>
          <p className={styles.subtitle}>Attach the completed report for this test order.</p>
        </div>
        {test?.report?.url && (
          <a className={styles.viewLink} href={resolveAssetUrl(test.report.url)} target="_blank" rel="noreferrer">
            View Current Report
          </a>
        )}
      </div>

      <div className={styles.fileRow}>
        <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
          <Upload size={24} />
          <div>
            <span className={styles.dropTitle}>Drop or select file</span>
            <span className={styles.dropHint}>PDF/JPG/PNG up to 10MB</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />

        {file && (
          <div className={styles.filePreview}>
            <FileText size={18} />
            <div>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileMeta}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button type="button" className={styles.removeBtn} onClick={() => setFile(null)}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      {fileError && <p className={styles.errorText}>{fileError}</p>}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Findings</label>
        <textarea
          className={styles.textarea}
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          placeholder="Summarize observed findings..."
          rows={3}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Recommendations</label>
        <textarea
          className={styles.textarea}
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="Add follow-up or additional notes for the doctor..."
          rows={3}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Lab Notes</label>
        <textarea
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes for this report..."
          rows={2}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={!file || loading}>
          {loading ? 'Uploading...' : 'Upload Report'}
        </button>
        <button type="button" className={styles.clearBtn} onClick={handleClear}>
          Clear
        </button>
      </div>
    </form>
  );
};

export default ReportUploadPanel;
