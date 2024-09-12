const apiKey = '49ab51a72b12ec9a691f33aad66addcf'; // Your OpenWeatherMap API key
const lat = 'YOUR_LATITUDE'; // Replace with your latitude
const lon = 'YOUR_LONGITUDE'; // Replace with your longitude
const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;

async function fetchSunsetData() {
    try {
        const response = await fetch(oneCallUrl);
        const data = await response.json();

        const locationName = 'Your Location'; // Optionally replace with actual location name
        const sunsetTime = new Date(data.current.sunset * 1000).toLocaleTimeString();
        const cloudsLow = data.current.clouds_low;
        const cloudsMid = data.current.clouds_mid;
        const cloudsHigh = data.current.clouds_high;
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
    document.body.className = `bg-${rating}`;
}

fetchSunsetData();
