$(document).ready(function () {
  // Grab the existing history from local storage IF it exists
  var searchHistory = [];
  if (JSON.parse(localStorage.getItem('history'))) {
    searchHistory = JSON.parse(localStorage.getItem('history'));
  } else {
    $("#prevSearch").hide();
    $("#clear-button").hide();
  }

  function getForecast(searchValue) {
    if (!searchValue) {
      return;
    }
    var endpoint = `https://api.weatherbit.io/v2.0/forecast/daily?city=${searchValue}&key=52fd2e801a1a495aa466ea0447a2848b&days=6&units=I`;
    
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        var forecast = document.querySelector('#forecast');
        forecast.innerHTML = '<h4 class="m-3 w-100">5-Day Forecast:</h4>';

        for (var i = 1; i < data.data.length; i++) {
            let windSpd = Math.round(data.data[i].wind_spd);

            var col = $("<div>").addClass("col-md mx-1 my-2")
            var card = $("<div>").addClass("card bg-primary text-center text-white h-100");
            var wind = $("<p>").addClass("card-text").text(`Wind Speed: ${windSpd} MPH`);
            var humidity = $("<p>").addClass("card-text").text(`Humidity : ${data.data[i].rh}%`);
            var body = $("<div>").addClass("card-body p-2");
            var title = $("<h5>").addClass("card-title").text(new Date(data.data[i].valid_date).toLocaleDateString());
            var img = $("<img>").attr('src', `https://www.weatherbit.io/static/img/icons/${data.data[i].weather.icon}.png`).addClass("forecastIcon");
            var p1 = $("<p>").addClass("card-text").html(`<span style="text-decoration: underline;">Temperature</span> <br> Max: ${data.data[i].max_temp}°F <br>  Min: ${data.data[i].min_temp}°F`);
            var p2 = $("<p>").addClass("card-text").text(`Chance of Rain: ${data.data[i].pop}%`);

            $(col).append(card);
            $(body).append(title).append(img).append(wind).append(humidity).append(p1).append(p2);
            $(card).append(body);
            $(forecast).append(col);
          }
        }
      );

  }

  function handleHistory (term){

    if (JSON.parse(localStorage.getItem('history'))) {
      var existingEntries = JSON.parse(localStorage.getItem('history'));
      existingEntries.push(term);
      localStorage.setItem('history', JSON.stringify(existingEntries));
    } else {
      searchHistory.push(term);
      localStorage.setItem('history', JSON.stringify(searchHistory));
    }
    $("#prevSearch").show();
    $("#clear-button").show();
  };

  // Function for current weather:
  function searchWeather(searchValue) {
    var endpoint = `https://api.weatherbit.io/v2.0/current?city=${searchValue}&key=52fd2e801a1a495aa466ea0447a2848b&units=I`
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        // Invoke our history method
        if (!searchHistory.includes(searchValue)) {
          handleHistory(searchValue);
        }
        todayEl = $('#today');
        todayEl.empty();

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

  function makeRow(searchValue) {
    var li = $('<li></li>').addClass('list-group-item list-group-item-action text-center');
    li.attr('id', searchValue);
    var searched = searchValue;
    li.text(searched);

    li.on('click', function (e) {
      if (e.target.tagName === 'LI') {
        searchWeather(e.target.textContent);
      }
    });
    $("#history").append(li);
  }

  if (searchHistory.length > 0) {
    for (let i = 0; i < searchHistory.length; i++) {
      makeRow(searchHistory[i]);      
    }
  }

  function getSearchVal() {
    var searchValue = $('#search-value').val();
    if (searchValue) {
      searchWeather(searchValue);
      makeRow(searchValue);
      $('#search-value').empty();
    }
  }

  document.querySelector('#search-button').addEventListener('click', getSearchVal);
  $('#search-value').on('keyup', function(event) {
      if (event.key == "Enter") {
        getSearchVal();
      }
    } );
});

$("#clear-button").on("click", function(){
  localStorage.clear();
  location.reload();
})