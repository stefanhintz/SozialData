var database = firebase.database();
console.log(database);
var addiction = database.ref("addiction/");
var filtered = new Array();

$.get("https://dl.dropboxusercontent.com/s/7r345qkp9i8gwwa/sozialdata-export%20%281%29.json?dl=0", function(data) {
  console.log(data);
  var parse = JSON.parse(data);
  var json = parse.addiction;
  var filtered = new Array();
  console.log(json);
  for (var i = 1; i < json.length; i++) {
    //var tag = json[i].institution;
    var obj = json[i];
    console.log(obj.institution);
    filtered.push(obj.institution);
    filtered.push(obj.tags);
  }
  console.log(filtered);
  // constructs the suggestion engine
  var states = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    // `states` is an array of state names defined in "The Basics"
    local: filtered
  });

  $('#bloodhound .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'states',
    source: states
  });
});

/*
addiction.once("value", function(data) {
  console.log(data);
  var json = data.val();
  var filtered = new Array();
  console.log(data);
  for (var i = 1; i < json.length; i++) {
    //var tag = json[i].institution;
    var obj = json[i];
    console.log(obj.institution);
    filtered.push(obj.institution);
    filtered.push(obj.tags);
  }
  console.log(filtered);
  // constructs the suggestion engine
  var states = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    // `states` is an array of state names defined in "The Basics"
    local: filtered
  });

  $('#bloodhound .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'states',
    source: states
  });
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
*/
