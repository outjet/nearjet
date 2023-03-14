function cycleEmojis() {
  const emojis = ["✈️"];
  let i = 0;
  return setInterval(() => {
    $("#findingyou").text(emojis[i]);
    i++;
    if (i >= emojis.length) {
      i = 0;
    }
  }, 820);
}

function getAircraftData() {
  // Set up "Finding you..." message
  $("#findingyou").text("Finding you...");
  const cycleInterval = cycleEmojis();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleGeolocationSuccess(position, cycleInterval);
      },
      () => {
        clearInterval(cycleInterval);
        $("#findingyou").text("Failed to find your location.");
      }
    );
  } else {
    clearInterval(cycleInterval);
    $("#findingyou").text("Geolocation is not supported by this browser.");
  }
}

function handleGeolocationSuccess(position, cycleInterval) {
  const browserLat = position.coords.latitude;
  const browserLon = position.coords.longitude;
  $("#result").html("Scanning the Sky...");
  console.log("Lat: ", browserLat);
  console.log("Long: ", browserLon);
  //Lat:  41.4
  //Lon:  -81.8
  const range = 25; // miles
  const lat_range = range / 69.172;
  const lon_range = range / (Math.cos(browserLat) * 69.172);
  const southWestLat = browserLat - lat_range; // 25 miles south: 41.4 - 0.362 = 41.038
  const southWestLon = browserLon - lon_range; // 25 miles west : -81.8 - 0.362 = -82.162
  const northEastLat = browserLat + lat_range; // 25 miles north : 41.4 + 0.362 = 41.762
  const northEastLon = browserLon + lon_range; // 25 miles east : -81.8 + 0.362 = -81.438

  const apiUrl = `https://us-central1-nearjet.cloudfunctions.net/myFunction?swLat=${southWestLat}&swLon=${southWestLon}&neLat=${northEastLat}&neLon=${northEastLon}`;

  const cache = localStorage.getItem("cache");
  const cacheTimestamp = localStorage.getItem("timestamp");
  
  // cache good?
  if (cache && cacheTimestamp && Date.now() - cacheTimestamp < 60000 * 1.5  ) { // check if the cache is less than x minutes old
    const data = JSON.parse(cache);
    console.log('Data (from cache): ', data);
    displayAircraftData(data.flights, browserLat, browserLon);
    $("#cache").html("Cachegood");
    clearInterval(cycleInterval);
  } else {
    $.ajax({
      url: apiUrl
    }).done(function (data) {
      console.log('Data (from API): ', data);
      console.log('API URL: ', data.composedUrl);
      localStorage.setItem("cache", JSON.stringify(data));
      localStorage.setItem("timestamp", Date.now());
      displayAircraftData(data.flights, browserLat, browserLon);
      clearInterval(cycleInterval);
    });
  }
}

function displayAircraftData(data, browserLat, browserLon) {
    const sortedFlights = data.flights.sort((a, b) => {
      const aPos = a.last_position;
      const bPos = b.last_position;
      const aDist = haversineDistance(browserLat, browserLon, aPos.latitude, aPos.longitude);
      const bDist = haversineDistance(browserLat, browserLon, bPos.latitude, bPos.longitude);
      return aDist - bDist;
    });
    const nearestFlights = sortedFlights.slice(0, Math.min(4, sortedFlights.length));
  
    let result = "";
    nearestFlights.forEach((flight) => {
      const lastPos = flight.last_position;
      const aircraftLat = lastPos.latitude;
      const aircraftLon = lastPos.longitude;
  
      result += `<div class='aircraft'>`;
      result += `<a target="_blank" href="https://flightaware.com/live/flight/${flight.ident}">Call sign: ${flight.ident}</A>`;
      if (flight.type) {
        result += `Type: ${flight.type}<br>`;
      }
      result += `Aircraft type: ${flight.aircraft_type}<br>`;
      result += `Altitude: ${lastPos.altitude * 100} feet<br>`;
      result += `Origin: ${flight.origin.code} - ${flight.origin.name}<br>`;
      result += `Destination: ${flight.destination.code} - ${flight.destination.name}<br>`;
      result += `Distance : ${haversineDistance(browserLat, browserLon, aircraftLat, aircraftLon).toFixed(2)} miles</div>`;
    });  

  $("#result").html(result);
}


function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

$(document).ready(function () {
  getAircraftData();
});

