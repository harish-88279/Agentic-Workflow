require('dotenv').config();
const express = require('express');
const cors = require('cors');
const workflowRoutes = require('./routes/workflowRoutes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api', workflowRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});