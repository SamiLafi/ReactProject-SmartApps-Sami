import React, { useState } from 'react';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the newly created user

      // Store user information in Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        username,
        email,
        profilePic: "https://via.placeholder.com/50",
      });

      console.log('User registered and data saved successfully');
      navigate('/');
    } catch (error) {
      setError('Error registering: ' + error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="logo">VibeNET</div>
      <h1>Registreer</h1>

      <form onSubmit={handleRegister}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mailadres"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wachtwoord"
          required
        />
        
        <div className="name-inputs">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Voornaam"
            required
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Achternaam"
            required
          />
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Gebruikersnaam"
          required
        />
        <button type="submit">Registreer</button>
        {error && <p className="error">{error}</p>}
      </form>

      <a href="/login" className="register-link">Heb je al een account? Log hier in</a>
    </div>
  );
};

export default Register;
