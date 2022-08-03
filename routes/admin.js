const express = require('express');

const adminHelper = require('../helpers/admin-helper');


const router = express.Router();
const mongoose =require ('mongoose')
const multer =require ('multer');
const path  = require('path');



 router.get('/',  (req, res) => {
  if(req.session.admin){
    console.log('sdfghjkjhjhhgjhgjhgjg')
     res.redirect('/admin/dashboard')
  }else{
  
    
    res.render('admin/adminlogin');
  
  }
});


router.get('/dashboard',(req,res)=>{
  if(req.session.admin){
    res.render('admin/admin')
  }else{
    res.redirect('/admin')
  }
})




router.get('/view-products',(req,res)=>{
  adminHelper.getAllproducts().then((products)=>{
    console.log("df");
    console.log(products)

    res.render('admin/view-products',{Products:products})
  })
 
 })


 router.post('/adminsign',(req,res)=>{
  console.log(req.body);
  adminHelper.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.admin=true
      res.redirect('/admin/dashboard')
     

      
     
      
    }else{
      console.log('login failed');
    res.redirect('/admin')
    }
  })
 
 })

 router.get('/user',(req,res)=>{
  adminHelper.getAllUsers().then((users)=>{ 
  res.render('admin/user',{users})
  })
 })

 router.get("/blockUser/:id",(req,res)=>{
  console.log(" blocking user..")
const proId = req.params.id
console.log(proId)
console.log("done")
adminHelper.blockUser(proId).then((response)=>{
  res.json({status:true})
})
})
router.get("/unBlockUser/:id",(req,res)=>{
  const proId =req.params.id
  adminHelper.unBlockUser(proId).then((response)=>{
    res.json({status: true})
  })
})




/* GET add products. */  
router.get('/category',function(req,res){
  let exizt =req.session.catExist;
  // if(req.session.login){
    adminHelper.getCategory().then((respose)=>{
      console.log("dds");
      console.log(respose);
  
       res.render('admin/category',{data:respose,exizt})
       req.session.catExist=false;
})
  // }else{
    // req.session.loginError=true;

  // }

}) 




router.post('/addcategory',(req,res)=>{
  console.log("she just fucked you up");
 console.log('gdghfghf');
  adminHelper.uniqueCategory(req.body).then((resp)=>{

    if (resp.exist){
      req.session.catExist= true
      let exizt =  req.session.catExist;
      res.redirect('/admin/category')
    }else{
  adminHelper.addCategory(req.body).then((response)=>{
   
    if (response){
    res.redirect('/admin/category')
    }
  })
}
  })


 
})
router.get('/delete-category/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.deleteCategory(id).then((resp)=>{
    res.redirect('/admin/category')
  })
})
router.post('/edit-category/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.updateCategory(id,req.body) .then((resp)=>{
    console.log(req.body)
    res.redirect('/admin/category')
    console.log(req.body)
  })
})
router.get('/add-products', function(req,res) {
  adminHelper.getCategory().then((data)=>{
  
    res.render('admin/add-products', {data:data })
  })
})
/* File upload*/
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './public/images/');
  },

  filename: function(req, file, cb) {
    
      cb(null, file.fieldname + '-' + Date.now() +   path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage })

router.post('/add-products', upload.array('multi-files',4), (req, res) => {

  let images = req.files
  console.log(req.files)
  console.log("dds")
  console.log(req.body);
  adminHelper.addProducts(req.body, images ).then ((response)=>{

      if (response){
        res.redirect('/admin/add-products')
      }
      else {
        res.redirect('/admin/add-products')
      }
  })
});
 

router.get('/view-orders',  async (req,res)=>{
  let orders = await adminHelper.getAllorders()

    console.log("thus");   
    console.log(orders);
      res.render('admin/orderss',{orders})



})

router.get('/delete-products/:id',function(req,res){
  let id= mongoose.Types.ObjectId(req.params.id)
    adminHelper.deleteproducts(id).then((response)=>{
        res.redirect('/admin/view-products')

    })
})

router.get('/category/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.getCatogoryproducts(id).then((catogoryproducts)=>{
    res.render('admin/products-category',{catogoryProducts: catogoryproducts})
  })
})


router.post("/edit-orders",async(req,res)=>{

  
  console.log(req.body);
  console.log("edit orders....");

 await adminHelper.changeadminStatus(req.body).then(async(resp)=>{
     res.json(resp)
  })




})
router.post("/edit-orders2",async(req,res)=>{

  
  console.log(req.body);
  console.log("edit orders....");

 await adminHelper.changeadminStatus2(req.body).then(async(resp)=>{
  res.json(resp)
})




})
router.post("/edit-orders3",async(req,res)=>{

  
  console.log(req.body);
  console.log("edit orders....");

  await adminHelper.changeadminStatus3(req.body).then(async(resp)=>{
    res.json(resp)
 })




})
router.post("/edit-orders4",async(req,res)=>{

  
  console.log(req.body);
  console.log("edit orders....");

  await adminHelper.changeadminStatus4(req.body).then(async(resp)=>{
    res.json(resp)
 })




})





module.exports = router;    