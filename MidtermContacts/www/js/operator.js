/****** Contacts Mid Term - Matt Young ***************/

//GLOBAL VARIABLE DECLARATIONS
var loadCount = 0;
var contactsList = [];
var mapOptions = {};
var long;
var latt;
var currentCon;


//WAIT FOR BOTH DOMCONTENT AND DEVICE TO BE READY THEN START
document.addEventListener("DOMContentLoaded", function(){
    loadCount ++;
    if (loadCount === 2){
        start();
    };
});
document.addEventListener("deviceready",function(){
    loadCount ++;
    if (loadCount === 2){ 
        start();
    };
});




/*************************************************
        START FUNCTION
************************************************/        

function start(){
    
    
    
    //Set the hammer listener for tap on the modal window back btn
   var backBtn = document.getElementById("divClose");
   var ht = new Hammer(backBtn);
   ht.on('tap', hideModal);
    
    var exitMap = document.getElementById("closeMap");
   var ht2 = new Hammer(exitMap);
   ht2.on('tap', hideMap);
    
    
    
    //check for local Storage
    if(localStorage.getItem("contacts-youn0482")){
        //turn the string into a numeric array
        contactsList = JSON.parse(localStorage.getItem("contacts-youn0482"));
        //start the showConLIst function
        showConList();
        
    }else{ //No local storage, collect contacts from phone
        
        if (navigator.contacts){
    
            //set up contacts call.
            var options = new ContactFindOptions();
            options.filter = "";
            options.multiple = true;
            filter = ["displayName"];

            navigator.contacts.find(filter, successF, errorF, options); 
        }; 
    };
  };






/***************************************************
        Collect Contacts and Show Contact List
**************************************************/

function successF(contacts){
    
    console.log(contacts);
    
    //collect 12 contacts from phone and save to global object array
    for (var i=0;i<12;i++){
        
        //fetch new contact from phone's contacts object array
        var newContact = {id:(contacts[i].id), name:(contacts[i].name.formatted), numbers:(contacts[i].phoneNumbers[0].value), lat:"",lng:""};
                        
        //push new contact object onto working array list.
        contactsList.push(newContact); 
    };
    
    
    //set local storage
    localStorage.setItem("contacts-youn0482", JSON.stringify(contactsList) );
    //start the showConLIst function
    showConList();
    
    console.log(contactsList);
    
};


//error function for contact collection
function errorF(){
    console.log("contact error");   
};


 

//SHOW LIST FUNCTION
function showConList(){
    
    var conList = document.getElementById("conList");
    var divsCt = document.getElementById("ctc");
    
    //loop to append the 12 contacts in list form
    for (var i=0;i<12;i++){
        
        var li = document.createElement("li");


        li.setAttribute("id",i);
        li.setAttribute("class", "cons");
        li.innerHTML = contactsList[i].name;
        conList.appendChild(li);
        
    };
   
    //set the hammertime single and double tap event listeners
    var hammertime = new Hammer.Manager(divsCt);
        hammertime.add( new Hammer.Tap({ event: 'doubletap', taps:2}) );
        hammertime.add( new Hammer.Tap({ event: 'singletap'}) );
        hammertime.get('doubletap').recognizeWith('singletap');
        hammertime.get('singletap').requireFailure('doubletap');

        //hammer listener and functino to show modal window
        hammertime.on('singletap', showModal);
        hammertime.on('doubletap', showMap);
    

};




/***********************************
            MODAL WINDOW
************************************/

function showModal(ev){
        alert("hi");

        //ev.stopPropagation();
        var nmt = document.getElementById("conName");
        var nLst = document.getElementById("numList");
        var li2 = document.createElement("li");

        nmt.innerHTML = contactsList[ev.target.id].name;
        li2.innerHTML = contactsList[ev.target.id].numbers;

        //clear previous list and append new numbers
        nLst.innerHTML = "";
        nLst.appendChild(li2);

        console.log(ev);

        document.querySelector("[data-role=modal]").style.display="block";
        document.querySelector("[data-role=overlay]").style.display="block";

};

function hideModal(ev){
       // ev.stopPropagation();

        console.log(ev);
        alert("hideen");

        
        document.querySelector("[data-role=modal]").style.display="none";
        document.querySelector("[data-role=overlay]").style.display="none";

};

/*******************************************************
        DYNAMIC MAP FUNCTIONS
**********************************************************/

var map;

function showMap(ev) {
    
    
  var mapOptions = {
      disableDoubleClickZoom: true,
    zoom: 8
  };
    
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: 'Location found using HTML5.'
      });

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
    
    //Show the Map
    document.querySelector("[data-role=page]").style.display="none";
    document.querySelector("[data-role=map]").style.display="block";
    
    
    
    //Check to see if contact Location needs to be set or not
    if (contactsList[ev.target.id].lat === "" && contactsList[ev.target.id].lng === ""){
        
        google.maps.event.addListener(map, 'dblclick', function(event){
        
            //save the ev target Id for further use
            currentCon = ev.target.id;
            placeMarker(event.latLng);
            
        });
        
        alert("To add " + ev.target.innerHTML + " location, Please double tap on the map.");
    }else{
        
        var myLatlng = new google.maps.LatLng( contactsList[ev.target.id].lat , contactsList[ev.target.id].lng );
        
         placeMarker(myLatlng);
    }
    
    console.log(ev);
    
    

};



function placeMarker(location) {
    
        var marker = new google.maps.Marker({
          position: location,
          map: map
        });

        contactsList[currentCon].lat = marker.getPosition().lat();
        contactsList[currentCon].lng = marker.getPosition().lng();
    
        console.log(contactsList[currentCon].lat);
        console.log(contactsList[currentCon].lng); 

        map.setCenter(location);
}

function hideMap(ev){
       // ev.stopPropagation();

        console.log(ev);
        alert("hideen");

        
    document.querySelector("[data-role=page]").style.display="block";
    document.querySelector("[data-role=map]").style.display="none";
};


function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}
