(function($) {
  "use strict";

  /**====== SET ME =====**/
  /**====== SET ME =====**/
  /**====== SET ME =====**/
  // Set the configuration for your app
  // TODO: Replace with your project's config object
  var config = {
    apiKey: "AIzaSyDF_NiEhEf6GslYf3FLX1RxD8EDyrPSo_Y",
    authDomain: "sozialdata.firebaseapp.com",
    databaseURL: "https://sozialdata.firebaseio.com",
    storageBucket: "sozialdata.appspot.com",
    messagingSenderId: "49094287081"
  };

  // TODO: Replace this with the path to your ElasticSearch queue
  // TODO: This is monitored by your app.js node script on the server
  // TODO: And this should match your seed/security_rules.json
  var PATH = "search";
  /**====== /SET ME =====**/
  /**====== /SET ME =====**/
  /**====== /SET ME =====**/


  mapboxgl.accessToken = 'pk.eyJ1Ijoic3RlZmFuaGludHoiLCJhIjoiY2l0aXp6aDlwMDZ4NTJ4bnZqM2lhaWlmcSJ9.Iec-WeMNiHTqv6-GlQ5BpA';
  L.mapbox.accessToken = 'pk.eyJ1Ijoic3RlZmFuaGludHoiLCJhIjoiY2l0aXp6aDlwMDZ4NTJ4bnZqM2lhaWlmcSJ9.Iec-WeMNiHTqv6-GlQ5BpA';

  var geocoder = L.mapbox.geocoder('mapbox.places');
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9'
  });

  geocoder.query('Switzerland', showMap);

  function showMap(err, data) {
    // The geocoder can return an area, like a city, or a
    // point, like an address. Here we handle both cases,
    // by fitting the map bounds to an area or zooming to a point.
    var box = new mapboxgl.LngLatBounds(
      new mapboxgl.LngLat(data.bounds[0], data.bounds[1]),
      new mapboxgl.LngLat(data.bounds[2], data.bounds[3])
    );
    if (data.lbounds) {
      map.fitBounds(box);
    } else if (data.latlng) {
      map.setView(box, 13);
    }
  }

  // Initialize connection using our project credentials
  firebase.initializeApp(config);

  // Get a reference to the database service
  var database = firebase.database();

  // handle form submits
  $('form').on('submit', function(e) {
    e.preventDefault();
    $(".mapboxgl-marker").remove();
    var $form = $(this);
    var term = $form.find('[name="term"]').val();
    var words = false;
    if (term) {
      $('#results ol').text('');
      //$('#results').text('');
      doSearch($form.find('[name="index"]').val(), "users", makeTerm(term, words));
    } else {
      $('#results ol').text('');
    }
  });

  // display search results
  function doSearch(index, type, query) {
    var ref = database.ref().child(PATH);
    var key = ref.child('request').push({ index: index, type: type, query: query }).key;

    console.log('search', key, { index: index, type: type, query: query });
    ref.child('response/' + key).on('value', showResults);
  }

  function showResults(snap) {
    if (!snap.exists()) {
      return;
    } // wait until we get data
    var dat = snap.val();
    snap.ref.off('value', showResults);
    snap.ref.remove();
    var data = dat.hits;
    var string;
    for (var i = 0; i < data.length; i++) {
      var website = data[i]._source.website;
      if (website == undefined) {
        website = "-";
        string = "<li id=" + data[i]._id + "><h2>" + data[i]._source.institution + "</h2>";
      } else {
        string = "<li id=" + data[i]._id + "><h2><a href='" + website + "'>" + data[i]._source.institution + "</a></h2>";
      }
      var mail = data[i]._source.mail;
      if (mail == undefined) {
        mail = "-";
      }
      $('#results ol').append(string + "<p class='shortDiscription'>" + data[i]._source.shortDiscription + "</p><p class='description'>" + data[i]._source.description + "</p><div class='detailsContainer'><div class='details'><div class='label-row'><p class='website title'>Website<p class='website'><a href='" + website + "'>" + website + "</a></p></p></div><div class='label-row'><p class='phone title'>Phone<p class='phone'>" + data[i]._source.phone + "</p></p></div><div class='label-row'><p class='mail title'>Mail<p class='mail'>" + mail + "</p></p></div><div class='label-row'><p class='address title'>Adresse<p class='address'>" + data[i]._source.address + "</p></p></div></div><div class='source'><p><a href='"+data[i]._source.source+"'>Quelle infodrog.ch</a></p></div></div></li>");

      addMarker(data[i]._source.address,
        data[i]._id);
    }
  }

  function makeTerm(term, matchWholeWords) {
    if (!matchWholeWords) {
      if (!term.match(/^\*/)) { term = '*' + term; }
      if (!term.match(/\*$/)) { term += '*'; }
    }
    console.log(term.replace(/[^a-zA-Z0-9 ]/g, ''));
    return term.replace(/[^a-zA-Z0-9 ]/g, '');
  }

  var addMarker = function(query, markerID) {
    if (query !== undefined) {
      var geocoder = L.mapbox.geocoder('mapbox.places');
      return geocoder.query(query, function(err, data) {
        var htmlMarker = document.createElement('div');
        htmlMarker.classList.add("institution-" + markerID);
        var marker = new mapboxgl.Marker(htmlMarker).setLngLat([data.latlng[1], data.latlng[0]]).addTo(map);

        $("#" + markerID).hover(function() {
          var marker = document.querySelector(".mapboxgl-marker.institution-" + markerID);
          console.log(marker);
          marker.style.width = "30px";
          marker.style.height = "30px";
          marker.style.margin = "-5px 0 0 -5px";
          marker.style.zIndex = "100";
        }, function() {
          var marker = document.querySelector(".mapboxgl-marker.institution-" + markerID);
          marker.style.width = "20px";
          marker.style.height = "20px";
          marker.style.margin = "0";
          marker.style.zIndex = "1";
        });
      });
    }
  };

  function makeId(string) {
    return string.replace(/[^a-zA-Z0-9]/g, '');
  }

  // display raw data for reference
  database.ref().on('value', setRawData);

  function setRawData(snap) {
    $('#raw').text(JSON.stringify(snap.val(), null, 2));
  }
})(jQuery);
