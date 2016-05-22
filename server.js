var restify = require('restify');
var mongodb = require('mongodb');
var request = require('request');

var server = restify.createServer();
var uri = 'mongodb://bookstore-dba:bookstore-dba@ds019482.mlab.com:19482/bookstore'
var port = process.env.PORT || 9000;

server.use(restify.bodyParser({ mapParams: true }));

var connecting = {};

connecting.linkedin = function(res){
    request.get('https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=78mqsj45fsrio3&redirect_uri=https://connecting-server.herokuapp.com/auth/linkedin/callback&state=CoNNecTinGDCEeFWf45A53sdfKef424&scope=r_basicprofile')
        .on('response', function(response) {
            res.json(response);
        })
        .on('error', function(error){
            res.json(error);
        })
};

connecting.login = function(req, res, next) {
    connecting.linkedin(res);
    next();
}

connecting.prepareFind = function(req, res, next){

    var attrs = {};

    if(req.params['collection'])
        attrs['collection'] = req.params['collection'];

    if(req.params['filter'])
        attrs['filter'] = req.params['filter'];

    var params = {
        "operation": connecting.find,
        "collection": attrs['collection'],
        "filter": attrs['filter'],
        "response": res,
        "callback": undefined
    };

    connecting.dbOperations(params);
    next();
};

connecting.prepareSave = function(req, res, next){
    var params = {
        "operation": connecting.save,
        "collection": req.body.collection,
        "object": req.body.object,
        //"filter": req.body.filter,
        "response": res,
        "callback": undefined
    };

    connecting.dbOperations(params);
    next();
};

connecting.prepareUpdate = function(req, res, next){
    var params = {
        "operation": connecting.update,
        "collection": req.body.collection,
        "object": req.body.object,
        "filter": req.body.filter,
        "response": res,
        "callback": undefined
    };
    
    connecting.dbOperations(params);
    next();
};

connecting.find = function(params) {
    var collection = params.db.collection(params.collection);

    collection.find(params.filter).toArray(function(err, docs) {
        if(err) {
            params.response.json(err);
            return;
        }

        if(params.callback){
            params.docs = docs;
            params.callback(params);
        } else {
            params.response.json(docs);
        }
    });
};

connecting.save = function(params){

    var collection = params.db.collection(params.collection);

    try {
        collection.insert(params.object);
        params.response.json({"insert": true});
    } catch(ex) {
        params.response.json({"insert": false});
    }
};

connecting.update = function(params) {
    var collection = params.db.collection(params.collection);

    try {
        collection.update(params.filter, { $push: { url: params.config.url }});
        params.response.json({"success": true});
    } catch(ex) {
        params.response.json({"success": false, "err": "Error on trying to save the link."});
    }
};

connecting.dbOperations = function(params) {
    mongodb.MongoClient.connect(uri, function(err, db) {
        if(err) throw err;

        params.db = db;
        params.operation(params);
    });
};

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

server.get('/author/:collection', connecting.prepareFind);
server.get('/author/:collection/:filter', connecting.prepareFind);
server.post('/auth/linkedin/callback', connecting.linkedin)
server.get('/auth/linkedin', connecting.login)

server.listen(port, function() {
  console.log('%s listening at server port %s', 'connecting', port);
});