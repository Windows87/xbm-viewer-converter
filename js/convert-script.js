function onConvertButtonClick() {
  const convertInputFile = document.querySelector('#convert-image-to-xbm-input-file');
  convertInputFile.click();
}

function reset() {
  const xbmExample = `#define logo_width 30
#define logo_height 30
static unsigned char logo_bits[] = {
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };`; 

  updateTextarea(xbmExample);
  updateScreen(xbmExample);
}

function onDownloadFileClick() {
  const xbmText = document.querySelector('#xbm-value-textarea').value;
  const xbmTextWords = xbmText.split(' ');
  const filename = xbmTextWords[1].split('_width')[0];

  download(`${filename}.xbm`, xbmText);
}

function onConvertInputFileChange(event) {
  const image = event.target.files[0];

  if(!image)
  	return;

  showImageInCanvas(image);
}

function showImageInCanvas(image) {
  const img = new Image();
  const canvas = document.querySelector('#convert-image-to-xbm-canvas');
  const context = canvas.getContext('2d');
  const reader = new FileReader();

  const convertForm = document.querySelector('#convert-image-to-xbm-form');
  const resizeWidthInput = document.querySelector('#convert-image-to-xbm-width-input');
  const resizeHeightInput = document.querySelector('#convert-image-to-xbm-height-input');

  reader.readAsDataURL(image);

  reader.onload = event => {
  	if(event.target.readyState !== FileReader.DONE)
  	  return;

  	img.onload = () => {
  	  let width = 300;
  	  
  	  if(img.width < width)
  	  	width = img.width;

  	  const height = (width * img.height) / img.width;

  	  resizeWidthInput.value = img.width;
  	  resizeHeightInput.value = img.height;

  	  context.clearRect(0, 0, canvas.width, canvas.height);
  	  canvas.width = width;
  	  canvas.height = height;

  	  context.drawImage(img, 0, 0, width, height);

  	  monochrome(canvas, 0, 0, width, height);
  	  openConvertContainer();
  	}

  	convertForm.onsubmit = event => onConvertFormSubmit(event, image, img);

  	img.src = event.target.result;
  }
}

function onConvertFormSubmit(event, imageFile, img) {
  event.preventDefault();

  const downloadButton = document.querySelector('#download-file-button');
  const resizeWidthInput = document.querySelector('#convert-image-to-xbm-width-input');
  const resizeHeightInput = document.querySelector('#convert-image-to-xbm-height-input');

  const fileName = imageFile.name.split('.')[0].replaceAll(' ', '_');
  const width = resizeWidthInput.value;
  const height = resizeHeightInput.value;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  context.drawImage(img, 0, 0, width, height);
  monochrome(canvas, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  let xbmText = '';
  let pixel = 0;
  let atualRow = 1;
  let atualHex = 0;

  xbmText += `#define ${fileName}_width ${width}\n`;
  xbmText += `#define ${fileName}_height ${height}\n`;
  xbmText += `static unsigned char ${fileName}_bits[] = {\n`;

  for(let c = 0; c < height; c++) {
  	for(let c2 = 0; c2 < width / 8; c2++) {
  	  const hexBits = [];

  	  for(let c3 = 0; c3 < 8; c3++) {
  	  	const pixelIsBlack = !(data[pixel * 4]);

  	  	if(pixelIsBlack)
  	  	  hexBits.push(c3);

  	  	pixel++;

  	    const isNewRow = pixel / (width * atualRow) === 1;

  	    if(isNewRow) {
  	  	  atualRow++;
  	  	  break;
  	    }	
  	  }

  	  for(let c4 = 0; c4 < 256; c4++) {
  	    if(JSON.stringify(xbmValues[String(c4)]) === JSON.stringify(hexBits))
  	      xbmText += `0x${toHex(c4)}, `;
  	  }

  	  atualHex++;

  	  if(atualHex % 12 === 0)
  	    xbmText += `\n  `;  	  
  	}
  }

  xbmText += `};`;

  updateScreen(xbmText);
  updateTextarea(xbmText);
  closeConvertContainer();

  downloadButton.onclick = () => onDownloadFileClick(`${fileName}.xbm`);
}

function openConvertContainer() {
  const convertContainer = document.querySelector('#convert-image-to-xbm-container');
  convertContainer.style.display = 'flex';
}

function closeConvertContainer() {
  const convertContainer = document.querySelector('#convert-image-to-xbm-container');
  convertContainer.style.display = 'none';	
}

function toHex(d) {
  return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}

function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);


  element.click();
}