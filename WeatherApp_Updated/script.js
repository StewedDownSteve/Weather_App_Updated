let weather = {
  apiKey: "8177d83311ffe9177db90622a480a907",
  lastSearchedCity: "", // Variable to store the last searched city

  fetchWeatherByLocation: function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          fetch(
            "https://api.openweathermap.org/data/2.5/weather?lat=" +
              latitude +
              "&lon=" +
              longitude +
              "&units=imperial&appid=" +
              this.apiKey
          )
            .then((response) => {
              if (!response.ok) {
                alert("No weather found for your location.");
                throw new Error("No weather found.");
              }
              return response.json();
            })
            .then((data) => this.displayWeather(data))
            .catch((error) =>
              console.error("Error fetching weather by location:", error)
            )
            .finally(() => {
              // Hide loading spinner regardless of success or error
              document.querySelector(".spinner").style.display = "none";
            });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Handle geolocation error here
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      // Handle lack of geolocation support
    }
  },

  fetchWeather: function (city) {
    this.lastSearchedCity = city; // Update last searched city
    // Fetch current weather data
    fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=imperial&appid=" +
        this.apiKey
    )
        .then((response) => {
            if (!response.ok) {
                alert("No weather found.");
                throw new Error("No weather found.");
            }
            return response.json();
        })
        .then((data) => {
            this.displayWeather(data);
            // Fetch forecast data
            fetch(
                "https://api.openweathermap.org/data/2.5/forecast?q=" +
                city +
                "&units=imperial&appid=" +
                this.apiKey
            )
                .then((forecastResponse) => {
                    if (!forecastResponse.ok) {
                        alert("No forecast found.");
                        throw new Error("No forecast found.");
                    }
                    return forecastResponse.json();
                })
                .then((forecastData) => this.displayForecast(forecastData))
                .catch((error) => console.error("Error fetching forecast:", error));
        })
        .catch((error) => console.error("Error fetching current weather:", error));
},

  displayWeather: function (data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;
    document.querySelector(".city").innerText = "Weather in " + name;
    document.querySelector(".icon").src =
      "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = temp + "°F";
    document.querySelector(".humidity").innerText =
      "Humidity: " + humidity + "%";
    document.querySelector(".wind").innerText =
      "Wind speed: " + speed + " km/h";
    document.querySelector(".weather").classList.remove("loading");
    document.body.style.backgroundImage =
      "url('https://source.unsplash.com/1600x900/?" + name + "')";
  },

  saveToLocalStorage: function () {
    localStorage.setItem("lastSearchedCity", this.lastSearchedCity);
  },

  loadFromLocalStorage: function () {
    const lastSearchedCity = localStorage.getItem("lastSearchedCity");
    if (lastSearchedCity) {
      this.fetchWeather(lastSearchedCity);
    }
  },

  search: function () {
    this.fetchWeather(document.querySelector(".search-bar").value);
    this.saveToLocalStorage(); // Save to local storage after searching
  },
  displayForecast: function (data) {
    const forecastContainer = document.querySelector(".forecast");
    forecastContainer.innerHTML = ""; // Clear previous forecast data
  
    const uniqueDays = new Set();
    let daysProcessed = 0;
  
    // Loop through forecast data and create forecast cards
    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  
      // Skip the entry if the day has already been added
      if (uniqueDays.has(dayOfWeek)) {
        continue;
      }
  
      uniqueDays.add(dayOfWeek);
      daysProcessed++;
  
      const icon = item.weather[0].icon;
      const temp = item.main.temp.toFixed(1);
  
      // Create forecast card
      const card = document.createElement("div");
      card.classList.add("forecast-card");
  
      const day = document.createElement("div");
      day.innerText = dayOfWeek;
      card.appendChild(day);
  
      const weatherIcon = document.createElement("img");
      weatherIcon.src = "https://openweathermap.org/img/wn/" + icon + ".png";
      card.appendChild(weatherIcon);
  
      const temperature = document.createElement("div");
      temperature.innerText = temp + "°F";
      card.appendChild(temperature);
  
      // Append forecast card to the container
      forecastContainer.appendChild(card);
  
      // Break out of the loop after processing five unique days
      if (daysProcessed === 5) {
        break;
      }
    }
  
    // Make the forecast section visible
    forecastContainer.classList.remove("hidden");
  },
  
  
};




// Load last searched city from local storage on page load
weather.loadFromLocalStorage();

// Add event listener for the geolocation button
document
  .querySelector(".geolocation-btn")
  .addEventListener("click", function () {
    weather.fetchWeatherByLocation();
  });

document.querySelector(".search button").addEventListener("click", function () {
  weather.search();
});

document
  .querySelector(".search-bar")
  .addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
      weather.search();
    }
  });
