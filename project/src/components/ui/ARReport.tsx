import React, { useRef, useState } from 'react';

// AR Civic Reporting: Camera + Overlay + Annotation
const ARReport: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  // Start camera
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err: any) {
      setError('Camera access denied or unavailable.');
    }
  };

  // Capture photo from video
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL('image/png'));
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  };

  // Submit annotated photo (stub)
  const handleSubmit = () => {
    // TODO: Integrate with backend or dashboard
    alert('AR civic report submitted!');
    setPhoto(null);
    stopCamera();
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">AR Civic Reporting</h2>
      <p className="mb-4 text-gray-600">Use your camera to capture and annotate civic issues in real time.</p>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {!streaming ? (
        <button onClick={startCamera} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">Start Camera</button>
      ) : (
        <button onClick={stopCamera} className="bg-red-600 text-white px-4 py-2 rounded mb-4">Stop Camera</button>
      )}
      <div className="relative">
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border mb-2" style={{ display: streaming ? 'block' : 'none' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {photo && (
          <img src={photo} alt="Captured" className="w-full rounded-lg border mb-2" />
        )}
      </div>
      {streaming && !photo && (
        <button onClick={capturePhoto} className="bg-green-600 text-white px-4 py-2 rounded mb-4">Capture Photo</button>
      )}
      {photo && (
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Submit Report</button>
      )}
    </div>
  );
};

export default ARReport;
