const slugify=require("slugify");

const Category=require("../models/Category");
const Product=require("../models/Product");

exports.getCategories=async(req,res)=>{

const categories=await Category.findAll({
include:[{ model:Category, as:"parent" }],
order:[["displayOrder","ASC"]]
});

// Product.category stores the parent category name and Product.subcategory
// stores the selected child category name. Count approved listings only.
const rows = await Promise.all(categories.map(async (category) => {
    const name = String(category.name || "");
    const productCount = await Product.count({
        where: {
            status: "Approved",
            [require("sequelize").Op.or]: [
                { category: name },
                { subcategory: name }
            ]
        }
    });
    return { ...category.toJSON(), productCount };
}));

res.json(rows);

};

exports.createCategory=async(req,res)=>{

const body=req.body;

const category=await Category.create({

name:body.name,

slug:slugify(body.name,{lower:true}),

parentId:body.parentId||null,

featured:body.featured,

homepage:body.homepage,

displayOrder:body.displayOrder,

status:body.status,

metaTitle:body.metaTitle,

metaDescription:body.metaDescription,

icon:req.files?.icon?.[0]?.filename,

image:req.files?.image?.[0]?.filename,

banner:req.files?.banner?.[0]?.filename

});

res.json(category);

};

exports.updateCategory=async(req,res)=>{

const category=await Category.findByPk(req.params.id);

if(!category){

return res.status(404).json({

message:"Category not found."

});

}

await category.update({

...req.body,

slug:slugify(req.body.name,{lower:true}),

icon:req.files?.icon?.[0]?.filename||category.icon,

image:req.files?.image?.[0]?.filename||category.image,

banner:req.files?.banner?.[0]?.filename||category.banner

});

res.json(category);

};

exports.deleteCategory=async(req,res)=>{

const category=await Category.findByPk(req.params.id);

if(!category){

return res.status(404).json({

message:"Category not found."

});

}

await category.destroy();

res.json({

success:true

});

};