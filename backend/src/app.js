require('dotenv').config();
const express = require('express');
const cors = require('cors');
const workflowRoutes = require('./routes/workflowRoutes');

const app = express();
const PORT = 3001;

// UPDATE CORS
app.use(cors({
  // Allow your future Vercel URL (e.g., https://my-workflow-app.vercel.app)
  // OR use '*' to allow everyone (easiest for Hackathons)
  origin: '*', 
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
}));

// ... rest of code ...app.use(express.json());

// Mount Routes
app.use('/api', workflowRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});