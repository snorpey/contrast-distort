/*global define*/
define(
	[ 'aux/canvas', 'aux/greyscale' ],
	function( canvas_helper, greyscale )
	{
		var canvas = document.createElement( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );

		var canvas_size = { width: 10, height: 10 };

		var amount;

		var i;
		var len;

		var greyscale_image_data;
		var res_image_data;
		var tmp_image_data;

		function applyFilter( image_data, input, callback )
		{
			amount = input.amount;

			canvas_helper.resize( canvas, image_data );
			canvas_helper.resize( tmp_canvas, image_data );

			drawBackground( tmp_canvas, tmp_ctx, '#cccccc' );

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
			var gravity = amount;
			var gravity_direction = { x: 0, y: 1 };
			var gravity_amount;

			console.log( amount );

			len = image_data.data.length;

			for ( i = 0; i < image_data.data.length; i += 4 )
			{
				// gravity = greyscale * gravity
				gravity_amount = parseInt( greyscale_image_data.data[i] / 255 * gravity, 10 );

				pixels[pixel_index] = {
					pos: {
						x: i % image_data.width,
						y: Math.floor( i / image_data.width )
					},
					gravity: {
						x: gravity_direction.x * gravity_amount,
						y: gravity_direction.y * gravity_amount
					}
				};

if ( i === 4000 )
{
	console.log( pixels[pixel_index], gravity_amount );
}
				pixel_index++;
			}

			len = pixels.length;

			for ( i = 0; i < len; i++ )
			{
				var x = pixels[i].pos.x + pixels[i].gravity.x;
				var y = pixels[i].pos.y + pixels[i].gravity.y;

				var target_index = tmp_image_data.width * y + x;
				var src_index = image_data.width * pixels[i].pos.y + pixels[i].pos.x;

				if ( target_index < tmp_image_data.data.length )
				{
					tmp_image_data.data[target_index]     = image_data[src_index];
					tmp_image_data.data[target_index + 1] = image_data[src_index + 1];
					tmp_image_data.data[target_index + 2] = image_data[src_index + 2];
					tmp_image_data.data[target_index + 3] = image_data[src_index + 3];
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