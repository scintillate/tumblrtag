//this code attempts to obtain a unique array of tags associated with a tumblr blog
//the program flows like this
// 1)on document ready -> calls getPostCount()
// 2)within getPostCount an ajax is called to get info about the blog, getTags() is called within the callback function named postCountFound
// 3)within getTags, another ajax is fired off to get post information AKA finding your tags
//	 since tumblr only lets 1 request to retrieve 20 posts so we loop until we know all the posts(within ~20, since i dont trust ajax that much) have been accounted for
// 4)since more than 1 callback must run the same code i have placed an if to determine when to generate the html (or you can change it to do something else)
// 5)generate flowers simply sorts your results in descending post count (e.g. apples 6 oranges 3 grapes 2) and generates an simple ul and then returns the whole html as a string
//	 it assumes you have a div with id="taggggs" and replaces the html inside

//global variables

//the name of your page on tumblr where you are displaying your tags (from the end of the URL)
//you can change this to whatever you want to use on your Tumblr
your_pathname = 'tags';

//these are used to determine how to set the font-sizes of the tags in the resulting list of tags
//this way, the most used tags (with the highest usage-count) can have the largest font size
//while the tags you barely use can have the smallest font size
//you can set the boundaries between each category here, based on what suits you and your blog.

threshold_barely = 5;		// tags used under this many times are considered barely-used
threshold_sometimes = 12;	// tags used more than barely, but under this many times, are considered sometimes-used
threshold_frequent = 25;	// tags used more than sometimes, but under this many times, are considered frequently-used
threshold_normal = 50;		// tags used more than frequently, but under this many times, are considered normally-used
// tags used more than normally will be considered always-used

// caseInsensitive:
// if true, all tags will be treated as if they were lower-case (this is how Tumblr seems to treat tags)
// If false, multiple versions of the tag with different capitalizations will be displayed and counted separately.
caseInsensitive = true;

//global counters
totalposts = 0;
totaltags = 0;

//a simple sorting function
function getSortedKeys(obj) {
    var keys = []; 
	for(var key in obj) keys.push(key);
    return keys.sort(function(a,b){return obj[b]-obj[a]});
}

//gets the tags associated with a user url
function getTags(user_url)
{	
	//processed posts counter
	counter = 0;
	
    //make an array to store the tags
	tags = new Array();

	//firefox jquery likes to cache the get req
	//by doing this we force it to load everytime !
	$.ajaxSetup({
	// Disable caching of AJAX responses
		cache: false
	});
	
	//create the tumblr api url
	url = "http://api.tumblr.com/v2/blog/"+user_url+"/posts";
	
	//declare the callback for the tags found
	tagsFound = function(data)
	{
		//console.log(data);
		//process and add the tags into the tags array
		for (var i=0;i<data.response.posts.length;i++){
			for (var j=0;j<data.response.posts[i].tags.length;j++){
				temp_tag = sanitizeTagForList( data.response.posts[i].tags[j] );
				
				if (tags[temp_tag]) {
					tags[temp_tag]++;
				}
				else {
					tags[temp_tag] = 1;
				}
				totaltags++;
			}
		}
		if (counter >= totalposts) {	
			//this is the last part of the code 
			//console.log(tags);
			f = generateFlowers(tags);
			$("#taggggs").html(f);			//you can change how you want this to be done, i was lazy to quick and dirty
		}
	}
	
	//while not all posts are processed
	while (counter < totalposts){
	
		$.ajax({
			type: "GET",
			url : url,
			dataType: "jsonp",
			data: {
				api_key : "p1AWZjPoQfTlOxqFOpHs1Z1WYN0WkHppJ76AQEVmimL2vFLcAR",
				offset : counter,
				jsonp : "tagsFound"
			}
		});
	
		//increment the processed posts counter
		counter += 20
		//console.log(counter);
	}
}

//adjust the tag name so that it can be used in a list of tags to be counted
function sanitizeTagForList(tag_name)
{
	sanitized_tag_name = tag_name;
	
	if( caseInsensitive )
	{
		sanitized_tag_name = sanitized_tag_name.toLowerCase();
	}
	
	// The addition of quotes here avoids problems with reserved words, like "pop"
	// We will need to remove the quotes later.
	sanitized_tag_name = '"' + sanitized_tag_name + '"';
	
	return sanitized_tag_name;
}

//Prepare the tag to be displayed, undoing the weird things we did to sanitize it
function getTagName(t)
{
	tag_name = t;
	
	// Remove the double-quotes from the beginning and end of the tag-name
	// which were added in sanitizeTagForList
	tag_name = tag_name.substring( 1, tag_name.length - 1 );
	
	return tag_name;
}

//adjust the tag name so that it will work as a URL for that tag
function sanitizeTagForURL(tag_name)
{
	sanitized_tag_name = tag_name;

	// replace spaces with hyphens
	sanitized_tag_name = sanitized_tag_name.replace(/\s+/g, '-');
	
	// replace apostrophes with URL encoding
	sanitized_tag_name = sanitized_tag_name.replace(/[']/g, '%27');
	
	return sanitized_tag_name;
}

//generate the pretty html that you'll use on your page
function generateFlowers(tags)
{
	var sum = 0;
	for(key in tags) {
		sum += tags[key]; 
	}
	console.log(sum);
	
	if (sum < totaltags) { console.log('not ready ' + sum + "/" + total); return 'loading' + sum + "/" + total;}
	
	flower = "<ul id='tag_info'>";
	sortedTags = getSortedKeys(tags);
	console.log(sortedTags);	//prints the sorted tags in descending order
	
	for (var i=0;i<sortedTags.length;i++){
		t = sortedTags[i];
      		number = tags[t];
		tag_name = getTagName(t);
		frequency = '';
		
		if (number < threshold_barely) {
		frequency = 'barely';
		}
		else if (number < threshold_sometimes) {
		frequency = 'sometimes';
		}
		else if (number < threshold_frequent) {
		frequency = 'frequent';
		}
		else if (number < threshold_normal) {
		frequency = 'normal';
		}
		else {
		frequency = 'always';
		}
		
		tag_url = "/tagged/" + sanitizeTagForURL(tag_name);
		
		flower += "<li class='tagitem'><a href='" + tag_url + "' class='" + frequency + "'>"+ tag_name + "" + " (" + number + ") </a></li>";
	}
	flower += "</ul>";	
	
	return flower;
}

//gets the userPostCount so we can determine if we have processed all the posts later on
function getPostCount(user_url) {

	$.ajaxSetup({
	// Disable caching of AJAX responses
		cache: false
	});
	
	//create the tumblr api url
	url = "http://api.tumblr.com/v2/blog/"+user_url+"/info";

	//declare our callback function
	postCountFound = function(data)
	{
		totalposts = data.response.blog.posts;
		getTags(user_url);	//call get tags in the callback
	}

	$.ajax({
		type: "GET",
		url : url,
		dataType: "jsonp",
		data: {
			api_key : "p1AWZjPoQfTlOxqFOpHs1Z1WYN0WkHppJ76AQEVmimL2vFLcAR",
			jsonp : "postCountFound"
		}
	});
}

//starts the whole chain, without this block nothing will happen
$(document).ready(function() {
    if (location.pathname == '/' + your_pathname || location.pathname == '/' + your_pathname + '/') {
		user = location.hostname;		//this'll cause the page to autoload the tags for the blog it is placed on
		getPostCount(user);		
	}
});
