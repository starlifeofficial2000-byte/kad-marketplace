const express=require("express");

const router=express.Router();

const upload=require("../middleware/upload");

const controller=require("../controllers/categoryController");

router.get("/",controller.getCategories);

router.post(

"/",

upload.fields([

{name:"icon",maxCount:1},

{name:"image",maxCount:1},

{name:"banner",maxCount:1}

]),

controller.createCategory

);

router.put(

"/:id",

upload.fields([

{name:"icon",maxCount:1},

{name:"image",maxCount:1},

{name:"banner",maxCount:1}

]),

controller.updateCategory

);

router.delete("/:id",controller.deleteCategory);

module.exports=router;