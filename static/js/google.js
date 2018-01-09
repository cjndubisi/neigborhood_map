/*jshint esversion: 6 */

// global app
var app;
// json values for places. Used only once.
var mPlaces = ko.observableArray();

// notify application when json gets back
// this should be reached only once. dispse done afterwards
var done = mPlaces.subscribe(function (newValue) {
    var interests = ko.utils.arrayMap(newValue, place => {
        return new MarkerViewModel(new FSPlaceViewModel(place));
    });

    app.locations(interests);
    if (interests.length !== 0) {
        // disable further notifcations
        done.dispose();
    }
});

// fetch places from server
$.ajax({
    type: 'GET',
    url:'http://localhost:5000/foursquare/nearby',
    data: {'lat': '6.423784', 'lng': '3.462076'},
        success: (data, status) => {
        if (status !== 'success') {
            alert('shomething isn\'t right\nTry reloading this page');
        }
        var response = data.response.groups[0];
        var places = [];
        for (var i = 0; i < response.items.length; i++) {
            var { venue: { name, location: { lat, lng, formattedAddress } } } = response.items[i];
            places.push({ name, lat, lng, formattedAddress: formattedAddress.join(", ") });
        }
        mPlaces(places);
    }, error: (data) => {
        alert('Woops! Something went wrong!\n Kindly Reload');
    }
});

// ViewModel: FSPlaceViewModel
// viewmodel for a foursquare venue
function FSPlaceViewModel({ name, lat, lng, formattedAddress }) {
    this.title = ko.observable(name);
    this.position = ko.observable({ lat, lng });
    this.address = ko.observable(formattedAddress);
}

// ViewModel: MarkerViewModel
// wrapper around google marker and FSPlaceViewModel
// This is to associate location with markers
function MarkerViewModel(location) {
    
    this.location = location; // observable
    
    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');
    
    // this is not an observable
    this.marker = new google.maps.Marker({
        position: location.position(),
        title: location.title(),
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: "lat" + location.position().lat
    });

    this.showInfo = () => {
        // check if info windows is displaying
        if (app.infowindow.marker !== undefined && app.infowindow.marker !== null) {
            app.infowindow.marker.setIcon(defaultIcon);
        }                              
        this.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            this.marker.setAnimation(null);            
            app.populateInfoWindow(this.marker, this.location);
            this.marker.setIcon(highlightedIcon);       
        }.bind(this), 600);
    };

    google.maps.event.addListener(this.marker, 'click', function() {
        this.showInfo();
    }.bind(this));

    google.maps.event.addListener(app.infowindow,'closeclick',function(){
        app.infowindow.marker.setIcon(defaultIcon);// reset icon color when window closes 
    });
}

function AppViewModel() {
    
    var bounds = new google.maps.LatLngBounds();
    
    // should be only one map
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 6.465422, lng: 3.406448 },
        zoom: 13,
        mapTypeControl: false
    });

    this.infowindow = new google.maps.InfoWindow();

    // internal data
    this.locations = ko.observableArray();

    // search text
    this.filterText = ko.observable("");

    this.filteredLocations = ko.computed(() => {
        var result = ko.utils.arrayFilter(this.locations(), function ({ marker, location }) {
            var contains = location.title().toLowerCase().indexOf(this.filterText().toLowerCase()) !== -1;
            // update marker visibility
            marker.setMap(contains ? this.map : null);
            return contains;
        }.bind(this));
        // return result of filter
        return result;
    }, this);

    // update view when locations changes
    this.locations.subscribe((newMarkers) => {
        for (var i = 0; i < newMarkers.length; i++) {
            var { marker } = newMarkers[i];
            marker.setMap(this.map);
            bounds.extend(marker.position);
        }
        if (newMarkers.length === 0) { return; }
        this.map.fitBounds(bounds);
    }, this);

    this.populateInfoWindow = (marker, place) => {
        // Check to make sure the infowindow is not already opened on this marker.
        if (this.infowindow.marker != marker) {
            this.infowindow.marker = marker;
            this.infowindow.setContent('<div>' +
            '<h6>'+ place.title() +'</h6>'+
            '<p>'+ place.address() +'</p>'+
            '</div>');
            this.infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            this.infowindow.addListener('closeclick', function() {
                this.marker = null;
            });
        }
    };

    google.maps.event.addDomListener(window, 'resize', function() {
        this.map.fitBounds(bounds);
    }.bind(this));
}

// create maker icon given a hex-color
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}


function initMap() {
    app = new AppViewModel();
    ko.applyBindings(app);
}

function errorLoadingMap() {
    alert('Woops! Something went wrong!\n Kindly Reload');    
}