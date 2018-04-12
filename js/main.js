// Author : Ravichandra K
// Library used : simplePagination.js for pagination, Jquery for DOM manipulation
// API Used : GitHub Search API
// 

$('document').ready(function() {
	
	var requestUrl = "https://api.github.com/search/repositories"
	var endPtUrl;
	var searchItem; // string to be searched
	var initialized = false;
	var sortByCondUrl;
	var dropDwnTxt; // variable to store the user selected sort by menu option
	
	var sortByArr = ["", "stars", "forks", "updated"];
	var orderByTxt = ["Best Match", ["Most Stars", "Least Stars"], ["Most Forks", "Least Forks"], ["Recently Updated", "Least Recently Updated"]];
	
	$('.searchResult').hide();
	
	$("#searchBtn").click(function() {
		
		searchItem = $("#search-box").val();
		endPtUrl = requestUrl + "?q=" + searchItem;
		sortByCondUrl = undefined;
		dropDwnTxt = undefined;
		initialized = false;
		
		processRequest(endPtUrl);
	});
	
	// function to escape html entities
	
	function escapeString(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
	
	// fucntion to handle all the github request
	
	function processRequest($endPtUrl)
	{
		$(".navigationCont").hide();
	
		$.ajax({
			dataType : 'json',
			url: $endPtUrl,
			success: function(data) {
				
				$(".searchResult").empty().show();
				$(".navigationCont").show();
				
				var repoRes = data;
				
				var totResCount = repoRes.total_count;
				var itemsArr = repoRes.items;
				
				var totPages = Math.ceil(totResCount / itemsArr.length);
				
				// only for the first time call this block
				if (!initialized)
				{
					initialized = true;
					
					// show only 1000 pages
					
					if (totPages > 1000)
						totPages = 1000;
					
					
					// initialize pagination block (simplepagination.js library)
					
					$(".navigationCont div").pagination({
						items : totPages,
						itemsOnPage : 30,
						cssStyle : 'compact-theme',
						onInit : paginationReady,
						onPageClick : navigationClick
					});
					
					
					// prepare sort by dropdown
					
					prepareSortDropDown();
				}
				
				var htmlStr = "";
				
				// display count of repository search result
				
				$(".repoResCount").show().html("<h3>" + totResCount.toLocaleString() + " repository results</h3>");
				
				var i;
				
				for (i=0; i<itemsArr.length; i++)
				{
					var repoName = itemsArr[i].full_name;
					var htmlUrl = itemsArr[i].html_url;
					
					var desc = itemsArr[i].description;
					var totForks = itemsArr[i].forks;
					var totStars = itemsArr[i].stargazers_count;
					
					var avatrUrl = itemsArr[i].owner.avatar_url;
					var licenseObj = itemsArr[i].license;
					
					var lang = itemsArr[i].language;
					
					htmlStr += "<div class='col-xs-12 repoContainer'>";
					htmlStr += "<div class='col-xs-8 repositoryInfo'>";
					htmlStr += "<h3><a href='" + htmlUrl + "' target='_blank'>" + repoName + "</a></h3>";
					
					if (desc != null)
						htmlStr += "<p class='text-muted'>" + escapeString(desc) +"</p>";
					
					htmlStr += "<div>";
					
					if (licenseObj != null)
						htmlStr += "<p class='text-muted'>" + licenseObj.name + "</p>";
					
					htmlStr += "</div>";
					htmlStr += "</div>"; <!-- end of 8 column width div -->
					
					htmlStr += "<div class='col-xs-2 languageDiv text-center'>";
					
					if (lang != null)
						htmlStr += "<p><span class='glyphicon glyphicon-tag'></span>&nbsp;" + lang + "</p>";
					
					htmlStr += "</div>"; <!-- end of language div -->
					
					htmlStr += "<div class='col-xs-2 likesDiv text-right'>";
					
					if (totStars > 0)
						htmlStr += "<p><a href='" + htmlUrl + "/stargazers' class='muted-link' target='_blank'><span class='glyphicon glyphicon-star'></span>&nbsp;" + totStars + "</a></p>";
					
					htmlStr += "</div>";
					htmlStr += "</div>";
				}
				
				$('.searchResult').html(htmlStr);
			},
			error: function(xhr, type, exception) {
				console.log(xhr);
			}
		});
	}
	
	
	// function to call when the pagination is initialized
	
	function paginationReady()
	{
		var unOrdlist = $('.navigationCont div').find('ul');
		if(unOrdlist.length > 0)
		{
			$(unOrdlist).addClass("paginationList");
		}
	}
	
	//Function to call when a page is clicked.
	//Page number and event are optional parameters.
	
	function navigationClick(pageNo, evt)
	{
		evt.preventDefault();
		
		if (sortByCondUrl === undefined)
			endPtUrl = requestUrl + "?q=" + searchItem + "&page=" + pageNo;
		else
			endPtUrl = sortByCondUrl + "&page=" + pageNo;
			
		processRequest(endPtUrl);
	}
	
	// function to display sort by dropdown on a page
	
	function prepareSortDropDown()
	{
		var htmlStr = '<div class="btn-group pull-right"><button type="button" class="btn btn-default dropdown-toggle"';
		
		var glyphiconStr = '<span class="glyphicon blankspace"></span>';
		
		if (dropDwnTxt === undefined)
			htmlStr += 'data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Sort : Best Match <span class="caret"></span></button>';
		else
			htmlStr += 'data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Sort : ' + dropDwnTxt + ' <span class="caret"></span></button>';
		
		htmlStr += 	'<ul class="dropdown-menu">';
		htmlStr += 	'<h4 class="dropdown-header">Sort options</h4>';
		
		for (var i=0; i<sortByArr.length; i++)
		{
			htmlStr +=	'<li role="separator" class="divider"></li>';
			
			var ordrBy = "desc";
			
			if (typeof orderByTxt[i] === 'object')
			{
				for (var c=0; c<orderByTxt[i].length; c++)
				{
					if (dropDwnTxt == orderByTxt[i][c])
						htmlStr +=	'<li class="dropdown-menu-link-disabled"><span class="glyphicon glyphicon-ok blankspace"></span><p data-name="' + sortByArr[i] + '" data-orderby="' + ordrBy + '">' + orderByTxt[i][c] + '</p></li>';
					else
						htmlStr +=	'<li class="dropdown-menu-link"><span class="glyphicon blankspace"></span><a href="javascript:void(0)" data-name="' + sortByArr[i] + '" data-orderby="' + ordrBy + '">' + orderByTxt[i][c] + '</a></li>';
					
					
					ordrBy = (ordrBy == "desc") ? "asc" : ordrBy;
					
					if (c!= orderByTxt[i].length - 1)
						htmlStr +=	'<li role="separator" class="divider"></li>';
				}
			}
			else
			{
				// if the user has not selected any sort by option - show default option
				
				if (dropDwnTxt === undefined)
					htmlStr +=	'<li class="dropdown-menu-link-disabled"><span class="glyphicon glyphicon-ok blankspace"></span><p data-name="' + sortByArr[i] + '" data-orderby="' + ordrBy + '">' + orderByTxt[0] + '</p></li>';
				else
				{
					if (dropDwnTxt == orderByTxt[0])
						htmlStr +=	'<li class="dropdown-menu-link-disabled"><span class="glyphicon glyphicon-ok blankspace"></span><p data-name="' + sortByArr[i] + '" data-orderby="' + ordrBy + '">' + orderByTxt[0] + '</p></li>';
					else
						htmlStr +=	'<li class="dropdown-menu-link"><span class="glyphicon blankspace"></span><a href="javascript:void(0)" data-name="' + sortByArr[i] + '" data-orderby="' + ordrBy + '">' + orderByTxt[0] + '</a></li>';
				}
			}
		}
		
		htmlStr +=	'</ul>';
		htmlStr += 	'</div>';
		
		$('.repoSortContainer').show().html(htmlStr);
	}
	
	// function to call on click of each sort by menu option
	
	$(document).on("click", ".dropdown-menu-link", function(e) {
		var selName = $(this).find('a').attr('data-name');
		var orderBy = $(this).find('a').attr('data-orderby');
		
		dropDwnTxt = $(this).find('a').text();
		
		$(this).find(":first-child").addClass("glyphicon-ok");
		
		sortByCondUrl = requestUrl + "?q=" + searchItem + "&sort=" + selName + "&order=" + orderBy;
		
		initialized = false;
		
		processRequest(sortByCondUrl);
	});
});