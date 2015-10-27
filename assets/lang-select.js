$(function(){
    console.log('adding lang select');

    $('div.selections a').each(function(ix, val){
        var $val = $(val);
	    var toSelect = $val.text();
    	console.log('setting up ' + toSelect);
	    $val.click(function(e){
	        $('div.selections a.selection.active').each(function(ix, iv){
	            $(iv).removeClass('active');
            });
	        $val.addClass('active');
    		$('.code').each(function(ix, iv){
	    		$(iv).hide();
		    });
    		$('.'+toSelect).each(function(ix, iv){
	    		$(iv).show();
		    });
    	});
    });

    var defaultLanguage = $('div.selections a').first().text();
    console.log($('div.selections a').first().text());
     console.log('default lang: ' + defaultLanguage);
    $('.'+defaultLanguage).each(function(ix, iv){
        $(iv).show();
    });
    $('div.selections a').first().addClass('active');
});
