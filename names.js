// names.js
// CSCV 337 Assignment 5 - Baby Names using SheetBest API
//Trigger GitHub Pages Deployment
"use strict";

window.onload = function () {
  const select = $("babyselect");
  const graph = $("graph");
  const meaning = $("meaning");
  const errorBox = $("errors");
  const apiBase = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";

  fetch(apiBase)
    .then(response => response.json())
    .then(data => {
      let names = [...new Set(data.map(entry => entry.name))].sort();
      names.forEach(name => {
        let opt = document.createElement("option");
        opt.text = name;
        opt.value = name;
        select.appendChild(opt);
      });
      select.disabled = false;
    })
    .catch(err => {
      showError("Failed to load names: " + err.message);
    });

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

        // Sort by year in ascending order
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

  function buildGraph(data) {
    const graph = $("graph");
    data.forEach((entry, index) => {
      const rank = parseInt(entry.rank || entry.Rank || 1000); // fallback in case of bad data
      const year = entry.year;
      const x = 10 + index * 60;
      const height = Math.floor((1000 - rank) / 4);

      // Bar
      let bar = document.createElement("div");
      bar.className = "ranking";
      bar.style.left = x + "px";
      bar.style.height = height + "px";
      bar.style.bottom = "0px";
      bar.textContent = rank;
      if (rank <= 10) bar.classList.add("popular");
      graph.appendChild(bar);

      // Year Label
      let yearLabel = document.createElement("p");
      yearLabel.className = "year";
      yearLabel.style.left = x + "px";
      yearLabel.textContent = year;
      graph.appendChild(yearLabel);
    });
  }

  function clearGraph() {
    while (graph.firstChild) {
      graph.removeChild(graph.firstChild);
    }
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.color = "red";
  }

  function clearError() {
    errorBox.textContent = "";
  }
};
