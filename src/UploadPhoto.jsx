import { useState, useRef, useEffect } from 'react'
import './UploadPhoto.css'

function UploadPhoto() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setStatus('')
    setResult(null)
  }

  async function handleUpload() {
    if (!file) {
      setStatus('Please select a photo first.')
      return
    }
    setUploading(true)
    setStatus('Uploading…')
    setResult(null)

    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        setStatus(`Error: ${data.error || 'Upload failed.'}`)
      } else {
        setStatus('Upload successful!')
        setResult(data)
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  function handleReset() {
    setFile(null)
    setPreview(null)
    setStatus('')
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="upload-photo">
      <h2>Upload Photo</h2>

      <label className="file-label">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {file ? file.name : 'Choose a photo'}
      </label>

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" />
        </div>
      )}

      <div className="upload-actions">
        <button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        {(file || result) && (
          <button className="reset-btn" onClick={handleReset} disabled={uploading}>
            Reset
          </button>
        )}
      </div>

      {status && <p className={`upload-status ${result ? 'success' : ''}`}>{status}</p>}

      {result && (
        <div className="upload-result">
          <p><strong>ID:</strong> {result.id}</p>
          <p><strong>Blob:</strong> {result.blobName}</p>
          <p>
            <strong>URL:</strong>{' '}
            <a href={result.urlOrSignedUrl} target="_blank" rel="noreferrer">
              {result.urlOrSignedUrl}
            </a>
          </p>
          <p><strong>Type:</strong> {result.contentType}</p>
          <p><strong>Size:</strong> {(result.size / 1024).toFixed(1)} KB</p>
          <p><strong>Uploaded:</strong> {new Date(result.uploadedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}

export default UploadPhoto
