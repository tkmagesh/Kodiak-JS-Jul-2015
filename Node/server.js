var http = require("http");
var path = require("path");
var fs = require("fs");
var qs = require("querystring");
var nodejsWebSocket = require("nodejs-websocket");
var messageTransformer = require("./messageTransformer");

var socketPort = null;
var socketServer = null;
function createSocketServer(port){
    socketPort = port;
    socketServer = nodejsWebSocket.createServer(function(connection){
        connection.on("text", function(msg){
            socketServer.connections.forEach(function(con){
                con.sendText(messageTransformer.transform(msg));
            });
        });
    });
    socketServer.listen(port);
    console.log("Socket server listening on port ", port);
}

var staticResourceExtns = [".html",".js",".css",".jpg",".png",".ico",".txt",".json"];

function isStatic(resourceName){
    var ext = path.extname(resourceName);
    return staticResourceExtns.indexOf(ext) !== -1;
}

var server = http.createServer(function(req, res){
    if (isStatic(req.url)){
        var resourcePath = path.join(__dirname, req.url);
        if (!fs.existsSync(resourcePath)){
            res.statusCode = 404;
            res.end();
            return;
        }
        fs.createReadStream(resourcePath).pipe(res);
    } else if (req.url === "/config" && req.method === "POST"){
        var reqData = '';
        req.on('data', function(buffer){
            reqData += buffer;
        });
        req.on("end", function(){
            console.log(reqData);
            var reqObj = qs.parse(reqData);
            createSocketServer(parseInt(reqObj.socketPort,10));
            res.write("<h1>Done</h1>");
            res.end();
        });
    } else if (req.url === "/config.port" && req.method === "GET"){
        res.write('window.socketPort = ' + socketPort + ';');
        res.end();
    }
        else {
        res.statusCode = 404;
        res.end();
    }
});

server.listen(9090);