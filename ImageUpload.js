import React, { useState, useRef } from 'react';
import api from '../../api/axios';

export default function ImageUpload({ onUpload, label = 'Upload Images', multiple = true, accept = 'image/*' }) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef();

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Local previews
    const localPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...localPreviews]);

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const data = await api.post('/uploads/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (onUpload) onUpload(data.urls);
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
          padding: '24px', textAlign: 'center', cursor: 'pointer',
          background: 'var(--gray-light)', transition: 'border-color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        {uploading ? (
          <div><div className="spinner" style={{ margin: '0 auto 8px' }} /><p style={{ color: 'var(--gray)' }}>Uploading...</p></div>
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
            <p style={{ fontWeight: 500, marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Click to select {multiple ? 'files' : 'a file'} · JPG, PNG, MP4 up to 50MB</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={handleFiles} />

      {previews.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {previews.map((p, i) => (
            <div key={i} style={{ width: 80, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
