const express=require("express");

const router=express.Router();

const controller=require("../controllers/featuredProductController");
const auth=require("../middleware/auth");
const admin=require("../middleware/admin");

router.use(auth,admin);

router.get("/",controller.getFeaturedProducts);

router.post("/",controller.addFeaturedProduct);

router.put("/:id",controller.updateFeaturedProduct);

router.delete("/:id",controller.deleteFeaturedProduct);

module.exports=router;