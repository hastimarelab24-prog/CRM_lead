//  Fixed: Explicit (req, res, next) parameter signature sequence alignment
const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name parameter is strictly required.' });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'A valid email format is required.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must match or exceed 6 alphanumeric characters.' });
  }
  
  next(); // This will now run successfully as a function!
};

//  Fixed: Explicit (req, res, next) parameter signature sequence alignment
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email address field cannot be transmitted empty.' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Account authentication verification password required.' });
  }
  
  next(); // This will now run successfully as a function!
};

module.exports = { validateRegistration, validateLogin };
