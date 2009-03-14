
		<div style="text-align:center;">
			<h1 style="text-align:left;">What's on your mind?</h1>
			<textarea style="width:99%; height:200px; font-size:28px;" onKeyDown="textCounter(this)" onKeyUp="textCounter(this)"><?= $status ?></textarea>
			<div style="text-align:left; float:left;"><input type="submit" value="Send" style=" font-size:16px;"></div>
			<div style="text-align:right; float:right; font-size:26px;" id="character_count">0</div>
		</div>
		<div style="clear:both"></div>
		<br />
		<h3>Services</h3>
		<ul>
			<li>
				<span class="pseudolink" onclick="$('#tiny-info').toggle();">TinyURL</span>
				<div id="tiny-info" style="display:none">
					URL: <input type="text"><input type="button" value="Shorten URL">
				</div>	
			</li>
			<li>
				<span class="pseudolink" onclick="$('#twitpic-info').toggle();">TwitPic</span>
				<div id="twitpic-info" style="display:none">
					File: <input type="file"> <span class="small">Picture will be uploaded when posting tweet</span>
				</div>	
			</li>
		</ul>
