import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "../style/SignUp.css";
import axios from "axios";

function Input({ type, placeholder, name, value, onChange, error }) {
  return (
    <>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className={error ? 'input-error' : ''}
        required
      />
      {error && <span className="field-error">{error}</span>}
    </>
  );
}

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    day: '1',
    month: 'Jan',
    year: '1950',
    gender: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 1950 + i);

  const validateEmail = (email) => {
    if (!email) return "Please fill out this field";
    if (/\s/.test(email)) return "Email cannot contain spaces";
    if (!email.includes("@")) return "Must contain @ symbol";
    const [local, domain] = email.split("@");
    if (!local)   return "Missing text before @";
    if (!domain)  return "Missing domain after @";
    if (!domain.includes(".")) return "Domain must contain .";
    if (domain.endsWith("."))  return "Domain cannot end with .";
    const parts = domain.split(".");
    if (parts[parts.length-1].length < 2) return "Domain extension too short";
    return "";
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const validateForm = () => {
    const newErr = {};
    if (!formData.firstName.match(/^[a-zA-Z]{2,30}$/)) newErr.firstName = '2-30 letters only';
    if (!formData.lastName.match(/^[a-zA-Z]{2,30}$/))  newErr.lastName  = '2-30 letters only';
    if (formData.address.length < 5)                   newErr.address   = 'At least 5 chars';
    if (!formData.gender)                              newErr.gender    = 'Please select gender';
    if (!formData.mobileNumber.match(/^\d{10}$/))      newErr.mobileNumber = 'Must be 10 digits';

    const emailError = validateEmail(formData.email);
    if (emailError) newErr.email = emailError;

    const pw = formData.password;
    const pwChecks = [];
    if (pw.length < 8)            pwChecks.push("at least 8 chars");
    if (!/[A-Z]/.test(pw))        pwChecks.push("one uppercase letter");
    if (!/[0-9]/.test(pw))        pwChecks.push("one number");
    if (!/[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\/;'`~]/.test(pw)) {
      pwChecks.push("one symbol (e.g. -)");
    }
    if (pwChecks.length) newErr.password = `Password must contain ${pwChecks.join(", ")}`;

    if (formData.password !== formData.confirmPassword) {
      newErr.confirmPassword = 'Passwords must match';
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) return;

    try {
      const res = await axios.post('http://localhost:3001/api/signup', {
        ...formData,
        month: months.indexOf(formData.month) + 1
      });
      if (res.data.message === 'User created successfully') {
        navigate('/login', {
          state: {
            email: formData.email,
            successMessage: 'Account created successfully! Please log in.'
          }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed';
      setFormError(msg);
      if (msg.includes('Email already exists')) {
        setErrors(e => ({ ...e, email: msg }));
      } else if (msg.includes('Phone number already exists')) {
        setErrors(e => ({ ...e, mobileNumber: msg }));
      }
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-cont">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Create a new account</h2>
          

          {/* First & Last Name */}
          <div className="input-group">
            <label htmlFor="firstName">First name</label>
            <Input type="text" name="firstName" value={formData.firstName}
                   onChange={handleChange} error={errors.firstName} />
          </div>
          <div className="input-group">
            <label htmlFor="lastName">Last name</label>
            <Input type="text" name="lastName" value={formData.lastName}
                   onChange={handleChange} error={errors.lastName} />
          </div>

          {/* Address */}
          <div className="input-group">
            <label htmlFor="address">Address</label>
            <Input type="text" name="address" value={formData.address}
                   onChange={handleChange} error={errors.address} />
          </div>

          {/* Date of Birth */}
          <div className="input-group">
            <label>Date of birth</label>
            <div className="dob-row">
              <select name="day" value={formData.day} onChange={handleChange}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select name="month" value={formData.month} onChange={handleChange}>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select name="year" value={formData.year} onChange={handleChange}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div className="input-group">
            <label>Gender</label>
            <div className="gender-options">
              <label>
                <input type="radio" name="gender" value="female"
                       checked={formData.gender==='female'} onChange={handleChange} /> Female
              </label>
              <label>
                <input type="radio" name="gender" value="male"
                       checked={formData.gender==='male'} onChange={handleChange} /> Male
              </label>
              {errors.gender && <span className="field-error">{errors.gender}</span>}
            </div>
          </div>

          {/* Contact */}
          <div className="input-group">
            <label htmlFor="mobileNumber">Mobile number</label>
            <Input type="tel" name="mobileNumber" value={formData.mobileNumber}
                   onChange={handleChange} error={errors.mobileNumber} />

            <label className="top-margin" htmlFor="email">Email address</label>
            <Input type="email" name="email" value={formData.email}
                   onChange={handleChange} error={errors.email} />
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password">New password</label>
            <Input type="password" name="password" value={formData.password}
                   onChange={handleChange} error={errors.password} />

            <label className="top-margin" htmlFor="confirmPassword">Confirm password</label>
            <Input type="password" name="confirmPassword" value={formData.confirmPassword}
                   onChange={handleChange} error={errors.confirmPassword} />
          </div>
          {formError && <div className="form-error-message">{formError}</div>}
          <button type="submit" className="signup-btn">Sign Up</button>
          <div className="login-link">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </form>
        
      </div>
    </div>
  );
}

export default SignUp;



// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom"; 
// import "../style/SignUp.css";
// import axios from "axios";

// function Input({ type, placeholder, name, value, onChange, error }) {
//   return (
//     <>
//       <input
//         id={name}
//         type={type}
//         placeholder={placeholder}
//         name={name}
//         value={value}
//         onChange={onChange}
//         className={error ? 'input-error' : ''}
//         required
//       />
//       {error && <span className="field-error">{error}</span>}
//     </>
//   );
// }

// function SignUp() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     address: '',
//     day: '1',
//     month: 'Jan',
//     year: '1950',
//     gender: '',
//     mobileNumber: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [formError, setFormError] = useState('');

//   const days = Array.from({ length: 31 }, (_, i) => i + 1);
//   const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
//   const years = Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 1950 + i);

//   const validateEmail = (email) => {
//     if (!email) return "Please fill out this field";
//     if (/\s/.test(email)) return "Email cannot contain spaces";
//     if (!email.includes("@")) return "Must contain @ symbol";
//     const [local, domain] = email.split("@");
//     if (!local)   return "Missing text before @";
//     if (!domain)  return "Missing domain after @";
//     if (!domain.includes(".")) return "Domain must contain .";
//     if (domain.endsWith("."))  return "Domain cannot end with .";
//     const parts = domain.split(".");
//     if (parts[parts.length-1].length < 2) return "Domain extension too short";
//     return "";
//   };

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setFormData(f => ({ ...f, [name]: value }));
//     if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
//   };

//   const validateForm = () => {
//     const newErr = {};
//     if (!formData.firstName.match(/^[a-zA-Z]{2,30}$/)) newErr.firstName = '2-30 letters only';
//     if (!formData.lastName.match(/^[a-zA-Z]{2,30}$/))  newErr.lastName  = '2-30 letters only';
//     if (formData.address.length < 5)                   newErr.address   = 'At least 5 chars';
//     if (!formData.gender)                              newErr.gender    = 'Please select gender';
//     if (!formData.mobileNumber.match(/^\d{10}$/))      newErr.mobileNumber = 'Must be 10 digits';

//     const emailError = validateEmail(formData.email);
//     if (emailError) newErr.email = emailError;

//     const pw = formData.password;
//     const pwChecks = [];
//     if (pw.length < 8)            pwChecks.push("at least 8 chars");
//     if (!/[A-Z]/.test(pw))        pwChecks.push("one uppercase letter");
//     if (!/[0-9]/.test(pw))        pwChecks.push("one number");
//     if (!/[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\/;'`~]/.test(pw)) {
//       pwChecks.push("one symbol (e.g. -)");
//     }
//     if (pwChecks.length) newErr.password = `Password must contain ${pwChecks.join(", ")}`;

//     if (formData.password !== formData.confirmPassword) {
//       newErr.confirmPassword = 'Passwords must match';
//     }

//     setErrors(newErr);
//     return Object.keys(newErr).length === 0;
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setFormError('');
//     if (!validateForm()) return;

//     try {
//       const res = await axios.post('http://localhost:3001/api/signup', {
//         ...formData,
//         month: months.indexOf(formData.month) + 1
//       });
//       if (res.data.message === 'User created successfully') {
//         navigate('/login', {
//           state: {
//             email: formData.email,
//             successMessage: 'Account created successfully! Please log in.'
//           }
//         });
//       }
//     } catch (err) {
//       const msg = err.response?.data?.error || 'Signup failed';
//       setFormError(msg);
//       if (msg.includes('Email already exists')) {
//         setErrors(e => ({ ...e, email: msg }));
//       } else if (msg.includes('Phone number already exists')) {
//         setErrors(e => ({ ...e, mobileNumber: msg }));
//       }
//     }
//   };

//   return (
//     <div className="signup-page">
//       <div className="signup-cont">
//         <form className="signup-form" onSubmit={handleSubmit}>
//           <h2>Create a new account</h2>
          

//           {/* First & Last Name */}
//           <div className="input-group">
//             <label htmlFor="firstName">First name</label>
//             <Input type="text" name="firstName" value={formData.firstName}
//                    onChange={handleChange} error={errors.firstName} />
//           </div>
//           <div className="input-group">
//             <label htmlFor="lastName">Last name</label>
//             <Input type="text" name="lastName" value={formData.lastName}
//                    onChange={handleChange} error={errors.lastName} />
//           </div>

//           {/* Address */}
//           <div className="input-group">
//             <label htmlFor="address">Address</label>
//             <Input type="text" name="address" value={formData.address}
//                    onChange={handleChange} error={errors.address} />
//           </div>

//           {/* Date of Birth */}
//           <div className="input-group">
//             <label>Date of birth</label>
//             <div className="dob-row">
//               <select name="day" value={formData.day} onChange={handleChange}>
//                 {days.map(d => <option key={d} value={d}>{d}</option>)}
//               </select>
//               <select name="month" value={formData.month} onChange={handleChange}>
//                 {months.map(m => <option key={m} value={m}>{m}</option>)}
//               </select>
//               <select name="year" value={formData.year} onChange={handleChange}>
//                 {years.map(y => <option key={y} value={y}>{y}</option>)}
//               </select>
//             </div>
//           </div>

//           {/* Gender */}
//           <div className="input-group">
//             <label>Gender</label>
//             <div className="gender-options">
//               <label>
//                 <input type="radio" name="gender" value="female"
//                        checked={formData.gender==='female'} onChange={handleChange} /> Female
//               </label>
//               <label>
//                 <input type="radio" name="gender" value="male"
//                        checked={formData.gender==='male'} onChange={handleChange} /> Male
//               </label>
//               {errors.gender && <span className="field-error">{errors.gender}</span>}
//             </div>
//           </div>

//           {/* Contact */}
//           <div className="input-group">
//             <label htmlFor="mobileNumber">Mobile number</label>
//             <Input type="tel" name="mobileNumber" value={formData.mobileNumber}
//                    onChange={handleChange} error={errors.mobileNumber} />

//             <label className="top-margin" htmlFor="email">Email address</label>
//             <Input type="email" name="email" value={formData.email}
//                    onChange={handleChange} error={errors.email} />
//           </div>

//           {/* Password */}
//           <div className="input-group">
//             <label htmlFor="password">New password</label>
//             <Input type="password" name="password" value={formData.password}
//                    onChange={handleChange} error={errors.password} />

//             <label className="top-margin" htmlFor="confirmPassword">Confirm password</label>
//             <Input type="password" name="confirmPassword" value={formData.confirmPassword}
//                    onChange={handleChange} error={errors.confirmPassword} />
//           </div>
//           {formError && <div className="form-error-message">{formError}</div>}
//           <button type="submit" className="signup-btn">Sign Up</button>
//           <div className="login-link">
//             Already have an account? <Link to="/login">Log In</Link>
//           </div>
//         </form>
        
//       </div>
//     </div>
//   );
// }

// export default SignUp;





// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom"; 
// import "../style/SignUp.css";
// import axios from "axios";

// const styles = {
//   marginTop: '25px'
// };

// function Input(props) {
//   return (
//     <input
//       type={props.type}
//       placeholder={props.placeholder}
//       name={props.name}
//       value={props.value}
//       onChange={props.onChange}
//       required
//     />
//   );
// }

// function SignUp() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     address: '',
//     day: '1',
//     month: 'Jan',
//     year: '1950',
//     gender: '',
//     mobileNumber: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState('');

//   const days = Array.from({ length: 31 }, (_, i) => i + 1);
//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", 
//     "Jun", "Jul", "Aug", "Sep", "Oct", 
//     "Nov", "Dec"
//   ];
//   const years = Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 1950 + i);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const response = await axios.post('http://localhost:3001/api/signup', {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         address: formData.address,
//         day: formData.day,
//         month: months.indexOf(formData.month) + 1,
//         year: formData.year,
//         gender: formData.gender,
//         mobileNumber: formData.mobileNumber,
//         email: formData.email,
//         password: formData.password,
//         confirmPassword: formData.confirmPassword
//       });

//       if (response.data.message === 'User created successfully') {
//         navigate('/login'); // Redirect to login page after successful signup
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || 'Signup failed. Please try again.');
//     }
//   };

//   return (
//     <div className="signup-page">
//       <div className="signup-cont">
//         <form className="signup-form" onSubmit={handleSubmit}>
//           <h2>Create a new account</h2>
          
         

//           <div className="input-group">
//             <label>First name</label>
//             <Input 
//               type="text" 
//               placeholder="First name" 
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="input-group">
//             <label>Last name</label>
//             <Input 
//               type="text" 
//               placeholder="Last name" 
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="input-group">
//             <label>Address</label>
//             <Input 
//               type="text" 
//               placeholder="Address" 
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="input-group">
//             <label>Date of birth</label>
//             <div className="dob-row">
//               <select name="day" value={formData.day} onChange={handleChange}>
//                 {days.map(day => (
//                   <option key={day} value={day}>
//                     {day}
//                   </option>
//                 ))}
//               </select>

//               <select name="month" value={formData.month} onChange={handleChange}>
//                 {months.map(month => (
//                   <option key={month} value={month}>
//                     {month}
//                   </option>
//                 ))}
//               </select>

//               <select name="year" value={formData.year} onChange={handleChange}>
//                 {years.map(year => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="input-group">
//             <label>Gender</label>
//             <div className="gender-options">
//               <label>
//                 <input 
//                   type="radio" 
//                   name="gender" 
//                   value="female" 
//                   checked={formData.gender === 'female'}
//                   onChange={handleChange}
//                 required/> Female
//               </label>
//               <label>
//                 <input 
//                   type="radio" 
//                   name="gender" 
//                   value="male" 
//                   checked={formData.gender === 'male'}
//                   onChange={handleChange}
//                 required/> Male
//               </label>
//             </div>
//           </div>

//           <div className="input-group">
//             <label>Mobile number</label>
//             <Input 
//               type="number" 
//               placeholder="Mobile number" 
//               name="mobileNumber"
//               value={formData.mobileNumber}
//               onChange={handleChange}
//             />
//             <label style={styles}>Email address</label>
//             <Input 
//               type="email" 
//               placeholder="Email address" 
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="input-group">
//             <label>New password</label>
//             <Input 
//               type="password" 
//               placeholder="New password" 
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//             />
//             <label style={styles}>Confirm password</label>
//             <Input 
//               type="password" 
//               placeholder="Confirm password" 
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//             />
//           </div>
//           {error && <div className="error-message">{error}</div>}
//           <button type="submit" className="signup-btn">
//             Sign Up
//           </button>

//           <div className="login-link">
//             Already have an account? <Link to="/login">Log In</Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SignUp;





// import React from "react";
// import { Link } from "react-router-dom"; 
// import "../style/SignUp.css";
// const styles = {
//   marginTop: '25px'
// };
// function Input(props) {
//   return (
//     <input
//       type={props.type}
//       placeholder={props.placeholder}
//       required

//     />
//   );
// }

// function SignUp() {
//   const days = Array.from({ length: 31 }, (_, i) => i + 1);
//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", 
//     "Jun", "Jul", "Aug", "Sep", "Oct", 
//     "Nov", "Dec"
//   ];
//   const years = Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 1950 + i);

//   return (
//     <div className="signup-page">
//       <div className="signup-cont">
//         <form className="signup-form">
//           <h2>Create a new account</h2>

//           <div className="input-group">
//             <label>First name</label>
//             <Input type="text" placeholder="First name" />
//           </div>

//           <div className="input-group">
//             <label>LastName</label>
//             <Input type="text" placeholder="Last name" />
//           </div>

//           <div className="input-group">
//             <label>Date of birth</label>
//             <div className="dob-row">
//               <select>
//                 {days.map(day => (
//                   <option key={day} value={day}>
//                     {day}
//                   </option>
//                 ))}
//               </select>

//               <select>
//                 {months.map((month, index) => (
//                   <option key={month} value={index + 1}>
//                     {month}
//                   </option>
//                 ))}
//               </select>

//               <select>
//                 {years.map(year => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="input-group">
//             <label>Gender</label>
//             <div className="gender-options">
//               <label>
//                 <input type="radio" name="gender" />Female
//               </label>
//               <label>
//                 <input type="radio" name="gender" /> Male
//               </label>
//             </div>
//           </div>

//           <div className="input-group">
//             <label>Mobile number</label>
//             <Input type="number" placeholder="Mobile number" />
//             <label style={styles}>email address</label>
//             <Input type="email" placeholder="email address" />

//           </div>

//           <div className="input-group">
//             <label>New password</label>
//             <Input type="password" placeholder="New password" />
//             <label style={styles}>Confirm password</label>
//             <Input type="password" placeholder="Confirm password"/>
//           </div>

//           <button type="submit" className="signup-btn">
//             Sign Up
//           </button>

//           <div className="login-link">
//             Already have an account? <Link to="/login">Log In</Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SignUp;
