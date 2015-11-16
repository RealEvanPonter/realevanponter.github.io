var Model = {
  locations: [
    {
      name: "Abbey Burger Bistro",
      position: {lat: 39.277200, lng: -76.612911},
      tags: ["burgers", "pubs", "english", "beer"],
      yelpId: "abbey-burger-bistro-baltimore"
    },
    {
      name: "Bluegrass",
      position: {lat: 39.272478, lng: -76.615542},
      tags: ["french", "southern", "gastropubs"],
      yelpId: "bluegrass-baltimore-2"
    },
    {
      name: "Bookmakers Cocktail Club",
      position: {lat: 39.276554, lng: -76.613134},
      tags: ["american", "cocktail bars"],
      yelpId: "bookmakers-cocktail-club-baltimore-4"
    },
    {
      name: "Brewer’s Cask",
      position: {lat: 39.275096, lng: -76.612188},
      tags: ["pubs", "american", "beer", "wine & spirits"],
      yelpId: "brewers-cask-baltimore"
    },
    {
      name: "Delia Foley’s",
      position: {lat: 39.272727, lng: -76.613980},
      tags: ["pubs", "chicken wings", "irish"],
      yelpId: "delia-foleys-baltimore"
    },
    {
      name: "Don't Know Tavern",
      position: {lat: 39.272942, lng: -76.611585},
      tags: ["sports bars", "seafood", "sandwiches", "pubs"],
      yelpId: "dont-know-tavern-baltimore-2"
    },
    {
      name: "Hersh's",
      position: {lat: 39.268630, lng: -76.611680},
      tags: ["pizza", "italian", "wine", "bars"],
      yelpId: "hershs-baltimore-2"
    },
    {
      name: "Home Slyce",
      position: {lat: 39.269643, lng: -76.611524},
      tags: ["sports bars", "american", "pizza"],
      yelpId: "home-slyce-baltimore-2"
    },
    {
      name: "liv2eat",
      position: {lat: 39.273028, lng: -76.611916},
      tags: ["american"],
      yelpId: "liv2eat-baltimore"
    },
    {
      name: "Matsuri Japanese Restaurant",
      position: {lat: 39.276508, lng: -76.614139},
      tags: ["japanese", "sushi"],
      yelpId: "matsuri-japanese-restaurant-baltimore-2"
    },
    {
      name: "Mums",
      position: {lat: 39.275918, lng: -76.615723},
      tags: ["bars"],
      yelpId: "mums-baltimore"
    },
    {
      name: "No Idea Tavern",
      position: {lat: 39.270592, lng: -76.614935},
      tags: ["bars"],
      yelpId: "no-idea-tavern-baltimore"
    },
    {
      name: "Pub Dog",
      position: {lat: 39.277022, lng: -76.613544},
      tags: ["pizza", "pubs", "beer"],
      yelpId: "pub-dog-baltimore"
    },
    {
      name: "Ronnie's Sub Shop",
      position: {lat: 39.269336, lng: -76.614013},
      tags: ["breakfast & brunch", "american", "sandwiches"],
      yelpId: "ronnies-sub-shop-baltimore"
    },
    {
      name: "The Rowan Tree",
      position: {lat: 39.270631, lng: -76.613771},
      tags: ["bars"],
      yelpId: "the-rowan-tree-baltimore"
    },
    {
      name: "The Rowhouse Grille",
      position: {lat: 39.274129, lng: -76.612094},
      tags: ["bars", "american"],
      yelpId: "the-rowhouse-grille-baltimore"
    },
    {
      name: "Shoyou Sushi",
      position: {lat: 39.272526, lng: -76.611796},
      tags: ["sushi bars"],
      yelpId: "shoyou-sushi-baltimore"
    },
    {
      name: "SoBo Cafe",
      position: {lat: 39.276873, lng: -76.614878},
      tags: ["american", "breakfast & brunch", "vegetarian"],
      yelpId: "sobo-cafe-baltimore"
    },
    {
      name: "SoBo Market",
      position: {lat: 39.271382, lng: -76.613566},
      tags: ["beer", "wine & spirits", "bakeries", "specialty food"],
      yelpId: "sobo-market-baltimore"
    },
    {
      name: "Thai Arroy",
      position: {lat: 39.277836, lng: -76.612330},
      tags: ["thai"],
      yelpId: "thai-arroy-baltimore"
    }
  ]
};

var AppViewModel = function() {
  var self = this;
  self.map;
  self.locations = ko.observableArray();
  self.searchTerm = ko.observable("");
  self.openLocation = ko.observable("0");
  
  // Create a location
  function Location(rawLocation, map, id) {
    var loc = this;
    
    loc.name = ko.observable(rawLocation.name);
    loc.id = id;
    loc.tags = rawLocation.tags;
    loc.yelpId = rawLocation.yelpId;
    loc.yelpUrl = ko.observable("");
    loc.ratingImgUrl = ko.observable("");
    loc.reviewCount = ko.observable("");
    loc.street = ko.observable("");
    loc.city = ko.observable("");
    loc.state = ko.observable("");
    loc.zip = ko.observable("");
    loc.phone = ko.observable("");
    
    // Create a map marker for this location
    loc.marker = new google.maps.Marker({
      map: map,
      position: rawLocation.position,
      title: loc.name(),
    });
    
    // Determine if the location should be visible, which is
    // based on the search term, name of the location, and the tags
    loc.shouldDisplay = function() {
      var searchTerm = self.searchTerm().toLowerCase();
      var shouldDisplay = self.searchTerm() === "" ||
        loc.name().toLowerCase().indexOf(searchTerm) > -1 ||
        loc.isTermInTags(searchTerm);
      loc.marker.setVisible(shouldDisplay);
      return shouldDisplay;
    };
    
    // Determine if this location should be visible in real time
    loc.visible = ko.computed(function() {
      return loc.shouldDisplay();
    });
    
    // Create an infoWindow that will display info about this location
    loc.infoWindow = new google.maps.InfoWindow({
      content: ''
    });
    
    // Display info window for only this location near its bouncing marker
    loc.showInfo = function() {
      self.closePreviousWindow();
      loc.bounceMarker();
      loc.infoWindow.open(loc.marker.map, loc.marker);
      self.openLocation(loc.id);
      yelpInfo(loc.yelpId);
    };
    
    // Make the marker bounce
    loc.bounceMarker = function() {
      loc.marker.setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function() {
        loc.marker.setAnimation(null);
      }, 1450);
    };
    
    // Add click listener to marker. When clicked, run showInfo function
    loc.marker.addListener('click', function() {
      loc.showInfo();
    });
    
    // Return true if search term is in any of the tags, false if not
    loc.isTermInTags = function(searchTerm) {
      for(i=0; i<loc.tags.length; i++) {
        if (loc.tags[i].toLowerCase().indexOf(searchTerm) > -1) {
          return true;
        }
      }
      return false;
    };
  }
  
  // Set up the intitial page view
  self.initialize = function() {
    self.createMap();
    self.createLocations(Model.locations, self.map);
    self.centerAndZoomMap(Model.locations, self.map);
  };
  
  // Create a map object and specify the DOM element for display
  self.createMap = function() {
    self.map = new google.maps.Map(document.getElementById('map'));
  };
  
  // Create a location object for each location in the model
  self.createLocations = function(locations, map) {
    for (i=0; i<locations.length; i++) {
      self.locations.push(new Location(locations[i], map, i));
    }
  };
  
  // Center and zoom the map to fit all of the makers
  self.centerAndZoomMap = function(locations, map) {
    var markerBounds = new google.maps.LatLngBounds();
    var lat, lng;
    for (i=0; i<locations.length; i++) {
      lat = locations[i].position.lat;
      lng = locations[i].position.lng;
      markerBounds.extend(new google.maps.LatLng(lat, lng));
    }
    map.fitBounds(markerBounds);
  };
  
  // Close the previously opened window
  self.closePreviousWindow = function() {
    self.locations()[self.openLocation()].infoWindow.close();
  };
  
  // Request Yelp info about the location
  function yelpInfo(yelpId) {
    
    var request = this;
    var loc = self.locations()[self.openLocation()];
    
    function nonce_generate() {
      return (Math.floor(Math.random() * 1e12).toString());
    }
    var yelp_url = 'https://api.yelp.com/v2/business/' + yelpId;
    var parameters = {
      oauth_consumer_key: 'LV5XNWjcIXqcbD7iPpZEaw',
      oauth_token: 'ErK1BSEc2laU6xc8cWhhfIUi2O0AElRg',
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version : '1.0',
      callback: 'cb'
    };
    
    var encodedSignature = oauthSignature.generate(
      'GET', yelp_url, parameters,
      'a0F8gEJ8DLP-MOQrkQRYjkNG6W0', 'BrJ3R7L9SJwZS2G_bpoyAQKORz8');
    parameters.oauth_signature = encodedSignature;
    
    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,
      dataType: 'jsonp',
      
      // Save results to location attributes
      success: function(results) {
        loc.yelpUrl(results.url);
        loc.ratingImgUrl(results.rating_img_url);
        loc.reviewCount(results.review_count);
        loc.street(results.location.address[0]);
        loc.city(results.location.city);
        loc.state(results.location.state_code);
        loc.zip(results.location.postal_code);
        loc.phone(results.display_phone);
        
        // Display results in the infoWindow
        loc.infoWindow.setContent(
          $('#yelp-info').prop('outerHTML'));
      },
      
      // Display an error message if the Yelp request is not successful
      error: function() {
        loc.infoWindow.setContent(
        'Could not retrieve info about this location');
      }
    };
    
    // Request Yelp info and display a waiting message
    $.ajax(settings);
    loc.infoWindow.setContent('hang on...');
  }
  
  // Recenter the map when the window is resized
  $(window).resize(function() {
    self.centerAndZoomMap(Model.locations, self.map);
  });
  
  // Set up the initial render
  self.initialize();
};

// Displays an error where the map is supposed to load
function error() {
  $('map').innerHTML = 'Something went wrong...' +
    '<br>Map could not be displayed. Please check your internet connection ' +
    'and try again';
}

// Activates knockout.js
function start() {
  ko.applyBindings(new AppViewModel());
}