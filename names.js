// names.js
// CSCV 337 Assignment 5 - Baby Names
// This script dynamically loads baby name data from a REST API,
// populates a dropdown list, and generates a ranking bar graph with meaning.
// Author: Rick Schroeder

"use strict";

window.onload = function () {
  const apiBase = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";
  const select = $("babyselect");
  const graph = $("graph");
  const meaning = $("meaning");
  const errorBox = $("errors");

  // Fetch and populate baby name options
  fetch(apiBase)
    .then(response => response.json())
    .then(data => {
      const names = [...new Set(data.map(entry => entry.name))].sort();
      populateSelect(names);
    })
    .catch(err => {
      showError("Failed to load names: " + err.message);
    });

  // When a name is selected, fetch and display its data
  select.onchange = function () {
    const selectedName = select.value;
    clearError();
    clearGraph();
    meaning.textContent = "";

    if (!selectedName) return;

    fetch(`${apiBase}/name/${encodeURIComponent(selectedName)}`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) return;

        // Sort records by year
        data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        buildGraph(data);

        // Show meaning if available
        const entryWithMeaning = data.find(entry => entry.meaning && entry.meaning.trim());
        meaning.textContent = entryWithMeaning ? entryWithMeaning.meaning : "";
      })
      .catch(err => {
        showError("Failed to load data for " + selectedName + ": " + err.message);
      });
  };

  // Populates the dropdown menu with sorted baby names
  function populateSelect(names) {
    names.forEach(name => {
      let opt = document.createElement("option");
      opt.text = name;
      opt.value = name;
      select.appendChild(opt);
    });
    select.disabled = false;
  }

  // Builds the ranking bar graph and year labels
  function buildGraph(data) {
    data.forEach((entry, index) => {
      const rank = parseInt(entry.rank || entry.Rank || 1000);
      const year = entry.year;
      const x = 10 + index * 60;
      const height = Math.floor((1000 - rank) / 4);

      // Create bar element
      let bar = document.createElement("div");
      bar.className = "ranking";
      bar.style.left = x + "px";
      bar.style.height = height + "px";
      bar.style.bottom = "0px";
      bar.textContent = rank;
      if (rank <= 10) bar.classList.add("popular");
      graph.appendChild(bar);

      // Create year label element
      let yearLabel = document.createElement("p");
      yearLabel.className = "year";
      yearLabel.style.left = x + "px";
      yearLabel.textContent = year;
      graph.appendChild(yearLabel);
    });
  }

  // Clears the graph area
  function clearGraph() {
    while (graph.firstChild) {
      graph.removeChild(graph.firstChild);
    }
  }

  // Displays an error message in the error box
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.color = "red";
  }

  // Clears the error box
  function clearError() {
    errorBox.textContent = "";
  }
};
