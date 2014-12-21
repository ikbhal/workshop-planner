var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 80));
app.use(express.static(__dirname + '/public'));


app.get('/', function(request, response) {
	response.add('Hello World!');
});

app.listen(app.get('port'), function() {
	console.log("Workshop Planner running at localhost:" + app.get('port'));
});