require('dotenv').config()

const accountSID = process.env.accountSID
const authToken = process.env.authToken
const serviceSid = process.env.serviceSid

const sms = require('twilio')(accountSID,authToken);



module.exports={
    dosms:(nodata)=>{
      console.log(nodata);
     let res = {}
   
     console.log(nodata);
      return new Promise(async(resolve,reject)=>{
         
      sms.verify.services(serviceSid).verifications.create({
       
        to : `+91${nodata.phone}`,
        channel : "sms"
   

      }).then((res)=>{
        res.valid = false;
        resolve(res)
        console.log(res);

    
    })
        


      })
      
      
      


    },

    otpVerify:(otpData,nuData)=>{


        let resp = {}
        let ni = nuData.phone
        return new Promise(async(resolve,reject)=>{
           
        sms.verify.services(serviceSid).verificationChecks.create({
         
          to : `+91${ni}`,
          code : otpData.otp
  
  
        }).then((resp)=>{
         
         console.log('verfication failed');
         console.log(resp);
         resolve(resp)
  
      
      })
          
  
  


        })
    }
}




