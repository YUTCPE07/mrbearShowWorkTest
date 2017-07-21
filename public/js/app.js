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

function initApp(){
	var firebaseRef=firebase.database().ref("ADMIN/USER");
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
	  		// $('a[name="login"]').show();
	  		// $('a[name="logout"]').hide();
	  		$('#loginOrlogOut').html(htmlLogin());
	  		$('[name="disableUnAult"]').hide();
	  	}
	});
}

function createElementProduct(id,imgUrl,name,description){
	if(description==''){
		description = '***';
	}
	var htmlImg = document.createElement("img");
	var htmlName = document.createElement("h2");
	var htmlDescript = document.createElement("p");
	var htmlDiv = document.createElement("DIV");

	var textH2 = document.createTextNode(name);
	var textP = document.createTextNode(description);
	htmlDiv.className += "col-sm-6 col-md-4";
	htmlDiv.setAttribute('onclick', 'productOnclick("'+id+'")');
	htmlImg.setAttribute('src', imgUrl);
	htmlImg.className += 'img-circle';

	htmlName.appendChild(textH2);
	htmlDescript.appendChild(textP);
	
	htmlDiv.appendChild(htmlImg);
	htmlDiv.appendChild(htmlName);
	htmlDiv.appendChild(htmlDescript);
	return htmlDiv;
}



function exDel(){
	var firebaseRef=firebase.database().ref("User/user1");
	firebaseRef.remove().then(function(){
		console.log("remove sccuess");
	}).catch(function(err){
		console.log("remove failed:"+err.message);
	});
}

function updateOnclick(){
	var firebaseRef=firebase.database().ref("User/user1");
	firebaseRef.update({
		address: 'updateAdressSir',
		email: 'updateEmailSir',
		pass: 'updatePassSir'
	}).then(function(){
		console.log("update sccuess");
	}).catch(function(err){
		console.log("update failed:"+err.message);
	});
}

function scrollto(id){
    $('html,body').animate({
        scrollTop: $("#"+id).offset().top-100
    },'slow');
}       

function htmlShowFocus(id,name,imgFocus){
	html = '<h1 id="'+id+'" class="tagline"> '+
                '<div class="form-inline">'+name+' '+
                '<button id="btnShowColor'+id+'" onclick="productFocusOnclik(this)" '+
                'class="btn btn-primary btn-lg">เลือกสี</button> '+
                '</div> '+
            '</h1> '+
            '<div class="row text-center">        '+
                '<div class="col-sm-6 col-md-3"> '+
                    '<img src="'+imgFocus.imgFocus1+'"> '+
                '</div> '+
                '<div class="col-sm-6 col-md-3"> '+
                    '<img src="'+imgFocus.imgFocus2+'"> '+
                '</div> '+
                '<div class="col-sm-6 col-md-3"> '+
                    '<img src="'+imgFocus.imgFocus3+'"> '+
                '</div> '+
                '<div class="col-sm-6 col-md-3"> '+
                    '<img src="'+imgFocus.imgFocus4+'"> '+
                '</div> '+
            '</div><br><br> ';
    return html;      
}

function showProduct(){
	var firebaseRef=firebase.database().ref("PRODUCT");
	firebaseRef.once('value').then(function(dataSnapshot){
		var lengthProduct = Object.keys(dataSnapshot.val()).length;
		dataSnapshot.forEach(function(childSnapshot){
			var childData = childSnapshot.val();
			var childKey = childSnapshot.key;
			var html = createElementProduct(childKey,childData.imgUrl,childData.name,childData.description);
			var htmlFocus = htmlShowFocus(childKey,childData.name,childData.imgFocus);
			$('#showFocus').append(htmlFocus);
			$('#showProduct').append(html);
		});
	});
}

function productOnclick(id){
	scrollto(id);
}

function productFocusOnclik(ele){
	var id = $(ele).get(0).id;
	var idProduct = id.split('btnShowColor');
	window.location = "/product/"+idProduct[1];
}

// $( document ).ready(function() {
//     $('#btn|'+name+'|'+color).click(function(data) {
//         var id = $(this).get(0).id;
//         console.log(id)
//     });
// });

window.onload=function(){
	initApp();
	showProduct();
}

