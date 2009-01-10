
setInterval ( "recalculate_timestamps()", 10000 );



function relative_time(parsed_date) {
   var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
   var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
   delta = delta + (relative_to.getTimezoneOffset() * 60);
   if (delta < 60) {
     return 'less than a minute ago';
   } else if(delta < 120) {
     return 'a minute ago';
   } else if(delta < (45*60)) {
     return (parseInt(delta / 60)).toString() + ' minutes ago';
   } else if(delta < (90*60)) {
     return 'an hour ago';
   } else if(delta < (24*60*60)) {
     return '' + (parseInt(delta / 3600)).toString() + ' hours ago';
   } else if(delta < (48*60*60)) {
     return '1 day ago';
   } else {
     return (parseInt(delta / 86400)).toString() + ' days ago';
   }
 };



function recalculate_timestamps()
{
	$(".timestamp").each(function(){
		$(this).html(relative_time($(this).attr('title')));
	});
}

function KeyCheck(e)
{
   var KeyID = (window.event) ? event.keyCode : e.keyCode;
   switch(KeyID)
   {

      case 38:
      	alert('up');
      break;

      case 40:
		alert('down');
      break;
   }
}

function string_length_counter(what) 
{
	var str = new String(what.value);
	var len = str.length;
	if (!(len >0))
		len = "0";
	return len;
}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
