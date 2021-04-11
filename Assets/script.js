window.addEventListener('load', function () {
  // Grab the existing history from local storage IF it exists
  var existingHistory;
  if (!JSON.parse(localStorage.getItem('history'))) {
    existingHistory = [];
    $("#prevSearch").hide();
    $("#clear-button").hide();
  } else {
    existingHistory = JSON.parse(localStorage.getItem('history'));
  }

  var historyItems = [];

  function getForecast(searchValue) {
    if (!searchValue) {
      return;
    }
    var endpoint = `https://api.weatherbit.io/v2.0/forecast/daily?city=${searchValue}&key=52fd2e801a1a495aa466ea0447a2848b&days=5&units=I`;
    
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        var forecastEl = document.querySelector('#forecast');
        forecastEl.innerHTML = '<h4 class="m-3 w-100">5-Day Forecast:</h4>';

        for (var i = 0; i < data.data.length; i++) {
            let windSpd = Math.round(data.data[i].wind_spd);

            var colEl = $("<div>").addClass("col-md mx-1 my-2")
            var cardEl = $("<div>").addClass("card bg-primary text-center text-white h-100");
            var windEl = $("<p>").addClass("card-text").text(`Wind Speed: ${windSpd} MPH`);
            var humidityEl = $("<p>").addClass("card-text").text(`Humidity : ${data.data[i].rh}%`);
            var bodyEl = $("<div>").addClass("card-body p-2");
            var titleEl = $("<h5>").addClass("card-title").text(new Date(data.data[i].valid_date).toLocaleDateString());
            var imgEl = $("<img>").attr('src', `https://www.weatherbit.io/static/img/icons/${data.data[i].weather.icon}.png`).addClass("forecastIcon");
            var p1El = $("<p>").addClass("card-text").html(`<span style="text-decoration: underline;">Temperature</span> <br> Max: ${data.data[i].max_temp} °F <br>  Min: ${data.data[i].min_temp} °F`);
            var p2El = $("<p>").addClass("card-text").text(`Chance of Rain: ${data.data[i].pop}%`);

            $(colEl).append(cardEl);
            $(bodyEl).append(titleEl).append(imgEl).append(windEl).append(humidityEl).append(p1El).append(p2El);
            $(cardEl).append(bodyEl);
            $(forecastEl).append(colEl);
          }
        }
      );

  }

  const handleHistory = (term) => {
    if (existingHistory && existingHistory.length > 0) {
      var existingEntries = JSON.parse(localStorage.getItem('history'));
      var newHistory = [...existingEntries, term];
      localStorage.setItem('history', JSON.stringify(newHistory));
      // If there is no history, create one with the searchValue and save it localStorage
    } else {
      historyItems.push(term);
      localStorage.setItem('history', JSON.stringify(historyItems));
      $("#prevSearch").show();
      $("#clear-button").show();
    }
  };

  // Function for current weather:
  function searchWeather(searchValue) {
    var endpoint = `https://api.weatherbit.io/v2.0/current?city=${searchValue}&key=52fd2e801a1a495aa466ea0447a2848b&units=I`
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        // Invoke our history method
        if (!existingHistory.includes(searchValue)) {
          handleHistory(searchValue);
        }
        // Clear any old content
        todayEl = document.querySelector('#today');
        todayEl.textContent = ' ';

        console.log(data);
        let titleRow = $("<div>").addClass("h3 text-center").text(`${data.data[0].city_name} (${new Date().toLocaleDateString()})`);

        let currentImg = $("<img>").attr(
          'src',
          `https://www.weatherbit.io/static/img/icons/${data.data[0].weather.icon}.png`
        ).addClass("currentIcon");

        let row = $("<div>").addClass("row");

        let currentTemp = $("<div>").addClass("col-sm text-center").html(`Temperature: ${data.data[0].temp} °F <br> (Feels like: ${data.data[0].app_temp} °F)`);

        let Humidity = Math.round(data.data[0].rh)
        let currentHumid = $("<div>").addClass("col-sm text-center").text(`Humidity: ${Humidity}%`);

        let precip = $("<div>").addClass("col-sm text-center").html(`Precipitation Chance: ${data.data[0].precip}%`);

        let uvIndex = Math.round(data.data[0].uv);
        let currentUV = $("<div>").addClass("col-sm text-center").html(`UV Index: <span class="btn" id="uvBtn">${uvIndex}</span>`);

        $(row).append(currentTemp).append(currentHumid).append(precip).append(currentUV)
        $(todayEl).append(titleRow).append(row)
        $(todayEl).addClass("p-3 border border-info rounded")
        $(titleRow).prepend(currentImg)

        getForecast(searchValue);
        uvColor(uvIndex);
      });
  }

  function uvColor(uvIndex) {
        if (uvIndex < 3) {
          $("#uvBtn").addClass('btn-success');         
        } else if (uvIndex < 7) {
          $("#uvBtn").addClass('btn-warning');
        } else {
          $("#uvBtn").addClass('btn-danger');
        }
  }

  // Helper function to create a new row
  function makeRow(searchValue) {
    // Create a new `li` element and add classes/text to it
    var liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'list-group-item-action', 'text-center');
    liEl.id = searchValue;
    var text = searchValue;
    liEl.textContent = text;

    // Select the history element and add an event to it
    liEl.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        searchWeather(e.target.textContent);
      }
    });
    document.getElementById('history').appendChild(liEl);
  }

  // Render existing history to the page.
  if (existingHistory && existingHistory.length > 0) {
    existingHistory.forEach((item) => makeRow(item));
  }

  // Helper function to get a search value.
  function getSearchVal() {
    var searchValue = document.querySelector('#search-value').value;
    if (searchValue) {
      searchWeather(searchValue);
      makeRow(searchValue);
      document.querySelector('#search-value').value = '';
    }
  }

  // Attach our getSearchVal function to the search button for click or enter
  document.querySelector('#search-button').addEventListener('click', getSearchVal);
  document.querySelector('#search-value').addEventListener('keyup', function(event) {
      if (event.key == "Enter") {
        getSearchVal();
      }
    } );
});

$("#clear-button").on("click", function(){
  localStorage.clear();
  location.reload();
})