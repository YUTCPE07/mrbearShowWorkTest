var pathname = window.location.pathname;
var pathnameSplit = pathname.split("pay/");
var IdOrder = pathnameSplit[1];
firebase.auth().onAuthStateChanged(function(user) {
	if(user){
		$('p[class="navbar-text"]').html(user.email);
   	  	$('a[name="logout"]').show();
   	  	$('a[name="login"]').hide();
   	  	var firebaseRef=firebase.database().ref("ADMIN/USER");
   	  	firebaseRef.once('value').then(function(dataSnapshot){
			dataSnapshot.forEach(function(childSnapshot){
				var childData = childSnapshot.val();
				if(childData === user.email){
					$('p[class="navbar-text"]').html(user.email+' <a href="/admin">ADMIN<a>');
				}
			});
		});
		var arr = user.email.split('.');
		var idUser = arr[0];
		getData(idUser);
		badge(idUser);
		$('#sendOnclick').click(function(){
			sendOnclick(idUser);
		});
	}else{
		$('p[class="navbar-text"]').html('มีบัญชีแล้วหรือยัง?');
  		$('a[name="login"]').show();
  		$('a[name="logout"]').hide();
		window.history.back();
	}
});
function badge(idUser){
	var cart=firebase.database().ref("CART/"+idUser);
	cart.once('value').then(function(dataSnapshotCart){
		if(dataSnapshotCart.val()!==null){
			var data = Object.keys(dataSnapshotCart.val());
			$('#badgeCart').html(data.length);
		}
	});
	var order=firebase.database().ref("PAY/"+idUser);
	order.once('value').then(function(dataSnapshotOrder){
		if(dataSnapshotOrder.val()!==null){
			var data = Object.keys(dataSnapshotOrder.val());
			$('#badgeOrder').html(data.length);
		}
	});
}
function getData(idUser){
	var firebaseRef=firebase.database().ref("PAY/"+idUser+"/"+IdOrder);
	firebaseRef.once('value').then(function(dataSnapshot){
		if(dataSnapshot.val()!==null){
			var data = dataSnapshot.val();
			var status = data.STATUS.status;
			$('#idOrder').html('รายการ: '+IdOrder);
			var firebaseStust=firebase.database().ref("STATUS/"+status);
			firebaseStust.once('value').then(function(statusString){
				$('#statusOrder').html('สถานะ: '+statusString.val());
			});
			sum(idUser,function(price){
				console.log(price)
				$('#sumPrice').html('จากรายการสินค้าคุณต้องชำระทั้งสิ้น '+price+' บาท');
				$('#price').val(price);
			});
			if(data.STATUS.status===2||data.STATUS.status===3){
				showAddressAndInform(IdOrder);
			}
		}else{
			alert("ไม่มีรายการนี้");
			window.location = '/';
		}
	});
}
function showAddressAndInform(IdOrder){
	disable(true);
	var firebaseRef=firebase.database().ref("INFORM/"+IdOrder);
	firebaseRef.once('value').then(function(dataSnapshot){
		var data = dataSnapshot.val();
	  	$('#dateInform').val(data.dateInform);
		$('#timeInform').val(data.timeInform);
		$('#price').val(data.price);
		$('#name').val(data.name);
		$('#tel').val(data.tel);
		$('#address').val(data.address);
	});
}
function htmlListProduct(i,product,color,number,unit,price){
	var html = 	'<div class="col-sm-2"><h5>'+i+'</h5></div> '+
			    '<div class="col-sm-6"><h5>'+product+' '+color+'</h5></div> '+
			    '<div class="col-sm-2"><h5>'+number+' '+unit+'</h5></div> '+
			    '<div class="col-sm-2"><h5>'+price+'</h5></div> ';
    return html;
}
function sum(idUser,callback){
	var price = 0;
	var i = 0;
	$('#listProduct').html('');
	var firebaseRef=firebase.database().ref("PAY/"+idUser+"/"+IdOrder+"/PRODUCT");
	firebaseRef.once('value').then(function(dataSnapshot){
		dataSnapshot.forEach(function(childSnapshot){
			var length = Object.keys(dataSnapshot.val()).length;
			var data = childSnapshot.val();
			i++;
			var html = htmlListProduct(i,data.name,data.color,data.number,data.unit,data.price);
			$('#listProduct').append(html);
			price = price+data.price;
			if (i===length){
				price = price+50;
				callback(price);
			}
		});
	});
}
function sendOnclick(idUser){
	var dateInform = $('#dateInform').val();
	var timeInform = $('#timeInform').val();
	var price = $('#price').val();
	var name = $('#name').val();
	var tel = $('#tel').val();
	var address = $('#address').val();
	if(dateInform!=''&&timeInform!=''&&price!=''&&name!=''&&tel!=''&&address!=''){
		insertInformAndAddres(dateInform,timeInform,price,name,tel,address,idUser);
	}else{
		alert('กรุณากรอกข้อมูลให้ครบ');
	}
}
function insertInformAndAddres(dateInform,timeInform,price,name,tel,address,idUser){
	var firebaseRefCart=firebase.database().ref("INFORM/"+IdOrder);
	firebaseRefCart.set({
		dateInform: dateInform,
    	timeInform: timeInform,
    	price: price,
    	name: name,
    	tel: tel,
    	address: address,
    	email: idUser,
    	idOrder:IdOrder
	}).then(function(){
		insertStutsPay(2,idUser);
		getData(idUser);
		alert("แจ้งโอนเรียบร้อย");
	}).catch(function(err){
		alert("ผิดผลาด ลองใหม่อีกครั้ง");
		console.log(err)
	});
}
function insertStutsPay(data,idUser){
	var firebaseRefCart=firebase.database().ref("PAY/"+idUser+"/"+IdOrder+"/STATUS");
	firebaseRefCart.set({
		status: data
	});
}
function disable(data){
	$("input").prop('disabled', data);
	$("button").prop('disabled', data);
	$("textarea").prop('disabled', data);
}

