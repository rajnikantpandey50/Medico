const express = require("express");
const router = express.Router();
const Medicine = require("../model/medicine.model");
const mongoose = require("mongoose");

//const MedicineController = require('../contoller/medicine.controller');

router.get("/medicines", (req, res) => {
  Medicine.find()
    .then(medicines => res.send(medicines))
    .catch(err => res.send("No data found " + err.message));
});

router.post("/medicines", (req, res) => {
  var medicineName = req.body.medicineName;
  var manufacturerName = req.body.manufacturerName;
  var medicineType = req.body.medicineType;
  var exists = false;

  Medicine.find({ medicineName: medicineName }).then(result => {
    console.log(result.length);
    if (result.length > 0) exists = true;
    console.log(exists);
    if (exists) res.json({ message: "exists" });
    else {
      const medicine = new Medicine({
        _id: mongoose.Types.ObjectId(),
        medicineName: medicineName,
        manufacturerName: manufacturerName,
        medicineType: medicineType,
        supplier: "",
        price: 0,
        quantity: 0,
        mrp: 0,
        piecePerPack: 0,
        expiryDate: [],
        purchaseDate: new Date()
      });
      medicine
        .save()
        .then(result => {
          console.log(result);
          res.json({ message: "success" });
        })
        .catch(err => {
          console.log("Error occured " + err);
          res.send(err);
        });
    }
  });
  // console.log(exists);
});

module.exports = router;
