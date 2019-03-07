var req;
var objJSON;
var mongodb_id;

var indexedDB_req = indexedDB.open("pogodaDB");
var db;

indexedDB_req.onupgradeneeded = function () {
	db = indexedDB_req.result;
	var store = db.createObjectStore("pogoda", { keyPath: "id", autoIncrement: true });
	store.createIndex("miejsce", "miejsce");
	store.createIndex("data", "data");
	store.createIndex("temp", "temp");
	store.createIndex("opad", "opad");

};

indexedDB_req.onsuccess = function () {
	db = indexedDB_req.result;
};

cookies();

function getRequestObject() {
	if (window.ActiveXObject) {
		return (new ActiveXObject("Microsoft.XMLHTTP"));
	}
	else if (window.XMLHttpRequest) {
		return (new XMLHttpRequest());
	}
	else {
		return (null);
	}
}

//cookies
function cookies() {
	var arr = {};
	var session_id = get_cookies();
	arr.sessionID = session_id;
	to_send = JSON.stringify(arr);
	req = getRequestObject();
	req.onreadystatechange = function () {
		if (req.readyState == 4 && (req.status == 200 || req.status == 400)) {
			objJSON = JSON.parse(req.response);
			if (objJSON['status'] == 'ok') {
				document.getElementById('log_id').style.display = "none";
				document.getElementById('sign_id').style.display = "none";
				document.getElementById('data_id_offline').style.display = "none";
				document.getElementById('log_out_id').style.display = "inline";
			}
			else {
				logout();
				log_form();
			}
		}
	}
	req.open("POST", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/session", true);
	req.send(to_send);
}

function set_cookies(value) {
	document.cookie = "sessionID=" + value + "; path=/";
}

function get_cookies() {
	var tmp;
	var cookies;
	cookies = document.cookie.split(';');
	for (var i = 0; i < cookies.length; i++) {
		tmp = cookies[i];
		while (tmp.charAt(0) == ' ') {
			tmp = tmp.substring(1, tmp.length);
		}
		if (tmp.indexOf("sessionID=") == 0) {
			return tmp.substring("sessionID=".length, tmp.length);
		}
	}
	return '';
}

function log_form() {
	document.getElementById('list_id').style.display = "none";
	document.getElementById('data_id').style.display = "none";
	document.getElementById('analyse_id').style.display = "none";
	document.getElementById('sync_id').style.display = "none";
	document.getElementById('log_out_id').style.display = "none";
	document.getElementById('data_id_offline').style.display = "inline";
	document.getElementById('log_id').style.display = "inline";
	document.getElementById('sign_id').style.display = "inline";
	var form = "<form method='post' class = 'input'>";
	form += "<input type = 'text' name = 'nazwa' placeholder = 'login' required ><br>";
	form += "<input type = 'password' name = 'haslo' placeholder = 'hasło' required><br>";
	form += "<input type='button' value='Zaloguj' onclick='log_user(this.form)'>";
	form += "</form>"
	document.getElementById('data').innerHTML = form;
}

function reg_form() {
	var form = "<form method='post' class = 'input'>";
	form += "<input type = 'text' name = 'nazwa' placeholder = 'login' required ><br>";
	form += "<input type = 'password' name = 'haslo' placeholder = 'hasło' required><br>";
	form += "<input type='button' value='Zarejestruj' onclick='add_user(this.form)'>";
	form += "</form>"
	document.getElementById('data').innerHTML = form;
}

function validate_reg(form) {
	if (form.nazwa.value == "" || form.haslo.value == "") {
		alert("Wprowadź dane");
		return false;
	}
	if (form.nazwa.value.length < 4) {
		alert("Login musi mieć więcej niż 4 znaki");
		return false;
	}
	if (form.haslo.value.length < 4) {
		alert("Hasło musi mieć więcej niż 4 znaki");
		return false;
	}
	return true;
}

function add_user(form) {
	if (validate_reg(form)) {
		var user = {};
		user.username = form.nazwa.value;
		user.password = form.haslo.value;
		txt = JSON.stringify(user);
		req = getRequestObject();
		req.onreadystatechange = function () {
			if (req.readyState == 4 && req.status == 200) {
				objJSON = JSON.parse(req.response);
				if (objJSON['status'] == 'ok') {
					alert("Zarejestrowano");
					log_form();
				}
				else {
					alert("Wprwadzony login już istnieje.");
				}
			}
		}
		req.open("POST", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/register", true);
		req.send(txt);
	}
}

function log_user(form) {
	if (form.nazwa.value == "" || form.haslo.value == "") {
		alert("Wprowadź dane.");
		return;
	}
	var user = {};
	user.username = form.nazwa.value;
	user.password = form.haslo.value;
	txt = JSON.stringify(user);
	req = getRequestObject();
	req.onreadystatechange = function () {
		if (req.readyState == 4 && req.status == 200) {
			objJSON = JSON.parse(req.response);
			if (objJSON['status'] == 'ok') {
				document.getElementById('data_id_offline').style.display = "none";
				document.getElementById('log_id').style.display = "none";
				document.getElementById('sign_id').style.display = "none";
				document.getElementById('list_id').style.display = "inline";
				document.getElementById('data_id').style.display = "inline";
				document.getElementById('analyse_id').style.display = "inline";
				document.getElementById('sync_id').style.display = "inline";
				document.getElementById('log_out_id').style.display = "inline";
				set_cookies(objJSON['sessionID']);
				list_data();
				alert("zalogowano");
			}
			else
				alert("Podano złe dane.");
		}
	}
	req.open("POST", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/login", true);
	req.send(txt);
}

function logout() {
	var session_id = get_cookies();
	var cookies = {};
	cookies.sessionID = session_id;
	txt = JSON.stringify(cookies);
	req = getRequestObject();
	req.onreadystatechange = function () {
		if (req.readyState == 4 && req.status == 200) {
			objJSON = JSON.parse(req.response);
			if (objJSON['status'] == 'ok') {
				document.getElementById('list_id').style.display = "none";
				document.getElementById('data_id').style.display = "none";
				document.getElementById('analyse_id').style.display = "none";
				document.getElementById('sync_id').style.display = "none";
				document.getElementById('log_out_id').style.display = "none";
				document.getElementById('data_id_offline').style.display = "inline";
				document.getElementById('log_id').style.display = "inline";
				document.getElementById('sign_id').style.display = "inline";
				log_form();
				set_cookies('');
				alert("wylogowano");
			}
		}
	}
	req.open("POST", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/logout", true);
	req.send(txt);
}

function new_data() {
	var form = "<div class='input'><h3 style='text-align: center;'>Dodaj dane</h3>";
	form += "<form name='add' ><table>";
	form += "<tr><td>Miejsce:</td><td><select  name='miejsce'>";
	form += "<option value='Krakow'>Kraków</option>";
	form += "<option value='Warszawa'>Warszawa</option>";
	form += "<option value='Wroclaw'>Wrocław</option>";
	form += "</select></td></tr>";
	form += "<tr><td>Data:</td><td><input class='form_input' type='date' name='data'></input></td></tr>";
	form += "<tr><td>Temperatura :</td><td><input class='form_input' type='text' name='temp' placeholder = '[*C]'></input></td></tr>";
	form += "<tr><td>Opad:</td><td><input class='form_input' type='text' name='opad' placeholder = '[mm]'></input></td></tr>";
	form += "<tr><td></td><td><input class='butt' type='button' value='Wyślij' onclick='insert(this.form)'></td></tr>";
	form += "</table></form></div>";
	document.getElementById('data').innerHTML = form;
}

function validate_data(form) {
	if (form.miejsce.value == "" || form.data.value == "" || form.temp.value == "" || form.opad.value == "") {
		alert("Uzupełnij wszystkie pola");
		return false;
	}
	var inserted_date = new Date(form.data.value);
	var current_time = new Date(Date.now());
	if (inserted_date > current_time) {
		alert("Podaj rzeczywistą datę pomiaru.");
		return false;
	}
	if (isNaN(form.temp.value) || form.temp.value < -90 || form.temp.value > 71) {
		alert("Podaj poprawną odległość.");
		return false;
	}
	if (isNaN(form.opad.value) || form.opad.value < 0) {
		alert("Błędna wartość opadu.");
		return false;
	}
	return true;
}

function insert(form) {
	if (validate_data(form)) {
		var data = {};
		data.miejsce = form.miejsce.value;
		data.data = form.data.value;
		data.temp = form.temp.value;
		data.opad = form.opad.value;

		to_send = JSON.stringify(data);
		var db_tr = db.transaction("pogoda", "readwrite");
		var obj = db_tr.objectStore("pogoda");

		var key;
		var op = obj.put(data);
		op.onsuccess = function (event) {
			key = event.target.result;
		};

		req = getRequestObject();
		req.onreadystatechange = function () {
			if (req.readyState == 4 && req.status == 200) {
				objJSON = JSON.parse(req.response);
				if (objJSON['status'] == 'ok') {
					alert("Pomyślnie dodano dane.");
					db_tr = db.transaction("pogoda", "readwrite");
					obj = db_tr.objectStore("pogoda");
					obj.delete(key);
				}
				else {
					alert("Błąd bazy danych. Nie dodano danych.");
				}
			}
			else if (req.readyState == 4 && req.status == 400) {
				alert("Wprowadzone dane sa niepoprawne");
			}
			else if (req.readyState == 4 && req.status == 500) {
				alert("Błąd połączenia. Dodano do do lokalnej bazy danych");
			}
		}
		req.open("POST", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/save", true);
		req.send(to_send);
	}
}

function list_data() {
	var data_to_print = "<div class = \"output\"><table>";
	data_to_print += "<th>Miejsce</th><th>Data</th><th>Temperatura</th><th>Opad</th>";

	req = getRequestObject();
	req.onreadystatechange = function () {
		if (req.readyState == 4 && req.status == 200) {
			objJSON = JSON.parse(req.response);
			for (var id in objJSON) {
				data_to_print += "<tr>";
				for (var prop in objJSON[id]) {
					if (prop != "_id")
						data_to_print += "<td>" + objJSON[id][prop] + "</td>";
				}
				data_to_print += "</tr>";
			}
			data_to_print += "</table></div>";
			document.getElementById('data').innerHTML = data_to_print;
		}

	}
	req.open("GET", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/list", true);
	req.send(null);
}

function new_data_offline(){
	var form = "<div class='input'><h3 style='text-align: center;'>Dodaj dane</h3>";
	form += "<form name='add' ><table>";
	form += "<tr><td>Miejsce:</td><td><select  name='miejsce'>";
	form += "<option value='Krakow'>Kraków</option>";
	form += "<option value='Warszawa'>Warszawa</option>";
	form += "<option value='Wroclaw'>Wrocław</option>";
	form += "</select></td></tr>";
	form += "<tr><td>Data:</td><td><input class='form_input' type='date' name='data'></input></td></tr>";
	form += "<tr><td>Temperatura :</td><td><input class='form_input' type='text' name='temp' placeholder = '[*C]'></input></td></tr>";
	form += "<tr><td>Opad:</td><td><input class='form_input' type='text' name='opad' placeholder = '[mm]'></input></td></tr>";
	form += "<tr><td></td><td><input class='butt' type='button' value='Wyślij' onclick='insert_off(this.form)'></td></tr>";
	form += "</table></form></div>";
	document.getElementById('data').innerHTML = form;
}


function insert_off(form) {
	if (validate_data(form)) {
		var data = {};
		data.miejsce = form.miejsce.value;
		data.data = form.data.value;
		data.temp = form.temp.value;
		data.opad = form.opad.value;

		to_send = JSON.stringify(data);
		var db_tr = db.transaction("pogoda", "readwrite");
		var obj = db_tr.objectStore("pogoda");

		if(obj.put(data)){
			alert("Dodano dane do bazy przeglądarki");
		}

	}
}


function synchronize_data() {
	var counter = 0;
	var db_tx = db.transaction("pogoda", "readwrite");
	var obj = db_tx.objectStore("pogoda");
	obj.openCursor().onsuccess = function (event) {
		var cursor = event.target.result;
		if (cursor) {
			var data = {};
			data.miejsce = cursor.value.miejsce;
			data.data = cursor.value.data;
			data.temp = cursor.value.temp;
			data.opad = cursor.value.opad;

			to_send = JSON.stringify(data);
			req = getRequestObject();

			req.onreadystatechange = function () {
				if (req.readyState == 4 && req.status == 200) {
					objJSON = JSON.parse(req.response);
					if (objJSON['status'] == 'ok') {
						alert("Dodano: " + counter + "danych");
					}
				}
			}
			req.open("POST", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/save", true);
			req.send(to_send);
			cursor.delete();
			counter += 1;

			cursor.continue();
		}
		else if (counter == 0) {
			alert("Brak rekordów offline.");
		}
	};
	list_data();
}

function analyse_data() {
	var form = "<div class = \"input\"><form name='selectCity'>";
	form += "<p>Wybierz miejsce:</p>";
	form += "<select name='miejsce'>";
	req = getRequestObject();

	req.onreadystatechange = function () {
		if (req.readyState == 4 && req.status == 200) {
			objJSON = JSON.parse(req.response);
			objJSON.forEach(function (entry) {
				form += "<option>" + entry + "</option>";
			});

			form += "</select><br><input class='butt' type='button' value='Wybierz' onclick='draw_chart(this.form)' ></input>";
			form += "</form></div><div id='chart'></div>";
			document.getElementById('data').innerHTML = form;
		}

	}
	req.open("GET", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/selectCity", true);
	req.send(null);
}

function draw_chart(form) {
	document.getElementById('data').style.display = "none";

	var temp_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var opad_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var label_arr = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
	req = getRequestObject();
	req.onreadystatechange = function () {
		if (req.readyState == 4 && req.status == 200) {
			objJSON = JSON.parse(req.response);
			for (var id in objJSON) {
				if (objJSON[id]['miejsce'] == form.miejsce.value) {
					var arr = objJSON[id]['data'].split("-");
					count[parseInt(arr[1]) - 1] += 1;
					temp_arr[parseInt(arr[1]) - 1] += parseInt(objJSON[id]['temp'], 10);
					opad_arr[parseInt(arr[1]) - 1] += parseInt(objJSON[id]['opad'], 10);
				}
			}
			for (var i = 0; i < 12; i++) {
				if (count[i] == 0) {
					temp_arr[i] == opad_arr[i] == "null";
				}
				else {
					temp_arr[i] = temp_arr[i] / count[i];
					opad_arr[i] = opad_arr[i] / count[i];
				}
			}
			var chart = new CanvasJS.Chart("chart", {

				theme: "dark1", // "light2", "dark1", "dark2"
				animationEnabled: true,
				title: {
					text: "Średnia temperatura oraz opad w miesiącach",
					fontSize: 25
				},
				axisY: [
					{
						title: " opad",
						suffix: "mm"
					}],
				axisY2: [
					{
						title: "temperatura",
						suffix: "*C"
					}
				],
				data: [
					{
						type: "column",
						color: "#369936",
						axisYindex: 0,
						name: "opad",
						showInLegend: true,
						legendText: "opad",
						dataPoints: [
							{ label: label_arr[0], y: opad_arr[0] },
							{ label: label_arr[1], y: opad_arr[1] },
							{ label: label_arr[2], y: opad_arr[2] },
							{ label: label_arr[3], y: opad_arr[3] },
							{ label: label_arr[4], y: opad_arr[4] },
							{ label: label_arr[5], y: opad_arr[5] },
							{ label: label_arr[6], y: opad_arr[6] },
							{ label: label_arr[7], y: opad_arr[7] },
							{ label: label_arr[8], y: opad_arr[8] },
							{ label: label_arr[9], y: opad_arr[9] },
							{ label: label_arr[10], y: opad_arr[10] },
							{ label: label_arr[11], y: opad_arr[11] }
						]
					},
					{
						type: "spline",

						axisYType: "secondary",
						name: "temperatura",
						showInLegend: true,
						legendText: "temperatura",
						dataPoints: [
							{ label: label_arr[0], y: temp_arr[0] },
							{ label: label_arr[1], y: temp_arr[1] },
							{ label: label_arr[2], y: temp_arr[2] },
							{ label: label_arr[3], y: temp_arr[3] },
							{ label: label_arr[4], y: temp_arr[4] },
							{ label: label_arr[5], y: temp_arr[5] },
							{ label: label_arr[6], y: temp_arr[6] },
							{ label: label_arr[7], y: temp_arr[7] },
							{ label: label_arr[8], y: temp_arr[8] },
							{ label: label_arr[9], y: temp_arr[9] },
							{ label: label_arr[10], y: temp_arr[10] },
							{ label: label_arr[11], y: temp_arr[11] }
						]
					}
				]
			});
			chart.render();

		}
	}
	req.open("GET", "http://pascal.fis.agh.edu.pl/~6molenda/projekt2/rest/list", true);
	req.send(null);
	document.getElementById('data').style.display = "block";
}

function doc(){
	var txt = "<h1>Dokumentacja projektu 2 z przedmiotu Techniki Internetowe</h1> <br>";
	txt += "<b>Autor:</b> Krystian Molenda, gr: Wtorek <br>";
	txt += "<b>Temat:</b> Analiza danych pogodowych w 3 wybranych miastach<br>";
	txt += "<b>Wykorzystane technologie</b>: <br> 1. Baza danych MongoDB <br> 2. Język JavaScript<br>3. Język PHP -  Styl Restful.<br>";
	txt += "4.Wykres został wykonany przy pomocy biblioteki CanvasJS, dającej możliwość realizacji czytelnej analizy danych w zwięzły sposób.<br> ";
	txt += "<b>Dokumentacja użytkownika:</b><br>";
	txt += "Aby uzyskać dostęp do pełnej funkcjonalności aplikacji nalezy zarejestrować się oraz następnie zalogować. <br> Raz założone konto jest dostępne wielokrotnie.";
	txt += "<br>Dodawanie Rekordów możliwe z poziomu niezalogowanego użytkownika - do bazy danych przeglądarki, oraz z poziomu zalogowanego użytkownika do bazy danych na serwerze. <b>UWAGA PODAWANE DANE MUSZĄ BYĆ REALNE</b><br>";
	txt += "W przypadku braku połaczenia z bazą danych na serwerze, rekord zostanie dodany do tymczasowej bazy danych w przeglądarce w taki sam sposób jak gdyby użytkownik nie był zalogowany.<br>";
	txt += "Możliwe jest zsynchronizowanie danych będących w bazie przeglądarkowej poprzez kliknięcie przycisku \"Synchronizuj\". Dane zostaną wysłane do bazy na serwerze. <br>";
	txt += "Dane będące w bazie na serwerze można wyświetlić klikając w przycisk \"Pobierz Dane\". <br> Dane będące w bazie na serwerze można poddać analizie ze względu na poszczególne miasta klikając \"Analiza Danych \" ";
	txt += "<br>Aplikacja ma zaimplementowaną obsługę Cookies oraz utrzymywanie sesji. Po zakończeniu pracy, zalecane jest wylogowanie się.";

	document.getElementById('data').innerHTML = txt;
}