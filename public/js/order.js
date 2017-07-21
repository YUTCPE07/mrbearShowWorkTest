
function auth(){
	firebase.auth().onAuthStateChanged(function(user) {
		if(user){
			$('p[class="navbar-text"]').html(user.email);
	   	  	$('a[name="logout"]').show();
	   	  	$('a[name="login"]').hide();
	   	  	var arr = user.email.split('.');
			var idUser = arr[0];
			getData(idUser);
			badge(idUser);
	   	  	var firebaseRef=firebase.database().ref("ADMIN/USER");
	   	  	firebaseRef.once('value').then(function(dataSnapshot){
				dataSnapshot.forEach(function(childSnapshot){
					var childData = childSnapshot.val();
					if(childData === user.email){
						$('p[class="navbar-text"]').html(user.email+' <a href="/admin">ADMIN<a>');
					}
				});
			});
		}else{
			$('p[class="navbar-text"]').html('มีบัญชีแล้วหรือยัง?');
	  		$('a[name="login"]').show();
	  		$('a[name="logout"]').hide();
			window.history.back();
		}
	});
}

function badge(idUser){
	var cart=firebase.database().ref("CART/"+idUser);
	cart.once('value').then(function(dataSnapshotCart){
		if(dataSnapshotCart.val()!=null){
			var data = Object.keys(dataSnapshotCart.val());
			$('#badgeCart').html(data.length);
		}
	});
	var order=firebase.database().ref("PAY/"+idUser);
	order.once('value').then(function(dataSnapshotOrder){
		if(dataSnapshotOrder.val()!=null){
			var data = Object.keys(dataSnapshotOrder.val());
			$('#badgeOrder').html(data.length);
		}
	});
}

function getData(idUser){
	var i = 0;
	var firebasePay=firebase.database().ref("PAY/"+idUser);
	firebasePay.once('value').then(function(dataSnapshot){
		$('#show').html('');
		if(dataSnapshot.val()!==null){
			dataSnapshot.forEach(function(childSnapshot){
			var idOrder = childSnapshot.key;
			var data = childSnapshot.val();
			var status = data.STATUS.status;
			var firebaseStust=firebase.database().ref("STATUS/"+status);
				firebaseStust.once('value').then(function(statusString){
					i++;
					var statusStr = statusString.val();
					var htmlStr = createHtml(i,idOrder,statusStr,idUser);
					$('#show').append(htmlStr);
					$('#nullOrder').hide();
				});
			});
		}else{
			$('#nullOrder').show();
		}
	});
}

function createHtmlNull(){
	var html = '<div class="panel-body"> '+
                    '<div class="row text-center"> '+
                        '<div class="col-sm-12"><h4>ยังไม่มีรายการข้อมูล</h4></div> '+
                    '</div> '+
                '</div>'
    return html;
}

function cancleOnclick(ele){
	var r = confirm("คำเตือน!คุณกำลังลบรายการสั่งซื้อ");
    if (r == true) {
        var id = $(ele).get(0).id;
		var arr = id.split('_');
		var idUser = arr[1]; 
		var idOrder = arr[2];
		var firebaseRef=firebase.database().ref("PAY/"+idUser+'/'+idOrder);
		firebaseRef.remove().then(function(){
			auth();
		});
    }
}

function createHtml(i,idOrder,statusStr,idUser){
	var html = '<div class="panel-body"> '+
                    '<div class="row text-center"> '+
                        '<div class="col-sm-1"><h4>'+i+'</h4></div> '+
                        '<div class="col-sm-4"><h4>'+idOrder+'</h4></div> '+
                        '<div class="col-sm-4"><h4>'+statusStr+'</h4></div> '+
                        '<div class="col-sm-2"> '+
                            '<button onclick="check('+idOrder+')" class="btn btn-lg btn-primary btn-block" >ตรวจสอบ</button> '+
                        '</div> '+
                    	'<div class="col-sm-1"> '+
                            '<button id="cancel_'+idUser+'_'+idOrder+'" onclick="cancleOnclick(this)" '+
                            'class="btn btn-lg btn-danger btn-block" > '+
                            '<span class="glyphicon glyphicon-trash"></span></button> '+
                        '</div> '+
                    '</div> '+
                '</div>'
    return html;
}

function check(idOrder){
	window.location = '/pay/'+idOrder.toString();
}

auth();