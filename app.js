const apiKey = '49ab51a72b12ec9a691f33aad66addcf'; // Your OpenWeatherMap API key

// Function to fetch weather data from OpenWeatherMap API using latitude and longitude
async function fetchWeatherDataByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Error with API response:', response.status);
            throw new Error('API response error');
        }
        const data = await response.json();
        console.log('Local Weather Data:', data); // Log to see if API returns data
        const cloudCover = data.clouds.all;
        const sunsetUnix = data.sys.sunset;
        const locationName = `${data.name}, ${data.sys.country}`; // Get location name and country
        
        return { cloudCover, sunsetUnix, locationName };
    } catch (error) {
        console.error('Error fetching local weather data:', error);
        throw error;
    }
}

// Function to calculate sunset rating based on cloud cover
function calculateSunsetRating(cloudCover) {
    let rating = 5; // Default rating for an average sunset

    if (cloudCover >= 50 && cloudCover <= 80) {
        rating = 10; // Ideal conditions
    } else if (cloudCover >= 30 && cloudCover <= 90) {
        rating = 8; // Good conditions
    } else if (cloudCover < 30 || cloudCover > 90) {
        rating = 3; // Poor conditions
    } else if (cloudCover === 0) {
        rating = 6; // Clear skies, average sunset
    }

    return rating;
}

// Function to update the UI with sunset prediction and location
function updateUI(sunsetTime, description, rating, locationName) {
    document.getElementById('sunset-time').innerText = `Sunset Time: ${sunsetTime}`;
    document.getElementById('sunset-description').innerText = `Description: ${description}`;
    document.getElementById('sunset-rating').innerText = `Rating: ${rating}/10`;
    document.getElementById('location-name').innerText = `Location: ${locationName}`;
}

// Function to handle local sunset prediction
function getSunsetPrediction() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const { cloudCover, sunsetUnix, locationName } = await fetchWeatherDataByLocation(lat, lon);
                const sunsetDate = new Date(sunsetUnix * 1000); // Convert from UNIX timestamp
                const sunsetTime = sunsetDate.toLocaleTimeString();

                const rating = calculateSunsetRating(cloudCover);

                let description = 'Average sunset with normal colors.';
                if (rating === 10) {
                    description = 'Beautiful and colorful sunset expected!';
                } else if (rating === 8) {
                    description = 'Good chance for a colorful sunset!';
                } else if (rating <= 5) {
                    description = 'Grey skies with low sunset quality.';
                }

                updateUI(sunsetTime, description, rating, locationName);
            } catch (error) {
                console.error('Error in getSunsetPrediction:', error);
                document.getElementById('location-status').innerText = 'Unable to fetch sunset data.';
            }
        }, () => {
            document.getElementById('location-status').innerText = 'Location access denied.';
        });
    } else {
        document.getElementById('location-status').innerText = 'Geolocation is not supported by this browser.';
    }
}

// Run the main function on page load for local sunset
getSunsetPrediction();
