const mongoose = require("mongoose");

const MedSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  medicineName: String,
  manufacturerName: String,
  medicineType: String,
  supplier: String,
  price: Number,
  mrp: Number,
  quantity: Number,
  piecePerPack: Number,
  expiryDate: [],
  purchaseDate: Date
});

module.exports = mongoose.model("Medicine", MedSchema);
