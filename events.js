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

webide.module("ssl", function(commands, forms){
    this.ssl = {
        /**
         * Function to display all keys
         * @return void
         */
        myKeys: function(){
            webide.windowRemote("/ssl/mykeys", {width: 900, height: 400}, function(res){
                
            });
        },
        
        /**
         * Function to create SSL Key
         * @return void
         */
        createSSLKey: function(){
            webide.windowFormBuilder("Create SSL Key", JSON.stringify([
                {
                    "type": "text",
                    "subtype": "text",
                    "required": true,
                    "label": "Name",
                    "placeholder": "Name",
                    "className": "form-control",
                    "maxlength": "10",
                    "name": "name"
                },
                {
                    "type": "text",
                    "subtype": "email",
                    "required": true,
                    "label": "Email",
                    "placeholder": "E-mail",
                    "className": "form-control",
                    "name": "email"
                },
                {
                    "type": "text",
                    "subtype": "password",
                    "required": true,
                    "label": "Password",
                    "placeholder": "Password",
                    "className": "form-control",
                    "name": "pass"
                }
            ]), {width: 300, height: 290, createbutton: true, cancelbutton: true}, function(form){
                $(form).submit(function(e){
                    e.preventDefault();
                    
                    if(forms.validate(form)){
                        var data = forms.data(form);
                        
                        webide.getContentsJSON("POST", "/ssl/createsslkey", data, function(res){
                            webide.closeWindow();                            
                            webide.windowFormBuilder("Create SSL Key", JSON.stringify([
                                {
                                    "type": "textarea",
                                    "label": "Fingerprint",
                                    "className": "form-control",
                                    "name": "textarea-1486545868491",
                                    "value": res.fingerprint
                                },
                                {
                                    "type": "button",
                                    "label": "Download Private Key",
                                    "subtype": "button",
                                    "className": "btn-ssl-private-download",
                                    "name": "button-1486545879159",
                                    "style": "default"
                                }
                                ,
                                {
                                    "type": "button",
                                    "label": "Download Public Key",
                                    "subtype": "button",
                                    "className": "btn-ssl-public-download",
                                    "name": "button-1486545879159",
                                    "style": "default"
                                }
                            ]), {width: 300, height: 280, cancelbutton: true}, function(form){
                                $(".btn-ssl-private-download", form).click(function(){ webide.ssl.download(res.private); });
                                $(".btn-ssl-public-download", form).click(function(){ webide.ssl.download(res.public); });
                            });
                        });                        
                    }
                });
                
                $(".wi-btn-ok").click(function(){
                    $(form).submit();
                });
            })
        },
        
        createHTTPSCertificate: function(){
            
        },
        
        importSSLKey: function(){
            
        },
        
        importHTTPSCertificate: function(){
            
        },
        
        download: function(filename){
            filename = encodeURIComponent(filename).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');//Bugfix @see http://locutus.io/php/url/urlencode/
                        
            var a = document.createElement('a');
            a.href = "/ssl/download?filename=" + filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
        }
    };   
    
    commands.add("webide:ssl:mykeys", webide.ssl.myKeys);    
    commands.add("webide:ssl:createsslkey", webide.ssl.createSSLKey);
    commands.add("webide:ssl:createhttpscertificate", webide.ssl.createHTTPSCertificate);
    commands.add("webide:ssl:importsslkey", webide.ssl.importSSLKey);
    commands.add("webide:ssl:importhttpscertificate", webide.ssl.importHTTPSCertificate);
});