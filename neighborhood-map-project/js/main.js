// MVVM code
/**
 * @description The model representing a business.
 * @param data The business to get the data from.
 */
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

/**
 * @description The ViewModel.
 */
let ViewModel = function(){
    let self = this;
    self.businesses = [];
    self.filteredBusinesses = ko.observableArray([]);
    self.filters = ko.observableArray([]);
    self.selectedFilter = ko.observable();

    /**
     * @description Filters the businesses by dropdown user selection.
     */
    self.selectedFilter.subscribe(function(newValue){
        if(self.filteredBusinesses().length !== 0)
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

    /**
     * @description Gets the businesses from Yelp when the search button is clicked.
     */
    self.getBusinesses = function(){
        loc = locationText.val();
        resetPage(self, false);

        if( loc !== "")
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
                        if(self.filters.indexOf(business.category) === -1){
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

    /**
     * @description Animates the marker when the corresponding list item is clicked.
     * @param business The business who's marker needs animation.
     */
    self.selectBusiness = function(business){
        google.maps.event.trigger(business.marker, "click");
    };

    /**
     * @description Reset the page on clear button press.
     */
    self.clearBusinesses = function(){
        resetPage(self, true);
    };

    /**
     * @description Hides and unhides sidebar.
     */
    self.toggleSidebar = function(){
        // Get current width.
        width = sidebar.css("width");

        // Unhide when hidden and vice versa.
        if(width === "0px"){
            sidebar.css("width", "250px");
        }
        else{
            sidebar.css("width", "0px");
        }
    };
}

ko.applyBindings(new ViewModel());

// Google Maps code
let map;
let infoWindow;

/**
 * @description Initializes Google map.
 */
function initMap(){
    let location = {lat: 30.143347, lng: -97.833595};
    // Need the actual DOM element from the jQuery object to init the map.
    map = new google.maps.Map(mapDiv[0], {
        zoom: 6,
        center: location
    });

    infoWindow = new google.maps.InfoWindow();
}

/**
 * @description Zooms map to the address passed in.
 * @param address Address to zoom to.
 */
function zoomToArea(address){
    let geocoder = new google.maps.Geocoder();

    // Get lat/lng and move map to location.
    geocoder.geocode({
        address: loc,
    },function(results, status){
        if(status === google.maps.GeocoderStatus.OK){
            map.setCenter(results[0].geometry.location);
            map.setZoom(10);
        }
    });
}

/**
 * @description Creates marker for business passed in.
 * @param business The busines to create a marker for.
 * @returns The marker created.
 */
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

/**
 * @description Toggles the marker animation.
 * @param marker The marker to toggle.
 */
function toggleBounce(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // Toggle animation off after approximately 2 bounces.
    setTimeout(function(){marker.setAnimation(null)}, 750);
}

/**
 * @description Toggles the markers of the passed in businesses on/off.
 * @param businesses The businesses to toggle the markers.
 * @param toggleOn A boolean value indicating whether to toggle the marker on/off.
 */
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

/**
 * @description Populates info window with business data.
 * @param marker The marker to populate info for.
 * @param business The business to populate info from.
 */
function populateInfoWindow(marker, business){
    // Display only 1 info window per seletion.
    if(infoWindow.marker === null){
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

// Utility methods

/**
 * @description Resets the page to the initial state.
 * @param self The current ViewModel.
 * @param clearText A boolean value indicating whether to clear the location text box.
 */
function resetPage(self, clearText)
{
    // Clear textbox.
    if(clearText){
        locationText.val("");
    }

    toggleMarkers(self.filteredBusinesses, false);

    // Clear arrays.
    self.filters.removeAll();
    self.filteredBusinesses.removeAll();
    self.businesses.length = 0;
}

/**
 * @description Listens for when media query hits width limits.
 * Toggles sidebar on/off accordingly.
 * @param mediaQueryList The list to check if there are matches.
 */
function mediaQueryListener(mediaQueryListx) {
    if(!mediaQueryList.matches){
        sidebar.css("width", "250px");
    }
    else{
        sidebar.css("width", "0px");
    }
}

const sidebar = $("#sidebar");
const locationText = $("#location");
const mapDiv = $("#map");
let mediaQueryList = window.matchMedia("(max-width: 1275px)")
mediaQueryListener(mediaQueryList) // Call listener function at run time
mediaQueryList.addListener(mediaQueryListener) // Attach listener function on state changes
