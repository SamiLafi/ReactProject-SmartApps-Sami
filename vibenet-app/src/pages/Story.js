import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../services/firebaseConfig';
import '../styles/Story.css';

const db = getFirestore();
const storage = getStorage();

const Story = () => {
  const [videoStream, setVideoStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [storyContent, setStoryContent] = useState('');
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const chunks = useRef([]);

  const navigate = useNavigate();


  // Start de camera
  const startVideoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Fout bij toegang tot de camera:', err);
    }
  };

  // Stop de camera
  const stopVideoCapture = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
  };

  // Start de opname
  const startRecording = () => {
    if (videoStream) {
      const mediaRecorder = new MediaRecorder(videoStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/mp4' });
        setRecordedVideoBlob(blob);
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        chunks.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Stop de opname
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Verhaal indienen
  const handleStorySubmit = async () => {
    if (!recordedVideoBlob) {
      alert('Neem een video op voordat je deze indient.');
      return;
    }

    const currentUserId = auth.currentUser.uid;
    const storiesRef = collection(db, 'stories');

    try {
      const videoRefInStorage = ref(
        storage,
        `stories/${currentUserId}/${Timestamp.now().toMillis()}`
      );
      const uploadResult = await uploadBytes(
        videoRefInStorage,
        recordedVideoBlob
      );

      const videoDownloadURL = await getDownloadURL(uploadResult.ref);

      await setDoc(doc(db, 'friends', currentUserId), {
        videoUrl: videoDownloadURL,
      }, { merge: true });

      // Video gegevens opslaan in 'stories'
      await addDoc(storiesRef, {
        userId: currentUserId,
        content: storyContent,
        videoUrl: videoDownloadURL,
        timestamp: Timestamp.now(),
      });

      alert('Verhaal ingediend!');
      setStoryContent('');
      setRecordedVideoBlob(null);
      setRecordedVideoUrl(null);
    } catch (error) {
      console.error('Fout bij het uploaden van video:', error);
      alert('Er is iets mis gegaan, probeer het later opnieuw.');
    }
  };

  useEffect(() => {
    return () => {
      stopVideoCapture();
    };
  }, []);

  return (
    <div className='story-container'>
      <div className='story-header'>
        <button onClick={() => navigate(-1)}>←</button>
        <h2>Vibehaal</h2>
        <span></span>
      </div>

      <div className='video-preview'>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ display: recordedVideoUrl ? 'none' : 'block' }}
        ></video>
        {recordedVideoUrl && (
          <video
            src={recordedVideoUrl}
            controls
            playsInline
            style={{ display: 'block' }}
          ></video>
        )}
      </div>

      <div className='media-capture'>
        <button onClick={startVideoCapture} disabled={videoStream}>
          Start Camera
        </button>
        <button onClick={stopVideoCapture} disabled={!videoStream}>
          Stop Camera
        </button>
      </div>
      <div className='media-capture'>
        <button onClick={startRecording} disabled={isRecording || !videoStream}>
          Start Opname
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Opname
        </button>
      </div>

      <div className='story-content'>
        <textarea
          placeholder='Schrijf je verhaal...'
          value={storyContent}
          onChange={(e) => setStoryContent(e.target.value)}
        />
        <button onClick={handleStorySubmit} disabled={!recordedVideoBlob}>
          Submit Vibehaal
        </button>
      </div>
    </div>
  );
};

export default Story;
