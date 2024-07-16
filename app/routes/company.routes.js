module.exports = app => {
    const company = require("../controllers/getCompany.js");
    
    var router = require("express").Router();
  
    // Retrieve all Tutorials
    router.get("/", company.findAll);
    router.post("/generate-invoice", company.customerinvoice);
    router.post("/invoice", company.customerinvoice);
    router.post("/test-register", company.test_register);
    router.post("/generate-token", company.generate_token);
    router.post("/enable-token", company.enabletoken);
    router.post("/send-message", company.sendmessage);
    // router.post("/meetups", company.customerinvoice);
    router.get("/inv/:id", company.findId);
    router.get("/ip-address", company.ip_address);
    router.get("/invoicename/:invoicename", company.customerinvoicepdf);
    router.post("/sendmessage_with_gentoken", company.sendmessage_with_gentoken);

    app.use('/api/company', router);
};
  