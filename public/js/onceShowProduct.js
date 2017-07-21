var pathname = window.location.pathname;
var pathnameSplit = pathname.split("product/");
var idProduct = pathnameSplit[1];
var firebaseRef=firebase.database().ref("ADMIN/USER");
var newTime = new Date().getTime();
firebase.auth().onAuthStateChanged(function(user) {
  	if (user) {
   	  	$('p[class="navbar-text"]').html(user.email);
   	  	// $('a[name="logout"]').show();
   	  	// $('a[name="login"]').hide();
   	  	$('#loginOrlogOut').html(htmlLogOut());
   	  	$('[name="disableUnAult"]').show();
   	  	var arr = user.email.split('.');
		var idUser = arr[0];
   	  	badge(idUser);
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
  		// $('a[name="logout"]').hide();
  		// $('[name="disableUnAult"]').hide();
  		$('#loginOrlogOut').html(htmlLogin());
  	}
});

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

function chengUnit(unit){
	if(unit=='pce'){
		return 'ชิ้น';
	}else if(unit=='set'){
		return 'ชุด';
	}
}

function onceShowProduct(){
	var product = {};
	var unit;
	var name;
	// var price;
	var firebaseRef=firebase.database().ref("PRODUCT/"+idProduct);
	firebaseRef.once('value').then(function(dataSnapshot){
		if (dataSnapshot.val()!==null){
			var data = dataSnapshot.val();
			unit = chengUnit(data.unit);
			name = data.name;
			var price = data.price;
			var priceAndUnit = 'ทุกสีราคา '+price+' บาท/'+unit;
			$('[class="tagline"]').html(name);
			$('#priceAndUnit').html(priceAndUnit);
		}
	}).then(function(){
		var firebaseRefColor=firebase.database().ref("PRODUCT/"+idProduct+"/COLOR");
		firebaseRefColor.orderByKey().once('value').then(function(dataSnapshot){
			if (dataSnapshot.val()!==null){
				dataSnapshot.forEach(function(childSnapshot){
					var data = childSnapshot.val();
					var color = childSnapshot.key;
					var number = data.number;
					var imgColorUrl = data.img;
					var htmlProduct = createEleProductColor(color,number,unit,imgColorUrl);
					$('#onceProductShowColor').append(htmlProduct);
					disabledInputAndBtn(number,color);
				});
			}
		});
	});
}

function disabledInputAndBtn(number,color){
	if(number===0){
		var message = '***ขออภัยตอนนี้สินค้าหมด';
		$('#alert_'+idProduct+'_'+color).html(message);
		$('#btn_'+idProduct+'_'+color).prop('disabled', true);
		$('#btnLetBuy_'+idProduct+'_'+color).prop('disabled', true);
		$('#inputNumberBuy_'+idProduct+'_'+color).prop('disabled', true);
	}
	
}

function cartOnClick(data){
	firebase.auth().onAuthStateChanged(function(user) {
		if(user){
			var emailStr = user.email;
			var emailSplit = emailStr.split('.');
			var email = emailSplit[0];
			var id = $(data).get(0).id;
		    var idSplit = id.split('_');
		    // var idProduct= idSplit[1];
		    var color = idSplit[2];
		    var number = $('#inputNumberBuy_'+idProduct+'_'+color).val();
		    var firebaseRef=firebase.database().ref("PRODUCT/"+idProduct);
			firebaseRef.once('value').then(function(dataSnapshot){
				var data = dataSnapshot.val();
				price = data.price;
				unit = data.unit;
				name = data.name;
				insertCart(email,name,color,number,unit,price,function(){
					badge(email);
				});
			});
			// window.location = '/'
		}else{
			alert('login เพื่อดำเนินการต่อ หรือสมัครสมาชิกระบบ');
			$('.dropdown-toggle').dropdown('toggle');
		}
	});	
}
function insertCart(email,name,color,number,unit,price,callback){
	var firebaseRefCart=firebase.database().ref("CART/"+email);
	firebaseRefCart.push({
		idProduct: idProduct,
		name: name,
    	color: color,
    	number: number,
    	unit: unit,
    	price: price*number
	});
	callback(); 	
}


function insertStutsPay(email,data){
	var firebaseRefCart=firebase.database().ref("PAY/"+email+"/"+newTime+"/STATUS");
	firebaseRefCart.set({
		status: data
	});
}
function insertPay(email,name,color,number,unit,price,callback){
	var firebaseRefCart=firebase.database().ref("PAY/"+email+"/"+newTime+"/PRODUCT");
	firebaseRefCart.push({
		idProduct: idProduct,
		name: name,
    	color: color,
    	number: number,
    	unit: unit,
    	price: price*number
	});
	callback(); 	
}

function letBeyOnClick(ele){
	firebase.auth().onAuthStateChanged(function(user) {
		if(user){
			var emailStr = user.email;
			var emailSplit = emailStr.split('.');
			var email = emailSplit[0];
			var id = $(ele).get(0).id;
		    var idSplit = id.split('_');
		    // var idProduct = idSplit[1];
		    var color = idSplit[2];
		    var number = $('#inputNumberBuy_'+idProduct+'_'+color).val();
		    var price;
		    var unit;
		    var name;
		    var firebaseRef=firebase.database().ref("PRODUCT/"+idProduct);
				firebaseRef.once('value').then(function(dataSnapshot){
					var data = dataSnapshot.val();
					price = data.price;
					unit = data.unit;
					name = data.name;
					insertPay(email,name,color,number,unit,price,function(){
						insertStutsPay(email,1);
						window.location = '/pay/'+newTime;
					});

				});
			
		}else{
			alert('login เพื่อดำเนินการต่อ หรือสมัครสมาชิกระบบ');
			$('.dropdown-toggle').dropdown('toggle');
		}
	});	
}


function createEleProductColor(color,number,unit,imgColorUrl){
	var numberStr = number.toString();
	var str = 	'<div class="row">'+
        			'<div class="col-sm-7">'+
                		'<img src="'+imgColorUrl+'">'+
            		'</div>'+
        		'<div class="col-sm-5">'+
                '<h2>'+color+'</h2>'+
                '<h2>พร้อมจำหน่าย '+numberStr+' '+unit+'</h2>'+
               	'<br>'+
                '<div class="form-group row">'+
                    '<div class="col-sm-2">'+
                         '<label>เลือก</label>'+
                    '</div>'+
                    '<div class="col-sm-3">'+
                        '<input id="inputNumberBuy_'+idProduct+'_'+color+'" value="1" class="form-control" type="number">'+
                    '</div>'+
                    '<div class="col-sm-6">'+
                        '<label>ชิ้น</label>'+
                    '</div>'+
                '</div>'+
                '<div class="form-group row">'+
                    '<div class="col-sm-12 ">'+
                        '<button id="btn_'+idProduct+'_'+color+'" onclick="cartOnClick(this)" '+
                        'class="btn btn-primary btn-lg">ใส่รถเข็น</button>'+
                        '&nbsp;'+
                        '<button id="btnLetBuy_'+idProduct+'_'+color+'" onclick="letBeyOnClick(this)" '+
                        'class="btn btn-success btn-lg">ซื้อเลย</button>'+
                    '</div><br>'+
                    '<div class="col-sm-12"> '+ 
                    	'<p id="alert_'+idProduct+'_'+color+'" class="text-danger"></p>'+   
                	'</div> '+
                '</div>'+
            '</div>'+
        '</div>'+
        '<hr>';

    return str;
}

window.onload=function(){
	// showdata();
	onceShowProduct();
}