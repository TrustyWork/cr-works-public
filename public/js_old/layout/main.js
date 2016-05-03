$(document).ready(function() {
	function setWrapperVertical() {
		var wrapperHeight = $('#wrapper').outerHeight();
		var htmlHeight = $(window).height();
		var wrapperTopMargin = (htmlHeight - wrapperHeight) / 2

		if(wrapperTopMargin > 0) {
			$('#wrapper').css({marginTop : wrapperTopMargin});
		}
	}
	setWrapperVertical();
});