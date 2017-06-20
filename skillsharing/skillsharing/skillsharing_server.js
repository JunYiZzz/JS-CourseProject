var http = require("http");
var Router = require("./router");
var ecstatic = require("ecstatic");

var fileServer = ecstatic({root: "./public"});
var router = new Router();

http.createServer(function(request, response) {
  if (!router.resolve(request, response))
    fileServer(request, response);
}).listen(8000);

function respond(response, status, data, type) {
  response.writeHead(status, {
    "Content-Type": type || "text/plain"
  });
  response.end(data);
}

function respondJSON(response, status, data) {
  respond(response, status, JSON.stringify(data),
          "application/json");
}

var users = Object.create(null);

router.add("GET", /^\/users\/([^\/]+)$/,
           function(request, response, username) {
  if (username in users)
    respondJSON(response, 200, users[username]);
  else
    respond(response, 404, "No users '" + username + "' found");
});

router.add("DELETE", /^\/users\/([^\/]+)$/,
           function(request, response, username) {
  if (username in users) {
    delete users[username];
    registerChange(username);
  }
  respond(response, 204, null);
});

function readStreamAsJSON(stream, callback) {
  var data = "";
  stream.on("data", function(chunk) {
    data += chunk;
  });
  stream.on("end", function() {
    var result, error;
    try { result = JSON.parse(data); }
    catch (e) { error = e; }
    callback(error, result);
  });
  stream.on("error", function(error) {
    callback(error);
  });
}

yonghu=document.getElementById()
router.add("PUT", /^\/users\/([^\/]+)$/,
           function(request, response, username) {
  readStreamAsJSON(request, function(error, username) {
    if (error) {
      respond(response, 400, error.toString());
    } else if (!talk ||
               typeof talk.presenter != "string" ||//对应index里div的东西
               typeof talk.summary != "string") {
      respond(response, 400, "Bad user data");
    } else {
      users[username] = {title: title,
                      presenter: talk.presenter,//对应users：username password jifen 
                      summary: talk.summary,
                      comments: []};
      registerChange(username);
      respond(response, 204, null);
    }
  });
});

router.add("POST", /^\/users\/([^\/]+)\/comments$/,//这里也要改到对应的地方
           function(request, response, username) {
  readStreamAsJSON(request, function(error, comment) {
    if (error) {
      respond(response, 400, error.toString());
    } else if (!comment ||
               typeof comment.author != "string" ||
               typeof comment.message != "string") {
      respond(response, 400, "Bad comment data");
    } else if (title in talks) {
      talks[title].comments.push(comment);
      registerChange(title);
      respond(response, 204, null);
    } else {
      respond(response, 404, "No talk '" + title + "' found");
    }
  });
});

function sendTalks(users, response) {
  respondJSON(response, 200, {
    serverTime: Date.now(),//要修改
    talks: talks
  });
}

router.add("GET", /^\/users$/, function(request, response) {
  var query = require("url").parse(request.url, true).query;
  if (query.changesSince == null) {
    var list = [];
    for (var username in users)
      list.push(users[username]);
    sendTalks(list, response);
  } else {
    var since = Number(query.changesSince);
    if (isNaN(since)) {
      respond(response, 400, "Invalid parameter");
    } else {
      var changed = getChangedTalks(since);
      if (changed.length > 0)
         sendTalks(changed, response);
      else
        waitForChanges(since, response);
    }
  }
});

var waiting = [];

function waitForChanges(since, response) {
  var waiter = {since: since, response: response};
  waiting.push(waiter);
  setTimeout(function() {
    var found = waiting.indexOf(waiter);
    if (found > -1) {
      waiting.splice(found, 1);
      sendTalks([], response);
    }
  }, 90 * 1000);
}

var changes = [];

function registerChange(username) {
  changes.push({title: title, time: Date.now()});//修改
  waiting.forEach(function(waiter) {
    sendTalks(getChangedTalks(waiter.since), waiter.response);
  });
  waiting = [];
}

function getChangedTalks(since) {
  var found = [];
  function alreadySeen(username) {
    return found.some(function(f) {return f.title == title;});//修改
  }
  for (var i = changes.length - 1; i >= 0; i--) {
    var change = changes[i];
    if (change.username <= since)
      break;
    else if (alreadySeen(change.username))
      continue;
    else if (change.username in users)
      found.push(users[change.username]);
    else
      found.push({username: change.username, deleted: true});
  }
  return found;
}
