const Report = require("../models/Report");
const Product = require("../models/Product");
const User = require("../models/User");

/* ==========================================
   CREATE REPORT
========================================== */

exports.createReport = async (req, res) => {

    try {

        const { productId, reason, description } = req.body;
        if (!req.user?.id) return res.status(401).json({ success: false, message: "Authentication required." });
        if (!productId || !reason) return res.status(400).json({ success: false, message: "Product and report reason are required." });

        const report = await Report.create({

            userId: req.user.id,

            productId,

            reason,

            description,

            status: "Pending"

        });

        res.status(201).json({

            success: true,

            report

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};
exports.getAllReports=async(req,res)=>{try{const rows=await Report.findAll({order:[["createdAt","DESC"]]});const reports=await Promise.all(rows.map(async row=>{const item=row.toJSON();const [product,user]=await Promise.all([Product.findByPk(item.productId),User.findByPk(item.userId,{attributes:["id","name","email","phone"]})]);return {...item,Product:product,User:user};}));return res.json({success:true,reports});}catch(error){console.error("ADMIN GET REPORTS ERROR:",error);return res.status(500).json({success:false,message:"Unable to load reports."});}};
exports.updateReport=async(req,res)=>{try{const row=await Report.findByPk(req.params.id);if(!row)return res.status(404).json({success:false,message:"Report not found."});const status=String(req.body.status||"Resolved");if(!["Pending","Resolved"].includes(status))return res.status(400).json({success:false,message:"Invalid report status."});row.status=status;await row.save();return res.json({success:true,report:row});}catch(error){console.error("ADMIN UPDATE REPORT ERROR:",error);return res.status(500).json({success:false,message:"Unable to update report."});}};
exports.deleteReport=async(req,res)=>{try{const row=await Report.findByPk(req.params.id);if(!row)return res.status(404).json({success:false,message:"Report not found."});await row.destroy();return res.json({success:true,message:"Report deleted."});}catch(error){console.error("ADMIN DELETE REPORT ERROR:",error);return res.status(500).json({success:false,message:"Unable to delete report."});}};
