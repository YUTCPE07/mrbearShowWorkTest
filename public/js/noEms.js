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
          $('#addNoEms').show();
        }
      });
    }); 
      }else{
        $('p[class="navbar-text"]').html('มีบัญชีแล้วหรือยัง?');
        $('a[name="login"]').show();
        $('a[name="logout"]').hide();
        $('[name="disableUnAult"]').hide();
         $('#addNoEms').hide();
      }
});
}

var uploader = $('.progress-bar');
var filebutton = $('input[type="file"]');
var fullNameFile;
var name;
var type;
filebutton.change(function(e){
    auth();
    fullNameFile = getTime();
    name = fullNameFile; 
    var percentage = 0;
    var file = e.target.files[0];
    var arrtype = file.name.split('.');
    fullNameFile = fullNameFile+'.'+arrtype[1];
    type = arrtype[1];
    uploadImg(file,fullNameFile,name,type);
});

function uploadImg(file,fullNameFile,name,type){
  var storageRef = firebase.storage().ref('noEms/'+fullNameFile);
    var task = storageRef.put(file);
    task.on('state_changed',function progress(snapshort){
        percentage = snapshort.bytesTransferred/snapshort.totalBytes*100;
        uploader.html(percentage);
        uploader.css('width', percentage+'%').attr('aria-valuenow', percentage);
    },function error(err){
        console.log(err)
    },function complete(){
        var address = task.snapshot.downloadURL;
        insertDB(name,fullNameFile,address);
    });
}

function insertDB(name,fullNameFile,address){
  var firebaseRef=firebase.database().ref("NOEMS/"+name);
  firebaseRef.set(address).then(function(){
      uploader.html(fullNameFile+" complete");
      getNoEms();
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

function getTime(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = dd+'_'+mm+'_'+yyyy;
    return today;
}

function createHtmlNoEms(key,src){
    var date = key.split("_");
    var dd = date[0];
    var mm = date[1];
    var yyyy = date[2];
    date = dd+'/'+mm+'/'+yyyy; 
    html = '<div class="col-sm-6 col-md-4"> '+
                '<div class="panel panel-primary"> '+
                  '<div class="panel-heading text-center"> '+
                     '<h4>'+date+'</h4> '+
                  '</div> '+
                  '<div class="panel-body"> '+
                     '<img src="'+src+'" width="100%"> '+
                  '</div> '+
                '</div> '+
            '</div>';
    return html;
}


function getNoEms(){
    var firebaseRef=firebase.database().ref("NOEMS");
    firebaseRef.once('value',function(value){
        $('#showNoEms').html('');
        if(value.val()!=null){
              $('#mesLoading').html('กำลังดำเนินการ...');
              value.forEach(function(snapshot){
                  var key = snapshot.key;
                  var src = snapshot.val();
                  var html = createHtmlNoEms(key,src);
                  $('#showNoEms').append(html);
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
    getNoEms();
}

