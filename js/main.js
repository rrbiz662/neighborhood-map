// MVVM code
let Business = function(data){
    let self = this;
    self.id =data.id;
    self.name = data.name;
    self.img = data.image_url;    
    self.phone = data.display_phone;
    self.address = {
        "street": data.location.display_address[0],
        "city": data.location.display_address[1]
    };
    self.latitude = data.coordinates.latitude;
    self.longitude = data.coordinates.longitude;
    self.category = data.categories[0].title;
}

let ViewModel = function(){
    let self = this;
    self.businesses = [];
    self.filteredBusinesses = ko.observableArray([]);
    self.filters = ko.observableArray([]);
    self.selectedFilter = ko.observable();

    // Filter businesses by user selection. 
    self.selectedFilter.subscribe(function(newValue){
        // Get all businesses.  
        self.filteredBusinesses(self.businesses.slice(0));

        if(self.filteredBusinesses().length != 0)
        {
            // Remove businesses that dont match the selected food type. 
            self.filteredBusinesses.remove(function(item){
                return item.category != newValue;
            });
            
            clearMarkers();
            createMarkers(self.filteredBusinesses);
        }

    }, self);

    // Get businesses from Yelp. 
    self.getBusinesses = function(){
        loc = $("#location").val();
        resetPage(self, false);

        if( loc != "")
        {
            $.ajax({
                type: "GET",
                url: "http://localhost:5000/yelprequest/",
                data: {
                    location: loc,                
                },
                dataType: "json",
                cache: true,
                crossDomain: true,
            }).done(function(response){
                let data = JSON.parse(response);
                let businesses = data.businesses;
            
                if(!data.error){
                    for (let i = 0; i < businesses.length; i++) {
                        business = new Business(businesses[i]);
            
                        self.businesses.push(business);
                        createMarker(business);
            
                        // No duplicate filtering items. 
                        if(self.filters.indexOf(business.category) == -1){
                            self.filters.push(business.category);
                        }
                    }
                    // Copy businesses array.  
                    self.filteredBusinesses(self.businesses.slice(0));
                }
                else{
                    console.log("ERROR retrieving data from YELP.");
                }
            }).fail(function(response){
                console.log("ERROR connecting to server.");
            });

            zoomToArea(loc);
        }
    };

    self.selectBusiness = function(){

    }

    self.clearBusinesses = function(){
        resetPage(self, true);
    };
}

ko.applyBindings(new ViewModel());

// Google Maps code 
let map; 
let markers = [];
let infoWindow; 

function initMap(){
    let location = {lat: -25.363, lng: 131.044};
    // Need the actual DOM element from the jQuery object to init the map. 
    map = new google.maps.Map($("#map")[0], {
        zoom: 10,
        center: location
    });

    infoWindow = new google.maps.InfoWindow();
}

// Zoom to area specified by the user. 
function zoomToArea(address){
    let geocoder = new google.maps.Geocoder();

    // Get lat/lng and move map to location. 
    geocoder.geocode({
        address: loc,
    },function(results, status){
        if(status == google.maps.GeocoderStatus.OK){
            map.setCenter(results[0].geometry.location);
            map.setZoom(10);
        }
        else{
            alert("Location not found.");
        }
    });
}

// Create a map marker for a business. 
function createMarker(business){
    let position = {
        lat: business.latitude,
        lng: business.longitude
    };

    let marker = new google.maps.Marker({
        position: position,
        title: business.name,
        animation: google.maps.Animation.DROP
    });

    markers.push(marker);
    marker.setMap(map);

    marker.addListener("click", function(){
        populateInfoWindow(marker, business);
        toggleBounce(marker);
    });
}

// Create map markers for the passed in list. 
function createMarkers(businessList){
    for (let i = 0; i < businessList().length; i++) {
        createMarker(businessList()[i]);
    }
}

// Toggles animation. 
function toggleBounce(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // Togle animation off after 2 bounces. 
    setTimeout(function(){marker.setAnimation(null)}, 750);
}

// Populate info window with business data. 
function populateInfoWindow(marker, business){
    // Display only 1 info window per seletion. 
    if(infoWindow.marker == null){
        infoWindow.marker = marker;

        infoWindow.addListener("closeclick", function(){
            infoWindow.marker = null;
        });
    }

    infoWindow.setContent("<div>" + marker.title + "</div>");    
    infoWindow.open(map, marker);
}

// Resets the page to initial state. 
function resetPage(self, clearText)
{
    // Clear textbox. 
    if(clearText){
        $("#location").val("");
    }

    // Clear arrays. 
    self.filters.removeAll();
    self.filteredBusinesses.removeAll();
    self.businesses.length = 0;
    clearMarkers();  
}

// Clears markers from the map. 
function clearMarkers(){
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);        
    }
    markers.length = 0; 
}
