const { ObjectId } = require('mongodb');
const mongoose = require ('mongoose');
const Numbers = require('twilio/lib/rest/Numbers');

const userSchema = new mongoose.Schema({
  
    
        name:String,
        email:String,
        phone:Number,
        password:String,
        role:Boolean,
        block:{
        type:Boolean},
        category:[{
            category:String,
            isdeleted:Boolean
        }],



products:[{


productname:{type:String,required:true},
price:{type:Number,required:true},
discount:{type:Number,required:true},
stock:{type:Number,required:true}, 
color:{type:String,required:true},
strap:{type:String,required:true},
discription:{type:String,required:true},
productCategory:{type:String,required:true},
brand:{type:String,required:true},
sku:{type:String,required:true},
category:{type:String,required:true},
Images:Array,
 created_at: {type:Date,required:true,default:Date.now},
 isdeleted:Boolean

  },
 
  

],


cart:[{
  productdetails:Object,
  productname:{type:String,required:true},
  price:{type:Number,required:true},
  

  qty:Number,
  placed:Boolean,
  ship:Boolean,
  cancel:Boolean,
  completed:Boolean,
  status:String,
  total:Number,
  isdeleted:Boolean
   



}],
orders:[{
  usrid:ObjectId,
  address:[{
  userId:ObjectId,
   fname:String,
   lname:String,
   city:String,
   street:String,
   state:String,
   house:String,
   mob:Number,
   pincode:Number,
   mail:String,
  }],
 
  userd:ObjectId,
  productss:Object,
  totalamnt:Object,
  paymethod:{type:String,required:true},

  date:Date,
 
  created_at: {type:Date,required:true,default:Date.now},
  updated_at: {type:Date,required:true,default:Date.now}
},{timestamp:true}]

})
var user = mongoose.model("user",userSchema)
module.exports = user
;