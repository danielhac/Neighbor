var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var mongoose = require('mongoose');

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/n';
mongoose.connect(connectionString);

var ReplySchema = new mongoose.Schema({
    reply: String,
    created: {type: Date, default: Date.now}
}, {collection: 'rreplys'});

var WebSiteSchema = new mongoose.Schema({
    name: String,
    message: String,
    replys: [ReplySchema],
    created: {type: Date, default: Date.now}
}, {collection: 'website'}); // Forcing the name (no plural version of websites)

var WebSiteModel = mongoose.model('WebSite', WebSiteSchema);
// var ReplyModel = mongoose.model('WebSite', WebSiteSchema);

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multpart/form-data

app.use(express.static(__dirname + '/public'));

// View all posts
app.get('/api/website', function(req, res) {
    WebSiteModel.find(function(err, sites) {
        res.json(sites);
    });
});

// Create one post object
app.post("/api/website", function(req, res) {
    var website = new WebSiteModel (req.body);
    website.save(function(err, doc) {
        WebSiteModel.find(function (err, sites) { // Reloads after post
            res.json(sites);
        });
    });
});

///////////// By ID ///////////
// Notes: req.params.id - the 'id' in that is the same 'id' in /api/website/:id
// Find by id (one) // 
app.get('/api/website/:id', function(req, res) {
    WebSiteModel.findById(req.params.id, function(err, sites) { // req.params.id - passing index of array
        res.json(sites);
    });
});

// Delete by id (one)
app.delete('/api/website/:id', function(req, res) {
    var id = req.params.id;
    WebSiteModel.remove({ _id: id }, function(err, count) {
        WebSiteModel.find(function(err, sites) { // fetch all sites
            res.json(sites); // respond with remaining sites
        });
    }); 
});

// Need to add post, put, delete etc for creating "comment" (replies)
// We have created an object (id), now make commentId (replies)
// 
app.get('/api/website/:id/rreplys', function(req, res) {
    WebSiteModel.findById(req.params.id, function(err, site) {
        res.json(site.replys);
    });
});

// Create one post object
app.post("/api/website/:id/rreplys", function(req, res) {
    var repId = req.params.id;
    WebSiteModel.findById({_id: repId }, function(err, sites) {
            sites.replys.push(req.body);
            sites.save(function(err, sites) {
                WebSiteModel.find(function(err, sites) {
                    res.json(sites);
                });
            });
    });
});
// Find by id (one)
app.get('/api/website/:id/rreplys/:replyId', function(req, res) {
    WebSiteModel.findById(req.params.id, function(err, site) {
        res.json(site.replys.id(req.params.replyId));

        // res.json(site);
    });
});
    // var id = req.params.id;
    // var reply = new WebSiteModel (req.body);
    // reply.save(function(err, sites) {
    // WebSiteModel.findById(req.params.id, function(err, sites) {
    //     WebSiteModel.find(function(err, sites) {
    //         console.log('Updated Comments!');
    //         res.json(sites);
        // });  
// For posting underneath parent object
// 1. Retrieve the dish
// 2. Push reply into parent post
// 3. Save


// Create one post object - BACKUP
// app.post("/api/website/:id/rreplys", function(req, res) {
//     // var reply = new WebSiteModel (req.body);
//     WebSiteModel.findById(req.params.id, function(err, sites) {
//         // if (err) throw err;
//             sites.replys.push(req.body);
//             sites.save(function(err, sites) {
//                 WebSiteModel.find(function(err, sites) {
//                     console.log('Updated Comments!');
//                     res.json(sites);
//                 });
//             });
//     });
// });

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port, ip);