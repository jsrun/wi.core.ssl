/**
 *  __          __  _    _____ _____  ______    _____ _____ _      
 *  \ \        / / | |  |_   _|  __ \|  ____|  / ____/ ____| |     
 *   \ \  /\  / /__| |__  | | | |  | | |__    | (___| (___ | |     
 *    \ \/  \/ / _ \ '_ \ | | | |  | |  __|    \___ \\___ \| |     
 *     \  /\  /  __/ |_) || |_| |__| | |____ _ ____) |___) | |____ 
 *      \/  \/ \___|_.__/_____|_____/|______(_)_____/_____/|______|                                                                                                                             
 * 
 *  @author André Ferreira <andrehrf@gmail.com>
 *  @license MIT
 */

"use strict";

let fs = require("fs"),
    path = require("path"),
    sshKeygen = require('ssh-keygen'),
    NodeRSA = require('node-rsa'),
    fingerprint = require('ssh-fingerprint'),
    mkdirp = require("mkdirp"),
    glob = require("glob");

module.exports = {
    /**
     * Module startup function
     * 
     * @param object app
     * @return this
     */
    bootstrap: function(app, dirname, commands, navbar){
        navbar.addItem("Tools/SSL", {
            submenu: [{display: "My Keys...", command: "webide:ssl:mykeys", divide: true},
                      {display: "Create SSL Key (For SSH access)...", command: "webide:ssl:createsslkey"},
                      {display: "Create HTTPS certificate (With lets encrypt)...", command: "webide:ssl:createhttpscertificate", divide: true},
                      {display: "Import SSL key...", command: "webide:ssl:importsslkey"},
                      {display: "Import HTTPS certificate...", command: "webide:ssl:importhttpscertificate"}]  
        }, 1000);
        
        app.get("/ssl/mykeys", (req, res) => {
            let _id = (req.user) ? req.user._id : 0;
            glob(dirname + "/.certificates/" + _id + "/*.pub", (err, files) => {
                let certificates = [];
                
                for(let key in files)
                    certificates.push({
                        dirname: path.dirname(files[key]),
                        name: path.basename(files[key], ".pub"), 
                        fingerprint: fingerprint(fs.readFileSync(files[key], 'utf-8'))
                    });
                
                res.render(__dirname + "/mykeys.ejs", {itens: certificates});
            });
        });
        
        app.post("/ssl/createsslkey", (req, res) => {
            let _id = (req.user) ? req.user._id : 0;
            mkdirp(dirname + "/.certificates/" + _id);
            
            sshKeygen({
                location: dirname + "/.certificates/" + _id + "/" + req.body.name,
                comment: req.body.email,
                password: req.body.pass,
                read: true
            }, (err, out) => {
                if(err) res.status(500).send("error");
                else res.send({
                    fingerprint: fingerprint(fs.readFileSync(dirname + "/.certificates/" + _id + "/" + req.body.name + ".pub", 'utf-8')),
                    public: req.body.name + ".pub",
                    private: req.body.name
                });
            });
        });
        
        app.get("/ssl/download", (req, res) => {
            let _id = (req.user) ? req.user._id : 0,
                dirname = fs.realpathSync(__dirname + "/../../.certificates/" + _id),        
                filename = fs.realpathSync(dirname + "/" + decodeURIComponent((req.query.filename + '').replace(/%(?![\da-f]{2})/gi, function () {return '%25'}).replace(/\+/g, '%20')));
                
            if(fs.statSync(filename).isFile()){
                res.setHeader('Content-disposition', 'attachment; filename=' + path.basename(filename));
                
                if(path.extname(filename) == ".pub")
                    res.setHeader('Content-type', "application/vnd.ms-publisher");
                else
                    res.setHeader('Content-type', "application/x-pem-key");

                var filestream = fs.createReadStream(filename);
                filestream.pipe(res);
            }
        });
    }
};