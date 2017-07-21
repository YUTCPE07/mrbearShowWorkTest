window.onload=function(){
	firebase.auth().onAuthStateChanged(function(user) {
		if(user){
			showOrderInform();
			showOrderSuccess();
			var firebaseRef=firebase.database().ref("ADMIN/USER");
			firebaseRef.once('value').then(function(dataSnapshot){
				var length = Object.keys(dataSnapshot.val()).length;
				var i = 0;
				var arr = [];
				dataSnapshot.forEach(function(childSnapshot){
					var childData = childSnapshot.val();
					i++;
					// console.log(childData,user.email)
					if(childData === user.email){
						arr.push(childData);
					}
					if(i===length&&arr.length===0){
					// console.log("last",arr)
						getDataHacker(user.email);
					}
				});
			});
		}else{
			getDataHacker('No user');
		}
	});
}

function carteHtmlOrderIform(i,order,date,time,price,email){
	var html = '<div class="panel-body"> '+
                    '<div class="row text-center"> '+
                        '<div class="col-sm-1"><h4>'+i+'</h4></div> '+
                        '<div class="col-sm-3"><h4>'+order+'</h4></div> '+
                        '<div class="col-sm-2"><h4>'+date+'</h4></div> '+
                        '<div class="col-sm-1"><h4>'+time+'</h4></div> '+
                        '<div class="col-sm-2"><h4>'+price+'</h4></div> '+
                        '<div class="col-sm-3 form-group"> '+
                            '<button id="no_'+order+'_'+email+'" onclick="unApproed(this)"'+
                            'class="btn btn-lg btn-danger" >NO</button> '+
                            '<button id="yes_'+order+'_'+email+'" onclick="approed(this)" '+
                            'class="btn btn-lg btn-success " >YES</button> '+
                        '</div> '+
                    '</div> '+
                '</div>';
    return html;
}

function insertSuccess(id,email,callback){
	var getPay=firebase.database().ref("PAY/"+email+'/'+id+'/PRODUCT');
	getPay.once('value').then(function(dataSnapshot){
		dataSnapshot.forEach(function(snapProduct){
			var dataProduct = snapProduct.val();
			var SuccessProduct=firebase.database().ref("SUCCESS/"+id+'/PRODUCT');
			SuccessProduct.push(dataProduct);
			delNumberProduct(dataProduct);
		});
	});

	var getInform=firebase.database().ref("INFORM/"+id);
	getInform.once('value').then(function(dataSnapshot){
		var dataCustomer = dataSnapshot.val();
		// console.log(dataCustomer)
		var SuccessProduct=firebase.database().ref("SUCCESS/"+id+'/CUSTOMER');
		SuccessProduct.set(dataCustomer).then(function(){
			callback();
		});
	});
}

function delNumberProduct(data){
	// console.log(data.idProduct,data.color,data.number)
	var firebaseRef=firebase.database().ref("PRODUCT/"+data.idProduct+'/COLOR/'+data.color+'/number');
	firebaseRef.once('value').then(function(dataSnapshot){
		var numberMaster = dataSnapshot.val()-data.number;
		firebaseRef.set(numberMaster);	
	});

}

function insertStutsPay(data,email,id){
	var firebaseRefCart=firebase.database().ref("PAY/"+email+"/"+id+"/STATUS");
	firebaseRefCart.set({
		status: data
	});
}

function remove(idOrder){
	var firebaseRef=firebase.database().ref("INFORM/"+idOrder);
	firebaseRef.remove().then(function(){
		// console.log("remove sccuess");
	}).catch(function(err){
		// console.log("remove failed:"+err.message);
	});
}

function approed(ele){
	var idFull = $(ele).get(0).id;
	var arr = idFull.split('_');
	var id = arr[1];
	var email = arr[2];
	insertSuccess(id,email,function(){
		insertStutsPay(3,email,id);
		remove(id);
		showOrderInform();
		showOrderSuccess();
	});
}

function unApproed(ele){
	var idFull = $(ele).get(0).id;
	var arr = idFull.split('_');
	var id = arr[1];
	var email = arr[2];
	// console.log(id,email)
	insertStutsPay(4,email,id);
	remove(id);
	showOrderInform();
	showOrderSuccess();	
}

function showOrderInform(){
	var i = 0;
	var firebaseRef=firebase.database().ref("INFORM");
	firebaseRef.once('value').then(function(dataSnapshot){
		$('#showOrderInform').html('');
		if(dataSnapshot.val()!==null){
			dataSnapshot.forEach(function(childSnapshot){
				i++;
				var childData = childSnapshot.val();
				var childKey = childSnapshot.key;
				var html = carteHtmlOrderIform(i,childKey,childData.dateInform,childData.timeInform,
							childData.price,childData.email);
				$('#showOrderInform').append(html);
				$('#nullInform').hide();
			});
		}else{
			$('#nullInform').show();
		}
	});
}

function showOrderSuccess(){
	var i = 0;
	var firebaseRef=firebase.database().ref("SUCCESS");
	firebaseRef.once('value').then(function(dataSnapshot){
		$('#showOrderSucess').html('');
		if(dataSnapshot.val()!==null){
			dataSnapshot.forEach(function(dataSnapOrderId){
			var data = dataSnapOrderId.val();
			var idOrder = dataSnapOrderId.key;
			var email = data.CUSTOMER.email;
			var name = data.CUSTOMER.name;
			var address = data.CUSTOMER.address;
			var tel = data.CUSTOMER.tel;
			var date = data.CUSTOMER.dateInform;
				var getProduct=firebase.database().ref("SUCCESS/"+idOrder+'/PRODUCT');
				var check = 0;
				var htmlAddProduct = ''; 
				getProduct.once('value').then(function(dataSnapProduct){
					var length = Object.keys(dataSnapProduct.val()).length;
					dataSnapProduct.forEach(function(dataProductForeach){
						var product = dataProductForeach.val();
						htmlAddProduct = htmlAddProduct+htmlListProduct(product.name,product.color,product.number,product.unit);
						check++;
						if(check===length){
							i++;
							var html = htmlOrderSuccess(i,date,idOrder,htmlAddProduct,name,address,tel);
							$('#showOrderSucess').append(html);
							$('#nullSuccess').hide();
						}	
					});
				});
			});
		}else{
			$('#nullSuccess').show();
		}
	});
}

function htmlListProduct(product,color,number,unit){
	var html = '<h4>'+product+' '+color+' x'+number+' '+unit+'</h4>';
	return html;
}

function htmlOrderSuccess(i,date,idOrder,htmlAddProduct,name,address,tel){
	var html = '<div class="panel-body"> '+
                    '<div class="row text-center"> '+
                        '<div class="col-sm-1"><h4>'+i+'</h4></div> '+
                        '<div class="col-sm-2"><h4>'+date+'</h4><h4>'+idOrder+'</h4></div> '+
                        '<div class="col-sm-3"> '+htmlAddProduct+'</div> '+
                        '<div class="col-sm-5"> '+
                        '<h4>'+name+'</h4><h4>'+address+'</h4><h4>โทร '+tel+'</h4></div> '+
                        '<div class="col-sm-1"> '+
                        	'<button id="del_'+idOrder+'" onclick="delOrderSuccess(this.id)" class="btn btn-lg btn-block btn-danger">  '+
                        	'<span class="glyphicon glyphicon-trash"></span></button> '+
                        '</div '+
                    '</div> '+
                '</div> ';
    return html;
}

function delOrderSuccess(id){
	var arr = id.split('_');
	var idOrder = arr[1];
	var firebaseRef=firebase.database().ref("SUCCESS/"+idOrder);
	firebaseRef.remove().then(function(){
		console.log('Delect',idOrder)
		showOrderSuccess();
	});
}

function uploadImg(key,file,callback){
	var address;
	if(file===undefined){
		address ='/image/300x300.png';
        callback(address);
	}else{
		var oldname = file.name;
	  	var arrtype = oldname.split('.');
	  	var newname = key+'.'+arrtype[1];
	  	var uploader = $('.progress-bar');
	  	var date = new Date().getTime();
	  	var storageRef = firebase.storage().ref('product/'+date+'/'+newname);
	    var task = storageRef.put(file);
	    task.on('state_changed',function progress(snapshort){
	        percentage = snapshort.bytesTransferred/snapshort.totalBytes*100;
	        uploader.html(percentage);
	        uploader.css('width', percentage+'%').attr('aria-valuenow', percentage);
	    },function error(err){
	        // console.log(err)
	    },function complete(){
			address = task.snapshot.downloadURL;
			callback(address);
		});  
	}
}

function addProductOnclick(){
	
	var name = document.getElementById('inputAddProductName').value;
		var price = document.getElementById('inputAddProductPrice').value;
		var unit = $('#inputAddProductUnit').val();
		var description = document.getElementById('inputAddProductDescription').value;
		var colorBlack = document.getElementById('colorBlack').value;
		var colorRed = document.getElementById('colorRed').value;
		var colorBlue = document.getElementById('colorBlue').value;
		var colorGreen = document.getElementById('colorGreen').value;
		var colorGray = document.getElementById('colorGray').value;
		var colorPink = document.getElementById('colorPink').value;
		var colorTransparent = document.getElementById('colorTransparent').value;
		var colorBlackRed = document.getElementById('colorBlackRed').value;
		var colorBlackGreen = document.getElementById('colorBlackGreen').value;
		var colorBlackPurple = document.getElementById('colorBlackPurple').value;
		var colorBlackYellow = document.getElementById('colorBlackYellow').value;
		var colorBlackOrenge = document.getElementById('colorBlackOrenge').value;
		var colorBlackBluesky = document.getElementById('colorBlackBluesky').value;

	var srcObj = {};
	var img = {};
		img.product = $('#inputAddProductImgUrl').get()[0].files[0];
		img.focus1 = $('#inputAddProductImgFocus1').get()[0].files[0];
		img.focus2 = $('#inputAddProductImgFocus2').get()[0].files[0];
		img.focus3 = $('#inputAddProductImgFocus3').get()[0].files[0];
		img.focus4 = $('#inputAddProductImgFocus4').get()[0].files[0];
		img.black = $('#imgBlack').get()[0].files[0];
		img.red = $('#imgRed').get()[0].files[0];
		img.blue = $('#imgBlue').get()[0].files[0];
		img.green = $('#imgGreen').get()[0].files[0];
		img.gray = $('#imgGray').get()[0].files[0];
		img.pink = $('#imgPink').get()[0].files[0];
		img.transparent = $('#imgTransparent').get()[0].files[0];
		img.blackRed = $('#imgBlackRed').get()[0].files[0];
		img.blackGreen = $('#imgBlackGreen').get()[0].files[0];
		img.blackPurple = $('#imgBlackPurple').get()[0].files[0];
		img.blackYellow = $('#imgBlackYellow').get()[0].files[0];
		img.blackOrenge = $('#imgBlackOrenge').get()[0].files[0];
		img.blackBluesky = $('#imgBlackBluesky').get()[0].files[0];
	
	var i = 0;
	var length = Object.keys(img).length;
	Object.keys(img).forEach(function(snap) {
		
    	var key = snap;
      	var file = img[snap];
      	uploadImg(key,file,function(src){
         	srcObj[key] = src;
         	i++;
         	if(i===length){
         		$('.progress-bar').html('upload complete');
		     	insertProduct(
					name,price,unit,srcObj.product,description,srcObj,srcObj.focus1,srcObj.focus2,srcObj.focus3,srcObj.focus4,
					colorBlack,colorRed,colorBlue,colorGreen,colorGray,colorPink,colorTransparent,
					colorBlackRed,colorBlackGreen,colorBlackPurple,colorBlackYellow,colorBlackOrenge,colorBlackBluesky
				);
      		}
        });
      	  
	});

	
}

function insertProduct(name,price,unit,imgUrl,description,img,focus1,focus2,focus3,focus4,
		colorBlack,colorRed,colorBlue,colorGreen,colorGray,colorPink,colorTransparent,
		colorBlackRed,colorBlackGreen,colorBlackPurple,colorBlackYellow,colorBlackOrenge,colorBlackBluesky){
	
	var color = {};
	color.black = parseInt(colorBlack);
	color.red = parseInt(colorRed);
	color.blue = parseInt(colorBlue);
	color.green = parseInt(colorGreen);
	color.gray = parseInt(colorGray);
	color.pink = parseInt(colorPink);
	color.transparent = parseInt(colorTransparent);
	color.blackRed = parseInt(colorBlackRed);
	color.blackGreen = parseInt(colorBlackGreen);
	color.blackPurple = parseInt(colorBlackPurple);
	color.blackYellow = parseInt(colorBlackYellow);
	color.blackOrenge = parseInt(colorBlackOrenge);
	color.blackBluesky = parseInt(colorBlackBluesky);
	var imgFocus = {};
	imgFocus.imgFocus1 = focus1;
	imgFocus.imgFocus2 = focus2;
	imgFocus.imgFocus3 = focus3;
	imgFocus.imgFocus4 = focus4;
	var time = new Date().getTime();
	var firebaseRef=firebase.database().ref("PRODUCT/"+time);
	firebaseRef.set({
	    name: name,
	    price: parseInt(price),
	    unit: unit,
	    imgUrl: imgUrl,
	    description: description,
	    imgFocus : imgFocus,
	    COLOR : {
	    	black: {
	    		img: img.black,
	    		number: color.black
	    	},
	    	red: {
	    		img: img.red,
	    		number: color.red
	    	},
	    	blue: {
	    		img: img.blue,
	    		number: color.blue
	    	},
	    	green: {
	    		img: img.green,
	    		number: color.green
	    	},
	    	gray: {
	    		img: img.gray,
	    		number: color.gray
	    	},
	    	pink: {
	    		img: img.pink,
	    		number: color.pink
	    	},
	    	transparent: {
	    		img: img.transparent,
	    		number: color.transparent
	    	},
	    	blackRed: {
	    		img: img.blackRed,
	    		number: color.blackRed
	    	},
	    	blackGreen: {
	    		img: img.blackGreen,
	    		number: color.blackGreen
	    	},
	    	blackPurple: {
	    		img: img.blackPurple,
	    		number: color.blackPurple
	    	},
	    	blackYellow: {
	    		img: img.blackYellow,
	    		number: color.blackYellow
	    	},
	    	blackOrenge: {
	    		img: img.blackOrenge,
	    		number: color.blackOrenge
	    	},
	    	blackBluesky: {
	    		img: img.blackBluesky,
	    		number: color.blackBluesky
	    	}

	    }
	}).then(function(){
		alert("sucesss");
	}).catch(function(err){
		alert("error");
		// console.log(err)
	});
}

function getDataHacker(email){
	var firebaseRef=firebase.database().ref('ADMIN/HACKER');
	var date = new Date().toString();
	firebaseRef.push({
	    email: email,
	    date: date
	}).then(function(){
		window.location = "/";
	});
}
