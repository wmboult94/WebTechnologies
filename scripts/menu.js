'use strict';

$(function() {

	$(window).ready(function() {
		if ( $(window).width() > 950 ) {
			document.getElementById('nav_toggle').className = "menuItemHide";
			document.getElementById('menu_items').className = "menuItemShow";
		}
		else if ( $(window).width() <= 950) {
			document.getElementById('nav_toggle').className = "menuItemShow";
			document.getElementById('menu_items').className = "menuItemHide";
		}
	})

	$(window).resize(function() {
		if ( $(window).width() > 950 ) {
			document.getElementById('nav_toggle').className = "menuItemHide";
			document.getElementById('menu_items').className = "menuItemShow";
		}
		else if ( $(window).width() <= 950) {
			document.getElementById('nav_toggle').className = "menuItemShow";
			document.getElementById('menu_items').className = "menuItemHide";
		}
	})
});

$(function() {
	// Stick the logo to the top of the window
	var menu = $('#menu_wrapper');
	var logoHomeY = menu.offset().top;
	var isFixed = false;
	var $w = $(window);

	$w.scroll(function() {
	var scrollTop = $w.scrollTop();
	var shouldBeFixed = scrollTop > logoHomeY;
	if (shouldBeFixed && !isFixed) {
		document.getElementById('menu_wrapper').className = "menuFixed";
		// console.log(document.getElementById('nav_toggle').css);
		document.getElementById('menu_items').className = "menuItemHide";
		document.getElementById('nav_toggle').className = "menuItemShow";
		isFixed = true;
	}
	else if (!shouldBeFixed && isFixed)
	{
		document.getElementById('menu_wrapper').className = "menuTop";
		if ( $(window).width() > 950 ) {
			document.getElementById('nav_toggle').className = "menuItemHide";
			document.getElementById('menu_items').className = "menuItemShow";
		}
		// else if ( $(window).width() <= 950) {
		// 	document.getElementById('nav_toggle').className = "menuItemShow";
		// 	document.getElementById('menu_items').className = "menuItemHide";
		// }
		isFixed = false;
	}
	});
});

function openNav() {
	document.getElementById('menu_overlay').className = "navShow";
	document.getElementById('nav_middle').className = "navMiddleShow";
	document.getElementById('close_button').className = "closeButtonOpen";
	document.getElementById('nav_toggle').className = "burgerFadeOut";
}

function closeNav() {
	document.getElementById('menu_overlay').className = "navHidden";
	document.getElementById('nav_middle').className = "navMiddleHidden";
	document.getElementById('close_button').className = "closeButtonClose";
	document.getElementById('nav_toggle').className = "burgerFadeIn";
}
