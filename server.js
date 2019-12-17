const http = require("http");
const mysql = require("mysql");
const url = require("url");
const querystring = require("querystring");
const crypto = require("crypto");

let key = "1234656";
function md5(str){
    let obj = crypto.createHash("md5");
    obj.update(str);
    return obj.digest("hex");
}
function md5_2(str){
    return md5(md5(str+key));
}
//创建数据库的连接
let db = mysql.createPool({host: "192.168.0.102", port: "3306", user: "root", password: "root", database: "geography"});
console.log("mysql connected!");

//创建服务
let server = http.createServer((req,res)=>{
    var obj = url.parse(req.url,true);
	const pathname = obj.pathname;
	
	console.log("request: " + req.url);

	var data = "";
	req.on('data',function(chunk){ data += chunk; });

	req.on("end",function(){
		data=querystring.parse(data);
		username = data.username;
		password = data.password;
		
		if (pathname == '/register'){
			var resData = '';
			db.query(`SELECT * FROM user_table WHERE username='${username}'`,(error,data)=>{
				if(error){					
					resData = {"ok":false,"msg":"Database exception, please try again later."};
					res.writeHead(200,{"Content-Type":"application/json",'Access-Control-Allow-Origin': '*'});
					res.write(JSON.stringify(resData));
					res.end();
				}else{
					if(data.length  >  0){
						resData = {"ok" : false,"msg": "The username is exists"};
						res.writeHead(200,{"Content-Type":"application/json",'Access-Control-Allow-Origin': '*'});
						res.write(JSON.stringify(resData));
						res.end();
					}else{
						db.query(`INSERT INTO user_table (username,password) VALUES('${username}','${md5_2(password)}')`, (err, data) => {
							if(err){			
								resData = {"ok":false,"msg":"Database exception, please try again 	later."};
								res.writeHead(200,{"Content-Type":"application/json",'Access-Control-Allow-Origin': '*'});
								res.write(JSON.stringify(resData));
								res.end();
							}else{	
								resData = {"ok": true, "msg": "Successed!"};
								res.writeHead(200,{"Content-Type":"application/json",'Access-Control-Allow-Origin': '*'});
								res.write(JSON.stringify(resData));
								res.end();
							}
						})
					}
		         }
	         })
		}else if (pathname == "/login"){
			//写入数据库之前先判断用户明是否存在
			db.query(`SELECT * FROM user_table WHERE username='${username}'`, (error, data) => {
				if (error) {				
					resData = {"ok":false,"msg":"Database exception, please try again later."};
					res.writeHead(200,{"Content-Type":"application/json",'Access-Control-Allow-Origin': '*'});
					res.write(JSON.stringify(resData));
					res.end();
				}else if(data.length === 0){
					resData = {"ok":false,"msg":"The username is not exists"};
					res.writeHead(200,{"Content-Type":"application/json",'Access-Control-Allow-Origin': '*'});
					res.write(JSON.stringify(resData));
					res.end();
				}else if(data[0].password != md5_2(password)){
					resData = {"ok":false,"msg":"The username or password is incorrect"};
					res.writeHead(200,{"Content-Type":"application/json",'Access-Control-Allow-Origin': '*'});
					res.write(JSON.stringify(resData));
					res.end();
				}else{
					resData = {"ok":true,"msg":"Successed"};
					res.writeHead(200,{"Content-Type":"application/json",'Access-Control-Allow-Origin': '*'});
					res.write(JSON.stringify(resData));
					res.end();
               	}
           	})
		}else{
			res.writeHead(404,{"Content-Type":"text/html",'Access-Control-Allow-Origin': '*'});
			res.write('<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>nginx</center></body></html>');
			res.end();
		}
	});
})
// 监听端口
server.listen(8080);

