if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var browserlat = position.coords.latitude;
      var browserlon = position.coords.longitude;

     // Output the latitude and longitude on the page
    $("#lat").html("Latitude: " + browserlat);
    $("#lon").html("Longitude: " + browserlon);

      var apiUrl =
        "https://adsbx-flight-sim-traffic.p.rapidapi.com/api/aircraft/json/lat/" +
        browserlat +
        "/lon/" +
        browserlon +
        "/dist/25/";
  
      var cache = localStorage.getItem("cache");
      var cacheTimestamp = localStorage.getItem("timestamp");
  
      // Check if the cache is still valid (12 hours)
      if (cache && cacheTimestamp && Date.now() - cacheTimestamp < 43200000) {
        var data = JSON.parse(cache);
        var result = "";
        var count = 0;
        data.ac.forEach(function(aircraft) {
            if (count >= 3) {
              return;
            }
            if (aircraft.alt < 1000) {
                return;
              }

            var aircraftLat = aircraft.lat * (Math.PI / 180);
            var aircraftLon = aircraft.lon * (Math.PI / 180);
          
            // Calculate the direction and distance from the user's location
            var y = Math.sin(aircraftLon - browserlon) * Math.cos(aircraftLat);
            var x =
              Math.cos(browserlat) * Math.sin(aircraftLat) -
              Math.sin(browserlat) * Math.cos(aircraftLat) * Math.cos(aircraftLon - browserlon);
            var direction = (180 + Math.atan2(y, x) * 180 / Math.PI) % 360;
            var distance =
              111.045 *
              Math.acos(
                Math.sin(browserlat) * Math.sin(aircraftLat) +
                  Math.cos(browserlat) * Math.cos(aircraftLat) * Math.cos(aircraftLon - browserlon)
              );
          
            result +=
              "<div class='aircraft'>" +
              "From: " +
              aircraft.from +
              "<br>To: " +
              aircraft.to +
              "<br>Altitude: " +
              aircraft.alt +
              "<br>Latitude: " +
              aircraft.lat +
                "<br>Longitude: " +
              aircraft.lon +
              "<br>Call Sign: " +
              aircraft.call +
                "<br>Type: " +
              aircraft.type +
              "<br>Distance: " +
              distance.toFixed(2) +
              " miles " +
              getDirection(direction) +
              "<br><br>" +
              "</div>";
            count++;
          });
          
        $("#result").html(result);
        //print message indicating Cache is still valid
        $("#cache").html("Cache is still valid");
  
        return;
      }
  
      $.ajax({
        url: apiUrl,
        headers: {
          "X-RapidAPI-Host": "adsbx-flight-sim-traffic.p.rapidapi.com",
          "X-RapidAPI-Key": "4c60c2ee5cmsh2794bfecebffbb9p16c655jsn4fce7d556a65"
        }
      }).done(function(data) {
        localStorage.setItem("cache", JSON.stringify(data));
        localStorage.setItem("timestamp", Date.now());
        var result = "";
        var count = 0;
        data.ac.forEach(function(aircraft) {
            if (count >= 3) {
              return;
            }
          
            var aircraftLat = aircraft.lat * (Math.PI / 180);
            var aircraftLon = aircraft.lon * (Math.PI / 180);
          
            // Calculate the direction and distance from the user's location
            var y = Math.sin(aircraftLon - browserlon) * Math.cos(aircraftLat);
            var x =
              Math.cos(browserlat) * Math.sin(aircraftLat) -
              Math.sin(browserlat) * Math.cos(aircraftLat) * Math.cos(aircraftLon - browserlon);
            var direction = (180 + Math.atan2(y, x) * 180 / Math.PI) % 360;
            var distance =
              111.045 *
              Math.acos(
                Math.sin(browserlat) * Math.sin(aircraftLat) +
                  Math.cos(browserlat) * Math.cos(aircraftLat) * Math.cos(aircraftLon - browserlon)
              );
          
            result +=
              "<div class='aircraft'>" +
              "From: " +
              aircraft.from +
              "<br>To: " +
              aircraft.to +
              "<br>Altitude: " +
              aircraft.alt +
              "<br>Call Sign: " +
              aircraft.call +
                "<br>Type: " +
              aircraft.type +
              "<br>Distance: " +
              distance.toFixed(2) +
              " miles " +
              getDirection(direction) +
              "<br><br>" +
              "</div>";
            count++;
          });
          
        $("#result").html(result);
      });
    });
  }




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
