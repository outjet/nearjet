function getAircraftData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handleGeolocationSuccess);
    }
}

function handleGeolocationSuccess(position) {
    const browserLat = position.coords.latitude;
    const browserLon = position.coords.longitude;
    console.log('Lat: ', browserLat);
    console.log('Long: ', browserLon);
    // Output the latitude and longitude on the page
    $("#lat").html("Latitude: " + browserLat);
    $("#lon").html("Longitude: " + browserLon);
