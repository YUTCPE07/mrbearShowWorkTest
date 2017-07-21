var config = {
      apiKey: "AIzaSyBEPlXlNZFmXglK05nYOsMTKZYnHZTVVss",
      authDomain: "mrbear-a5276.firebaseapp.com",
      databaseURL: "https://mrbear-a5276.firebaseio.com",
      projectId: "mrbear-a5276",
      storageBucket: "mrbear-a5276.appspot.com",
      messagingSenderId: "954208284935"
    };
    firebase.initializeApp(config);
var provider = new firebase.auth.FacebookAuthProvider();

function insertNewUser(email,password){

	firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
		$('#registerAlert').html("สมัครสมาชิกเรียบร้อย สามารถเข้าสู่ระบบได้ทันที")
		.attr('class','alert alert-success').show();
		$('#inputRegisterEmail').prop('disabled', true);
		$('#inputRegisterPassword').prop('disabled', true);
		$('[onclick="sendRegisterOnclick()"]').hide();
	}).catch(function(err){
		var errCode = err.code;
		var errMessage = err.message;
		if(errCode == 'auth/weak-password'){
			$('#registerAlert').html("รหัสผ่านเดาง่ายเกินไป")
				.attr('class','alert alert-warning').show();
		}else if(errCode == 'auth/invalid-email'){
			$('#registerAlert').html("ผิดพลาด รูปแบบ email ไม่ถูกต้อง หรือ Email นี้ถูกใช้ไปเเล้ว")
				.attr('class','alert alert-warning').show();
		}else{
			$('#registerAlert').html('ผิดพลาด โปรดลองอีกครั้ง')
				.attr('class','alert alert-danger').show();
		}
	});
}

function sendRegisterOnclick(){
	var email = document.getElementById('inputRegisterEmail');
	var password = document.getElementById('inputRegisterPassword');
	if(email.value == '' || password.value == ''){
		$('#registerAlert').html("กรุณากรอกข้อมูลให้ครบ").show();
	}else{
		insertNewUser(email.value,password.value);
	}	
}

function saveOnclick() {
	var email = document.getElementById('inputEmail');
	var password = document.getElementById('inputPassword');
	var address = document.getElementById('inputAddress');
	// insertData(email.value,password.value,address.value);
	
}

function resetPassword(){
	var email = document.getElementById('inputEmailForgetPassword').value;
	firebase.auth().sendPasswordResetEmail(email).then(function(){
		$('#inputEmailForgetPassword').prop('disabled', true);
		$('#forgetPasswordAlert').html("ระบบได้ส่งลิ้งสำหรับเปลี่ยนรหัสผ่านไปยัง Email ของท่านเเล้ว")
		.attr('class','alert alert-success').show();
		console.log("success")
	}).catch(function(err){
		var errCode = err.code;
		var errMessage = err.message;
		$('#forgetPasswordAlert').html(errMessage).attr('class','alert alert-danger').show();
		console.log(err)
	});

}

function loginOnclick(){
	var email = document.getElementById('inputLoginEmail');
	var password = document.getElementById('inputLoginPassword');
	if(email.value == '' || password.value == ''){
		console.log('กรุณากรอกข้อมูลให้ครบ')
	}else{
		firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(function(){
			location.reload();
		}).catch(function(error){
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  if (errorCode === 'auth/wrong-password') {
		    alert('Wrong password.');
		  } else {
		    alert(errorMessage);
		  }
		});
	}
}

function logoutOnclick(){
	loginFacebook();
	firebase.auth().signOut().then(function(){
		window.location = '/';
	});
	
}

function loginFacebook(){
	firebase.auth().signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
      window.location = '/';
    });
}

function htmlLogin(){
	var login = '<a name="login" href="#" class="dropdown-toggle" data-toggle="dropdown"> '+
                        '<b>Login</b> <span class="caret"></span></a> '+
                        '<ul id="login-dp" class="dropdown-menu"> '+
                        '<li> '+
                        '<div class="row"> '+
                            '<div class="col-md-12"> '+
                                'Login '+
                                '<div class="form-group"> '+
                                    '<button onclick="loginFacebook()" href="#"  '+
                                    'class="btn btn-fb btn-block">Facebook</button> '+
                                '</div> '+
                                'or '+
                               ' <div class="form-group"> '+
                                    '<label class="sr-only" for="inputLoginEmail">Email address</label> '+
                                    '<input id="inputLoginEmail" type="email" class="form-control"  '+
                                    'placeholder="Email address" required> '+
                                '</div> '+
                                '<div class="form-group"> '+
                                    '<label class="sr-only" for="inputLoginPassword">Password</label> '+
                                    '<input id="inputLoginPassword" type="password" class="form-control"  '+
                                    'placeholder="Password" required> '+
                                    '<div class="help-block text-right"> '+
                                        '<a data-toggle="modal" data-target="#modalforgetPassword" href=""> '+
                                        'Forget the password ?</a></div> '+
                                '</div> '+
                                '<div class="form-group"> '+
                                     '<button onclick="loginOnclick()"  '+
                                     'type="button" class="btn btn-primary btn-block ">Sign in</button> '+
                                '</div> '+
                                '<div class="checkbox"> '+
                                     '<label> '+
                                     '<input type="checkbox"> keep me logged-in '+
                                     '</label> '+
                                '</div> '+
                            '</div> '+
                            '<div class="bottom text-center"> '+
                                '<button data-toggle="modal" data-target="#modalRegister" '+
                                    'class="btn btn-info"> '+
                                    'สมัครเดี่ยวนี้ </button> '+
                            '</div> '+
                        '</div> '+
                        '</li> '+
                        '</ul>';
    return login;
}

function htmlLogOut(){
	var logout = 	'<a name="logout" href="#" onclick="logoutOnclick()"> '+
	                        '<b>Logout</b> '+
	                '</a>';
    return logout;
}
