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
    // $("#lat").html("Latitude: " + browserLat);
    // $("#lon").html("Longitude: " + browserLon);

    const apiUrl = `https://adsbx-flight-sim-traffic.p.rapidapi.com/api/aircraft/json/lat/${browserLat}/lon/${browserLon}/dist/25/`;
    const cache = localStorage.getItem("cache");
    const cacheTimestamp = localStorage.getItem("timestamp");

    // Check if the cache is still valid (12 hours)
    if (cache && cacheTimestamp && Date.now() - cacheTimestamp < 43200000) {
        const data = JSON.parse(cache);
        console.log('Data: ', data);
        console.log('Result: ', result);
        displayAircraftData(data, browserLat, browserLon);
        //print message indicating Cache is still valid
        $("#cache").html("Cache is still valid");
    } else {
        $.ajax({
            url: apiUrl,
            headers: {
                "X-RapidAPI-Host": "adsbx-flight-sim-traffic.p.rapidapi.com",
                "X-RapidAPI-Key": "f77c4b15acmsh1c684ea25336b4ep1a6eaejsn6e0b1d02dcf3"
            }
        }).done(function (data) {
            localStorage.setItem("cache", JSON.stringify(data));
            localStorage.setItem("timestamp", Date.now());
            displayAircraftData(data, browserLat, browserLon);
        });
    }
}

function displayAircraftData(data, browserLat, browserLon) {
    let result = "";
    let count = 0;

    data.ac.forEach(function (aircraft) {
        if (count >= 3 || aircraft.alt < 1000) {
            return;
        }

        const aircraftLat = aircraft.lat;
        const aircraftLon = aircraft.lon;

        //Calculate the direction based on the angle
        const direction = (180 + Math.atan2(aircraftLat - browserLat, aircraftLon - browserLon) * 180 / Math.PI) % 360;
        //Calculate the distance between the aircraft and the browser
        const distance = Math.sqrt(Math.pow(aircraftLat - browserLat, 2) + Math.pow(aircraftLon - browserLon, 2)) * 69.172;

        result += `<div class='aircraft'>`
        if (aircraft.from) {
            result += `From: ${aircraft.from}<br>`
        }
        if (aircraft.to) {
            result += `To: ${aircraft.to}<br>`
        }
        result += `<br>Altitude: ${aircraft.alt}<br>`
        if (aircraft.call) {
            result += `Call sign: ${aircraft.call}<br>`
        }
        if (aircraft.type) {
            result += `Type: ${aircraft.type}<br>`
        }
        result += `Distance: ${distance.toFixed(2)} miles ${getDirection(direction)}<br><br>
        </div>`;
        // Latitude: ${aircraft.lat}
        // <br>Longitude: ${aircraft.lon}
    count++;
});

//update the result in the DOM
$("#result").html(result);
}

//Helper function to get the direction from degrees
function getDirection(degrees) {
if (degrees >= 337.5 || degrees < 22.5) {
return "N";
} else if (degrees >= 22.5 && degrees < 67.5) {
return "NE";
} else if (degrees >= 67.5 && degrees < 112.5) {
return "E";
} else if (degrees >= 112.5 && degrees < 157.5) {
return "SE";
} else if (degrees >= 157.5 && degrees < 202.5) {
return "S";
} else if (degrees >= 202.5 && degrees < 247.5) {
return "SW";
} else if (degrees >= 247.5 && degrees < 292.5) {
return "W";
} else if (degrees >= 292.5 && degrees < 337.5) {
return "NW";
}
}

$(document).ready(function() {
    getAircraftData();
    });