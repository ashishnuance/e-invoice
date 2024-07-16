const sql = require('./dbconnect.js');

// constructor
const Commpany = function(Commpany) {
    this.title = Commpany.title;
    this.description = Commpany.description;
    this.published = Commpany.published;
  };

Commpany.get = (title, result) => {
    let query = "SELECT * FROM users";
    
    if (title) {
        query += ` WHERE name LIKE '%${title}%'`;
    }

    sql.query(query, (err, res) => {
    if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
    }

    console.log("tutorials: ", res);
    result(null, res);
    });
    
};


Commpany.getbyid = (id) => {
    return new Promise( (resolve,reject) =>{
        let query = "SELECT * FROM users";
        if (id) {
            query += ` WHERE id LIKE '${id}'`;
        }
        // console.log(query);
        sql.query(query, (err, res) => {
            if (err) {
                // console.log("error: ", err);
                return reject(err);
            }else{
                // console.log("user: ", res);
                return resolve(res);
            }
        });
    })
    
};

Commpany.createInvoiceLog = (requestdata,result) => {
    sql.query("INSERT INTO invoice_send_log SET ?", requestdata, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          console.log('invoice_header',err);
          return;
        }
        result(null,{message:'add sucessfully','data': result});
        return ;
    })
}

Commpany.createinvoice = (requestdata,result) => {
    // console.log('request',requestdata.insertHeader,requestdata.insertLine,requestdata.insertPayment)
    
    sql.query("INSERT INTO invoice_header SET ?", requestdata.insertHeader, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          console.log('invoice_header',err);
          return;
        }
        if(res){
                      
            sql.query("INSERT INTO invoice_line SET ?", requestdata.insertLine, (err1, res1) => {
                if (err) {
                    // console.log("error: ", err);
                    result(err1, null);
                    console.log('invoice_line',err1);
                    return;
                }else{
                    sql.query("INSERT INTO invoice_payment SET ?", requestdata.insertPayment, (errPayment, resPayment) => {
                        if (errPayment) {
                            result(errPayment, null);
                            console.log('invoice_payment',errPayment);
                            return; 
                        }
                    // console.log("user: ", res);
                    // result(null, {message:"Added sucessfully", data: resPayment});
                    // return;
                    });
                }
            });
            let companyData = [];
            // console.log('insertId',res.insertId)
            if(res.insertId){
                let query = "SELECT company_name,address1,whatsup_detail,sms_detail,send_by FROM `companies` where company_code = '"+requestdata.insertHeader.company_code+"'";
                // console.log('query',query);
                companyData = sql.query(query, (err, resultCompany) => {
                    if (err) {
                        // console.log("error: ", err);
                        result({message:'Try again'},null);
                        return;
                    }else{
                        // console.log("user: ", res);
                        result(null,{message:'found sucessfully','data': resultCompany,'invoiceId':res.insertId});
                        return ;
                    }
                });
                // result(null,{message:'Added sucessfully'});
                // return; 
            }else{
                result({message:'Try again'},null);
                return; 
            }
        }
        //console.log("created invoice: ", { id: res.insertId,...requestdata });
        
        // result(null, {message:"Added sucessfully", data: res});
        // return;
    });
}

module.exports = Commpany