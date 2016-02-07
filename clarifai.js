var searchTerm2 = '';

function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}

function runYouTube() {

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();

  if (mm > 10) {

    mm = mm - 1;
    console.log(mm);

  }

  if (mm <= 10) {

    if (mm == 0) {

      mm = '12';

    }

    else {

      mm = ('0' + (mm-1));
      console.log(mm);
      console.log(mm);

    } 
  }

  if (dd<10) {

    dd = '0' + dd;

  }

  console.log(yyyy + " " + mm + " " + dd);

  var request = gapi.client.youtube.search.list({
    part: "snippet",
    type: "video",
    q: encodeURIComponent(searchTerm2).replace(/%20/g, "+"),
    maxResults: 10,
    order: "viewCount",
    publishedAfter: yyyy + "-" + mm + "-" + dd + "T00:00:00Z"
  }); 
    // execute the request
  request.execute(function(response) {
      var results = response.result;
      $("#results").html("");
      $.each(results.items, function(index, item) {
        $.get("tpl/item.html", function(data) {
            $("#results").append(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId}]));
        });
      });
      resetVideoHeight();
    });
}

function getCredentials(cb) {
  var data = {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
  };

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/token',
    'data': data,
    'type': 'POST'
  })
  .then(function(r) {
    localStorage.setItem('accessToken', r.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    cb();
  });
}

function postImage(imgurl, cb) {
  var data = {
    'url': imgurl
  };
  var accessToken = localStorage.getItem('accessToken');

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/tag',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'data': data,
    'type': 'POST'
  }).then(function(r){
    parseResponse(r);
    cb();
  });
}

function parseResponse(resp) {
  var tags = [];
  var probs = [];
  if (resp.status_code === 'OK') {
    var results = resp.results;
    tags = results[0].result.tag.classes;
    probs = results[0].result.tag.probs;
  } else {
    console.log('Sorry, something is wrong.');
  }

  var firstTag = tags[0];
  var prob = probs[0];
  var percent = prob * 100;

  document.getElementById('tags').innerHTML = "We analyzed your image and found that \"" + firstTag + "\" most" +
  " matched your picture with a percentage of " + percent + "%";
  //console.log(firstTag);

  /*
  for (i = 0; i < tags.length; i++) {

    var temp = tags[i].link("#");
    document.getElementById('tags').innerHTML += temp + ' ';

  }
  */

  //$('#tags').html(tags[i].toString().replace(/,/g, ', ').link("http://www.google.com"));

  //return tags;*/

  searchTerm2 = firstTag;
  console.log(searchTerm2);
  return firstTag;
}

function run(imgurl) {

  if (localStorage.getItem('tokenTimeStamp') - Math.floor(Date.now() / 1000) > 86400
    || localStorage.getItem('accessToken') === null) {
    getCredentials(postImage(imgurl, runYouTube));

  } else {
    postImage(imgurl, runYouTube);
  
      //searchTerm = postImage(imgurl);
    //console.log(searchTerm);
  }
}

function resetVideoHeight() {
    $(".video").css("height", $("#results").width() * 9/16);
}

function init() {
    gapi.client.setApiKey("AIzaSyDONOXBwif5FexvlAu6pEAfSuwsbGKhjdc");
    gapi.client.load("youtube", "v3", function() {
        // yt api is ready
    });
}
