$(document).ready(function() {
	$('[type=checkbox][protector=true]').click( function(){

		var submitEl = $(this).parents('form').find('[type=submit]');

		if($(this).is(':checked')) {
			$(submitEl).removeAttr('disabled');
		} else {
			$(submitEl).attr({'disabled' : ''});
		}
	})

	$('[type=checkbox][protector=true]')
		.click( function(){

			var submitEl = $(this).parents('form').find('[type=submit]');

			if($(this).is(':checked')) {
				$(submitEl).removeAttr('disabled');
			} else {
				$(submitEl).attr({'disabled' : ''});
			}
		})
		.removeAttr('checked')
		.parents('form').find('[type=submit]').attr({'disabled' : ''});

	$(document).ready(function() {
		$('form.ajax').ajaxForm(function( data ) {
			console.log( data );
		});
	});

	$('textarea.wysihtml').wysihtml5({
		"font-styles": true, //Font styling, e.g. h1, h2, etc. Default true
		"emphasis": true, //Italics, bold, etc. Default true
		"lists": true, //(Un)ordered lists, e.g. Bullets, Numbers. Default true
		"html": false, //Button which allows you to edit the generated HTML. Default false
		"link": true, //Button to insert a link. Default true
		"image": true, //Button to insert an image. Default true,
		"color": false //Button to change color of font
	});
});