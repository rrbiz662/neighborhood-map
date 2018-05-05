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
    self.marker = null;
    self.setMarker = function(marker){
        self.marker = marker; 
    }
}

let ViewModel = function(){
    let self = this;
    self.businesses = [];
    self.filteredBusinesses = ko.observableArray([]);
    self.filters = ko.observableArray([]);
    self.selectedFilter = ko.observable();

    // Filter businesses by dropdown user selection. 
    self.selectedFilter.subscribe(function(newValue){
        if(self.filteredBusinesses().length != 0)
        {        // Get all businesses.  
            self.filteredBusinesses(self.businesses.slice(0));
            toggleMarkers(self.filteredBusinesses, false);

            // Remove businesses that dont match the selected food type. 
            self.filteredBusinesses.remove(function(item){
                return item.category != newValue;
            });
            
            toggleMarkers(self.filteredBusinesses, true);
        }

    }, self);

    // Get businesses from Yelp when search button is clicked. 
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
                        // Initialize business.
                        business = new Business(businesses[i]);
                        business.setMarker(createMarker(business));   

                        self.businesses.push(business);
            
                        // No duplicate filtering items. 
                        if(self.filters.indexOf(business.category) == -1){
                            self.filters.push(business.category);
                        }
                    }
                    // Copy businesses array.  
                    self.filteredBusinesses(self.businesses.slice(0));
                }
                else{
                    alert("Error retrieving YELP data.");
                }
            }).fail(function(response){
                alert("Error connecting to the local server.");
            });
            zoomToArea(loc);
        }
    };

    // Animate marker when corresponding list item is clicked. 
    self.selectBusiness = function(business){
        google.maps.event.trigger(business.marker, "click");
    }

    // Reset the page on clear button press. 
    self.clearBusinesses = function(){
        resetPage(self, true);
    };
}

ko.applyBindings(new ViewModel());

// Google Maps code 
let map; 
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
    });
}

// Create a map marker for a business. 
function createMarker(business){
    let position = {
        lat: business.latitude,
        lng: business.longitude
    };

    // Create marker. 
    let marker = new google.maps.Marker({
        position: position,
        title: business.name,
        animation: google.maps.Animation.DROP
    });

    marker.setMap(map);

    marker.addListener("click", function(){
        populateInfoWindow(marker, business);
        toggleBounce(marker);
    });

    return marker;
}

// Toggles animation. 
function toggleBounce(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // Togle animation off after approximately 2 bounces. 
    setTimeout(function(){marker.setAnimation(null)}, 750);
}

// Toggles markers of businesseds passed in on/off. 
function toggleMarkers(businesses, toggleOn)
{
    for (let i = 0; i < businesses().length; i++) {        
        if(toggleOn){
            businesses()[i].marker.setMap(map);        
        }
        else{
            businesses()[i].marker.setMap(null);
        }
    }
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

    let content = "<div><b>" + business.name + "</b><br>" +
    business.phone + "<br>" +
    business.address.street + "<br>" +
    business.address.city+ "<br>" +
    "<a href=\"https://www.yelp.com/\"><img src=\"img/yelp.png\"></a></div>";

    infoWindow.setContent(content);    
    infoWindow.open(map, marker);
}

// Resets the page to initial state. 
function resetPage(self, clearText)
{
    // Clear textbox. 
    if(clearText){
        $("#location").val("");
    }

    toggleMarkers(self.filteredBusinesses, false); 

    // Clear arrays. 
    self.filters.removeAll();
    self.filteredBusinesses.removeAll();
    self.businesses.length = 0;     
}
