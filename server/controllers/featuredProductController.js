const FeaturedProduct=require("../models/FeaturedProduct");
const Product=require("../models/Product");

exports.getFeaturedProducts=async(req,res)=>{

const products=await FeaturedProduct.findAll({

include:[

{

model:Product,

as:"product"

}

],

order:[

["priority","DESC"],

["position","ASC"]

]

});

res.json(products);

};

exports.addFeaturedProduct=async(req,res)=>{

const featured=await FeaturedProduct.create(req.body);

res.json(featured);

};

exports.updateFeaturedProduct=async(req,res)=>{

const featured=await FeaturedProduct.findByPk(req.params.id);

if(!featured){

return res.status(404).json({

message:"Featured product not found."

});

}

await featured.update(req.body);

res.json(featured);

};

exports.deleteFeaturedProduct=async(req,res)=>{

const featured=await FeaturedProduct.findByPk(req.params.id);

if(!featured){

return res.status(404).json({

message:"Featured product not found."

});

}

await featured.destroy();

res.json({

success:true

});

};