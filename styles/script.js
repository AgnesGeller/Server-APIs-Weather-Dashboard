const apiKey = "5d1e67af1ea18ff5a66a99caa5a8d9e0";

// Event listener for form submission
$("#search-form").submit(function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();
  
    // Get the entered city from the input field
    const cityInput = $("#search-input").val().trim();
  
    // Check if the entered city is not an empty string
    if (cityInput !== "") {
        // Run the getWeather function with the entered city
        getWeather(cityInput);
    }
});

// Function to update the displayed history list
function updateHistoryList(historyList) {
    const historyContainer = $("#history");
  
    // Clear the existing history list
    historyContainer.empty();
  
    // Add each history item to the list with a delete button
    historyList.forEach((historyItem) => {
        const historyItemContainer = $("<div>").addClass("history-item-container");
  
        // Button to trigger weather information retrieval
        const historyLink = $("<a>").attr("onclick", `getWeather('${historyItem}')`).addClass("history-list-item").text(historyItem);
    
        // Button to delete the history item
        const deleteButton = $("<a>").addClass("delete-button btn btn-danger").text("X").attr("onclick", `deleteCity('${historyItem}')`);
    
        // Append items to the container
        historyItemContainer.append(historyLink, deleteButton);
        historyContainer.append(historyItemContainer);
    });
}

// Function to delete a city from the history list
function deleteCity(city) {
    const historyList = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    const updatedHistory = historyList.filter(item => item !== city);
    localStorage.setItem("weatherHistory", JSON.stringify(updatedHistory));
  
    // Update the displayed history list
    updateHistoryList(updatedHistory);
}

// Function to get weather information for a city
function getWeather(city) {
    const apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
  
    // Function to convert temperature from Kelvin to Celsius
    function kelvinToCelsius(kelvin) {
      return (kelvin - 273.15).toFixed(2);
    }
  
    // Function to handle API errors
    function handleApiError(errorType) {
      const errorMessage = errorType === "notFound" ? "City not found. Please enter a valid city name." : "Error fetching weather data.";
      console.log(errorMessage);
    }
  
    // Function to fetch weather data and update HTML content
    $.ajax({
      url: apiURL,
      dataType: "json",
      success: function (data) {

        // Update today's section with the current weather
        const currentWeather = data.list[0];
        const currentWeatherIcon = setWeatherIcon(currentWeather.weather[0].icon);

        // Check if the city is not already in the history list
        const historyList = JSON.parse(localStorage.getItem("weatherHistory")) || [];
        if (!historyList.includes(city)) {
          // Save the entered city to local storage
          historyList.push(city);
          localStorage.setItem("weatherHistory", JSON.stringify(historyList));

          // Update the displayed history list
          updateHistoryList(historyList);
        } else {
          // Inform the user that the city is already in the history list
          console.log(`City "${city}" is already in the history list.`);
        }
        
        // Extract today's weather information
        const today = data.list[0];
        const todayDate = dayjs().format("D/M/YYYY");
  
        // Update today's section
        $(".today-title").html(`${city.charAt(0).toUpperCase() + city.slice(1)} (${todayDate}) ${currentWeatherIcon}`);
        $("#today-temp").text(`${kelvinToCelsius(today.main.temp)} °C`);
        $("#today-wind").text(`${today.wind.speed} m/s`);
        $("#today-humidity").text(`${today.main.humidity}%`);
  
        // Extract and update 5-day forecast
        const forecastContainer = $("#forecast");
  
        // Clear the forecast container before appending to it
        forecastContainer.empty();
  
        for (let i = 1; i <= 5; i++) {
          const forecast = data.list[i * 8 - 1];
          const forecastDate = formatDate(forecast.dt);

          const forecastIcon = setWeatherIcon(forecast.weather[0].icon);
  
          const forecastCard = `
              <div class="forecast-card">
                  <div class="forecast-title">${forecastDate}</div>
                  <div class="forecast-icon">${forecastIcon}</div>
                  <div class="forecast-data">
                      <ul class="weather-data-list">
                          <li>Temp: ${kelvinToCelsius(forecast.main.temp)} °C</li>
                          <li>Wind: ${forecast.wind.speed} m/s</li>
                          <li>Humidity: ${forecast.main.humidity}%</li>
                      </ul>
                  </div>
              </div>
          `;
  
          forecastContainer.append(forecastCard);

          // Scroll into view when the weather information is loaded
          const todayTitleElement = document.getElementById('today-title');
          todayTitleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

          $("#search-input").val('');

        }
      },
      error: function (jqXHR) {
        // Handle API errors
        if (jqXHR.status === 404) {
          handleApiError("notFound");
        } else {
          handleApiError("other");
        }
      }
    });
}

// Function to set weather icon based on weather condition
function setWeatherIcon(conditionCode) {
    let iconClass = "";

    switch (conditionCode) {
      case "01d":
        iconClass = "fas fa-sun"; // Clear sky, day
        break;
      case "01n":
        iconClass = "fas fa-moon"; // Clear sky, night
        break;
      case "02d":
      case "02n":
      case "03d":
      case "03n":
        iconClass = "fas fa-cloud"; // Cloudy
        break;
      case "04d":
      case "04n":
        iconClass = "fas fa-cloud-sun"; // Broken clouds
        break;
      case "09d":
      case "09n":
      case "10d":
      case "10n":
        iconClass = "fas fa-cloud-showers-heavy"; // Rain
        break;
      case "11d":
      case "11n":
        iconClass = "fas fa-bolt"; // Thunderstorm
        break;
      case "13d":
      case "13n":
        iconClass = "fas fa-snowflake"; // Snow
        break;
      case "50d":
      case "50n":
        iconClass = "fas fa-smog"; // Mist
        break;
      default:
        iconClass = "fas fa-question"; // Unknown condition
    }

    return `<i class="${iconClass}"></i>`;
}  

function formatDate(timestamp) {
    return dayjs(timestamp * 1000).format("D/M/YYYY");
}

// Initial update of the history list when the page loads
const initialHistoryList = JSON.parse(localStorage.getItem("weatherHistory")) || [];
updateHistoryList(initialHistoryList);