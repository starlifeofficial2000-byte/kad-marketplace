const Subscription=require("../models/Subscription");
const Product=require("../models/Product");

async function calculateListingScore(product){

let score=0;

if(product.featured){

score+=100;

}

if(product.boosted){

score+=80;

}

const subscription=await Subscription.findOne({

where:{

userId:product.userId,

status:"Active"

}

});

if(subscription){

switch(subscription.plan){

case "Enterprise":

score+=600;

break;

case "VIP Bossman":

score+=500;

break;

case "Bossman":

score+=400;

break;

case "Express":

score+=300;

break;

case "Premium":

score+=200;

break;

default:

score+=100;

}

}

const ageHours=(Date.now()-new Date(product.createdAt))/3600000;

score-=Math.floor(ageHours/12);

return score;

}

module.exports={

calculateListingScore

};