// import axios from 'axios';
// import React, { useState } from 'react'
// import {useNavigate,Link} from 'react-router-dom';


// const Register = () => {
//     const [ fromData,setFromData]=useState({name:'',email:'',password:''});
//     const [error,setError]=useState('');
//     const[loading,setLoading] =useState(false)
//     const navigate = useNavigate();

//     const handleSubmit = async(e)=>{
//         e.preventDefault();
//         setError('');
//         setLoading(true)
//         try{
//             const res = await axios.post('http://localhost:5000/api/auth/register',{name:fromData.name,email:fromData.email,password:fromData.password});
//             if(res.status === 201 || res.status===200){

//                 alert('register sucessfully. | login now');
//                 navigate('/login');
//             }

//         } catch(err){
//             console.error("error detelis",err.resposnse);
//             setError(err.resposnse?.message || 'something went worng')
//         }finally{setLoading(false)}
//     }
//   return (
//     <div>
//         <h2>Register </h2>
//         {error && <p className='text-red'>{error}</p>}
//         <form onSubmit={handleSubmit}>
//             <div>
//                 <label htmlFor=""> Name</label>
//                 <input type="text"   required onChange={(e)=>setFromData({...fromData,name:e.target.value})}/>
//             </div>
//             <div>
//                 <label htmlFor=""> Email:</label>
//                 <input type="email" required onChange={(e)=>setFromData({...fromData,email:e.target.value})} />
//             </div>
//             <div>
//                 <label htmlFor=""> password :</label>
//                 <input type="password" required onChange={(e)=>setFromData({...fromData,password:e.target.value})} />
//             </div>
//             <button type='submit' > Account crated</button>
//         </form>
//         <p>
//             <Link to="/login">Login </Link>
//         </p>
//     </div>
//   )
// }

// export default Register

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Used for automatic redirection

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (res.status === 201 || res.status === 200) {
        alert("🎯 Account created successfully! Redirecting to login page...");
        // ✅ CRITICAL FIX: Automatically redirects the user to the login screen
        navigate('/login'); 
      }
    } catch (err) {
      console.error("Registration error:", err.response);
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Register</h2>
      {error && <p style={{ color: 'red', background: '#fee', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleActionSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
          <input type="text" required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address:</label>
          <input type="email" required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input type="password" required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        </div>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#95a5a6' : '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      {/* ✅ FIXED CLICKABLE LINK: Clean standard router pathway link to login manually */}
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        Already have an account? <Link to="/login" style={{ color: '#3498db', fontWeight: 'bold', textDecoration: 'none' }}>Login here</Link>
      </p>
    </div>
  );
};

export default Register;
