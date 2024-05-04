const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true
  },
  data: {
    type: [Number],
    required: true
  }
});

const PatientModel = mongoose.model('PatientData', patientSchema);

module.exports = PatientModel;
