const express = require("express");
const router = express.Router();
const Medicine = require("../model/medicine.model");
const mongoose = require("mongoose");

//const MedicineController = require('../contoller/medicine.controller');

router.get("/medicines", (req, res) => {
  Medicine.find()
    .sort({ medicineName: 1 })
    .then(medicines => {
      // medicines.expiryDate = Math.min.apply(null, medicines.expiryDate);

      //console.log(medicines);
      res.send(medicines);
    })
    .catch(err => res.send("No data found " + err.message));
});
router.get("/medicines/:name", (req, res) => {
  //console.log(req.params.name);
  // Medicine.find().where;
  Medicine.find({ medicineName: { $regex: req.params.name, $options: "$i" } })
    .then(medicine => {
      // console.log(medicine);
      res.send(medicine);
    })
    .catch(err => {
      // console.error(err);
      res.send("No data found " + err.message);
    });
});

router.post("/medicines", (req, res) => {
  var medicineName = req.body.medicineName;
  var manufacturerName = req.body.manufacturerName;
  var medicineType = req.body.medicineType;
  var exists = false;

  Medicine.find({ medicineName: medicineName }).then(result => {
    // console.log(result.length);
    if (result.length > 0) exists = true;
    // console.log(exists);
    if (exists) res.json({ message: "exists" });
    else {
      const medicine = new Medicine({
        _id: mongoose.Types.ObjectId(),
        medicineName: medicineName,
        manufacturerName: manufacturerName,
        medicineType: medicineType,
        supplier: "",
        price: 0,
        quantity: [],
        mrp: 0,
        totalQuantity: 0,
        piecePerPack: 0,
        totalSold: 0,
        purchaseDate: new Date()
      });
      medicine
        .save()
        .then(result => {
          // console.log(result);
          res.json({ message: "success" });
        })
        .catch(err => {
          //console.log("Error occured " + err);
          res.send(err);
        });
    }
  });
  // console.log(exists);
});

router.post("/medicine/buy", (req, res) => {
  // console.log(req.body);
  //req.body = JSON.parse(req.body);
  let medicines = req.body.medicines;
  medicines.map(medicine => {
    // console.log(medicine.quantity);
    Medicine.find({ medicineName: medicine.medicineName }).then(result => {
      let quantities = result[0].quantity || [];
      // console.log(quantities);
      let totalQuantity = parseInt(result[0].totalQuantity || 0);
      totalQuantity += parseInt(medicine.quantity || 0);
      if (medicine.isSame) {
        let quantity = {
          _id: mongoose.Types.ObjectId(),
          expiryDate: medicine.expiryDate[0],
          pack: medicine.quantity,
          piece: medicine.quantity * medicine.ppp
        };
        quantities.push(quantity);
      } else {
        let q = {};
        medicine.expiryDate.forEach(e => {
          q[e] = (q[e] || 0) + 1;
        });
        // console.log(q);
        for (let e in q) {
          // console.log("e: " + e);
          let quantity = {
            _id: mongoose.Types.ObjectId(),
            expiryDate: e,
            pack: q[e],
            piece: q[e] * medicine.ppp
          };
          quantities.push(quantity);
        }
      }
      // console.log(quantities);
      Medicine.update(
        { medicineName: medicine.medicineName },
        {
          $set: {
            mrp: medicine.mrp,
            price: medicine.price,
            quantity: quantities,
            piecePerPack: medicine.ppp,
            purchaseDate: medicine.purchaseDate,
            supplier: medicine.supplier,
            totalQuantity: totalQuantity
          }
        }
      )
        .then(result => {
          // console.log(result);
        })
        .catch(err => console.log(err));
    });
    res.json({ message: "Success" });
  });
});

router.post("/medicine/sell", (req, res) => {
  let medicines = [];
  let priceList = [];
  let total = 0;
  let updated = 0;
  medicines = req.body.medicines;
  // console.log(medicines);
  medicines.map(medicine => {
    Medicine.find({ medicineName: medicine.medicineName })
      .then(result => {
        let price = 0;
        if (medicine.piece) {
          price = medicine.quantity * (result[0].mrp / result[0].piecePerPack);
        } else price = medicine.quantity * result[0].mrp;
        priceList.push({
          medicineName: medicine.medicineName,
          price: price
        });
        total += price;
        if (medicine.piece) {
          Medicine.update(
            { _id: result[0]._id, "quantity.expiryDate": medicine.expDate[0] },
            {
              $inc: {
                "quantity.$.pack": -parseFloat(
                  medicine.quantity / result[0].piecePerPack
                ),
                "quantity.$.piece": -medicine.quantity,
                totalQuantity: -parseFloat(
                  medicine.quantity / result[0].piecePerPack
                ),
                totalSold: parseFloat(
                  medicine.quantity / result[0].piecePerPack
                )
              }
            }
          )
            .then(r => console.log(r))
            .catch(err => console.log(err));
        } else {
          let dRate = -parseInt(medicine.quantity);
          if (!medicine.isSame) dRate = -1;
          medicine.expDate.map(ed => {
            Medicine.update(
              { _id: result[0]._id, "quantity.expiryDate": ed },
              {
                $inc: {
                  "quantity.$.pack": dRate,
                  "quantity.$.piece": parseInt(result[0].piecePerPack * dRate),
                  totalQuantity: dRate,
                  totalSold: -dRate
                }
              }
            )
              .then(r => {
                console.log(r);
                Medicine.update(
                  {},
                  { $pull: { quantity: { pack: { $lte: 0 } } } },
                  { multi: true }
                ).catch(err => console.log(err));
              })
              .catch(err => console.log(err));
          });
        }
      })
      .then(r => {
        updated++;
        if (updated == medicines.length) {
          priceList.push({
            medicineName: "Total",
            price: total
          });
          // console.log(priceList);
          res.json({ price: priceList });
        }
      });
  });
});
router.delete("/medicines/delete", (req, res) => {
  console.log("Inside delete");
  console.log(req.body);
  Medicine.remove({ _id: req.body._id })
    .then(result => {
      console.log(result);
      res.json({ message: "Success" });
    })
    .catch(err => res.json({ message: err.message }));
});

router.put("/medicines", (req, res) => {
  console.log(req.body);
  Medicine.update(
    {
      _id: req.body._id
    },
    {
      medicineName: req.body.medicineName,
      manufacturerName: req.body.manufacturerName,
      medicineType: req.body.medicineType
    }
  )
    .then(result => {
      res.json({ message: "success" });
    })
    .catch(err => console.log(err));
});

module.exports = router;
