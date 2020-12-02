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

  saveButton.addEventListener('click', function(e) {
    e.preventDefault();
    var canvasElement = document.createElement('canvas');
    canvasElement.width = width.value;
    canvasElement.height = height.value;
    var ctx = canvasElement.getContext('2d');
    ctx.drawImage(svg, 0, 0, width.value, height.value);
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = canvasElement.toDataURL("image/png");
    a.download = originalFilename.replace('.svg', '-' + width.value + 'x' + height.value + '.png');
    document.body.appendChild(a);
    a.click();
  });
});
