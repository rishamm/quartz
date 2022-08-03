require('dotenv').config()
const mongoose = require("mongoose");
let user = require("../models/admin");
var bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");


const Razorpay = require("razorpay")
var instance = new Razorpay({
  key_id: process.env.Razorpay_keyID,
  key_secret: process.env.Razorpay_keySecret,
});

module.exports = {
  douniq: (validate) => {
    return new Promise(async (resolve, reject) => {
      //checking if email already exists
      var validphone = {};

      var phne = await user.findOne({ phone: validate.phone, role: false });
      console.log("phne==" + phne);
      if (phne) {
        console.log("phone number already exists");

        validphone.exist = true;

        resolve(validphone);
      } else {
        validphone.exist = false;
        resolve(validphone);
      }
    });
  },

  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      //encrypting password
      userData.password = await bcrypt.hash(userData.password, 10);

      //entering new user details
      let usr = user
        .create({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          role: false,
        })
        .then((data) => {
          console.log(data);

          data.insertedId = true;

          resolve(data.insertedId);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let usr = await user.findOne({ email: userData.email, role: false });
      // console.log(usr);
      if (usr) {
        if (usr.block) {
          reject({ status: true, msg: "your account has been blocked" });
        } else {
          bcrypt.compare(userData.password, usr.password).then((status) => {
            if (status) {
              console.log("login success");

              response.user = usr;
              response.status = true;
              response.email = userData.email;
              resolve(response);
            } else {
              console.log("login failed");
              response.passErr = true;
              response.status = false;
              resolve({ status: false });
            }
          });
        }
      } else {
        console.log("login fail");
        response.status = false;
        response.emailErr = true;
        resolve(response);
      }
    });
  },
  getoneProduct: (data) => {
    return new Promise(async (resolve, reject) => {
      const displaypro = await user.aggregate([
        { $unwind: { path: "$products" } },
        { $match: { "products._id": data } },
      {$project:{_id:0,products:1}}]);
      resolve(displaypro);
      console.log(displaypro);
    });
  },

  dispaycartCount: (Email) => {
    console.log(Email);

    let cnt = 0;

    return new Promise(async (resolve, reject) => {
      const cart = await user.aggregate([
        { $match: { email: Email } },
        { $unwind: { path: "$cart" } },
      ]);

      cnt = cart.length;
      console.log("this is cart count");
      console.log(cart.length);

      resolve(cnt);
    });
  },

  dispayttlAmnt: (Email) => {
    console.log("thidsssss");
    console.log(Email);
    console.log("hiddssss");
    let total = 0;

    return new Promise(async (resolve, reject) => {
      const cartTotal = await user.aggregate([
        { $match: { email: Email } },
        { $unwind: { path: "$cart" } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: ["$cart.qty", "$cart.productdetails.products.price"],
              },
            },
          },
        },
      ]);

      console.log("this is cart total");

      // console.log(cartTotal[0].total);

      resolve(cartTotal);
    });
  },

 getprice:async (oidd,userd)=>{
  let oid = mongoose.Types.ObjectId(oidd);
  console.log("heeyy ");
  console.log(userd)
  console.log(oidd);
    return new Promise(async (resolve, reject) => {
      const prr = await user.aggregate([
       
        { $unwind: { path: "$products" } },
        { $match: { "products._id": oid } },
        {$project:{_id:0,
          'products.price':1}}
      ]);
      if (prr.length > 0) {
     console.log(prr[0].products.price);
     resolve(prr[0].products.price)
    }

   })

  

 },

  










  addCartt: (product, Email, pidd,price) => {
    console.log(pidd);
    let oid = mongoose.Types.ObjectId(pidd);
    console.log("vcvvvvvvvvvvvvvvvvvvvvvvv");
    console.log(oid);
   console.log(price)
    return new Promise(async (resolve, reject) => {
      const prr = await user.aggregate([
        { $match: { email: Email } },
        { $unwind: { path: "$cart" } },
        { $match: { "cart.productdetails.products._id": oid } },
      ]);

      // const ttt = await user.aggregate([
      //   { $match: { email: Email } },
      //   { $unwind: { path: "$cart" } },
      //   { $match: { "cart.productdetails.products.stock": oid } },
      // ]);

      console.log("thiss is prr");
      console.log(prr.length);

      if (prr.length > 0) {
        //    let kkk=  await user.findOne({ email: Email, 'cart.productdetails.products._id': oid })

        if ("product.stock" == "cart.qty") {
          console.log("ffffffuckkkyuuuuuuuu");
        }
        console.log("ffffffuckkk");

        let items = await user
          .findOneAndUpdate(
            { email: Email, "cart.productdetails.products._id": oid },
            { $inc: { "cart.$.qty": 1 ,"cart.$.price":price} }
          )
          .exec();
        console.log(items);
        resolve(items);
      } else {
        let carrt = await user
          .updateOne(
            { email: Email, role: false },
            {
              $push: { cart: { productdetails: product, qty: 1,price:price,isdeleted:false,ship:false,cancel:false,completed:false,placed:false} },
            }
          )
          .then((data) => {
            console.log(data);
            resolve(data);
          });
      }
    });
  },
  getcartdetails: (mail) => {
    return new Promise(async (resolve, reject) => {
      let crrrt = await user.aggregate([
        { $match: { role: false, email: mail } },
        { $unwind: { path: "$cart" } },
      ]);

      resolve(crrrt);
    });
  },

  changeProductQuantity: ({ cart, product, stock,Price,id, count, quantity }) => {
    count = parseInt(count);
    quantity = parseInt(quantity);

    console.log(quantity);
    console.log(Price)
    console.log(stock);
    console.log("jjjjjjjjjjj");
    console.log(id);
    console.log(cart);
   
    console.log("carrrttt");
    console.log(product);
    console.log("count");
    console.log(count);

    //   removing products  from cart if quantity goes less than zero
    return new Promise((resolve, reject) => {
      if (quantity >= stock) {
        user
          .updateOne(
            {
              "cart._id": ObjectId(cart),
              "cart.productdetails.products._id": ObjectId(product),
            },
            {
              "cart.$.qty": stock,
            }
          )
          .then((response) => {
            console.log(response);

            resolve({ status: true });
          });
      } else {
        if (count == -1 && quantity == 1) {
          user
            .updateOne(
              {
                "cart._id": ObjectId(cart),
                "cart.productdetails.products._id": ObjectId(product),
              },
              {
                $pull: { cart: { _id: ObjectId(cart) } },
              },
            )
            .then((resonse) => {
              console.log("this is response from userhelper");
              console.log(resonse);
              console.log("this is after response");

              resolve({ removeProduct: true });
            });
        } else {
          // increasing qty of products in the cart
          if (count == 1){
          user.updateOne(
              {
                "cart._id": ObjectId(cart),
                "cart.productdetails.products._id": ObjectId(product),
              },
              {
                $inc: { "cart.$.qty": count ,"cart.$.price":Price},
                
              },

       
            
      
            )
            .then((response) => {
              console.log(response);

              resolve({ status: true });
            });}else{
            
              user
              .updateOne(
                {
                  "cart._id": ObjectId(cart),
                  "cart.productdetails.products._id": ObjectId(product),
                },
                {
                  $inc:{ "cart.$.qty": -1 ,"cart.$.price":-1},
                  
                },
  
         
              
        
              )
              .then((response) => {
                console.log(response);
  
                resolve({ status: true });
              });





         
            }
        }
      }
    });

   





  },

  
  getCartProductList: (dd) => {
    console.log(dd)
    return new Promise(async (resolve, reject) => {

    const prr = await user.aggregate([
        { $match: { _id: ObjectId(dd) } },
        { $unwind: "$cart"  },
        { $project:{ _id:1,cart:1} },
        
      ]).then((prr)=>{
        console.log(prr);
        resolve(prr)

     
    })
 
    })




  },
  checkout:(order,product,ttl)=>{


    return new Promise(async(res,rej)=>{
      console.log(order,product,ttl)
      // let status = order['payment-method'] === 'COD'?'Placed':'Pending'
      // let placed = order['payment-method'] === 'COD'? true: false
      const str = new Date()
      const orr = str.toGMTString();
      console.log(orr);

     let orders = await user.updateOne( { _id:ObjectId(order.userId)}, {$push: { orders:{
        
        address:[{
          
          fname:order.ffname,
          lname:order.llname,
          city:order.city,
          street:order.street,
          state:order.state,
          house:order.house,
          mob:order.mon,
          pincode:order.pin,
          mail:order.mail,
          userId:ObjectId(order.userId),
       
        }],
       
        user:order.userId,
        paymethod:order['payment-method'],
        productss:product,
        totalAmount:ttl,
        

        date:orr
        
      }}}) .then((response)=>{
        

          



          user.updateOne(
            {
              _id:ObjectId(order.userId),
             
            },
            {
              $pull: { cart:{isdeleted:false}},
            }
          )
          .then((resonse) => {
            console.log("this is response from userhelper");
            console.log(resonse);
            console.log("this is after response");

 
          });
          console.log("this response after order");
          console.log(response);
          res(response)
      })
    })








  },
   getproId:(ddd) =>{

    user.aggregate([
      { $match: { _id: ObjectId(id) } },
      { $unwind:'$cart' }
      
    ])

   },



  generateRazorpay:(orderId,total)=>{
    console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
    console.log("kkkkkkkkkkkkkkkkkkkkkkkk"+orderId)
    console.log(total)
    return new Promise((resolve,reject)=>{
      var options = {
        amount:total*100,
        currency:"INR",
        receipt:""+orderId
      }
      instance.orders.create(options, function(err,order){
        console.log(order)
        console.log(err)
        console.log("New order :" ,order)
         
        resolve(order)

      })
    })
  },
  verifyPayment:(details)=>{
    console.log(details);
    return new Promise((resolve,reject)=>{
      console.log("uuuuuuuuuuuuuuuuuuuuukkkkkkkkkkkkkk");
      const crypto = require('crypto')
      let hash = crypto.createHmac('sha256', key_secret).update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
      hash = hash.digest('hex')
      if(hash == details['payment[razorpay_signature]']){
        console.log("kkkkkkkkkkkkkkkkuuuuuuuuuuuuuuuuuuuuuuu");
        resolve()
      }else{
        reject()
      }
    })
  },
  changePaymentStatus:(orderId,usr)=>{

    console.log("dddddddddddddddddddd");
    console.log(usr);
    return new Promise((res,rej)=>{
      user.updateMany(
        {_id:ObjectId(usr),"orders._id":ObjectId(orderId)},
        {
          $set:{
            'orders.$.productss.$[].cart.status':'Placed',
          'orders.$.productss.$[].cart.placed':true
          }
        },{
           arrayFilters:[
            {
              "orders._id":{
                "$eq":ObjectId(orderId)
              }
            }
           ]
        }
      ).then((resp)=>{
        console.log('ssssssssssssssssss')
        console.log(resp)
        console.log("look grow up");
        res()
      })
    })
  }
,

   getorderid:(id)=>{

    console.log(id)
     return new Promise(async(resolve, reject) => {

      const pr = await user.aggregate([
        { $match: { _id: ObjectId(id) } },
        { $unwind: "$orders"  },
        { $sort:{"orders.date":-1} },
      ]).then((pr)=>{
        console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
        console.log(pr);
        console.log("ooooooooooooooooooooooooooooo");
        console.log(pr[0]);
        console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
       
        kr=pr[0].orders._id;
        resolve(kr)


    })
   })
  },


  getAllorders:(idddd)=>{
    console.log(idddd)
    return new Promise(async(resolve, reject) => {

     const ph = await user.aggregate([
       { $match: { _id: ObjectId(idddd) } },
       { $unwind: "$orders"  },
       { $unwind: "$orders.productss"  },  
       { $sort:{"orders.date":-1} },
     ])
     
     
     .then((ph)=>{

      
        resolve(ph)



     })
    })




  },
  changecodsts:(ord,usd) => {
    console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkoooooooooooooooooo");
    console.log(ord);
    console.log(usd);
    return new Promise((res,rej)=>{
      user.findOneAndUpdate(
        {_id:ObjectId(usd),'orders._id':ObjectId(ord)},
        {
          
          $set:{
          
          'orders.$.productss.$[].cart.status':'Placed',
          'orders.$.productss.$[].cart.placed':true
       
         
        }
        
      },    {
        arrayFilters:[{

          'orders._id':ObjectId(usd)
        }]
      }

      ).then((resp)=>{
        console.log('ssssssssssssssssss')
        console.log(resp)
        console.log("look grow up");
        res()
      })
    })

   


  },

  cancelOrder:({prid,odid},userid) => {
    console.log("hhhahahahahah ");
     console.log(prid);
     console.log(odid);
     console.log(userid)

     return new Promise((res,rej)=>{
      user.updateOne(
        {_id:ObjectId(userid),'orders.productss.cart._id':ObjectId(prid)},
        {
          $set:{
            'orders.$.productss.$[i].cart.status':'Cancelled',
            'orders.$.productss.$[i].cart.cancel': true,
            'orders.$.productss.$[i].cart.placed':false
           
          }
          
        },
        {
          arrayFilters:[{

            'i.cart._id':ObjectId(prid)
          }]
        }
      
      ).then((resp)=>{
        console.log('ssssssssssssssssss')
        console.log(resp)
        console.log("look grow up");
        res({stsus:true})
      })
    })

  },


};
