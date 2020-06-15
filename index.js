require('dotenv/config')
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var thenrequest = require('then-request');
var path = require('path');
var async = require('async');

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

const request = require('request')
var router = express.Router();


//Your Api key-secret pair for Authentication
var zoom_key = 'AcpLIt6NQAq5P1ahVCowLg';
var zoom_sec = '7WqUH30fsfTk3wC2rSR36prIYMWt465O';
//ACCESS_CODE
var code;
//USER_ID
var user_id = 'LNPQQJSjSeCNLJlMRBPx7w'; //TODO HARDCODED

//Set the routes
router.get('/', function(req, res) {
  //res.render('home', {title: 'Welcome'});
// Step 1: 
    // Check if the code parameter is in the url 
    // if an authorization code is available, the user has most likely been redirected from Zoom OAuth
    // if not, the user needs to be redirected to Zoom OAuth to authorize

    if (req.query.code) {

        // Step 3: 
        // Request an access token using the auth code

        let url = 'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + process.env.redirectURL;

        request.post(url, (error, response, body) => {
            // Parse response to JSON
            body = JSON.parse(body);

            // Logs your access and refresh tokens in the browser
            console.log(`ACCESS TOKEN: ${body.access_token}`);
            console.log(`\nREFRESH TOKEN: ${body.refresh_token}`);
			
			code = body.access_token;
            if (body.access_token) {

                // Step 4:
                // We can now use the access token to authenticate API calls

                // Send a request to get your user information using the /me context
                // The `/me` context restricts an API call to the user the token belongs to
                // This helps make calls to user-specific endpoints instead of storing the userID

                request.get('https://api.zoom.us/v2/users/me', (error, response, body) => {
                    if (error) {
                        console.log('API Response Error: ', error)
                    } else {
                        body = JSON.parse(body);
                        // Display response in console
                        //console.log('API call ', body);
                        // Display response in browser
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
                        res.send(`
                            <style>
                                @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "??";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                            </style>
                            <div class="container">
                                <div class="info">
                                    <img src="${body.pic_url}" alt="User photo" />
                                    <div>
                                        <span>Hello World!</span>
                                        <h2>${body.first_name} ${body.last_name}</h2>
                                        <p>${body.role_name}, ${body.company}</p>
                                    </div>
                                </div>
                                <div class="response">
                                    <h4>JSON Response:</h4>
                                    <a href="/home">
                                        Inicio
                                    </a>
                                    ${JSONResponse}
                                </div>
                            </div>
                        `);
                    }
                }).auth(null, null, true, body.access_token);

            } else {
                // Handle errors, something's gone wrong!
            }

        }).auth(process.env.clientID, process.env.clientSecret);

        return;

    }

    // Step 2: 
    // If no authorization code is available, redirect to Zoom OAuth to authorize
    res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + process.env.clientID + '&redirect_uri=' + process.env.redirectURL)
});

router.get('/listmeetings', function(req, res) {
	var body;
                        console.log("/listmeetings");

            if (code) {

                request.get('https://api.zoom.us/v2/users/'+user_id+'/meetings', (error, response, body) => {

                    if (error) {
                        console.log('API Response Error: ', error);
                    } else {
                        body = JSON.parse(body);
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
						 res.send(`
                            <style>
                                @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "??";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                            </style>
                            <div class="container">
                                <div class="info">
                                    <div>
                                        <span>Reuniones</span>
                                    </div>
                                </div>
                                <div class="response">
                                    <h4>JSON Response:</h4>
                                    <a href="/home">
                                        Inicio
                                    </a>
                                    ${JSONResponse}
                                </div>
                            </div>
                        `);
                    }
                }).auth(null, null, true, code);

            } else {
                        console.log("Codigo de acceso no existe");
						res.redirect('/');
            }



        return;

});

//Eliminando .auth() e incluyendo en el request (TEST)
router.get('/myinfo', function(req, res) {
		var body;


            if (code) {

                request.get('https://api.zoom.us/v2/users/me',
				{
				'auth': {
				'bearer': code
					}
					}, (error, response, body) => {
                    if (error) {
                        console.log('API Response Error: ', error);
                    } else {
                        body = JSON.parse(body);
                        // Display response in console
                        //console.log('API call ', body);
                        // Display response in browser
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
                        res.send(`
                            <style>
                                @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "??";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                            </style>
                            <div class="container">
                                <div class="info">
                                    <img src="${body.pic_url}" alt="User photo" />
                                    <div>
                                        <span>Hello World!</span>
                                        <h2>${body.first_name} ${body.last_name}</h2>
                                        <p>${body.role_name}, ${body.company}</p>
                                    </div>
                                </div>
                                <div class="response">
                                    <h4>Mi información personal</h4>
										<p><br>ID: ${body.id}<br>
										Nombre: ${body.first_name} ${body.last_name}<br>
										Email: ${body.email}<br>
										Localización: ${body.location}<br>
										Estado de la cuenta: ${body.status}</p><br>
                                </div>
                            </div>
                        `);
                    }
                })

            } else {
                        console.log("Codigo de acceso no existe");
						res.redirect('/');
            }



        return;

    

});



router.get('/home', function(req, res) {
	var body;
    request.get('https://api.zoom.us/v2/users/me', (error, response, body) => {
                    if (error) {
                        console.log('API Response Error: ', error)
                    } else {
                        body = JSON.parse(body);
                        console.log(body);

                    }
                }).auth(null, null, true, code);
  res.render('home', {title: 'Welcome'});

});



router.get('/createMeeting', function(req, res) {
	
	
	var body={
					"topic": "TestNode",
					"duration": "615",
					"settings": {
					"host_video": "true"
								}
					};
					
            if (code) {

                request.post('https://api.zoom.us/v2/users/'+user_id+'/meetings',
				{
				headers: {
						"content-type": "application/json", 
				},
				body: JSON.stringify(body)
				}, (error, response, body) => {

                    if (error) {
						console.log(body);
                        console.log('API Response Error: ', error);
                    } else {
                        body = JSON.parse(body);
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
						 res.send(`
                            <style>
                                @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "??";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                            </style>
                            <div class="container">
                                <div class="info">
                                    <div>
                                        <span>Reuniones</span>
                                    </div>
                                </div>
                                <div class="response">
                                    <h4>JSON Response:</h4>
                                    <a href="/home">
                                        Inicio
                                    </a>
                                    ${JSONResponse}
                                </div>
                            </div>
                        `);
                    }
                }).auth(null, null, true, code);

            } else {
                        console.log("Codigo de acceso no existe");
						res.redirect('/');

            }
        return;

});


router.get('/createUser', function(req, res) {
	
	
	var body={
			"action": "create",
			"user_info": {
			"email": "testemail@test.com",
			"type": 1,
			"first_name": "Test Name",
			"last_name": "Test Surname"
  }
};
				
            if (code) {

                request.post('https://api.zoom.us/v2/users',
				{
				headers: {
						"content-type": "application/json", 
				},
				body: JSON.stringify(body)
				}, (error, response, body) => {

                    if (error) {
						console.log(body);
                        console.log('API Response Error: ', error);
                    } else {
                        body = JSON.parse(body);
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
						 res.send(`
                            <style>
                                @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "??";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                            </style>
                            <div class="container">
                                <div class="info">
                                    <div>
                                        <span>Reuniones</span>
                                    </div>
                                </div>
                                <div class="response">
                                    <h4>JSON Response:</h4>
                                    <a href="/home">
                                        Inicio
                                    </a>
                                    ${JSONResponse}
                                </div>
                            </div>
                        `);
                    }
                }).auth(null, null, true, code);

            } else {
                        console.log("Codigo de acceso no existe");
						res.redirect('/');

            }
        return;

});


router.get('/myrecordings', function(req, res) {
		var body;


            if (code) {

                request.get('https://api.zoom.us/v2/users/'+user_id+'/recordings',
				{
				'auth': {
				'bearer': code
					}
					}, (error, response, body) => {
                    if (error) {
                        console.log('API Response Error: ', error);
                    } else {
                        body = JSON.parse(body);
                        // Display response in console
                        //console.log('API call ', body);
                        // Display response in browser
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
                       res.send(`
                            <style>
                                @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "??";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                            </style>
                            <div class="container">
                                <div class="info">
                                    <div>
                                        <span>Reuniones</span>
                                    </div>
                                </div>
                                <div class="response">
                                    <h4>JSON Response:</h4>
                                    <a href="/home">
                                        Inicio
                                    </a>
                                    ${JSONResponse}
                                </div>
                            </div>
                        `);
                    }
                })

            } else {
                        console.log("Codigo de acceso no existe");
						res.redirect('/');
            }



        return;

    

});


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/', router);
app.listen(3500);

console.log("Zoom App has started.");
