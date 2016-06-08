var restify = require('restify');
var mongodb = require('mongodb');
var request = require('request');

var server = restify.createServer();
var port = process.env.PORT || 9000;

server.use(restify.bodyParser({ mapParams: true }));

var connecting = {};

connecting.linkedin = function(res){
    var stage1 = {};

    request.get('https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=78mqsj45fsrio3&redirect_uri=https://connecting-server.herokuapp.com/auth/linkedin/callback&state=CoNNecTinGDCEeFWf45A53sdfKef424&scope=r_basicprofile')
        .on('response', function(response) {
            //res.json(response);
            //stage1 = response;
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.write(response);
            res.end();
        })
        .on('error', function(error){
            res.end("Batata");
        })

    var data = {
       "grant_type": "authorization_code",
       "code": "CoNNecTinGDCEeFWf45A53sdfKef424",
       "redirect_uri": "https://connecting-server.herokuapp.com/auth/linkedin/callback",
       "client_id": "78mqsj45fsrio3",
       "client_secret": "IZCT1PDjjXqmpmmM"
    };

    var options = {
        url: 'https://www.linkedin.com/uas/oauth2/accessToken',
        formData: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var callback = function(err, httpResponse, body){
        if (err)
            res.json(err);

        res.json(body);
    };

    // request.post(options, callback);
};

connecting.login = function(req, res, next) {
    connecting.linkedin(res);
    next();
}

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

server.post('/auth/linkedin/callback', connecting.linkedin)
server.get('/auth/linkedin', connecting.login)

server.listen(port, function() {
  console.log('%s listening at server port %s', 'connecting', port);
});