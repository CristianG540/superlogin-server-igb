process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
var SuperLogin = require('superlogin');

var privateKey  = fs.readFileSync('/opt/couchdb/etc/cert/server.key', 'utf8');
var certificate = fs.readFileSync('/opt/couchdb/etc/cert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var app = express();
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

var config = {
  dbServer: {
    protocol: 'https://',
    host: 'vm257.tmdcloud.com:6984',
    user: 'admin',
    password: 'Webmaster2017#@',
    userDB: 'sl-users',
    couchAuthDB: '_users'
  },
  mailer: {
    fromEmail: 'cristianneatproy@gmail.com',
    options: {
      service: 'Gmail',
        auth: {
          user: 'cristianneatproy@gmail.com',
          pass: 'SPACEDANDY'
        }
    }
  },
  security: {
    maxFailedLogins: 3,
    lockoutTime: 600,
    sessionLife: 8640000,
    tokenLife: 86400,
    loginOnRegistration: true,
  },
  userDBs: {
    defaultDBs: {
      private: ['supertest']
    }
  },
  // Anything here will be merged with the userModel that validates your local sign-up form.
  // See [Sofa Model documentation](http://github.com/colinskow/sofa-model) for details.
  userModel: {
    // For example, this will require each new user to specify a valid age on the sign-up form or registration will fail
    whitelist: ['profile.asesor_id', 'profile.email', 'asesor_id'],
    validate: {
      asesor_id: {
        presence: true,
        numericality: {
          onlyInteger: true,
          message: 'Ingrese el id del asesor, si es un cliente ingrese 05'
        }
      }
    }
  }
}


// Initialize SuperLogin
var superlogin = new SuperLogin(config);

// Mount SuperLogin's routes to our app
app.use('/auth', superlogin.router);

app.get('/ping', function (req, res) {
  res.send({
    status: 'ok'
  });
})

app.listen(app.get('port'));
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(3443);
console.log("App listening on " + app.get('port'));
