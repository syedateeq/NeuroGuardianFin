import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveUploadToFirestore, updateUploadResult, fetchUploadsFromFirestore } from '../services/firestoreService';
import './ScanUploader.css';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const ScanUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [firestoreDocId, setFirestoreDocId] = useState(null);
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchUploadsFromFirestore();
      setUploads(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
      setFirestoreDocId(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setUploadStage('Converting Image');
      
      // 1. Properly await and convert image to Base64 BEFORE saving
      const base64String = await fileToBase64(file);

      setUploadStage('Saving to Firestore');

      // 2. Ensure correct data object is passed to Firestore function
      const uploadData = {
        image_url: base64String,
        file_name: file.name,
        file_size: file.size,
        metadata: { status: 'pending analysis' }
      };

      const docId = await saveUploadToFirestore(uploadData);
      setFirestoreDocId(docId);

      setUploadStage('Analyzing Scan');

      // 3. Send raw file to Django API
      const formData = new FormData();
      formData.append('scan', file);

      const response = await axios.post('http://127.0.0.1:8000/api/upload-scan/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setResult(response.data.data);
        
        // 4. Update Firestore with final ML metadata
        await updateUploadResult(docId, {
          status: 'completed',
          ...response.data.data
        });
        
        loadHistory();
      } else {
        throw new Error(response.data.error || 'Server Analysis Failed');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'An upload error occurred.');
    } finally {
      setLoading(false);
      setUploadStage('');
    }
  };

  return (
    <div className="scan-uploader">
      <h2>🧠 Upload Brain Scan</h2>
      <div className="upload-area">
        <input type="file" onChange={handleFileChange} id="file-input" accept="image/*" />
        <label htmlFor="file-input" className="file-label">
          {file ? `📂 ${file.name}` : '🗂️ Choose an Image'}
        </label>
        {preview && <img src={preview} alt="Preview" className="preview-img" style={{maxWidth: '100%', marginTop: '10px'}} />}
      </div>

      <button onClick={handleUpload} disabled={!file || loading} className="upload-btn">
        {loading ? `⏳ ${uploadStage}...` : '🔬 Analyze Scan'}
      </button>

      {firestoreDocId && <div className="success">✅ Firestore Doc ID: {firestoreDocId}</div>}
      {error && <div className="error-message">❌ {error}</div>}

      {result && (
        <div className="result-card" style={{marginTop: '20px'}}>
          <h3>📊 Analysis Details</h3>
          <p><strong>Stroke Type:</strong> {result.stroke_type}</p>
          <p><strong>Severity:</strong> {result.severity}</p>
          <p><strong>Recommendation:</strong> {result.recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default ScanUploader;