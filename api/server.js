const express = require('express');
const mongoose = require('mongoose');
const patientDataRoutes = require('./routes/route');

const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // For parsing JSON request bodies

// Connect to MongoDB
const dbURI = 'mongodb://localhost:27017/patient-api'; // Replace with your connection string
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/', patientDataRoutes); 

// Error handling middleware (Keep this at the end)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
