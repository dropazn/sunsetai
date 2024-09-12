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
    } else if (cloudCover <= 30
