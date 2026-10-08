(function () {
  var USER = "gabrielteramae";
  var MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var MONTHS_LONG = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var DAYS = ["", "seg", "", "qua", "", "sex", ""];

  var totalEl = document.getElementById("contrib-total");
  var calEl = document.getElementById("contrib-cal");
  var dayEl = document.getElementById("contrib-day");
  var scrollEl = document.getElementById("contrib-scroll");
  if (!totalEl || !calEl) return;

  function formatDay(date, count) {
    var day = Number(date.slice(8, 10));
    var month = MONTHS_LONG[Number(date.slice(5, 7)) - 1] || "";
    var year = date.slice(0, 4);
    if (!count) return "Nenhuma contribuição em " + day + " de " + month + " de " + year;
    var noun = count === 1 ? "contribuição" : "contribuições";
    return count.toLocaleString("pt-BR") + " " + noun + " em " + day + " de " + month + " de " + year;
  }

  function weeksOf(days) {
    var sorted = days.slice().sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });
    if (!sorted.length) return [];
    var parts = sorted[0].date.split("-");
    var pad = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2])).getUTCDay();
    var cells = [];
    var i;
    for (i = 0; i < pad; i++) cells.push(null);
    cells = cells.concat(sorted);
    while (cells.length % 7) cells.push(null);
    var weeks = [];
    for (i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }

  function monthLabels(weeks) {
    var labels = [];
    var last = -10;
    weeks.forEach(function (week, index) {
      var marker = null;
      week.forEach(function (day) {
        if (day && Number(day.date.slice(8, 10)) === 1) marker = day;
      });
      if (!marker && index === 0) {
        week.forEach(function (day) {
          if (!marker && day) marker = day;
        });
      }
      if (!marker || index - last < 3) return;
      labels.push({ index: index, label: MONTHS[Number(marker.date.slice(5, 7)) - 1] });
      last = index;
    });
    return labels;
  }

  function paint(days) {
    var weeks = weeksOf(days);
    var labels = monthLabels(weeks);
    var labelAt = {};
    labels.forEach(function (item) {
      labelAt[item.index] = item.label;
    });

    var months = document.createElement("div");
    months.className = "contrib-months";
    weeks.forEach(function (week, index) {
      var cell = document.createElement("span");
      if (labelAt[index]) cell.textContent = labelAt[index];
      months.appendChild(cell);
    });

    var grid = document.createElement("div");
    grid.className = "contrib-grid";
    var pinned = null;
    for (var i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        pinned = days[i];
        break;
      }
    }

    function show(day) {
      dayEl.textContent = formatDay(day.date, day.count);
    }
    if (pinned) show(pinned);

    weeks.forEach(function (week) {
      week.forEach(function (day) {
        if (!day) {
          var empty = document.createElement("span");
          empty.className = "contrib-empty";
          grid.appendChild(empty);
          return;
        }
        var level = Math.max(0, Math.min(4, day.level || 0));
        var button = document.createElement("button");
        button.type = "button";
        button.className = "contrib-cell heat-" + level + (pinned && pinned.date === day.date ? " is-on" : "");
        button.setAttribute("aria-label", formatDay(day.date, day.count));
        button.addEventListener("mouseenter", function () {
          show(day);
        });
        button.addEventListener("click", function () {
          var current = grid.querySelector(".is-on");
          if (current) current.classList.remove("is-on");
          button.classList.add("is-on");
          show(day);
        });
        grid.appendChild(button);
      });
    });

    var labelsCol = document.createElement("div");
    labelsCol.className = "contrib-days";
    DAYS.forEach(function (label) {
      var span = document.createElement("span");
      span.textContent = label;
      labelsCol.appendChild(span);
    });

    calEl.textContent = "";
    var row = document.createElement("div");
    row.className = "contrib-row";
    var board = document.createElement("div");
    board.appendChild(months);
    board.appendChild(grid);
    row.appendChild(labelsCol);
    row.appendChild(board);
    calEl.appendChild(row);
    if (scrollEl) {
      var pin = function () {
        scrollEl.scrollLeft = scrollEl.scrollWidth;
      };
      pin();
      requestAnimationFrame(pin);
    }
    startSnake(grid);
  }

  var snakeTimer = 0;
  var snakeMarks = [];

  function clearSnake() {
    snakeMarks.forEach(function (cell) {
      cell.classList.remove("is-head");
      cell.style.backgroundColor = "";
    });
    snakeMarks = [];
  }

  function startSnake(grid) {
    if (snakeTimer) clearInterval(snakeTimer);
    clearSnake();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var nodes = grid.children;
    if (!nodes.length || nodes.length % 7 !== 0) return;
    var headIndex = -1;
    var length = 8;
    var dir = -1;
    var path = [];
    var windowKey = "";

    function visibleWindow() {
      var cols = nodes.length / 7;
      var start = 0;
      var end = cols - 1;
      if (!scrollEl) return { start: start, end: end };
      var view = scrollEl.getBoundingClientRect();
      var foundStart = false;
      for (var col = 0; col < cols; col++) {
        var rect = nodes[col * 7].getBoundingClientRect();
        if (!foundStart && rect.right >= view.left + 8) {
          start = col;
          foundStart = true;
        }
        if (rect.left <= view.right - 8) end = col;
      }
      if (end - start < 2) start = Math.max(0, end - 6);
      return { start: start, end: end };
    }

    function step() {
      if (document.hidden) return;
      var win = visibleWindow();
      var key = win.start + ":" + win.end;
      if (key !== windowKey) {
        windowKey = key;
        path = [];
        for (var col = win.start; col <= win.end; col++) {
          var down = col % 2 === 0;
          for (var row = 0; row < 7; row++) path.push(col * 7 + (down ? row : 6 - row));
        }
      }
      if (path.length < 2) return;
      var at = path.indexOf(headIndex);
      if (at === -1) at = path.length - 1;
      if (at + dir < 0 || at + dir >= path.length) dir *= -1;
      at += dir;
      headIndex = path[at];
      clearSnake();
      for (var i = 0; i < length; i++) {
        var index = at - i * dir;
        if (index < 0 || index >= path.length) break;
        var cell = nodes[path[index]];
        if (!cell) continue;
        snakeMarks.push(cell);
        if (i === 0) cell.classList.add("is-head");
        else {
          var fade = 1 - i / length;
          cell.style.backgroundColor = "rgba(34, 197, 94, " + (0.28 + fade * 0.72).toFixed(2) + ")";
        }
      }
    }

    step();
    snakeTimer = setInterval(step, 120);
  }

  fetch("https://github-contributions-api.jogruber.de/v4/" + USER + "?y=last", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then(function (data) {
      var days = (data.contributions || []).filter(function (day) {
        return day && typeof day.date === "string";
      });
      var total = data.total && typeof data.total.lastYear === "number"
        ? data.total.lastYear
        : days.reduce(function (sum, day) { return sum + (day.count || 0); }, 0);
      totalEl.textContent = total.toLocaleString("pt-BR") + " contribuições no último ano";
      paint(days);
    })
    .catch(function () {
      totalEl.textContent = "O calendário do GitHub não respondeu agora.";
      if (dayEl) dayEl.textContent = "";
    });
})();
