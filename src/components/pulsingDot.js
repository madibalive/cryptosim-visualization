 
class PulsingDot {

  static defaultColors = {
    outer: {
      r: 255,
      g: 200,
      b: 200,
    },

    inner: {
      r: 255,
      g: 100,
      b: 100,
    },
  }

  constructor(size, map, colors) {
    if (colors === undefined) {
      colors = PulsingDot.defaultColors;
    }
    this.size = size;
    this.width = size;
    this.height = size;
    this.colors = colors;
    this.data = new Uint8Array(size * size * 4);
    this.map = map
  }
    // get rendering context for the map canvas when layer is added to the map
  onAdd() {
    var canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d');
  }

  // called once before every frame where the icon will be used
  render() {
    var duration = 1000;
    var t = (performance.now() % duration) / duration;

    var radius = (this.size / 2) * 0.3;
    var outerRadius = (this.size / 2) * 0.7 * t + radius;
    var context = this.context;

    // draw outer circle
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(
      this.width / 2,
      this.height / 2,
      outerRadius,
      0,
      Math.PI * 2
    );
    // outer circle
    context.fillStyle = `rgba(${this.colors.outer.r}, ${this.colors.outer.g},
                              ${this.colors.outer.b}, ${1 - t})`;
    context.fill();

    // draw inner circle
    context.beginPath();
    context.arc(
      this.width / 2,
      this.height / 2,
      radius,
      0,
      Math.PI * 2
    );
    // inner circle
    context.fillStyle = `rgba(${this.colors.inner.r}, ${this.colors.inner.g},
                              ${this.colors.inner.b}, 1)`;
    context.strokeStyle = 'white';
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // update this image's data with data from the canvas
    this.data = context.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;

    // continuously repaint the map, resulting in the smooth animation of the dot
    this.map.triggerRepaint();

    // return `true` to let the map know that the image was updated
    return true;
  }
};

export default PulsingDot;

