// Global variables to store the user's location
let userLatitude, userLongitude;

// The Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyAIxaTQmywOJkn51QdU0zneqjJZvuzktsk";

/**
 * Attempts to get the user's current location
 */
function getUserLocation() {
    if (navigator.geolocation) {
        // Browser supports geolocation
        navigator.geolocation.getCurrentPosition(
            // Success callback
            handleLocationSuccess,
            // Error callback
            handleLocationError
        );
    } else {
        // Browser doesn't support geolocation
        alert("Geolocation is not supported by your browser.");
    }
}

/**
 * Handles successful retrieval of user location
 */
function handleLocationSuccess(position) {
    // Store the user's coordinates
    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;
    
    // Search for nearby attractions
    findNearbyAttractions(userLatitude, userLongitude);
}

/**
 * Handles errors when retrieving user location
 */
function handleLocationError() {
    alert("Unable to retrieve your location. Please enable location services.");
}

/**
 * Searches for tourist attractions near the specified coordinates
 */
function findNearbyAttractions(latitude, longitude) {
    // Search parameters
    const searchRadius = 5000; // 5km radius
    const placeType = "tourist_attraction";
    const minimumRating = 4.0;

    // Construct the API URL
    const searchURL = https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${searchRadius}&type=${placeType}&key=${GOOGLE_MAPS_API_KEY};

    // Make the API request
    fetch(searchURL)
        .then(response => response.json())
        .then(data => {
            // Filter places by rating
            const topRatedPlaces = data.results.filter(place => place.rating >= minimumRating);
            
            // Show the results
            showAttractionResults(topRatedPlaces);
        })
        .catch(error => console.log("Error finding attractions:", error));
}

/**
 * Displays the list of attractions on the page
 */
function showAttractionResults(attractions) {
    const resultsContainer = document.getElementById("placesContainer");
    resultsContainer.innerHTML = ""; // Clear previous results

    if (attractions.length === 0) {
        resultsContainer.innerHTML = "<p>No popular attractions found nearby.</p>";
        return;
    }

    // Create a card for each attraction
    attractions.forEach(attraction => {
        const attractionCard = document.createElement("div");
        attractionCard.classList.add("place-card");

        // Get the attraction photo or use a placeholder
        const photoUrl = attraction.photos 
            ? https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${attraction.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY} 
            : 'https://via.placeholder.com/300';

        // Build the card HTML
        attractionCard.innerHTML = `
            <h3>${attraction.name} (⭐ ${attraction.rating})</h3>
            <p>${attraction.vicinity}</p>
            <img src="${photoUrl}" alt="${attraction.name}">
            <p><strong>Estimated Travel Time:</strong> <span id="time-${attraction.place_id}">Calculating...</span></p>
        `;

        resultsContainer.appendChild(attractionCard);

        // Calculate travel time to this attraction
        calculateTravelTime(
            attraction.geometry.location.lat, 
            attraction.geometry.location.lng, 
            attraction.place_id
        );
    });

    // Show the results section
    document.getElementById("personalizedPage").style.display = "block";
}

/**
 * Calculates and displays the travel time to an attraction
 */
function calculateTravelTime(destinationLat, destinationLng, attractionId) {
    // Construct the API URL
    const travelTimeURL = https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLatitude},${userLongitude}&destinations=${destinationLat},${destinationLng}&mode=driving&key=${GOOGLE_MAPS_API_KEY};

    // Make the API request
    fetch(travelTimeURL)
        .then(response => response.json())
        .then(data => {
            const travelTimeElement = document.getElementById(time-${attractionId});
            
            if (data.rows[0].elements[0].status === "OK") {
                travelTimeElement.innerText = data.rows[0].elements[0].duration.text;
            } else {
                travelTimeElement.innerText = "Unknown time";
            }
        })
        .catch(error => console.log("Error calculating travel time:", error));
}
