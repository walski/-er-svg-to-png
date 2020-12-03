document.addEventListener("DOMContentLoaded", function() {
  var svg = document.getElementById('svg');
  var canvas = document.getElementById('canvas');
  var controls = document.getElementById('controls');
  var width = document.getElementById('width');
  var height = document.getElementById('height');
  var saveButton = document.getElementById('save-button');
  var widthHeightRatio;
  var preventAutoFieldsUpdates = false;
  var originalFilename;
  var originalSvgSource;

  var preventDefaults = function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.target !== canvas) {
      return;
    }

    switch (e.type) {
    case 'drop':
      canvas.classList.remove('active-drag');
      var file = e.dataTransfer.files[0];
      if (!file || file.type !== 'image/svg+xml') {
        setTimeout(function() {
          alert('Not an SVG file: ' + (file || {}).name);
        }, 20);
        return;
      }

      svg.style.display = 'block';
      document.getElementById('drop-hint').style.display = 'none';
      originalFilename = file.name;
      var reader = new FileReader();
      reader.readAsDataURL(e.dataTransfer.files[0]);
      reader.onload = function() {
        controls.style.display = 'flex';
        originalSvgSource = atob(reader.result.replace(/data:image\/svg\+xml;base64,/, ''));
        svg.src = reader.result;
      }
      break;
    case 'dragover':
    case 'dragenter':
      canvas.classList.add('active-drag');
      break;
    case 'dragleave':
    case 'dragend':
      canvas.classList.remove('active-drag');
      break;
    }
  };

  window.addEventListener('drag', preventDefaults);
  window.addEventListener('dragstart', preventDefaults);
  window.addEventListener('dragend', preventDefaults);
  window.addEventListener('dragover', preventDefaults);
  window.addEventListener('dragenter', preventDefaults);
  window.addEventListener('dragleave', preventDefaults);
  window.addEventListener('drop', preventDefaults);

  var updateHeight = function(e) {
    e.preventDefault();
    if (preventAutoFieldsUpdates) {
      return;
    }
    height.value = parseInt(width.value * widthHeightRatio, 10);
  };

  var updateWidth = function(e) {
    e.preventDefault();
    if (preventAutoFieldsUpdates) {
      return;
    }
    if (e.type === 'keyup' && !e.key.match(/^\d+$/)) {
      return;
    }
    width.value = parseInt(height.value / widthHeightRatio, 10);
  };

  width.addEventListener('change', updateHeight);
  width.addEventListener('keyup', updateHeight);

  height.addEventListener('change', updateWidth);
  height.addEventListener('keyup', updateWidth);

  svg.addEventListener('load', function() {
    widthHeightRatio = 1.0 * svg.height / svg.width;
    preventAutoFieldsUpdates = true;
    width.value = svg.width;
    height.value = svg.height;
    setTimeout(function() { preventAutoFieldsUpdates = false; }, 200);
  });

  var createTransferSvg = function(callback) {
    // Firefox needs explicit dimensions on the SVG root node in order
    // to export it correctly
    var parser = new DOMParser();
    var result = parser.parseFromString(originalSvgSource, 'text/xml');

    var inlineSVG = result.rootElement;
    var viewBox = inlineSVG.attributes.viewBox;

    if (viewBox) {
      var dimensions = viewBox.value.split(' ');
      var viewBoxWidth = parseInt(dimensions[2], 10) - parseInt(dimensions[0], 10);
      var viewBoxHeight = parseInt(dimensions[3], 10) - parseInt(dimensions[1], 10);
      inlineSVG.setAttribute('width', '' + viewBoxWidth + 'px');
      inlineSVG.setAttribute('height', '' + viewBoxHeight + 'px');
    } else {
      inlineSVG.setAttribute('width', '' + width.value + 'px');
      inlineSVG.setAttribute('height', '' + height.value + 'px');
    }

    // convert the SVG to a data uri
    var svg64 = btoa(new XMLSerializer().serializeToString(inlineSVG));
    var image64 = 'data:image/svg+xml;base64,' + svg64;

    // set that as your image source
    var result = new Image();
    result.addEventListener('load', callback);
    result.src = image64;
  }

  saveButton.addEventListener('click', function(e) {
    e.preventDefault();
    var canvasElement = document.createElement('canvas');
    canvasElement.width = width.value;
    canvasElement.height = height.value;
    var ctx = canvasElement.getContext('2d');
    createTransferSvg(function() {
      ctx.drawImage(this, 0, 0, width.value, height.value);
      var a = document.createElement('a');
      a.style.display = 'none';
      a.href = canvasElement.toDataURL("image/png");
      a.download = originalFilename.replace('.svg', '-' + width.value + 'x' + height.value + '.png');
      document.body.appendChild(a);
      a.click();
    });
  });
});
