const PatientModel = require('../models/PatientModel');

exports.createPatientDataArray = async (req, res) => {
  try {
    const {id, dataArray } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }
    const newPatientData = new PatientModel({ index: id, data: dataArray });
    const savedPatientData = await newPatientData.save();
    res.status(201).json(savedPatientData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPatientDataArray = async (req, res) => {
  try {
    const id = 0;
    const patientInfo = await PatientModel.find({index: id}).select('data');;
    res.json(patientInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePatientDataArray = async (req, res) => {
  try {
    const id = 0;
    const patientInfo = await PatientModel.findOne({index: id});
    if (patientInfo == null) {
      return res.status(404).json({ message: 'Cannot find Patient' });
    }
    if (req.body.dataArray != null) {
      patientInfo.data = req.body.dataArray;
    }
    const updatedPatientInfo = await patientInfo.save();
    res.json(updatedPatientInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
