var Model = {
  neighborhood: {
    name: "Federal Hill",
    position: {lat: 39.273, lng: -76.609},
  },
  locations: [
    {
      name: "No Idea Tavern",
      position: {lat: 39.270592, lng: -76.614935},
      tags: ["bars", "beer", "drinks", "food", "happy hour"]
    },
    {
      name: "Don't Know Tavern",
      position: {lat: 39.272942, lng: -76.611585},
      tags: ["bars", "beer", "drinks", "food", "happy hour"]
    }
  ]
};

var AppViewModel = function() {
  var self = this;
  self.map;
  self.locations = ko.observableArray();
  self.searchTerm = ko.observable("");
  self.openLocation;
  
  function Location(rawLocation, map) {
    var loc = this;
    
    this.name = rawLocation.name;
    this.tags = rawLocation.tags;
    
    this.marker = new google.maps.Marker({
      map: map,
      position: rawLocation.position,
      title: loc.name,
    });
    
    this.shouldDisplay = function() {
      var searchTerm = self.searchTerm().toLowerCase();
      var shouldDisplay = self.searchTerm() === "" ||
        loc.name.toLowerCase().indexOf(searchTerm) > -1 ||
        loc.isTermInTags(searchTerm);
      loc.marker.setVisible(shouldDisplay);
      return shouldDisplay;
    };
    
    this.visible = ko.computed(function() {
      return loc.shouldDisplay();
    });
    
    this.infoWindow = new google.maps.InfoWindow({
      content: '<h3>' + loc.name + '</h3>' +
        $.getJSON('https://api.yelp.com/v2/business/no-idea-tavern-baltimore'
          , function(data) {
            content.append(data.response.rating_img_url_small);
          })
    });
    
    // Display info window for only this location near its bouncing marker
    this.showInfo = function() {
      self.closePreviousWindow();
      loc.bounceMarker();
      loc.infoWindow.open(loc.marker.map, loc.marker);
      self.openLocation = loc;
    };
    
    // Make the marker bounce
    this.bounceMarker = function() {
      loc.marker.setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function() {
        loc.marker.setAnimation(null);
      }, 1450);
    };
    
    // Add click listener to marker. When clicked, run showInfo function
    this.marker.addListener('click', function() {
      loc.showInfo();
    });
    
    // Return true if search term is in any of the tags, false if not
    this.isTermInTags = function(searchTerm) {
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
  };
  
  // Create a map object and specify the DOM element for display.
  self.createMap = function() {
    self.map = new google.maps.Map(document.getElementById('map'), {
      center: Model.neighborhood.position,
      scrollwheel: true,
      zoom: 16
    });
  };
  
  self.createLocations = function(locations, map) {
    for (i=0; i<locations.length; i++) {
      self.locations.push(new Location(locations[i], map));
    }
  };
  
  // Close the previously opened window, if there is one
  self.closePreviousWindow = function() {
    if (self.openLocation !== undefined) {
      self.openLocation.infoWindow.close();
    }
  };
  
  self.initialize();
};

function error() {
  // Displays an error where the map is supposed to load
  document.getElementById('map').innerHTML = 'Something went wrong...' +
    '<br>Map could not be displayed. Please check your internet connection ' +
    'and try again';
}

function start() {
  // Activates knockout.js
  ko.applyBindings(new AppViewModel());
}