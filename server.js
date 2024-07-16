const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");
const basicAuth = require('express-basic-auth');
const dirpath = __dirname;


// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const app = express();
// Custom unauthorized response
// const getUnauthorizedResponse = (req) => {
//   return req.auth
//     ? { message: 'Credentials rejected' }
//     : { message: 'No credentials provided' };
// };

// app.use(basicAuth({
//   users: { tarc_admin: 'tarcadmin@123' },
//   challenge: true, // <--- needed to actually show the login dialog!
//   unauthorizedResponse: getUnauthorizedResponse
// }));

var corsOptions = {
  origin: "http://142.93.213.88:8081/"
};

app.use(cors(corsOptions));

/*function authentication(req, res, next) {
  const authheader = req.headers.authorization;
  console.log(req.headers);

  if (!authheader) {
      let err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err)
  }

  const auth = new Buffer.from(authheader.split(' ')[1],
      'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  if (user == 'tarc_admin' && pass == 'tarcadmin@123') {
      // If Authorized user
      next();
  } else {
      let err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
  }
}*/

// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */

app.get('/pdf', function(req, res){

  res.sendFile(dirpath+"/app/assets-file/outputs.pdf"); 
});
app.get('/logo', function(req, res){

  res.sendFile(dirpath+"/img/logo.png"); 
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to application."});
});

// app.use(authentication)

require("./app/routes/company.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
