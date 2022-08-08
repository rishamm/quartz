var db  = require ('../config/connection')
const user= require('../models/admin')
var bcrypt= require ('bcrypt')
const async = require('hbs/lib/async')
const { ObjectId } = require("mongodb");


module.exports={
    doLogin: (userData)=>{
        return new Promise(async(resolve,reject)=>{
           
          let response={}
          let admindetail=await user.findOne({name: userData.name,role:true}) 
          if(admindetail){

              bcrypt.compare(userData.password,admindetail.password).then((status)=>{
                  
                  if(status){
                      console.log("Login success")
                      response.status=true;
                      resolve(response)
                  }else{
                    
                    console.log("Login faile")
                    response.status=false
                    response.userErr=true
                      resolve(response) ;
                  }
              })
              
          }
          else{
            response.status=false
            response.paswdErr=true
            console.log("login failed")
            resolve(response) ;
        }
    
       }) 
    },
     
    getAllUsers:()=>{
        return new Promise(async(resolve,reject) =>{
            let users = await user.aggregate([{
                
                $match: { 
                    role:false
                }
           
           
           
            },
            {
              $project:  {
                   role:0,
                   __v:0 

              }




            }
        
        
        
        
        ])
            resolve(users)
        })
},

    blockUser:(userId)=>{
        console.log(userId)
        return new Promise (async (resolve,reject)=>{
          const usar = await user.findByIdAndUpdate(
                 { 
                    _id:userId
                
                },
           
            {
                $set:
                {
                    block:true
                }
            
            
            },
            {
                upsert:true
            
            }
            )
            resolve(usar)
        })
      },
    
    
    unBlockUser:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      const usar = await user.findByIdAndUpdate(
        {
            _id: userId
        
        
        },
        {
            $set:
            {
                block: false 
            }
        },
        {
            
            
            upsert:true
      
      
        }
        )
        resolve(usar)
      })
    },
    addCategory :(categoryData)=>{
     console.log(categoryData);
        return new Promise(async(resolve,reject)=>{
            let category=await user.updateOne({role: true},{$push:{category:{category: categoryData.category, isdeleted: false}}
        }).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
}
,
getCategory : ()=>{
    return new Promise(async(resolve,reject)=>{ 
        console.log("hai");
        let displayCategory = await user.aggregate([
            {
                $project:{
                    _id:0,
                    category:{
                        $filter:{
                            input: '$category',
                            as:'category',
                            cond: {
                                $eq: [
                                    '$$category.isdeleted',false,
                                ]
                            },
                            
                        }, 
                    },
                }
            }
        ])
        console.log(displayCategory[2])
        resolve(displayCategory[2])
    })
},
deleteCategory:(id)=>{
    return new Promise(async(resolve,reject)=>{ 
        let deleteCategory = await user.updateOne({'category._id': id},{$set : {'category.$.isdeleted': true}})
        resolve(deleteCategory)
    })
},

updateCategory:(id,categoryData)=> {
    return new Promise(async (resolve, reject)=> {
        let updateCategoryone= await user.updateOne({'category._id': id},{$set: {'category.$.category': categoryData.categoryEdit}})
        resolve(updateCategoryone)
    })
},




addProducts:(productData, images)=>{
    return new Promise(async(resolve,reject)=>{
        let category=await user.updateOne({role:true},{$push:{products:{
            productname: productData.productname,
            discription:productData.discription,
            brand: productData.brand,
            category: productData.category,
            sku:productData.sku,
            price:productData.price,
            color:productData.color,
            stock:productData.stock,
            strap:productData.strap,

          
            isdeleted: false,
            created_at: new Date(),
            Images: images}}
    }).then((data)=>{
        console.log(data)
        resolve(data)
    })
})
},
getAllproducts : ()=>{
    return new Promise(async(resolve,reject)=>{ 
        let displaypro = await user.aggregate([
            { $match : { role: true } },
            {
                $project:{
                  _id:1,
                    products:{
                        
                        $filter:{
                            input: '$products',
                            as:'products',
                            cond: {
                                $eq: [
                                    '$$products.isdeleted',false,
                                ]
                            },
                            
                        }, 
                    },
                }
            } 
           
        ])
        resolve(displaypro[0])
        console.log(displaypro)
    })
},
deleteproducts:(id)=>{
    return new Promise(async(resolve,reject)=>{ 
        let deleteRoom = await user.updateOne({'products._id': id},{$set : {'products.$.isdeleted': true}})
        resolve(deleteRoom)
    })
},


getCatogoryproducts: (id)=>{
    return new Promise(async(resolve,reject)=>{ 
        let categoryDetail = await user.aggregate( [{ $match : { role : true } },{ $unwind : "$category" },{$match:{'category._id':id}}] )
        let displayproduct = await user.aggregate( [ { $unwind : "$products" },{ $match : { 'products.isdeleted' : false,  'products.category' : categoryDetail[0].category.category} } ] )
        
        
        console.log(displayproduct)
        
        resolve(displayproduct)
    })
},
uniqueCategory :(categoryData)=> {
        
    return new Promise (async(resolve, reject)=> {
        let response={}
        let uniqueCategory= await user.aggregate([{$match: {role: true}},{ $unwind : "$category" },{ $match : { 'category.category' : categoryData.category } },{$match:{'category.isdeleted' : false}}])
        console.log(uniqueCategory);
        let uniqueCategoryLength = uniqueCategory.length
        console.log(uniqueCategoryLength)
        if (uniqueCategoryLength){
            response.exist=true;
            resolve(response)
        }

        else{
            response.exist=false;
            resolve(response)  
        }
    })
},
sortProducts : (sort)=>{
    return new Promise(async(resolve,reject)=>{ 
        let displaypro = await user.aggregate([
            { $match : { role: true } },
            {
                $project:{
                    _id:0,
                    products:{
                        $filter:{
                            input: '$products',
                            as:'products',
                            cond: {
                                $eq: [
                                    '$$products.isdeleted',false,
                                ]
                            },
                            
                        }, 
                    },
                }
            },{ $unwind : { path : "$products" } },
            {$sort:{"products.price":sort}}
        ])
        resolve(displaypro)
        console.log(displaypro)
    })
},

filterColor:(color)=>{
    return new Promise(async(resolve,reject)=>{ 
        let displaypro = await user.aggregate([
            { $match : { role: true } },
            {
                $project:{
                    _id:0,
                    products:{
                        $filter:{
                            input: '$products',
                            as:'products',
                            cond: {
                                $eq: [
                                    '$$products.isdeleted',false,
                                ]
                            },
                            
                        }, 
                    },
                }
            },
            {
                $project:{
                    
                    products:{
                        $filter:{
                            input: '$products',
                            as:'products',
                            cond: {
                                $eq: [
                                    '$$products.color',color,
                                ]
                            },
                            
                        }, 
                    },
                }
            }
        ])
        resolve(displaypro[0])
        console.log(displaypro)
    })

},

getAllorders:()=>{
   
    return new Promise(async(resolve,reject)=>{
        let disOrders = await user.aggregate([
        { $match:{
          role:false

        },
    },

        { $unwind:{ path:'$orders' }}
        , {$unwind:{  path: '$orders.productss'}}
        
       ,{ $project: {_id:0,orders:1}}
      
     
            

        ])





     console.log(disOrders[0])
     resolve(disOrders)

    })



},

changeadminStatus:({orderid,cartid})=>{
   
    console.log("admin status changing");
   console.log( cartid);
   console.log("this is cart id");
   console.log(orderid);
   console.log("after order id");
 return new Promise (async(resolve,reject)=>{
    let sts = await user.updateOne({role:false,"orders._id":orderid},
        
        
        {
            $set:{
                'orders.$.productss.$[i].cart.status':"Cancelled",
       
              }


        },
        {
          arrayFilters:[{

            'i.cart._id':ObjectId(cartid)
          }]
        })

     console.log(sts);
     resolve({sts:true})
 })


    
},
changeadminStatus2:({orderid,cartid})=>{
   
    console.log("admin status changing");
   console.log( cartid);
   console.log("this is cart id");
   console.log(orderid);
   console.log("after order id");
 return new Promise (async(resolve,reject)=>{
    let sts = await user.updateOne({role:false,"orders._id":orderid},
        
        
        {
            $set:{
                'orders.$.productss.$[i].cart.status':"Out for Delivery",
       
              }


        },
        {
          arrayFilters:[{

            'i.cart._id':ObjectId(cartid)
          }]
        })

     console.log(sts);
     resolve({sts:true})
 })


    
},
changeadminStatus3:({orderid,cartid})=>{
   
    console.log("admin status changing");
   console.log( cartid);
   console.log("this is cart id");
   console.log(orderid);
   console.log("after order id");
 return new Promise (async(resolve,reject)=>{
    let sts = await user.updateOne({role:false,"orders._id":orderid},
        
        
        {
            $set:{
                'orders.$.productss.$[i].cart.status':"Shipped",
       
              }


        },
        {
          arrayFilters:[{

            'i.cart._id':ObjectId(cartid)
          }]
        })

     console.log(sts);
     resolve({sts:true})
 })


    
},
changeadminStatus4:({orderid,cartid})=>{
   
    console.log("admin status changing");
   console.log( cartid);
   console.log("this is cart id");
   console.log(orderid);
   console.log("after order id");
 return new Promise (async(resolve,reject)=>{
    let sts = await user.updateOne({role:false,"orders._id":orderid},
        
        
        {
            $set:{
                'orders.$.productss.$[i].cart.status':"Pending",
       
              }


        },
        {
          arrayFilters:[{

            'i.cart._id':ObjectId(cartid)
          }]
        })

     console.log(sts);
     resolve({sts:true})
 })


    
}




}

