import { FileText, UploadCloud, X } from 'lucide-react';
import styles from './FileUploadBox.module.css';

const FileUploadBox = ({
  file,
  dragActive,
  loading,
  progress = 0,
  acceptHint = 'PDF, JPG, PNG up to 10MB',
  onDrag,
  onDrop,
  onOpen,
  onFileChange,
  onRemove,
  error,
  inputRef,
}) => {
  return (
    <div>
      <div
        className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''} ${file ? styles.hasFile : ''}`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => !loading && !file && onOpen?.()}
      >
        {file ? (
          <div className={styles.filePreview}>
            <FileText size={22} />
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileMeta}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            {!loading ? (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove?.();
                }}
                aria-label="Remove selected file"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <UploadCloud size={28} className={styles.icon} />
            <p className={styles.primaryText}>Drag and drop report file</p>
            <p className={styles.secondaryText}>or click to choose a file</p>
            <p className={styles.hint}>{acceptHint}</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className={styles.hiddenInput}
        />
      </div>

      {loading ? (
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <span className={styles.progressText}>Uploading... {Math.min(progress, 100)}%</span>
        </div>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
};

export default FileUploadBox;
