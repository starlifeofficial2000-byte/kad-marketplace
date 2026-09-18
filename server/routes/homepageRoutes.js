const express=require("express");

const router=express.Router();

const controller=require("../controllers/homepageController");

router.get("/",controller.getSections);

router.post("/",controller.createSection);

router.put("/:id",controller.updateSection);

router.delete("/:id",controller.deleteSection);

module.exports=router;