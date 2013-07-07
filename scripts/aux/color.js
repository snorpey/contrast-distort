/*global define*/
define(
	[ 'aux/canvas', 'aux/greyscale', 'aux/bresenham', 'aux/blend-rgba' ],
	function( canvas_helper, greyscale, bresenham, blendRGBA )
	{
		var canvas = document.createElement( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );

		var canvas_size = { width: 10, height: 10 };

		var amount;

		var i;
		var j;
		var len;
		var len_2;

		var greyscale_image_data;
		var res_image_data;
		var tmp_image_data;

		function applyFilter( image_data, input, callback )
		{
			amount = input.amount;

			canvas_helper.resize( canvas, image_data );
			canvas_helper.resize( tmp_canvas, image_data );

			drawBackground( tmp_canvas, tmp_ctx, '#fffff' );

			tmp_ctx = tmp_canvas.getContext( '2d' );
			tmp_image_data = tmp_ctx.getImageData( 0, 0, tmp_canvas.width, tmp_canvas.height );

			greyscale_image_data = greyscale( image_data );
			res_image_data = process( image_data, greyscale_image_data, tmp_image_data, amount );

			callback( res_image_data );
		}

		function process( image_data, greyscale_image_data, tmp_image_data, amount )
		{
			// for every px
			// calculate weight ( = greyscale 0 - 255)
			// calculate force
			var pixels = [ ];
			var pixel_index = 0;

			var trails = [ ];

			var gravity = amount * 5;
			var gravity_direction = { x: 0, y: 1 };
			var gravity_amount;

			var trail_pixels;
			var trail_alpha;
			var trail_x;
			var trail_y;
			var trail_index;
			var trail_color_1;

			var src_index;

			console.log( amount );

			len = image_data.data.length;

			for ( i = 0; i < len; i += 4 )
			{
				// gravity = greyscale * gravity
				gravity_amount = parseInt( ( ( 255 - greyscale_image_data.data[i] ) / 255 ) * gravity, 10 );

				pixels[pixel_index] = {
					pos: {
						x: ( i / 4 ) % image_data.width,
						y: Math.floor( ( i / 4 ) / image_data.width )
					},
					gravity: {
						x: gravity_direction.x * gravity_amount,
						y: gravity_direction.y * gravity_amount
					},
					color: [
						image_data.data[i],
						image_data.data[i + 1],
						image_data.data[i + 2],
						image_data.data[i + 3]
					]
				};

				pixels[pixel_index].target = {
					x: pixels[pixel_index].pos.x + pixels[pixel_index].gravity.x,
					y: pixels[pixel_index].pos.y + pixels[pixel_index].gravity.y
				};

				pixels[pixel_index].pos_index = i;
				pixels[pixel_index].target_index = ( image_data.width * pixels[pixel_index].target.y + pixels[pixel_index].target.x ) * 4;

				// get all pixels bewteen the start and the end point
				trail_pixels = bresenham( pixels[pixel_index].pos, pixels[pixel_index].target, 20 );

				len_2 = trail_pixels.length;

				for ( j = 0; j < len_2; j++ )
				{
					trail_x = trail_pixels[j].x;
					trail_y = trail_pixels[j].y;

					// ROWS
					if ( ! trails[trail_y] )
					{
						trails[trail_y] = [ ];
					}

					// COLUMNS
					if ( ! trails[trail_y][trail_x] )
					{
						trails[trail_y][trail_x] = [ 255, 255, 255, 1 ];
					}

					trail_alpha = j / len_2;
					trail_color_1 = [ image_data.data[i], image_data.data[i + 1], image_data.data[i + 2], trail_alpha ];

					trails[trail_y][trail_x] = blendRGBA( trail_color_1, trails[trail_y][trail_x] );
				}

				pixel_index++;
			}

			len = trails.length;

			console.log( 'TWO', trails );

			for ( i = 0; i < len; i++ )
			{
				len_2 = trails[i].length;

				for ( j = 0; j < len_2; j++ )
				{
					trail_index = ( image_data.width * i + j ) * 4;

					if ( trail_index < tmp_image_data.data.length )
					{
						try {
							tmp_image_data.data[trail_index]     = trails[i][j][0];
							tmp_image_data.data[trail_index + 1] = trails[i][j][1];
							tmp_image_data.data[trail_index + 2] = trails[i][j][2];
							tmp_image_data.data[trail_index + 3] = trails[i][j][3];
						}

						catch( e )
						{
							console.log( '#', trails, i, j, trails[i][j] );
							throw e;
						}
					}
				}
			}

			len = pixels.length;

			//console.log( 'THREE', pixels );

			for ( i = 0; i < len; i++ )
			{
				if ( pixels[i].target_index < tmp_image_data.data.length )
				{
					try {
						tmp_image_data.data[pixels[i].target_index]     = pixels[i].color[0];
						tmp_image_data.data[pixels[i].target_index + 1] = pixels[i].color[1];
						tmp_image_data.data[pixels[i].target_index + 2] = pixels[i].color[2];
						tmp_image_data.data[pixels[i].target_index + 3] = pixels[i].color[3];
					}

					catch( e )
					{
						console.log( '##', i, pixels[i], tmp_image_data.data[pixels[i].target_index] );
						throw e;
					}
				}
			}

			return tmp_image_data;
		}

		function drawBackground( canvas, ctx, color )
		{
			ctx.fillStyle = color;
			ctx.fillRect( 0, 0, canvas.width, canvas.height );
		}

		return applyFilter;
	}
);