function monochrome(canvas, x, y, width, height) {
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(x, y, width, height);
  const data = imageData.data;

  const pixelsLength = width * height;

  for(let pixel = 0; pixel < pixelsLength; pixel++) {
  	const pixelRed = data[pixel * 4];
  	const pixelGreen = data[pixel * 4 + 1];
  	const pixelBlue = data[pixel * 4 + 2];
  	const pixelAlpha = data[pixel * 4 + 3]; 

  	if(!pixelAlpha) {
  	  data[pixel * 4] = 255;
  	  data[pixel * 4 + 1] = 255;
  	  data[pixel * 4 + 2] = 255;
  	  data[pixel * 4 + 3] = 1;
  	} else {
  	  const allThem = (pixelRed + pixelGreen + pixelBlue) / 3;

  	  if(allThem <= 128) {
  	    data[pixel * 4] = 0;
  	    data[pixel * 4 + 1] = 0;
  	    data[pixel * 4 + 2] = 0;
  	  } else {
  	    data[pixel * 4] = 255;
  	    data[pixel * 4 + 1] = 255;
  	    data[pixel * 4 + 2] = 255;
      }
    }
  }

  context.putImageData(imageData, 0, 0);
}