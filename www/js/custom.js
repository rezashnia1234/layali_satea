// setTimeout(function(){
	// if(navigator.connection.type)
		// networkState = navigator.connection.type;
	// else
		// networkState = navigator.connection.effectiveType;
	
	// if(!window.cordova)
	// {
		// Connection = {};
		// Connection.NONE = "0000";
		// Connection.NONE = "4g";
		// setTimeout(function(){
			// if(window.localStorage.getItem("udid")==null)
				// window.localStorage.setItem("udid","test");
		// }, 1500);
	// }
// }, 500);

var timerID;
var json_data;
var my_Interval_function;
var quiz_starting_time;
var next_question;
var ajax_result;
var temp_answer;

$( document ).ready(function() {
	my_Interval_function = function(){
		// if(window.localStorage.getItem("is_login")!=null)
		// undefined
		if(window.localStorage.getItem("is_login")!=null && window.sessionStorage.getItem("we_have_net")=="true")
		{
            if(navigator.connection.type)
                networkState = navigator.connection.type;
            else
                networkState = navigator.connection.effectiveType;
			
			if (networkState != Connection.NONE) {
				var url = server_url;			
				$.ajax({
					type: "POST",
					url: url,
					data: {
						"udid":window.localStorage.getItem("udid"),
						"answer":temp_answer,
					},
					success: function (text)
					{
						// console.log(myApp.getCurrentView());
						if(text.success == "true")
						{
							ajax_result	= text.result;
							
							if(text.result.quiz_status == "no_quiz")
							{
								mainView.router.loadPage('no-game.html');
							}
							else if(text.result.quiz_status == "quiz_starting" || text.result.quiz_status == "quiz_started")
							{
								quiz_starting_time	= text.result.remaining_time;
								next_question		= text.result.next_question;
								
								// console.log(ajax_result);
								if(next_question==undefined)
								{
									if(quiz_starting_time>0)
										mainView.router.loadPage('before_game.html');
									else
										mainView.router.loadPage('waiting_page.html');
								}
								else
									mainView.router.loadPage('game.html');
							}
							// else if(text.result.quiz_status == "quiz_starting")
							// {
								// quiz_starting_time = text.result.remaining_time;
								// mainView.router.loadPage('before_game.html');
							// }
						}
						else
						{
							myApp.alert('تحتاج إلى اتصال بالإنترنت لاستخدام هذا التطبيق-0','تحذير', function () {});
							mainView.router.loadPage('index.html');
							window.sessionStorage.setItem("we_have_net","false");
						}
					},
					error: function (text)
					{				  
						myApp.alert('تحتاج إلى اتصال بالإنترنت لاستخدام هذا التطبيق-0','تحذير', function () {});
						mainView.router.loadPage('index.html');
						window.sessionStorage.setItem("we_have_net","false");
					}
				});
			}
			else
			{
				mainView.router.loadPage('index.html');
			}
			// console.log("here");
		}
	}
	timerID = setInterval(function() {
		my_Interval_function();
	}, 2 * 1000); 
	// clearInterval(timerID);
	
	
	$("#register_btn").click(function() {
			var url = server_url + "register.php";

			$.ajax({
				type: "POST",
				url: url,
				data: {
					"name":$("#register_form input[name=name]").val(),
					"mobile":$("#register_form input[name=mobile]").val(),
					"email":$("#register_form input[name=email]").val(),
					"gender":$("#register_form input[name=gender]").val(),
					"udid":window.localStorage.getItem("udid"),
					"os":device.platform
				},
				success: function (text)
				{				  
					if(text.success == "true")
					{
						login_and_get_data();
						window.localStorage.setItem("is_login","true");
						// mainView.router.loadPage('game.html');
						myApp.closeModal(".login-screen", true);
					}
					else
					{
						window.sessionStorage.setItem("we_have_net","false");
						myApp.alert('تحتاج إلى اتصال بالإنترنت لاستخدام هذا التطبيق-0','تحذير', function () {});
					}
				},
				error: function (text)
				{
					window.sessionStorage.setItem("we_have_net","false");
					myApp.alert('تحتاج إلى اتصال بالإنترنت لاستخدام هذا التطبيق-1','تحذير', function () {});
				}
			});
	});
});


function check_net_home_page()
{
    if(check_net(true,false))
    {
        if(window.localStorage.getItem("is_login")==null)
            myApp.popup(".login-screen", true, true);
        else
            login_and_get_data();
    }
}

function login_and_get_data()
{
	window.sessionStorage.setItem("we_have_net","true");
	my_Interval_function();
	// mainView.router.loadPage('game.html');
	/*
    $.ajax({
        url: server_url+'loginwithauthtoken',
        type: "POST",
        data: JSON.stringify
        ({
            "auth_token":window.localStorage.getItem("auth_token"),
            "client_version":client_version,
            "os":device.platform
        }),
        success : function(text)
        {
            myApp.hideIndicator();
            mainView.router.loadPage('landing.html');
            if(text.success == true)
            {
                window.sessionStorage.setItem("access_token",text.data.access_token);
                window.localStorage.setItem("app_data",JSON.stringify(text.data));
                mainView.router.loadPage('landing.html');
                $$('#sidebar-driver-name').text(text.data.name);
                $$('#sidebar-driver-car').text(text.data.car_type + ' ' + text.data.car_color + ' - ' + text.data.license_plate);
                $$("#sidebar-driver-profile-pic").attr("src",text.data.profile_pic_url);
                if(text.data.car_type== '' || text.data.license_plate =='' )
                {
                    $$('#sidebar-driver-complate-profile').text(text.data.name);
                }
            }
            else
            {
                var error = text.error;
                if(error=="app_not_updated")
                {
                    $$('#force-update-message').text(text.data.message);
                    myApp.popup(".force-update-popup", true, true);
                    window.sessionStorage.setItem('update_url',text.data.update_url);
                }
                if(error=="user_banned" || error == "registration_not_verified")
                {
                    $$('#popup-message-text').text(text.data);
                    myApp.popup(".message-popup", true, true);
                }
                else
                {
                    myApp.popup(".login-screen", true, true);
                    convert_persian_digit_to_english();
                }

            }
        },
        error: function(jqXHR, exception) {
            myApp.hideIndicator();
            myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
        },
    });

	*/

}


function check_net(show_alert,do_loop)
{
	console.log(networkState);
	if (networkState == Connection.NONE) {
		if(show_alert)
		{
			if(do_loop)
				window.sessionStorage.setItem("do_loop","1");
			else
				window.sessionStorage.setItem("do_loop","0");
			
			myApp.alert('تحتاج إلى اتصال بالإنترنت لاستخدام هذا التطبيق','تحذير', function () {
				if(window.sessionStorage.getItem("do_loop")=="1")
				{
					window.sessionStorage.removeItem("do_loop");
					check_net(true,true);
				}
			});
		}
		return false;
	}
	return true;
}

