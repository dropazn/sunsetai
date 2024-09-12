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
        const cloudCover = data.clouds.all;
        const weatherMain = data.weather[0].main; // To check for rain or fog
        const sunsetUnix = data.sys.sunset;
        const locationName = `${data.name}, ${data.sys.country}`; // Get location name and country
        
        return { cloudCover, weatherMain, sunsetUnix, locationName };
    } catch (error) {
        console.error('Error fetching local weather data:', error);
        throw error;
    }
}

// Function to calculate sunset rating based on cloud cover and weather conditions
function calculateSunsetRating(cloudCover, weatherMain) {
    let rating = 6; // Default rating for an average grey sunset

    if (weatherMain === "Rain") {
        rating = 1; // Raining conditions, very poor sunset
    } else if (weatherMain === "Fog" || weatherMain === "Mist") {
        rating = 3; // Foggy or misty conditions, low-quality sunset
    } else if (cloudCover >= 50 && cloudCover <= 80) {
        rating = 8; // Beautiful sunset with a good mix of clouds
    } else if (cloudCover > 80) {
        rating = 6; // Grey skies, average sunset
    } else if (cloudCover <= 30) {
        rating = 10; // Stunning sunset, clear sky
    }

    return rating;
}

// Function to change the background based on sunset rating
function changeBackground(rating) {
    const body = document.body;
    
    if (rating === 10) {
        body.style.background = 'linear-gradient(to top, #ff416c, #ff4b2b, #ff7e5f)'; // Vibrant for 10/10
    } else if (rating === 8) {
        body.style.background = 'linear-gradient(to top, #ff7e5f, #feb47b, #ff9966)'; // Beautiful sunset for 8/10
    } else if (rating === 6) {
        body.style.background = 'linear-gradient(to top, #ddd, #bbb, #999)'; // Grey skies for 6/10
    } else if (rating === 3) {
        body.style.background = 'linear-gradient(to top, #999, #666, #444)'; // Foggy or misty for 3/10
    } else if (rating === 1) {
        body.style.background = 'linear-gradient(to top, #555, #333, #111)'; // Raining, very poor sunset for 1/10
    }
}

// Function to update the UI with sunset prediction and location
function updateUI(sunsetTime, description, rating, locationName) {
    document.getElementById('sunset-time').innerText = `Sunset Time: ${sunsetTime}`;
    document.getElementById('sunset-description').innerText = `Description: ${description}`;
    document.getElementById('sunset-rating').innerText = `Rating: ${rating}/10`;
    document.getElementById('location-name').innerText = `Location: ${locationName}`;
    changeBackground(rating);
}

// Function to handle local sunset prediction
function getSunsetPrediction() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                // Initial message: "Fetching location..." changes to "Fetching sunset data for [location]"
                document.getElementById('location-status').innerText = 'Fetching local sunset data...';

                const { cloudCover, weatherMain, sunsetUnix, locationName } = await fetchWeatherDataByLocation(lat, lon);
                document.getElementById('location-status').innerText = `Fetching sunset data for ${locationName}...`;

                const sunsetDate = new Date(sunsetUnix * 1000); // Convert from UNIX timestamp
                const sunsetTime = sunsetDate.toLocaleTimeString();

                const rating = calculateSunsetRating(cloudCover, weatherMain);

                let description = 'Average sunset with normal colors.';
                if (rating === 10) {
                    description = 'Stunning and colorful sunset expected!';
                } else if (rating === 8) {
                    description = 'Beautiful sunset expected!';
                } else if (rating === 6) {
                    description = 'Average sunset with grey skies.';
                } else if (rating === 3) {
                    description = 'Foggy skies with poor sunset quality.';
                } else if (rating === 1) {
                    description = 'Raining, no sunset view.';
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
