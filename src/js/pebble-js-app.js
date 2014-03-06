var http=function(){return{get:get};function get(url,query,callback){var req=new XMLHttpRequest;url+="?"+serialize(query);req.open("GET",url,true);req.setRequestHeader("Connection","close");req.onload=function(){if(req.readyState===4&&req.status===200){if(req.status===200){var response=JSON.parse(req.responseText);return callback(null,response)}}else{return callback(new Error(req.status))}};req.onerror=function(){switch(req.status){case 0:return callback(new Error("NOT_CONNECTED"));case 404:return callback(new Error("NOT_FOUND"))}};req.send();function serialize(obj){var str=[];for(var p in obj){if(obj.hasOwnProperty(p)){str.push(encodeURIComponent(p)+"="+encodeURIComponent(obj[p]))}}return str.join("&")}}}();var Analytics=function(analyticsId,appName,appVersion){this.analyticsId=analyticsId;this.appName=appName;this.appVersion=appVersion;this.analyticsUserId=Pebble.getAccountToken()};Analytics.prototype._trackGA=function(type,params){var req=new XMLHttpRequest;var url="http://www.google-analytics.com/collect";var trackingParams="v=1";trackingParams+="&tid="+this.analyticsId;trackingParams+="&cid="+this.analyticsUserId;trackingParams+="&t="+type;trackingParams+="&an="+this.appName;trackingParams+="&av="+this.appVersion;for(var parameterKey in params){if(params.hasOwnProperty(parameterKey)){trackingParams+="&"+parameterKey+"="+params[parameterKey]}}req.open("POST",url,true);req.setRequestHeader("Content-length",trackingParams.length);req.send(trackingParams)};Analytics.prototype.trackScreen=function(screenName){this._trackGA("appview",{cd:screenName})};Analytics.prototype.trackEvent=function(category,action){this._trackGA("event",{ec:category,ea:action})};var AppInfo={uuid:"bcdef00a-b309-485d-b82f-341307693c73",shortName:"Hearts",longName:"Hearts",companyName:"Matthew Tole",versionCode:2,versionLabel:"0.1.1",watchapp:{watchface:false},appKeys:{},capabilities:["configurable"],resources:{media:[{menuIcon:true,type:"png",name:"MENU",file:"heart_28.png"},{type:"png",name:"BIG_HEART",file:"heart_big.png"}]}};var Hearts=function(){var developerId=null;Pebble.addEventListener("ready",function(){developerId=window.localStorage.getItem("developerId",null);if(!developerId){Pebble.sendAppMessage({0:"CONFIGURE"})}else{Pebble.sendAppMessage({0:"UPDATING"});updateApps()}});Pebble.addEventListener("showConfiguration",function(){Pebble.openURL("http://pblweb.com/hearts/app/config/?version="+AppInfo.versionLabel)});Pebble.addEventListener("webviewclosed",function(event){if(event.response!=="CANCELLED"){developerId=event.response;window.localStorage.setItem("developerId",developerId);updateApps()}});function updateApps(){http.get("http://pblweb.com/api/v1/store/developers/"+developerId+".json",{},function(err,data){var dataArray=[data.length];data.sort(function(app1,app2){return app1.hearts>app2.hearts?-1:app1.hearts<app2.hearts?1:app1.title<app2.title?-1:1});data.forEach(function(app){dataArray.push(app.title);dataArray.push(app.hearts)});Pebble.sendAppMessage({0:"DATA",1:dataArray.join("\n")})})}};if(window.Pebble){Hearts()}