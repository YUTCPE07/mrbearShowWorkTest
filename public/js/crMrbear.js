function auth(){
	var firebaseRef=firebase.database().ref("ADMIN/USER");
  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          $('p[class="navbar-text"]').html(user.email);
          $('a[name="logout"]').show();
          $('a[name="login"]').hide();
          var arr = user.email.split('.');
      var idUser = arr[0];
          badge(idUser);
          firebaseRef.once('value').then(function(dataSnapshot){
      dataSnapshot.forEach(function(childSnapshot){
        var childData = childSnapshot.val();
        if(childData === user.email){
          $('p[class="navbar-text"]').html(user.email+' <a href="/admin">ADMIN<a>');
          $('#addCrMrbear').show();
        }
      });
    }); 
      }else{
        $('p[class="navbar-text"]').html('มีบัญชีแล้วหรือยัง?');
        $('a[name="login"]').show();
        $('a[name="logout"]').hide();
        $('[name="disableUnAult"]').hide();
        $('#addCrMrbear').hide();
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

var uploader = $('.progress-bar');
var filebutton = $('input[type="file"]');
filebutton.change(function(e){

    var filesArr = e.target.files;
    for (var i = 0; i < filesArr.length; i++){
        console.log(filesArr[i].name);
        var time = new Date().getTime();
        var name = time; 
        var percentage = 0;
        var file = filesArr[i];
        var arrtype = filesArr[i].name.split('.');
        var type = arrtype[1];
        var fullNameFile = name+'.'+type;
        // console.log(file)
        uploadImg(fullNameFile,name,type,file);  
    }  
});

function uploadImg(fullNameFile,name,type,file){
  console.log('uploadImg',fullNameFile,name,type)
    var storageRef = firebase.storage().ref('crMrbear/'+fullNameFile);
    var task = storageRef.put(file);
    task.on('state_changed',function progress(snapshort){
        percentage = snapshort.bytesTransferred/snapshort.totalBytes*100;
        uploader.html(percentage);
        uploader.css('width', percentage+'%').attr('aria-valuenow', percentage);
    },function error(err){
        console.log(err)
    },function complete(){
        var address = task.snapshot.downloadURL;
        insertDB(fullNameFile,name,address);
    });
}

// insertDB();
function insertDB(fullNameFile,name,address){
  var firebaseRef=firebase.database().ref("CR/"+name);
  firebaseRef.set(address).then(function(){
    uploader.html(fullNameFile+" complete");
  });
}



function createHtmlNoEms(i,src){
    html = '<div class="col-sm-6 col-md-4"> '+
                '<div class="panel panel-primary" > '+
                  '<div class="panel-heading "> '+
                     '<h4>'+i+'</h4> '+
                  '</div> '+
                  '<div class="panel-body"> '+
                     '<img src="'+src+'" width="100%" height="450"> '+
                  '</div> '+
                '</div> '+
            '</div>';
    return html;
}


function getCrBrbear(){
  var i = 0;
  $('#showCrMrbear').html('');
  var firebaseRef=firebase.database().ref("CR");
	firebaseRef.once('value',function(value){
		if(value.val()!=null){
			firebaseRef.on('child_added', function(snapshot) {
		  		i++
			    var html = createHtmlNoEms(i,snapshot.val());
			    $('#showCrMrbear').append(html);
			    $('[name="loading"]').hide();
			});
		}else{
			$('[name="loading"]').show();
			$('#mesLoading').html('ไม่มีข้อมูล');
		}
	});
}

window.onload=function(){
	auth();
    getCrBrbear();
}

