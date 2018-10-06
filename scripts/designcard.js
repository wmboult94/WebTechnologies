'use strict';

function loadImage() {
	var client = filestack.init('AEdJBSGQOAW4Zsr5MYVADz');
	client.pick({
		accept: 'image/*',
		maxFiles: 1,
		disableTransformer: true,
		fromSources: ['local_file_system','facebook','imagesearch','webcam']
	}).then(function(result) {
		// console.log(result);
		var link = result.filesUploaded[0].url;
		// change picture
		var img = document.getElementById("image");
		// console.log(link);
		// console.log(img);
		img.src = link;
		document.getElementById("bottom_buttons").className = "showImageControls"
	});
}

function changeColor(e) {
	// console.log(e.className.split(" ")[1]);
	var color_class = e.className.split(" ")[1];
	document.getElementById('card_image').className = color_class;
}

$(function() {

	$('#user_image').draggable();

	// setup panzoom
	$('.panzoom').panzoom({
			$zoomIn: $("#zoom_in"),
			$zoomOut: $("#zoom_out"),
			$reset: $("#reset"),
			$zoomRange: $("#zoom_range"),
			startTransform: 'scale(0.8)',
			// increment: 0.1,
			// minScale: 0.5,
			// contain: 'automatic'
	});

});

// function saveImage() {
// 	console.log(document.body);
// 	html2canvas([document.getElementById('card_image')], {
// 		onrendered: function(canvas) {
// 			// theCanvas = canvas;
// 			var img = canvas.toDataURL("image/png");
// 		}
// 	});
// }
