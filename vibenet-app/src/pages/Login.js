import React, { useState } from 'react';
import { auth } from '../services/firebaseConfig'; // Import googleProvider
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';  // Import the useUser hook
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();  // Access setUser to update the logged-in user in the context

  // Handle login with email/password
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in successfully', user);
      
      // Set the user in the context
      setUser(user);

      navigate('/home');
    } catch (error) {
      setError('Error logging in: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="logo">VibeNET</div>
      <h1>Inloggen</h1>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Inloggen</button>
        {error && <p className="error">{error}</p>}
      </form>

      <a href="/register" className="register-link">
        Geen account? Registreer hier
      </a>
    </div>
  );
};

export default Login;
