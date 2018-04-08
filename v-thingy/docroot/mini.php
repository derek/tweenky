

<?

	$query = $_GET['query'];
	switch($_GET['service'])
	{
		default:
		case "twitter":
			$service_id = 1;
			break;
		case "identica":
			$service_id = 2;
			break;
	}
	
?>

<html>
<head>
	<title>Mini-Tweenky: "<?= $query ?>"</title>
	<script type="text/javascript" src="/js/mini.js"></script>
	<script type="text/javascript" src="/js/helpers.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js"></script>
	<script type="text/javascript" src="http://eyebulb.com/dropshadow/jquery.dropshadow.js"></script>
	<script type="text/javascript">
	
		Tweenky.search();
		setInterval ( "recalculate_timestamps()", 30000 );
		//_refresh_timer = setInterval ( "Tweenky.update();", 15000 );
	</script>
	
	<style>
		body{
			background-color: #405565;
			margin:0px;
			padding:6px;
				font-family:	lucida grande, arial, sans-serif;
		}

		a, .pseudolink 		{ color: #DA790B; cursor: pointer; text-decoration: underline;}
		a img				{ border:none; }
		b					{ font-size: 110%; }
		
		.hidden{
			display:none;
		}
		
		#header,
		#tweets{
			background-color: #F7F7F5;
		}
		.tweet{
			clear:both;
			padding:5px 5px 10px 5px;
			border-bottom:solid 1px #405565;
			display:none;
		}
		.tweet-author{
			font-weight:bold;
		}
		.tweet-image{
			height:50px;
			width:50px;
		}
		.tweet-source{
			float:left;
		}
		.tweet-options{
			float:left;
		}
		/* TWEETS */
		.author-image-overlay{
			display:none;
			width:90%;
		}
		.author-image-overlay td{
			background-color:#cccccc;
			font-size:11px;
			cursor: pointer;
			display:none;
		}
		.tweet{
			background:url('http://www.grabup.com/uploads/5131026c3eea526ee7c0b25f15dd6a25.png') repeat-x;
		}

		.tweet-content{
			color:		#000000; 
			font-size:	13px;
			padding:	0px 0px 10px 10px;
		}

		.tweet-footer{
			color:		#999999; 
			font-size:	11px; 
			margin:		5px 0px 0px 0px;
		}
		div.bottom { 
			position: relative ;
			background-color:#FFFFFF;
		               }
		div.bottom div {
			position: fixed ;
			bottom: 0 ;
			left: 0 ;
			right: 0 ;
			padding: 6px ;
			background-color:#405565;
			height:100px;
		}	
		div.bottom textarea {
			width:100%;
			height:70%;
		}
	</style>
</head>
<body>
	<div id="header" class="hidden">
		<div id="update-status" class="rounded section">
			<div class="title right-arrow"> Post a New Tweet</div>
			<div class="innertube hidden">
				<div>
					<textarea style="width:100%; height:100px;" id="new-status" onkeyup="$('#new-status-char-count').html(string_length_counter(this))"></textarea><br />
			
					<span id="new-status-char-count">0</span>/140
					<input type="button" value="Post Update" onclick="update_status($('#new-status').val())" />
				</div>
				<div class="clear-fix"></div>
			</div>
		</div>
	</div>
	<div id='tweets'></div>
	<div class="bottom">
		<div>
			<textarea></textarea>
			<input type="button" value="Update" />
		</div>
	</div>
</body>
</html>