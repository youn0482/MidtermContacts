/****** Contacts Mid Term - Matt Young ***************/

//GLOBAL VARIABLE DECLARATIONS
var loadCount = 0;
var contactsList = [];
var mapOptions = {};


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
    
    //start the readyMap function
    readyMap();
    
    //Set the hammer listener for tap on the modal window back btn
   var backBtn = document.getElementById("svgClose");
   var ht = new Hammer(backBtn);
   ht.on('tap', hideModal);
    
    var exitMap = document.getElementById("svgBack");
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
    
    
    //collect 12 contacts from phone and save to global object array
    for (var i=0;i<12;i++){
        
        //container to hold the numbers object
        var numCollect = [];
        
        //collect all sets of phone numbers for the contact
        for (var y=0;y<contacts[i].phoneNumbers.length;y++){
             
            //get this numbers type and value
            var newType = (contacts[i].phoneNumbers[y].type);
            var newNum = (contacts[i].phoneNumbers[y].value);
            
            //check to see what type and create object accordingly
            if (newType === "mobile"){
                
                var newObj = {mobile:newNum};
                
            }else if (newType === "home"){
                
                 var newObj = {home:newNum};
                
            }else if (newType === "work"){
                
                 var newObj = {work:newNum};
                
            }else{
                
                 var newObj = {other:newNum};
            };
            
            //add number object to container.
            numCollect.push(newObj);
            
        };
        
        
        //fetch new contact from phone's contacts object array
        var newContact = {id:(contacts[i].id), 
                          name:(contacts[i].name.formatted), 
                          numbers:(numCollect), //using the numbers container
                          lat:"",lng:""};
                        
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

        //ev.stopPropagation();
        var nmt = document.getElementById("conName");
        var nLst = document.getElementById("numList");
    
        //display name
        nmt.innerHTML = contactsList[ev.target.id].name;
        //clear previous list of numbers
        nLst.innerHTML = "";
    
        //loop to add all contacts numbers to list
        for (i=0;i<contactsList[ev.target.id].numbers.length;i++){
            
            var li2 = document.createElement("li");
            console.log(JSON.stringify(contactsList[ev.target.id]));
            
            for (prop in contactsList[ev.target.id].numbers[i]) {
                li2.innerHTML = prop + ": " + (contactsList[ev.target.id].numbers[i][prop]);
            }
            
            nLst.appendChild(li2);
        }
        
        //show the modal
        document.querySelector("[data-role=modal]").style.display="block";
        document.querySelector("[data-role=overlay]").style.display="block";

};

function hideModal(ev){
       // ev.stopPropagation();

        console.log(ev);

        document.querySelector("[data-role=modal]").style.display="none";
        document.querySelector("[data-role=overlay]").style.display="none";

};





/*******************************************************
        DYNAMIC MAP FUNCTIONS
**********************************************************/

var map;
var pos;
var long;
var latt;
var currentCon;
var oneMark;
var markerCheck;
var marker;
var infoWindow;


function showMap(ev){
    
    oneMark = true;
    //clear previous marker
    if (marker){
        marker.setMap(null);
    }
    
    //Show the Map
    document.querySelector("[data-role=page]").style.display="none";
    document.querySelector("[data-role=map]").style.display="block";

        //save the ev target Id for further use
        currentCon = ev.target.id;

        //Check to see if contact Location needs to be set or not
        if (contactsList[ev.target.id].lat === "" && contactsList[ev.target.id].lng === ""){
            
                //alert user to double click
                alert("Please double tap on this contacts location.");
                //Add the listener for location set on Doubleclick.
                google.maps.event.addListener(map, 'dblclick', function(event){
                        
                        //set marker check to true for animations sake
                        markerCheck = true;
                        
                        placeMarker(event.latLng);

                });

            
        }else{
        

                //set marker check to false to add animations
                markerCheck = false;
                
            
                var myLatlng = new google.maps.LatLng( contactsList[ev.target.id].lat , contactsList[ev.target.id].lng );
            
                placeMarker(myLatlng);
        };
    
    
};

function readyMap() {
    
    //map options
        var mapOptions = {
            disableDoubleClickZoom: true,
            zoom: 8
        };

        map = new google.maps.Map(document.getElementById('map-canvas'),
          mapOptions);

        // Try HTML5 geolocation
        if(navigator.geolocation) {
            
                navigator.geolocation.getCurrentPosition(function(position) { //success function
                
                    pos = new google.maps.LatLng( position.coords.latitude, position.coords.longitude );
                   
                    map.setCenter(pos);
                    
                }, function() { //geolocation failure function
                    
                        handleNoGeolocation(true);
                });
            
        } else {
            // Browser doesn't support Geolocation
            handleNoGeolocation(false);
        }

};



function placeMarker(location) {
    
    if (oneMark){
        
        oneMark = false;
        
        if (markerCheck){

                marker = new google.maps.Marker({
                  position: location,
                  map: map
                });

                contactsList[currentCon].lat = marker.getPosition().lat();
                contactsList[currentCon].lng = marker.getPosition().lng();

                //update the local storage
                localStorage.setItem("contacts-youn0482", JSON.stringify(contactsList) );

                map.setCenter(location);
            
              
        } else {
            
                marker = new google.maps.Marker({
                        position: location,
                        animation: google.maps.Animation.BOUNCE,
                        map: map
                });
                
           
             map.setCenter(location);
                
        };
        
    };
    
};

function hideMap(ev){
       // ev.stopPropagation();

        

        
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
