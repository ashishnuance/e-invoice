const companyModel = require("../models/getCompanyModel.js");
const pdf = require("pdf-creator-node");
// const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const dirpath = __dirname;
// const app = require('express');
const https = require('node:https');
const axios = require('axios');
var express=require('express');
const token_gen_url = 'https://api.myvfirst.com/psms/api/messages/token';
// const pdf_domain_url = 'http://143.110.181.88/e-invoice/app/assets-file/';
const pdf_domain_url = 'http://142.93.213.88:8081/app/assets-file/';
const domain_url = 'http://142.93.213.88:8081';
const domain_path = 'http://142.93.213.88';
const Joi = require('joi');
app=express();

var token_value = '';


// Retrieve all Tutorials from the database (with condition).
exports.findAll = (req, res) => {
  const title = req.query.title;
  //console.log(req.body,title)
  
  companyModel.get(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    else res.status(200).send(data);
  });
};

// Retrieve data by id from the database (with condition).
exports.findId = async (req, res) => {
  const id = req.params.id;
  console.log(dirpath,id);
  return res.status(200).send({
    message: "id"+id
  });
  
  return res.status(500).send({
    "message":'Try again'
  }) 
};

const tokenjsonfile = async () =>{
  const  filename = '/var/www/html/e-invoice/app/assets-file/st_token.json';
  // current date
  var date = new Date();
  await fs.readFile(filename, async (err, data) => {
    // Check for errors
    if (err) throw err;
    // Converting to JSON
    const token_data = JSON.parse(data);
    var date_t = new Date(token_data.expiryDate);
    var month_g = (date_t.getMonth() + 1);
    month_g = (month_g<=9) ? '0'+month_g : month_g
    var days = date_t.getDate();
    days = (days<=9) ? '0'+days : days
    var token_exp_date = date_t.getFullYear()+'-'+month_g+'-'+days;
    // console.log(token_data);
    var d2 = new Date(token_exp_date);
    if(date.getTime() < d2.getTime()){
      // console.log('old working fine');
      token_value = token_data.token;
      // resp.status(200).send({'message':'old working fine','token_value':token_value});
      return {'filename':filename,'date':date,'token_value':token_value}
    }
  })
}


exports.customerinvoice = async (req,resp) => {
  console.log('dirpath',dirpath)
  
  if(req.headers.authorization != 'Basic ZmxhbWJvd2E6UlRfJUt5YlowJQ==')
  {
    resp.status(400).send({
      message: "Anauthorize user"
    });
    return
  }
  
  if(!req.body || Object.keys(req.body).length == 0){
    resp.status(400).send({
      message: "fields can not be empty!"
    });
    return
  }
  
  const schema = Joi.object({
    company_code: Joi.string().required(),
    store_code: Joi.string().required(),
    inv_no: Joi.string().required(),
    payment_mode: Joi.string().required(),
    date: Joi.string().required(),
    amount: Joi.number().required(),
    customer_mobile: Joi.number().required(),
    customer_name: Joi.string().required(),
    rounding_amt: Joi.number().required(),
    tot_discount_amt: Joi.number().required(),
    points_earned: Joi.number().required(),
    store_name: Joi.string().required(),
    address_1: Joi.string().required(),
    address_2: Joi.string().required(),
    city: Joi.string().required(),
    pincode: Joi.string().required(),
    state: Joi.string().required(),
    phone_no: Joi.number().required(),
    gstin_no: Joi.string().required(),
    fssai_no: Joi.string().required(),
    payment_mode: Joi.string().required(),
    amount: Joi.number().required(),
    status: Joi.number(),
    lines: Joi.array().required(),
    email_id:Joi.string(),
    website_link:Joi.string()
  });

  const lineSchema = Joi.object({
    company_code: Joi.string().required(),
    inv_no: Joi.string().required(),
    item_no: Joi.string().required(),
    item_description: Joi.string().required(),
    item_unit: Joi.number().required(),
    quantity: Joi.number().required(),
    rate: Joi.number().required(),
    amount: Joi.number().required(),
    discount: Joi.number().required(),
    discount_amt: Joi.number().required(),
    CGST: Joi.string().required(),
    CGST_amt: Joi.number().required(),
    SGST: Joi.string().required(),
    SGST_amt: Joi.number().required(),
    IGST: Joi.string().required(),
    IGST_amt: Joi.number().required(),
    tot_GST: Joi.string().required(),
    tot_GST_amt: Joi.number().required()
  })
  
  const linesSchema = Joi.array().items(lineSchema);

  const { error, value } = schema.validate(req.body);
  const { errorlines } = linesSchema.validate(req.body.lines);

  if (error) {
    resp.status(400).send(error.details);
    return
  }

  if (errorlines) {
    
    resp.status(400).send(errorlines.details);
    return
  } 

  const insertHeader = {
    company_code:req.body.company_code,
    store_code:req.body.store_code,
    inv_no:req.body.inv_no,
    date:req.body.date,
    customer_mobile:req.body.customer_mobile,
    customer_name:req.body.customer_name,
    rounding_amt:req.body.rounding_amt,
    tot_discount_amt:req.body.tot_discount_amt,
    points_earned:req.body.points_earned,
    store_name:req.body.store_name,
    st_address_1:req.body.address_1,
    st_address_2:req.body.address_2,
    st_city:req.body.city,
    st_pincode:req.body.pincode,
    st_state:req.body.state,
    st_phone_no:req.body.phone_no,
    st_gstin_no:req.body.gstin_no,
    st_fssai_no:req.body.fssai_no
  };
  
  const insertLine = [];
  if(req.body.lines){
    req.body.lines.forEach(function (lineValue) {
      insertLine.push(
        { 
          company_code: lineValue.company_code,
          inv_no: lineValue.inv_no,
          item_no: lineValue.item_no,
          item_description: lineValue.item_description,
          item_unit: lineValue.item_unit,
          quantity: lineValue.quantity,
          rate: lineValue.rate,
          amount: lineValue.amount,
          discount: lineValue.discount,
          discount_amt: lineValue.discount_amt,
          CGST: lineValue.CGST,
          CGST_amt: lineValue.CGST_amt,
          SGST: lineValue.SGST,
          SGST_amt: lineValue.SGST_amt,
          IGST: lineValue.IGST,
          IGST_amt: lineValue.IGST_amt,
          tot_GST: lineValue.tot_GST,
          tot_GST_amt: lineValue.tot_GST_amt,
          status: lineValue.status
        }
      );  
    });
  }

  
  const insertPayment = {
    company_code:req.body.company_code,
    store_code:req.body.store_code,
    inv_no:req.body.inv_no,
    payment_mode:req.body.payment_mode,
    amount:req.body.rounding_amt
  };
  
  const insertData = {'insertPayment':insertPayment,'insertLine':insertLine,'insertHeader':insertHeader};
  
  /**/
  await companyModel.createinvoice(insertData,(err,data) => {
    if(err){
      resp.status(500).send({
        message:err.message || "try again"
      })
    }else{
      // console.log('data',data)
      // try {
        var template_name = (insertHeader.template_formate!='' && insertHeader.template_formate==2) ? "invoice-template-2.html" : "invoice-template-3.html";
        var html = fs.readFileSync(template_name, "utf8");

        
        var options = {
          childProcessOptions: {
            env: {
              OPENSSL_CONF: '/dev/null',
            },
          }
          // format: "A5",
          // border: "5mm"
        };
        let insertHeaderData = insertData.insertHeader;
        let insertLineData = insertData.insertLine;
        let insertPaymentData = insertData.insertPayment;
        let discountAmt = gstAmt = subTotalAmt = itemCount = cgst6 = sgst6 = cgst12 = sgst12 = cgst9 = sgst9 = cgst25 = sgst25 = cgst14 = sgst14 = 0;
        let gstType =[];
        insertLineData.forEach(function(val){
          discountAmt += Number(val.discount_amt)
          gstAmt += Number(val.tot_GST_amt)
          subTotalAmt += Number(val.amount)
          itemCount += Number(val.quantity)
          if(val.CGST=="6%"){
            cgst6 += val.CGST_amt
            sgst6 += val.SGST_amt
          }else if(val.CGST=="9%"){
            cgst12 += val.CGST_amt
            sgst12 += val.SGST_amt
          }else if(val.CGST=="12%"){
            cgst9 += val.CGST_amt
            sgst9 += val.SGST_amt
          }else if(val.CGST=="25%"){
            cgst25 += val.CGST_amt
            sgst25 += val.SGST_amt
          }else if(val.CGST=="14%"){
            cgst14 += val.CGST_amt
            sgst14 += val.SGST_amt
          }
        })
        let companyData = (data.data.length && data.data[0]!='') ? data.data[0] : [];
        
        var invoice = 
        {
          companyname: (companyData) ? companyData.company_name : insertHeaderData.company_code,
          address: insertHeaderData.st_address_1,
          country:insertHeaderData.st_city,
          companyphone:insertHeaderData.st_phone_no,
          cin:insertHeaderData.st_gstin_no,
          gstn:insertHeaderData.st_gstin_no,
          reg:insertHeaderData.st_fssai_no,
          shopname:insertHeaderData.store_name,
          discountAmt:discountAmt,
          cgst6:cgst6,
          sgst6:sgst6,
          cgst12:cgst12,
          sgst12:sgst12,
          cgst9:cgst9,
          sgst9:sgst9,
          cgst25:cgst25,
          sgst25:sgst25,
          cgst14:cgst14,
          sgst14:sgst14,
          gstAmt:gstAmt,
          subTotalAmt:subTotalAmt,
          itemCount:itemCount,
          amount:insertPayment.amount,
          customer_name:insertHeaderData.customer_name,
          customer_phone:insertHeaderData.customer_mobile,
          logo: domain_url+'/logo',
          orderdetail:
          {
            orderno: 'ORD'+insertHeaderData.inv_no,
            mobile: insertHeaderData.customer_mobile,
            transactionNo:insertHeaderData.inv_no,
            invoiceNo:insertHeaderData.inv_no,
            date: (insertHeaderData.date),
            emailId:req.body.email_id,
            websiteLink:req.body.website_link
          },
          productdetail:insertLineData
        }
        var crypto = require("crypto");
        var random_string = crypto.randomBytes(20).toString('hex');
        let filename = random_string+'-com888'+insertHeaderData.company_code;
        
        var document = {
          html: html,
          data: {
            invoice: invoice,
          },
          path: dirpath+"./../assets-file/"+filename+".pdf",
          type: "",
        };
        
        console.log('document',document);

        
        pdf.create(document, options)
        .then(async (res) => {
          
          const customer_invoice = pdf_domain_url+filename+'.pdf';
          
          // console.log('res',res)
          // const  token_filename = '/var/www/html/e-invoice/app/assets-file/st_token.json';
          // current date
          var date = new Date();
          if(companyData && (companyData.send_by == 'WhatsApp' || companyData.send_by == 'Both') && companyData.whatsup_detail){
            let whastappData = JSON.parse(companyData.whatsup_detail);
            // console.log('whatsup_detail',whastappData);
            let body = {
                "messaging_product": whastappData.messaging_product,
                "recipient_type": whastappData.recipient_type,
                "to": invoice.customer_phone,
                "type": "template",
                "template": {
                    "language": {
                        "code": "en"
                    },
                    "name": whastappData.template_name,
                    "components": [
                        {
                            "type": "header",
                            "parameters": [
                                {
                                    "type": "document",
                                    "document": {
                                        "link": domain_path+'/app/assets-file/'+filename+'.pdf',
                                        "filename":"Invocie"
                                    }
                                    
                                }
                            ]
                        },
                        {
                            "type": "body",
                            "parameters": []
                        }
                    ]
                }
            }
            console.log('whatsappData',body,body.template.components[0].parameters)
            let insertLogData;
            // console.log('headers',{headers:{'wanumber':whastappData.wanumber,'apikey':whastappData.apikey}})
            await axios.post(whastappData.apiUrl,body,{headers:{'wanumber':whastappData.wanumber,'apikey':whastappData.apikey}}).then( async (result) => {
              console.log('whatsapp result',JSON.stringify(result.data));
              insertLogData = {'mobile_no':invoice.customer_phone,'type':'whatsapp','invoice_header_id':data.invoiceId,'log':JSON.stringify(result.data)};
              
              // console.log('whastappData result',result);
              // resp.status(200).send({'mesg':'resultdata','data':result.data.MESSAGEACK,'filename':customer_invoice});
              //resp.status(200).send({'mesg':'resultdata','filename':customer_invoice});
            }).catch (err => {
              console.log('whastappData err',err)
              insertLogData = {'mobile_no':invoice.customer_phone,'type':'whatsapp','invoice_header_id':data.invoiceId,'log':JSON.stringify(result)};
              // resp.status(403).send(err);
            });

            // console.log('insertLogData',insertLogData);
            await companyModel.createInvoiceLog(insertLogData,(err,data) => {
              if(err){
                resp.status(500).send({
                  message:err.message || "Invocie log not created.please try again"
                })
              }
            });
          }
          resp.status(200).send({'message':'successfully created pdf','filename':domain_url+'/api/company/invoicename/'+filename})
          return
          // res.status(200).send(data)
        })
        .catch((error) => {
          console.log('document err',error);
          // resp.status(403).send(err);
          return
        });
        
      // } catch (error) {
      //   resp.status(403).send(err);
      // }
      // resp.status(200).send({'message':'successfully created pdf','filename':domain_url+'/api/company/invoicename/'+filename})
      //     return
      
    }
  })

}



exports.customerinvoicepdf = (req,res) => {
  const id = req.params.invoicename;
  
  // D:\xampp-8.2\htdocs\e-invoice\e-invoice\app\assets-file
  res.sendFile('/var/www/html/app/assets-file/'+id+'.pdf'); 
}




exports.meetups = (req,res) => {
// app.post('/meetups',function(req,res){
    console.log(req.body);
    res.status(200).send(req.body);
    // res.json({ message: "meetups application." });
};


exports.test_register = (req,res) => {
      console.log(req);
  //     axios.get('http://webcode.me').then(res => {

  //         console.log(res.data);
          
          res.status(200).send(req.body);
  //     });
      
  
  // app.get('http://webcode.me',function(req,res){
  //     res.status(200).send(res);
  //     // res.json({ message: "generate token" });
  // });
}

// get ip address
exports.ip_address = async (req,resp) => {
  var os = require('os');
  var networkInterfaces = os.networkInterfaces();
  console.log(networkInterfaces);
}

exports.generate_token = async (req,resp) => {
  const  filename = '/var/www/html/e-invoice/app/assets-file/st_token.json';

  // current date
  var date = new Date();
  // console.log(date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate())
  // Read json file
  fs.readFile(filename, async (err, data) => {
        
      // Check for errors
      if (err) throw err;
     
      // Converting to JSON
      const token_data = JSON.parse(data);
      var date_t = new Date(token_data.expiryDate);
      var month_g = (date_t.getMonth() + 1);
      month_g = (month_g<=9) ? '0'+month_g : month_g
      var days = date_t.getDate();
      days = (days<=9) ? '0'+days : days
      var token_exp_date = date_t.getFullYear()+'-'+month_g+'-'+days;
      // console.log(token_data);
      var d2 = new Date(token_exp_date);
      if(date.getTime() < d2.getTime()){
        // console.log('old working fine');
        token_value = token_data.token;
        resp.status(200).send({'message':'old working fine','token_value':token_value});
      }else{
        // generate token using api
        await axios.post(token_gen_url+'?action=generate',req.body,{headers:req.headers}).then(res => {
    
            const newdata = res.data
            token_value = res.data.token;
            axios.post(token_gen_url+'?action=enable&token='+token_value,{},{headers:req.headers}).then(res => {
              // console.log(res.data);
              resp.status(200).send(res.data);
              fs.writeFile(filename,JSON.stringify(newdata), err => {
           
                // Checking for errors
                if (err) throw err; 
               
                // console.log("Done writing"); // Success
                //resp.status(200).send(res.data);
              });
            }).catch (err => console.log(err));
          
        }).catch (err => console.log(err));
      }
      console.log(token_value);
  });
}


exports.enabletoken = (req,resp) => {
    console.log(req);
    // await axios.post(token_gen_url+'?action=enable&token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5teXZhbHVlZmlyc3QuY29tL3BzbXMiLCJzdWIiOiJmbGFtYm93YSIsImV4cCI6MTY3NTg1MTQzMn0.tTCp73booEpZcItKhlXT2AlapF1nPjZfgBn1mc5XHBs',req.body,{headers:req.headers}).then(res => {
    //   // console.log(res.data);
      resp.status(200).send(req.body);
    // }).catch (err => console.log(err));
}

const getbodyjson = (filename,mobile,name) =>{
  return body = {
    "@VER": "1.2",
    "USER": { "@USERNAME":"", "@PASSWORD" :"", 
        "@CH_TYPE": "4",                         
        "@UNIXTIMESTAMP": ""                        
    },
    "SMS": [
        {
            "@UDH": "0",                          
            "@CODING": "1",                        
            "@TEXT": "",
            "@TYPE": "document~Invoice",                         
            "@TEMPLATEINFO": "9208391~"+name,                   
            "@CONTENTTYPE": "document/pdf",   
            "@PROPERTY": "0",                      
            "@MSGTYPE": "3",  
            "@MEDIADATA":filename,                      
            "@ID": "",                            
            "ADDRESS": [
                {
                    "@FROM": "919625187541",
                    "@TO": mobile,
                    "@SEQ": "4",                
                    "@TAG": "C"                 
                }
            ]
        }
    ]
  }
}

exports.sendmessage = async (req,resp) => {

  var body1 = getbodyjson("http://143.110.181.88/e-invoice/app/assets-file/e07616f819d1db62a3bee330fd80aa1145bf5211-com2.pdf","9685646285");
  // var result = generate_token_fun(req,resp);
  console.log('result',body1);
  var body = body1;
  // resp.status(200).send({'mesg':'resultdata','data':body});
  // console.log('req',req);
  // await axios.post('http://143.110.181.88:8088/api/company/generate-token',{},{headers:req.headers})
  // .then(async res => {
    // resp.status(200).send({'mesg':'resultdata','body':req.body,'headers':req.headers});
      //   res.setHeader({
      //      'content-type': 'application/json',
      //      'Authorization': 'Bearer '+ res.data.token_value
      // });
      // req.setHeader('Authorization', 'Bearer '+ res.data.token_value); 
      // console.log('res',res.data);
      // resp.status(200);
      // await axios.post('https://api.myvfirst.com/psms/servlet/psms.JsonEservice',req.body,{headers:req.headers}).then(result => {
        await axios.post('https://api.myvfirst.com/psms/servlet/psms.JsonEservice',body,{headers:req.headers}).then(result => {
          console.log('result',result.data,result.data.MESSAGEACK);
          resp.status(400).send({'mesg':'resultdata'});
        }).catch (err => {
          console.log('err',err)
          resp.status(403).send(err);
        });
      
    // }).catch (err => {
    //   console.log('err',err)
    //   resp.status(403).send(err);
    // });
}




/* new test code */

const readtokenfile = async () =>{
  const  filename = '/var/www/html/e-invoice/app/assets-file/st_token.json';
  // current date
  var date = new Date();
  
  fs.readFile(filename, (err, data) => {
    // Check for errors
    if (err) throw err;
     
    // Converting to JSON
    return data;
    const token_data = JSON.parse(data);
    var date_t = new Date(token_data.expiryDate);
    var month_g = (date_t.getMonth() + 1);
    month_g = (month_g<=9) ? '0'+month_g : month_g
    var days = date_t.getDate();
    days = (days<=9) ? '0'+days : days
    var token_exp_date = date_t.getFullYear()+'-'+month_g+'-'+days;
    // console.log(token_data);
    var d2 = new Date(token_exp_date);
    return d2;
  })
}
exports.sendmessage_with_gentoken = async (req,resp) => {
  const result = readtokenfile();
  console.log(result)
  /*const  filename = '/var/www/html/e-invoice/app/assets-file/st_token.json';

  // current date
  var date = new Date();
  // console.log(date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate())
  // Read json file
  fs.readFile(filename, async (err, data) => {
        
      // Check for errors
      if (err) throw err;
     
      // Converting to JSON
      const token_data = JSON.parse(data);
      var date_t = new Date(token_data.expiryDate);
      var month_g = (date_t.getMonth() + 1);
      month_g = (month_g<=9) ? '0'+month_g : month_g
      var days = date_t.getDate();
      days = (days<=9) ? '0'+days : days
      var token_exp_date = date_t.getFullYear()+'-'+month_g+'-'+days;
      // console.log(token_data);
      var d2 = new Date(token_exp_date);
      if(date.getTime() < d2.getTime()){
        // console.log('old working fine');
        token_value = token_data.token;
        resp.status(200).send({'message':'old working fine','token_value':token_value});
      }else{
        // generate token using api
        await axios.post(token_gen_url+'?action=generate',req.body,{headers:req.headers}).then(res => {
    
            const newdata = res.data
            token_value = res.data.token;
            axios.post(token_gen_url+'?action=enable&token='+token_value,{},{headers:req.headers}).then(res => {
              // console.log(res.data);
              resp.status(200).send(res.data);
              fs.writeFile(filename,JSON.stringify(newdata), err => {
           
                // Checking for errors
                if (err) throw err; 
               
                // console.log("Done writing"); // Success
                resp.status(200).send(res.data);
              });
            }).catch (err => console.log(err));
          
        }).catch (err => console.log(err));
      }
  });*/

}