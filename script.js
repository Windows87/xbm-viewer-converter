const screen = document.querySelector('#screen');

String.prototype.replaceAll = function(search, replacement) {
  const target = this;
  return target.split(search).join(replacement);
};

String.prototype.toBitmapObject = function() {
  const target = this;
  let bitmapObject = `[${this.split('{')[1].replace('};', ']').replaceAll('\n', '').replaceAll(' ', '').replaceAll('0x', '"0x').replaceAll(',', '",').replace(',]', ']')}`;

  if(bitmapObject[bitmapObject.length - 2] !== '"')
  	bitmapObject = bitmapObject.replace(']', '"]');

  try {
    bitmapObject = JSON.parse(bitmapObject);
    return bitmapObject;
  } catch(error) {
  	return false;
  }
}

function getBitmapInfo(textValue) {
  const valueWords = textValue.split(' ');

  const width = parseInt(valueWords[2], '10');
  const height = parseInt(valueWords[4], '10');
  const bitmapObject = textValue.toBitmapObject();


  if(isNaN(width) || isNaN(height) || !bitmapObject)
  	return false;

  return { width, height, bitmapObject };
}

function getPixelsBlack(bitmapWidth, bitmapHeight, bitmapObject) {
  const pixelsBlack = [];
  let pixel = 0;
  let atualRow = 1;

  for(let bitmapHexAtual = 0; bitmapHexAtual < bitmapObject.length; bitmapHexAtual++) {
  	const bitmapDecimal = Number(bitmapObject[bitmapHexAtual]);
  	const xbmHexValue = xbmValues[bitmapDecimal];

  	for(let c = 0; c < 8; c++) {
  	  const isPixelBlack = xbmHexValue.indexOf(c) !== -1;
  	   
  	  if(isPixelBlack)
  	  	pixelsBlack.push(pixel);

  	  pixel++;

  	  const isNewRow = pixel / (bitmapWidth * atualRow) === 1;

  	  if(isNewRow) {
  	  	atualRow++;
  	  	break;
  	  }	
  	}
  }

  return pixelsBlack;
}

function setScreen(x, y, pixelsBlack) {
  screen.innerHTML = '';

  let pixel = 0;

  for(let c = 0; c < y; c++) {
  	const row = document.createElement('div');

  	row.classList.add('row');

  	screen.appendChild(row);

  	for(let c2 = 0; c2 < x; c2++) {
  	  const isPixelBlack = pixelsBlack.indexOf(pixel) !== -1;
  	  const pixelElement = document.createElement('div');

  	  pixelElement.classList.add('pixel');

  	  if(isPixelBlack)
  	  	pixelElement.classList.add('pixel-black');

  	  row.appendChild(pixelElement);

  	  pixel++;
  	}
  }

  setScreenPixelWidth(x);
}

function setScreenPixelWidth(screenX) {
  const pixelsElements = document.querySelectorAll('.pixel');
  const screenContainerWidth = document.querySelector('#screen-container').offsetWidth / 100 * 50;
  const widthPerPixel = `${screenContainerWidth / screenX}px`;

  pixelsElements.forEach(pixelElement => {
  	pixelElement.style.width = widthPerPixel;
  	pixelElement.style.height = widthPerPixel;
  });
}

function updateScreen(textValue) {
  const bitmap = getBitmapInfo(textValue);

  if(!bitmap)
  	return;

  const pixelsBlack = getPixelsBlack(bitmap.width, bitmap.height, bitmap.bitmapObject);

  window.addEventListener('resize', () => setScreenPixelWidth(bitmap.width));
  setScreen(bitmap.width, bitmap.height, pixelsBlack);
}

function onTextAreaChange(event) {
  const value = event.target.value;
  localStorage.setItem('textarea-value', value);
  updateScreen(value);
}

function start() {
  const xbmTextarea = document.querySelector('#xbm-value-textarea');
  const textValue = localStorage.getItem('textarea-value') || xbmTextarea.value;

  xbmTextarea.value = textValue;

  updateScreen(textValue);
}

start();