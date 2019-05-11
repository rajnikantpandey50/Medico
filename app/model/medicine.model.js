const mongoose = require("mongoose");

const QuantSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  expiryDate: Date,
  pack: Number,
  piece: Number
});

const MedSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  medicineName: String,
  manufacturerName: String,
  medicineType: String,
  supplier: String,
  price: Number,
  mrp: Number,
  quantity: [QuantSchema],
  totalQuantity: Number,
  piecePerPack: Number,
  purchaseDate: Date,
  totalSold: Number
});

module.exports = mongoose.model("Medicine", MedSchema);
