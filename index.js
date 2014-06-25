var ActivityList = require('activity-list');
var ChronosStream = require('chronos-stream');

// will be provided by Livefyre.js later
var auth;

console.log('loading personalized feed example');

var feed = new ActivityList(document.getElementById('feed'));
feed.streamMore(require('./mock-activity-stream'));
// feed.streamMore(chronosActivityStream(
//     'urn:livefyre:profiles-qa.fyre.co:user=5329c8c285889e7bc6000000:personalStream',
//     auth))


// create an authenticated stream of activities
// from chronos
function chronosActivityStream(topic, auth) {
    topic = topic || 'urn:livefyre:livefyre.com:site=290596:collection=2486485:SiteStream';
    var activities = new ChronosStream(topic);
    onUser(function () {
        activities.auth(user.get('token'));
    })
    if (auth) {
        activities.auth(auth);
    }
    return activities;
}

/**
 * Fire cb whenever a LivefyreUser logs in
 */
function onUser(cb) {
    if ( ! auth) {
        return setTimeout(function () {
            onUser(cb);
        }, 1000);
    }
    var user = auth.get('livefyre');
    if (user) cb(user);
    auth.on('login.livefyre', cb);
}

Livefyre.require(['auth-contrib#0.0.0-pre'], function (authContrib) {
    var auth = auth = Livefyre.auth;
    auth.delegate(auth.createDelegate('http://qa-ext.livefyre.com'));
    var authLog = authContrib.createLog(auth, document.getElementById('auth-log'));
    authContrib.createButton(auth, document.getElementById('auth-button'), authLog);
});

/**
 * Get streamclient 0.0.0 from the cdn
 */
Livefyre.require([
  'stream-client#0.0.3-dev.1'
], function (StreamClient) {
    var auth = Livefyre.auth;
  // Connect to stream
  var sc = new StreamClient({
    hostname: "stream.qa-ext.livefyre.com", port: "80"});
  
  var user = auth.get('livefyre');
  if (user) {
    onLogin(user);
  } else {
    auth.on('login.livefyre', onLogin);
  }
  function onLogin(user) {
    var token = user.get('token');
    sc.connect(token, "sample");
    feed.stream(sc); 
  }
  
});
