var lastLoadedPostID = 0;

function getData() {
	//reading data
	if (localStorage.getItem("posts") === null) {
		$.when(loadPosts(), loadComments(), loadUsers()).done(function (resp1, resp2, resp3) {
			displayData();
		});
	} else
		displayData();
}

function displayData() {
	//display data
	$("#fetch").hide();

	posts = JSON.parse(localStorage.posts);
	len = posts.length;
	var maxPostsToLoad = lastLoadedPostID + 21;

	var dv = "";
	for (var i = 0; i < len; i++) {
		if (posts[i].id < maxPostsToLoad) {
			var name = getPostUser(posts[i].userId);
			dv += `<div id="div_details_${posts[i].id}" style="border: 2px red;">
        <h4>Name: ${name}</h4>
        <h4>Title: ${posts[i].title}</h4>
        <h4>Description: ${posts[i].body}</h4>
        <button id="view_details_${posts[i].id}">View comments</button>
		<button id="crt_details_${posts[i].id}">Create comments</button>
		<button id="btn-like${posts[i].id}">Like Post</button>
		<button id="delete_post_${posts[i].id}">Delete Post</button>
        </div>`;
			lastLoadedPostID++;
		}

	}

	jQuery('#tmp').html(dv);
}

function loadPosts() {
	return $.getJSON("https://jsonplaceholder.typicode.com/posts", function (data) {
		localStorage.setItem('posts', JSON.stringify(data));
	});
}

function loadComments() {
	return $.getJSON("https://jsonplaceholder.typicode.com/comments", function (data) {
		localStorage.setItem('comments', JSON.stringify(data));
	});
}

function loadUsers() {
	return $.getJSON("https://jsonplaceholder.typicode.com/users", function (data) {
		localStorage.setItem('users', JSON.stringify(data));
	});
}

function getComments(postId) {
	var userComm = [];
	var commm = JSON.parse(localStorage.comments);
	var len = commm.length;
	for (var i = 0; i < len; i++) {
		if (commm[i].postId == postId) {
			userComm.push(commm[i]);
		}
	}
	return userComm;
}

function getPostUser(val) {
	var posts = JSON.parse(localStorage.users);

	var len = posts.length;
	for (var i = 0; i < len; i++) {
		if (posts[i].id == val) {
			return posts[i].name;
		}
	}
	return "unknown";
}

$.ajaxSetup({
	type: "GET",
	data: {},
	dataType: 'json',
	xhrFields: {
		withCredentials: true
	},
	crossDomain: true
});



//from top + height >= body last height
$(window).scroll(function () {
	if ($(window).scrollTop() + $(window).height() >= $("body").height()) {
		displayData();
	}
});
//taking posts from localStorage and looping over posts array stored in local storage and delete the post which we want to delete nd put back to local storage
jQuery(document).on('click', 'button[id^="delete_post_"]', function () {
	var id = jQuery(this).attr('id');
	id = id.replace('delete_post_', '');
	posts = JSON.parse(localStorage.posts);
	$("#div_details_" + id).remove();
	$.each(posts, function (i, item) {
		if (item.id == id) {
			posts.splice(i, 1);
			return false;
		}
	});
	localStorage.posts = JSON.stringify(posts);
});

jQuery(document).on('click', 'button[id^="view_details_"]', function () {
	var dcom = "";
	var post_id = jQuery(this).attr('id');
	post_id = post_id.replace('view_details_', '');
	var com = getComments(post_id);
	for (var i = 0; i < com.length; i++) {
		dcom += `<div id="comment_${post_id}_${com[i].id}" style="border: 1px solid black;">
        <h5>Comment: ${com[i].body}</h5>
        <button id="comment_delete_${post_id}_${com[i].id}">Delete Comment</button>
        </div>`;
	}
	jQuery('#div_details_' + post_id).append(dcom);//button view deletion
	jQuery(this).remove();
});
jQuery(document).on('click', 'button[id^="btn-like"]',function()
{
   $(this).html("Liked")
   $(this).css({color:"blue"})
});

jQuery(document).on('click', 'button[id^="comment_delete_"]', function () {
	var id = jQuery(this).attr('id');
	id = id.replace('comment_delete_', '');
	id = id.split("_");//to get comment id
	id = id[1];
	comments = JSON.parse(localStorage.comments);
	$("#div_details_" + id).remove();
	$.each(comments, function (i, item) {
		if (item.id == id) {
			comments.splice(i, 1);
			return false;
		}
	});
	localStorage.comments = JSON.stringify(comments);
	jQuery(this).parent().remove();//to delete the div of the comment
});

jQuery(document).on('click', 'button[id^="crt_details_"]', function () {
	//alert('need to add code to create comment');
	var post_id = jQuery(this).attr('id');
	post_id = post_id.replace('crt_details_', '');
	var ip = "";
	ip = `<div id = "'+post_id+'comment_submit__" style="border: 1px solid black;">
       <input type="text" name="name" id="comment_name_${post_id}" placeholder="Name">
	   <textarea rows="4" cols="50" name="body" id="comment_body_${post_id}" placeholder="Body">
	   </textarea>
       <button id="comment_submit_${post_id}">Submit comments</button>
       </div>`;
	jQuery('#div_details_' + post_id).append($(ip));

});

jQuery(document).on('click', 'button[id^="comment_submit_"]', function () {

	var id = jQuery(this).attr('id');
	var nameId = id.replace('submit', 'name');
	var emailId = id.replace('submit', 'email');
	var bodyId = id.replace('submit', 'body');

	var comments = JSON.parse(localStorage.comments);
	var len = comments.length;

	var res = Math.max.apply(Math, comments.map(function (o) {
				return o.id;
			}))
	var commentObj = {
		"postId": id.replace('comment_submit_', ''),
		"id": res + 1,
		"name": jQuery('#' + nameId).val(),
		"email": jQuery('#' + emailId).val(),
		"body": jQuery('#' + bodyId).val()
	};
	comments.push(commentObj);
	localStorage.comments = JSON.stringify(comments);
	var genDivId = 'div_details_' + id.replace('comment_submit_', '');
	var dispComm = `<div style="border: 1px solid black;">
        <h5>Comment: ${jQuery('#'+bodyId).val()}</h5>
        <button id="comment_delete_${commentObj.postId}_${commentObj.id}">Delete Comment</button>
		</div>`;
	jQuery('#' + genDivId).append(dispComm);
	jQuery(this).parent().remove();// to remove the form
});



