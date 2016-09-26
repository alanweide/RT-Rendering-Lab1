var has_data = false;
var data;
var has_avgs = false;
var avgs = [];
var counts = [];
var specNames = [];

function set_data(lines) {
	data = lines;
	has_data = true;
}

function csv_parse_data() {

	avgs = [];
	counts = [];
	specNames = [];

	var s = -1;
	var curSpecies = "foobar";
	for (var i = 1; i < data.length - 1; i++) {
		if (!(data[i][0] == curSpecies)) {
			s++;
			curSpecies = data[i][0];
			avgs.push([]);
			counts.push(0);
			specNames.push(curSpecies);
			for (var j = 1; j < data[i].length; j++) {
				avgs[s].push(0);
			}
		}
		counts[s]++;
		for (var j = 1; j < data[i].length; j++) {
			avgs[s][j - 1] += Number(data[i][j]);
		}
	}

	for (var m = 0; m < avgs.length; m++) {
		for (var n = 0; n < avgs[m].length; n++) {
			avgs[m][n] = avgs[m][n] / counts[m];
		}
	}

	has_avgs = true;
	
	setUpButtons();
}

function csvDrawAllBars() {
	if (data == null) {
		alert("You must select a file first!");
	} else {
		createAllBarVertices(avgs);
	}
}

function csvDrawBarsForSpecies(id) {
	if (data == null) {
		alert("You must select a file first!");
	} else {
		createSpeciesBarVertices(avgs[id]);
	}
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function setUpButtons() {
	var buttons = document.getElementById("drawButtons");
	buttons.innerHTML = "";
	for (var i = 0; i < specNames.length; i++) {
		var thisButton = document.createElement("button");
		thisButton.id = "button" + i;
		thisButton.setAttribute("onClick", "csvDrawBarsForSpecies(" + i + ")");
		if (data == null) {
			thisButton.innerHTML = "Averages for Species "
					+ i;
		} else {
			thisButton.innerHTML = "Averages for "
					+ capitalizeFirstLetter(specNames[i]);
		}
		buttons.appendChild(thisButton);
	}
}
