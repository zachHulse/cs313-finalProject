function signup(){
	var username = $("#uname").val();
	var password = $("#psw").val();
	var email = $("#email").val();

	var params = {
		username: username,
		password: password,
		email: email
	};

	$.post("/signup", params, function(result) {
		if (result && result.success) {
			console.log("success");
			window.location = result.redirect;
		} else {
			console.log("failure");
			$("#status").text(result.message);
		}
	});
}
function login() {
	var username = $("#username").val();
	var password = $("#password").val();

	var params = {
		username: username,
		password: password
	};

	$.post("/login", params, function(result) {
		if (result && result.success) {
			 window.location = result.redirect;
		} else {
			$("#status").text(result.message);
		}
	});
}

function logout() {
	$.post("/logout", function(result) {
		if (result && result.success) {
			window.location = result.redirect;
		} else {
			$("#status").text("Error logging out.");
		}
	});
}

function idea() {
	var name = $("#name").val();
	var description = $("#description").val();
	var min = $("#min").val();
	var max = $("#max").val();
	var instrument = $("#instrument").val();
	var category = $("#category").val();

	var params = {
	name: name,
	description: description,
	min: min,
	max: max,
	instrument: instrument,
	category: category
	};

	$.post("/idea", params, function(result) {
		if (result && result.success) {
			 $("#status").text("Practice Idea Added");
			 $("input[type=text], textarea, select").val("");
			 setTimeout(function() {$("#status").text("");}, 3000);
		} else {
			$("#status").text(result.message);
		}
	});
}
