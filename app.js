const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your OpenWeatherMap API key

// Function to fetch weather data from OpenWeatherMap API using latitude and longitude
async function fetchWeatherDataByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const cloudCover = data.clouds.all;
    const sunsetUnix = data.sys.sunset;
    
    return { cloudCover, sunsetUnix };
}

// Function to fetch weather data from OpenWeatherMap API using city name
async function fetchWeatherDataByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const cloudCover = data.clouds.all;
    const sunsetUnix = data.sys.sunset;
    
    return { cloudCover, sunsetUnix, cityName: data.name };
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

// Function to update the UI with sunset prediction
function updateUI(sunsetTime, description, rating, isCity = false) {
    if (isCity) {
        document.getElementById('city-sunset-time').innerText = `Sunset Time: ${sunsetTime}`;
        document.getElementById('city-sunset-description').innerText = `Description: ${description}`;
        document.getElementById('city-sunset-rating').innerText = `Rating: ${rating}/10`;
        document.querySelector('.city-sunset-info').style.display = 'block';
    } else {
        document.getElementById('sunset-time').innerText = `Sunset Time: ${sunsetTime}`;
        document.getElementById('sunset-description').innerText = `Description: ${description}`;
        document.getElementById('sunset-rating').innerText = `Rating: ${rating}/10`;
    }
}

// Function to handle local sunset prediction
function getSunsetPrediction() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const { cloudCover, sunsetUnix } = await fetchWeatherDataByLocation(lat, lon);
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

                updateUI(sunsetTime, description, rating);
            } catch (error) {
                console.error('Error fetching sunset data:', error);
                document.getElementById('location-status').innerText = 'Unable to fetch sunset data.';
            }
        }, () => {
            document.getElementById('location-status').innerText = 'Location access denied.';
        });
    } else {
        document.getElementById('location-status').innerText = 'Geolocation is not supported by this browser.';
    }
}

// Function to handle city sunset prediction based on user input
async function getCitySunsetPrediction() {
    const city = document.getElementById('city-name').value;
    if (city) {
        try {
            const { cloudCover, sunsetUnix, cityName } = await fetchWeatherDataByCity(city);
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

            document.getElementById('city-status').innerText = `Sunset prediction for ${cityName}:`;
            updateUI(sunsetTime, description, rating, true);
        } catch (error) {
            console.error('Error fetching city sunset data:', error);
            document.getElementById('city-status').innerText = 'Unable to fetch sunset data for the city.';
        }
    }
}

// Run the main function on page load for local sunset
getSunsetPrediction();
