const apiKey = '49ab51a72b12ec9a691f33aad66addcf'; // Your OpenWeatherMap API key

async function fetchSunsetData(lat, lon) {
    const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;

    try {
        const response = await fetch(oneCallUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data); // Log the API response

        const locationName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`; // Optionally replace with actual location name
        const sunsetTime = new Date(data.current.sunset * 1000).toLocaleTimeString();
        const cloudsLow = data.current.clouds_low || 0;
        const cloudsMid = data.current.clouds_mid || 0;
        const cloudsHigh = data.current.clouds_high || 0;
        const weatherMain = data.current.weather[0].main;

        document.getElementById('location-name').textContent = `Location: ${locationName}`;
        document.getElementById('location-status').textContent = `Fetching sunset data for ${locationName}`;
        document.getElementById('sunset-time').textContent = `Sunset Time: ${sunsetTime}`;
        
        const rating = calculateSunsetRating(cloudsLow, cloudsMid, cloudsHigh, weatherMain);
        const description = getDescription(rating);
        
        document.getElementById('sunset-description').textContent = `Description: ${description}`;
        document.getElementById('sunset-rating').textContent = `Rating: ${rating}/10`;
        document.getElementById('cloud-coverage').textContent = `Low Clouds: ${cloudsLow}% | Medium Clouds: ${cloudsMid}% | High Clouds: ${cloudsHigh}%`;

        updateBackground(rating);
    } catch (error) {
        console.error('Error fetching sunset data:', error);
        document.getElementById('sunset-description').textContent = 'Error fetching data.';
        document.getElementById('sunset-rating').textContent = 'Rating: N/A';
        document.getElementById('cloud-coverage').textContent = 'Cloud Coverage: N/A';
    }
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await fetchSunsetData(lat, lon);
        }, (error) => {
            console.error('Error getting user location:', error);
            document.getElementById('location-status').textContent = 'Unable to retrieve your location.';
        });
    } else {
        document.getElementById('location-status').textContent = 'Geolocation is not supported by this browser.';
    }
}

function calculateSunsetRating(cloudsLow, cloudsMid, cloudsHigh, weatherMain) {
    let rating = 6; // Default rating for an average sunset

    if (weatherMain === "Rain") {
        rating = 1; // Very poor sunset due to rain
    } else if (weatherMain === "Fog" || weatherMain === "Mist") {
        rating = 3; // Poor sunset due to fog
    } else {
        if (cloudsLow < 20 && cloudsHigh > 50) {
            rating = 10; // Stunning sunset, high clouds and minimal low clouds
        } else if (cloudsLow < 50 && cloudsMid > 40) {
            rating = 8; // Beautiful sunset with a good mix of clouds
        } else if (cloudsLow > 60) {
            rating = 6; // Grey skies, average sunset
        } else if (cloudsLow > 80) {
            rating = 3; // Overcast sky, poor sunset
        }
    }

    return rating;
}

function getDescription(rating) {
    switch (rating) {
        case 10: return 'Stunning sunset with clear skies and vibrant colors.';
        case 8: return 'Beautiful sunset with a good mix of clouds and colors.';
        case 6: return 'Average sunset with grey skies.';
        case 3: return 'Foggy or overcast with limited visibility.';
        case 1: return 'Raining with poor visibility for sunset.';
        default: return 'No data available.';
    }
}

function updateBackground(rating) {
    const body = document.body;
    body.className = ''; // Remove any existing class

    switch (rating) {
        case 10:
            body.style.background = 'linear-gradient(to top, #ff5f6d, #ffc371)'; // Beautiful sunset colors
            break;
        case 8:
            body.style.background = 'linear-gradient(to top, #ff9966, #ff5e62)'; // Beautiful sunset with less intensity
            break;
        case 6:
            body.style.background = 'linear-gradient(to top, #7f8c8d, #bdc3c7)'; // Average grey skies
            break;
        case 3:
            body.style.background = 'linear-gradient(to top, #bdc3c7, #2c3e50)'; // Foggy or overcast skies
            break;
        case 1:
            body.style.background = 'linear-gradient(to top, #000000, #434343)'; // Rainy and dark
            break;
        default:
            body.style.background = 'linear-gradient(to top, #ffffff, #cccccc)'; // Default background
            break;
    }
}

getUserLocation();
