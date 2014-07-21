$(function() {
  
	var showFlag = false;
	var pagetop = $('#pagetop');	
	pagetop.css('bottom', '-50px');
	var showFlag = false;
	
	$(window).scroll(function () {
		if ($(this).scrollTop() > 100) {
			if (showFlag == false) {
				showFlag = true;
				pagetop.stop().animate({'bottom' : '100px'}, 200); 
			}
		} else {
			if (showFlag) {
				showFlag = false;
				pagetop.stop().animate({'bottom' : '-50px'}, 200); 
			}
		}
	});
    pagetop.click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 500);
		return false;
    });
});

