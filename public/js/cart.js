var idUser;
var newTime = new Date().getTime();

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
		idUser = arr[0];
		showCart(idUser);
		badge();
	}else{

		$('p[class="navbar-text"]').html('มีบัญชีแล้วหรือยัง?');
  		$('a[name="login"]').show();
  		$('a[name="logout"]').hide();
		window.history.back();
	}
});

function badge(){
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

function showCart(idUser){
	var i = 0;
	var sum = 0;
	var ems = 50;
	var firebaseRefCart=firebase.database().ref("CART/"+idUser);
	firebaseRefCart.once('value').then(function(dataSnapshot){
		$('#showCart').html('');
		if (dataSnapshot.val()!==null){
			dataSnapshot.forEach(function(childSnapshot){
				var data = childSnapshot.val();
				var key = childSnapshot.key;
				i = i+1;
				sum = sum+(data.number*data.price);
				var html = htmlCart(i,data.name,data.color,data.number,data.unit,data.price,key);
				$('#showCart').append(html);
				$('#ems').html('ราคารวมค่าส่ง '+(sum+ems)+' บาท');
				$('#emsPrice').html('ราคา '+ems+' บาท');
				$('button').prop('disabled',false);
				$('#blockEms').removeClass('hide');	
				$('#nullOrder').addClass('hide');	
			});
		}else{
			$('#nullOrder').removeClass('hide');
			$('#blockEms').addClass('hide');
			$('button').prop('disabled',true);
		}
	});
}

function htmlCart(i,name,color,number,unit,price,key){
	var nameCart = name; 
	if(color != ''){
		nameCart = name+' '+color;
	}
	var html = '<div class="panel-body"> '+
                    '<div class="row text-center"> '+
                        '<div class="col-sm-2"><h4>'+i+'</h4></div> '+
                        '<div class="col-sm-3"><h4>'+nameCart+'</h4></div> '+
                        '<div class="col-sm-2"><h4>'+number+'</h4></div> '+
                        '<div class="col-sm-2"><h4>'+unit+'</h4></div> '+
                        '<div class="col-sm-2"><h4>'+price+'</h4></div> '+
                        '<div class="col-sm-1"> '+
                        	'<button id="'+key+'" onclick="cancelOnce(this);" class="btn btn-lg btn-danger"> '+
                        	'<span class="glyphicon glyphicon-trash"></span></button> '+
                        '</div> '+
                    '</div> '+
                '</div> ';

    return html;
}

function cancelOnce(ele){
	var id = $(ele).get(0).id;
	var firebaseRefCart=firebase.database().ref("CART/"+idUser+"/"+id);
	firebaseRefCart.remove().then(function(){
		showCart(idUser);
		badge();
		console.log('cancel success')
	});
}

function getData(callback){
	var i = 0;
	var firebaseRefCart=firebase.database().ref("CART/"+idUser);
	firebaseRefCart.once('value').then(function(dataSnapshot){
		dataSnapshot.forEach(function(childSnapshot){
			var data = childSnapshot.val();
			var length = Object.keys(dataSnapshot.val()).length;
			i++;
			console.log(data.idProduct,data.name,data.color,data.number,data.unit,data.price)
			insertPay(data.idProduct,data.name,data.color,data.number,data.unit,data.price,function(){
				if(i===length){
					insertStutsPay(1);
					callback();
				}
			});
		});
	});
}

function payOnclick(){
	getData(function(){
		removeDB(function(data){
			if(data==='done'){
				window.location = '/pay/'+newTime;
			}
		});
	});
}

function removeDB(callback){
	var firebaseRef=firebase.database().ref("CART/"+idUser);
	firebaseRef.remove().then(function(){
		callback('done');
	}).catch(function(err){
		callback('err');
	});
}

function insertStutsPay(data){
	var firebaseRefCart=firebase.database().ref("PAY/"+idUser+"/"+newTime+"/STATUS");
	firebaseRefCart.set({
		status: data
	});
}

function insertPay(idProduct,name,color,number,unit,price,callback){
	console.log(idProduct,name,color,number,unit,price)
	var firebaseRefCart=firebase.database().ref("PAY/"+idUser+"/"+newTime+"/PRODUCT");
	firebaseRefCart.push({
		idProduct:idProduct,
		name: name,
    	color: color,
    	number: number,
    	unit: unit,
    	price: price*number
	});
	callback(); 	
}