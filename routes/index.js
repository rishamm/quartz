

const express = require('express');
const { otpVerify } = require('../config/verify');
const adminHelper = require('../helpers/admin-helper')  
const otrp = require ('../config/verify')
const mongoose =require ('mongoose')
const router = express.Router();
var userHelper = require('../helpers/user-helper'); 
const async = require('hbs/lib/async');

/* GET home page. */



let crrt = []



router.get('/', function(req, res) {
  
  res.header('Cache-control','no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0')
  console.log(req.session.login)
  if(req.session.login){
    res.redirect('/shop')
  }else{
    res.render('user/index',{loginError:req.session.loginError});
    req.session.loginError=false
  }
});



router.get('/shop',async(req,res)=>{
 let users= req.session.user
 let ud = req.session.id
 console.log("user="+users);
 console.log("gggggg");
 console.log(ud);
 let idd=req.session.email
  if(req.session.login){
    let cnt = await userHelper.dispaycartCount(idd)
   await adminHelper.getAllproducts().then((products)=>{
      console.log("df");
      console.log(products)
    res.render('user/shop',{users,Products:products,cnt})
    })
  }else{
      res.redirect('/login')
    req.session.loginError=false
  }

 

});


router.get('/wishlist',(req,res)=>{
  if(req.session.login){
    res.render('user/wishlist');

  }else{
    res.render('user/login',{loginError:req.session.loginError});
    req.session.loginError=false
  }
 
});


router.get('/orders',async(req,res)=>{
  if(req.session.login){
    let userId = req.session.user._id
    let ordrs = await userHelper.getAllorders(userId)   
  
   
    res.render('user/orders',{ordrs});

  }else{
    res.render('user/login',{loginError:req.session.loginError});
    req.session.loginError=false
  }

});
router.get('/login',(req,res)=>{
  // if(req.session.login){
  //   productHelpers.getAllProducts().then((products) => {
  //     console.log(products)
 
  console.log(req.session.login)
  if(req.session.login){
    res.redirect('/')
  }else{
    res.render('user/login',{loginError:req.session.loginError});
    req.session.loginError=false
  
    
  }
    // console.log(user);
    });
  // }else{
  //  res.redirect('/')
  // }

// })





router.post('/shop', (req,res) => {
  res.header('Cache-control','no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0')
  userHelper.doLogin(req.body).then((response)=>

   {
    console.log(req.body);
    if(response.status){
      req.session.login=true;
      req.session.user=response.user;
      let usar = req.session.user 
      req.session.email=response.email
      req.session.uid=response.id
    


      
        res.redirect('/shop')
      
     }
     else{
      req.session.loginError=true;
      res.redirect('/login');
     }

   })
   .catch((err) => {
    req.session.loggedInError = err.msg;
    console.log(req.session.loggedInError + "log2")
    res.redirect("/login");
  })
})


   

router.post('/otpverify',(req,res)=>{
  otpVerify(req.body,req.session.signupData).then((response)=>{
      
    if (response.valid){
  

          userHelper.doSignup(req.session.signupData).then((response)=>{
          
            console.log("this is "+response);
            res.redirect("/login")
    })
    }
    else{
      
      console.log('otp is wrong');
      res.redirect('/otpsignup')

    }  
  })
  
  
 

})

router.get('/otpsignup',(req,res)=>{
    console.log(req.session.signupData)
   res.render('user/otpsignup')
})

router.get('/signup', (req,res) => {
    let exists = req.session.exist
    res.render('user/signup',{exists} )
    req.session.exist=false
})

router.get('/signout', (req,res) => {
  res.render('user/index')
  
  })




  router.post('/sign', (req,res) => {
    console.log(req.body);
   
    req.session.signupData=req.body;

     userHelper.douniq(req.body).then((response)=>{
      if (response.exist){
        req.session.exist=true
        res.redirect('/signup')
          }else{
      otrp.dosms(req.session.signupData).then((odata)=>{
      
        console.log("its odata"+odata);
        if (odata){
          res.redirect('/otpsignup')

        }else{
          res.redirect('/signup')
        }
      
      })
    }
     })

    })
 


     
 router.get("/shopsingle/:id", async (req, res) => {
     console.log("this is params");
     console.log(req.params.id);
     let id=mongoose.Types.ObjectId(req.params.id)
    req.session.pid=req.params.id 
    let idd=req.session.email
    let cnt =await userHelper.dispaycartCount(idd)
  let Product = await userHelper.getoneProduct(id)

  res.render("user/singlepro",{Product,cnt});
  console.log("Product");
  console.log(Product);
});



    
router.get("/add-cart/:id",async(req,res)=>{

  let oid= mongoose.Types.ObjectId(req.params.id)
  let userId = req.session.user._id
  let price = await userHelper.getprice(oid,userId)
  let Product = await userHelper.getoneProduct(oid)

  crrt=Product
  console.log(Product);

   console.log("hjfhjg");
  
  console.log(oid);
      let id=req.session.email



      console.log("kjfjhgo");



      console.log(id);


      
      userHelper.addCartt(Product[0],id,oid,price).then((response)=>{
 
 
 
 
 
 
        if (response){
         
         
          res.redirect('/cart')
        
        
        }
  console.log("this is respioness");
       console.log(response);


      })


})

router.get('/cart',async(req,res)=>{
  if(req.session.login){


    
    let id=req.session.email
    let oid= mongoose.Types.ObjectId(req.params.id)
   
  
    let cnt =await userHelper.dispaycartCount(id)
    console.log(cnt);
    console.log("this is cnt");
    if (cnt!=0){
    userHelper.getcartdetails(id).then(async(crrt)=>{
   
    
   
    console.log("hh");
    let id=req.session.email
    console.log(id);

    let ttlamnt =await userHelper.dispayttlAmnt(id)

    console.log(id);
    console.log(ttlamnt);
  
        res.render('user/cart',{crrt,cnt,ttlamnt,id});

    })
   } 
    else{

 
      res.render('user/emptyCart')

 }

   
  }else{
    res.render('user/login',{loginError:req.session.loginError});
    req.session.loginError=false
  }


});




router.post('/change-product-quantity/:id',(req,res)=>{
 
 
  console.log("yyyyyyyyytyyyyy");
  console.log(req.body);
  


  userHelper.changeProductQuantity(req.body).then(async(resp)=>{
    console.log("yyyyyyyyytyyyyy");
    let id=req.session.email
  console.log(id);
   resp.total  =  await userHelper.dispayttlAmnt(id)
    
   console.log(resp);
res.json(resp)

})

})



router.get('/checkout', async (req,res)=>{
let userId = req.session.user._id
  let id=req.session.email
  
  let total  =  await userHelper.dispayttlAmnt(id)
  console.log(total[0].total);
  let ttl = total[0].total
   res.render('user/checkout',{ttl,userId})


})

router.post('/payment',async(req,res)=>{
  console.log('hai')
  let products = await userHelper.getCartProductList(req.session.user._id);
  console.log(products)
  let id=req.session.email
  let total  =  await userHelper.dispayttlAmnt(id)
  let ttl = total[0].total
 
  userHelper.checkout(req.body, products, ttl).then(async(orderId) => {
    let orderidd =  await userHelper.getorderid(req.session.user._id)
   console.log("hhhhhhiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
  console.log(orderidd)
 
if (req.body['payment-method'] === "COD") {
  let userId = req.session.user._id
  console.log("lloooooookk schresssss");
    console.log(userId);
    console.log(orderidd);
       userHelper.changecodsts(orderidd,userId).then(()=>{
          res.json({codSuccess: true });
       })
       
        } else {
          console.log(orderId);
          userHelper.generateRazorpay(orderidd, ttl).then((response) => {
           
           
           console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjooooooooooooookkkkkkkkkkkkkkkkkeeeeeeeeeeee");
            console.log(response);
            res.json(response);
          });
        }







})
})


router.post("/cancel-order",async(req,res)=>{
  let userId = req.session.user._id
  console.log(req.body,userId);
  userHelper.cancelOrder(req.body,userId).then(async(resp)=>{
     res.json(resp)
  })
})


router.post("/verify-payment", (req, res) => {
  console.log(req.session.user._id);
  console.log("llllllllllllloooooooooooooookkkkkkkkkkkkkkkkkk");
  userHelper.verifyPayment(req.body).then(()=>{
    console.log('jmkm');
    let userId = req.session.user._id
    console.log(userId);
      
     userHelper.changePaymentStatus(req.body['order[receipt]'],userId).then(()=>{
     console.log('payment success')
     res.json({status:true})
   })
  }).catch((err)=>{
    console.log("fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
   console.log(err)
   res.json({status:false,errMsg:''})
  })
 });

router.post('*',function(req,res){
 
 


  res.render('user/error')


})





router.get('/logout', function(req, res) {

  req.session.destroy()
   res.redirect('/login');
 });
 

module.exports = router;