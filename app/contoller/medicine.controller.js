const Medicine = require('../model/medicine.model');

exports.findAll = ()=>{
    //var medicines;
    return Medicine.find();
   // console.log(medicines);
    
}
exports.create = (req,res)=>{

}