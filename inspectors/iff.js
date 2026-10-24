import BinaryStream from '../binary-stream.js';
var IFF = function(){
	// Detect and Decode IFF Files
	// handles ILBM images, including EHB (Extra Half-Bright) and HAM (Hold and Modify)
	// TODO: Brushes and other masked images

	// image format info on https://en.wikipedia.org/wiki/ILBM

	var me = {
		name: "IFF",
		version: "0.0.1"
	};

	me.parse = function(file,decodeBody){
        file = BinaryStream(file);
        if (file.length < 12 || file.readString(4,0) !== "FORM") throw new Error("Invalid IFF file");
		var img = {
			palette: []
		};
		var index = 12;

		function readChunck(){
			var chunk = {};
			chunk.name = file.readString(4);
			chunk.size = file.readDWord();
			return chunk;
		}

		while (index<file.length-4){
			file.goto(index);
			var chunck = readChunck();
			if (chunck.size > file.length - index - 8) throw new RangeError('Truncated IFF chunk');
			index += chunck.size + 8;
			if (chunck.size%2 === 1) index++;

			switch (chunck.name){
				case "BMHD":
					img.width = file.readWord();
					img.height = file.readWord();
                        if (img.width * img.height > 16777216) throw new RangeError('Image dimensions exceed the decoder limit');
					img.x = file.readShort();
					img.y = file.readShort();
					img.numPlanes = file.readUbyte();
                        if (img.numPlanes > 8) throw new Error('Unsupported image depth');
					img.mask = file.readUbyte();
					img.compression = file.readUbyte();
					img.pad = file.readUbyte();
					img.transparentColor = file.readWord();
					img.xAspect = file.readUbyte();
					img.yAspect = file.readUbyte();
					img.pageWidth = file.readWord();
					img.pageHeight = file.readWord();
					if (img.numPlanes && img.numPlanes<9) img.colors = 1<<img.numPlanes;
					break;
				case "CMAP":
					for (var i = 0, max=chunck.size/3;i<max;i++){
						img.palette.push([file.readUbyte(),file.readUbyte(),file.readUbyte()]);
					}
					break;
				case "CRNG":
					img.colourRange = img.colourRange || [];
					file.readShort(); // padding
					img.colourRange.push({
						rate: file.readShort(),
						flags: file.readShort(),
						low: file.readUbyte(),
						hight: file.readUbyte()
					});
					break;
				case "CAMG":
					var v = file.readLong();
					img.interlaced = v & 0x4;
					img.ehb = v & 0x80;
					img.ham = v & 0x800;
					img.hires = v & 0x8000;
					break;
				case "BODY":
					img.body = [];

					// adjust EHB and HAM palette here as the order of CMAP and CAMG is not defined;
					if (img.ehb){
						for (i = 0;i<32;i++){
							var c = img.palette[i];
							img.palette[i+32] = [c[0]>>1,c[1]>>1,c[2]>>1]
						}
					}
					img.colorPlanes = img.numPlanes;
					if (img.ham){
						img.hamPixels = [];
						img.colorPlanes = 6; // HAM8
						if (img.numPlanes<7) img.colorPlanes = 4; // HAM6
					}

					// some images have bad CAMG blocks?
					if (!img.hires && img.width>=640) img.hires=true;
					if (img.hires && !img.interlaced && img.height>=400) img.interlaced=true;

					if (decodeBody){
						var lineWidth = (img.width + 15) >> 4; // in words
						lineWidth = lineWidth*2; // in bytes
						var pixels = [];

						for (var y = 0; y<img.height; y++){
							pixels[y] = [];
							if (img.ham) img.hamPixels[y] = [];

							for (var plane=0;plane<img.numPlanes;plane++){
								var line = [];
								if (img.compression) {
									// RLE compression
									while (line.length < lineWidth) {
										var b = file.readUbyte();
										if (b === 128) continue;
										if (b > 128) {
											var b2 = file.readUbyte();
											for (var k = 0; k < 257 - b; k++) line.push(b2);
										} else {
											for (k = 0; k <= b; k++) line.push(file.readUbyte());
										}
									}
								}else{
									for (var x = 0; x<lineWidth; x++) line.push(file.readUbyte());
								}

								// add bitplane line to pixel values;
									for (b = 0; b<lineWidth; b++){
										var val = line[b];
										for (i = 7; i >= 0; i--) {
											x = (b*8) + (7-i);
											var bit = val & (1 << i) ? 1 : 0;
											if (plane<img.colorPlanes){
												var p = pixels[y][x] || 0;
												pixels[y][x] = p + (bit<<plane);
											}else{
												p=img.hamPixels[y][x] || 0;
												img.hamPixels[y][x] = p + (bit<<(plane-img.colorPlanes));
											}
										}
									}
							}
						}
						img.pixels = pixels;
					}
					break;
				default:

					break;
			}
		}

		return img;
	};

	me.inspect = function(file){
		var result = "";
		var info = me.parse(file,false);
		if (info.width && info.height) result=info.width+"x"+info.height;
		if (info.ham){
			result+= " HAM" + (info.numPlanes<7?"6":"8");
		}else{
			if (info.colors){
				result+= " " + info.colors + " colours";
			}else if(info.palette){
				result+= "palette with " + info.palette.length + " colours";
			}

		}
		return {info: result, details: info};
	};

	me.toCanvas = function(img){
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var pixelWidth = 1;

		if (img.interlaced && !img.hires){
			canvas.width*=2;
			pixelWidth = 2;
		}

		var ctx = canvas.getContext("2d");
		for (let y=0;y<img.height;y++){
			var prevColor = [0,0,0];
			for (let x=0;x<img.width;x++){
				var pixel = img.pixels[y][x];
				var color = img.palette[pixel] || [0,0,0];
				if(img.ham){
					var modifier = img.hamPixels[y][x];
					if (modifier){
						pixel = pixel << (8-img.colorPlanes); // should the remaining (lower) bits also be filled?
						color = prevColor.slice();
						if (modifier === 1) color[2] = pixel;
						if (modifier === 2) color[0] = pixel;
						if (modifier === 3) color[1] = pixel;
					}
				}
				prevColor = color;
				ctx.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+",1)";
				ctx.fillRect(x*pixelWidth, y, pixelWidth, 1 );
			}
		}
		return canvas;
	};


	return me;
};

export default IFF();