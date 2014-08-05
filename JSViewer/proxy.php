<?php
	error_reporting(E_ALL);	

	$serverUrls = array(
		//"<url>[,<token>]"
		//For ex. (secured server): "http://myserver.mycompany.com/arcgis/rest/services,ayn2C2iPvqjeqWoXwV6rjmr43kyo23mhIPnXz2CEiMA6rVu0xR0St8gKsd0olv8a"
		//For ex. (non-secured server): "http://sampleserver1.arcgisonline.com/arcgis/rest/services"
		"http://sampleserver1.arcgisonline.com/arcgis/rest/services",
		"http://sampleserver2.arcgisonline.com/arcgis/rest/services",
		"http://feeds.bbc.co.uk/weather/feeds/rss/",
		"http://code.google.com/",
		"http://earthquake.usgs.gov/eqcenter/catalogs" //NOTE - no comma after the last item
	);

	function proxy_url($url)
	{
		# Some content types (XML variants) are not accepted by browser XML parsing
		# This is a map of types to override the content type to "application/xml"
		$contentTypesToMapToXml = array(
			"application/vnd.google-earth.kml+xml"
		);
		
		# Make sure the args are url encoded
		$matchCount = preg_match("/(.+\?)(.+)/", $url, $matches);
		if ($matchCount > 0) {
			$encodedArgs = urlencode($matches[2]);
			$encodedArgs = str_ireplace("%3d", "=", $encodedArgs);
			$encodedArgs = str_ireplace("%26", "&", $encodedArgs);
			$url = $matches[1] . $encodedArgs;
		}
		#echo "Using cURL to get info from '$url'...<br/>\n";
		$ch = curl_init();  				// initialize curl handle 
		curl_setopt($ch, CURLOPT_URL, $url); 		// set url to post to 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); 	// return into a variable 
		curl_setopt($ch, CURLOPT_TIMEOUT, 60); 		// times out after 4s 
		if ( count($_POST) > 0) {
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);
		}
		
		$content = curl_exec($ch);
		
		$err = curl_error($ch);
		if ( $err == "" ) {
			$info = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
			if ($info) {
				$bChangeType = false;
				foreach ($contentTypesToMapToXml as $knownType) {
					$pos = strpos($info, $knownType);
					if ($pos === false) {}
					else {
						$bChangeType = true;
						break;
					}
				}
				if ($bChangeType) {
					header("Content-type: application/xml");
				}
				else {
					header("Content-type: $info");
				}
			}
			curl_close($ch);
			return $content;
		}
		header('HTTP/1.1 500');
		return $err;
	}
	
	$bAllowed = false;
	$token = "";
	
	$reqValues = array_merge( array_keys($_REQUEST), array_values($_REQUEST) );
	foreach ($reqValues as $rUrl) {
		// Weird PHP behaviour: "." in URL gets changed to "_"
		foreach ($serverUrls as $sUrl) {
			$serverAndToken = split('\s*,\s*', $sUrl);
			$url = $serverAndToken[0];
			if ( count($serverAndToken) > 1 ) {
				$token = $serverAndToken[1];
			}

			// Make a pattern that matches either-or
			$pat = str_replace(".", '[_\.]', $url);
			$pat = "/" . str_replace("/", '\/', $pat) . "/i";
			if (preg_match($pat, $rUrl)) {
				// Substitute the .'s back into the URL
				for ($i = 0; $i < strlen($url); $i++) {
					if (substr($url, $i, 1) == ".") {
						$rUrl = substr_replace($rUrl, ".", $i, 1);
					}
				}
				$bAllowed = true;
				$token = trim( $token );
				break;
			}
		}
		if ($bAllowed) {
			break;
		}
	}
	
	if (!$bAllowed) {
		header('HTTP/1.1 403 Forbidden');
		return;
	}
	
	if (strlen($token) > 0) {
		$rUrl = $rUrl . ( strpos($rUrl, "?") === false ? "?" : "&" ) . "token=" + token; 
	}
	
	echo proxy_url($rUrl);
?>