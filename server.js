var restify = require('restify');
var mongodb = require('mongodb');
var request = require('request');

var server = restify.createServer();
var port = process.env.PORT || 9000;

server.use(restify.bodyParser({ mapParams: true }));

var connecting = {};

connecting.linkedin = function(res){
    var params = {
        "response_type": "code",
        "client_id": "78mqsj45fsrio3",
        "redirect_uri": "https://connecting-server.herokuapp.com/auth/linkedin/callback",
        "state": "CoNNecTinGDCEeFWf45A53sdfKef424",
        "scope": "r_basicprofile",

    };

    var stage1 = {};

    request.get('https://www.linkedin.com/uas/oauth2/authorization'+
                '?response_type='+params.response_type+
                '&client_id='+params.client_id+
                '&redirect_uri='+params.redirect_uri+
                '&state='+params.state+
                '&scope='+params.scope)
        .on('response', function(response) {
            stage1 = response;
        })
        .on('error', function(error){
            res.json(error);
        })

    var url = 'https://www.linkedin.com/uas/oauth2/accessToken'
    var data = {
       "grant_type": "authorization_code",
       "code": "CoNNecTinGDCEeFWf45A53sdfKef424",
       "redirect_uri": "https://connecting-server.herokuapp.com/auth/linkedin/callback",
       /*"client_id": "78mqsj45fsrio3",*/
       "client_secret": "IZCT1PDjjXqmpmmM"
    };

    var callback = function(err, httpResponse, body){
        if (err)
            res.json(err);

        res.json(body);
    };

    request.post({url:url, formData: data}, callback);
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