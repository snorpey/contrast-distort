/*global define*/
define(
	[ 'aux/canvas', 'aux/greyscale', 'aux/brightness', 'aux/average-rgba', 'aux/blend-rgba' ],
	function( canvas_helper, greyscale, brightness, averageRGBA, blendRGBA )
	{
		var canvas = document.createElement( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );

		var amount;
		var grid_size;

		var direction = { x: 0, y: 1 };

		var i, j;
		var len, len_2;

		function applyFilter( image_data, input, callback )
		{
			amount = input.amount / 100;
			grid_size = input.grid_size;

			canvas_helper.resize( canvas, image_data );
			canvas_helper.resize( tmp_canvas, image_data );

			ctx.putImageData( image_data, 0, 0 );

			var res_image_data = process( image_data, amount );

			callback( res_image_data );
		}

		function process( image_data, amount )
		{
			var width = image_data.width;
			var height = image_data.height;
			var grid_points = getGridPoints( image_data, grid_size, grid_size );
			var distorted_points = getDistortedPoints( grid_points, grid_size, grid_size );

			var p_1, p_2, p_3, p_4;

			canvas_helper.clear( tmp_canvas, tmp_ctx );
			tmp_ctx.beginPath();

			for ( i = 0; i < distorted_points.length; i++ )
			{
				p_1 = distorted_points[i];
				p_2 = getItemByValue( distorted_points, 'row', p_1.row,     'column', p_1.column + 1 );
				p_3 = getItemByValue( distorted_points, 'row', p_1.row + 1, 'column', p_1.column + 1 );
				p_4 = getItemByValue( distorted_points, 'row', p_1.row + 1, 'column', p_1.column );

				if ( p_1 && p_2 && p_3 && p_4 )
				{
					tmp_ctx.moveTo( p_1.end_x, p_1.end_y );
					tmp_ctx.lineTo( p_2.end_x, p_2.end_y );
					tmp_ctx.lineTo( p_3.end_x, p_3.end_y );
					tmp_ctx.lineTo( p_4.end_x, p_4.end_y );
					tmp_ctx.lineTo( p_1.end_x, p_1.end_y );
				}
			}

			tmp_ctx.stroke();
			tmp_ctx.closePath();

			return tmp_ctx.getImageData( 0, 0, canvas.width, canvas.height );
		}

		function getGridPoints( image_data, tile_width, tile_height )
		{
			var grid_points = [ ];
			var index = 0;
			var x = 0;
			var y = 0;
			var width = image_data.width;
			var height = image_data.height;
			var column = 0;
			var row = 0;

			for ( x = 0; x < height; x += tile_height )
			{
				column = 0;

				for ( y = 0; y < width; y += tile_width )
				{
					if (
						x + tile_width < width &&
						y + tile_height < height
					)
					{
						grid_points[index] = {
							x          : x,
							y          : y,
							column     : column,
							row        : row,
							data_index : ( x * width + y ) * 4
						};

						index++;
					}

					column++;
				}

				row++;
			}

			grid_points.rows = row;
			grid_points.columns = column;

			return grid_points;
		}

		function getDistortedPoints( grid_points, tile_width, tile_height )
		{
			var tile_image_data;
			var average_color;
			var bright;
			var key;
			var distortion;
			var tile_points = [ ];

			len = grid_points.length;

			for ( i = 0; i < len; i++ )
			{
				tile_image_data = ctx.getImageData( grid_points[i].x, grid_points[i].y, tile_width, tile_height );
				average_color   = averageRGBA( tile_image_data, 30 );
				bright          = brightness( average_color );
				distortion      = amount * bright;

				if ( i === 30 )
				{
					console.log( average_color, bright, distortion );
				}

				grid_points[i].image_data = tile_image_data;
				grid_points[i].end_x = grid_points[i].x + ( direction.x * distortion );
				grid_points[i].end_y = grid_points[i].y + ( direction.y * distortion );
			}

			return grid_points;
		}

		function drawBackground( canvas, ctx, color )
		{
			ctx.fillStyle = color;
			ctx.fillRect( 0, 0, canvas.width, canvas.height );
		}

		function getItemByValue( items, key, value, key_2, value_2 )
		{
			var result;

			len_2 = items.length;

			for ( j = 0; j < len_2; j++ )
			{
				if (
					items[j][key] === value &&
					items[j][key_2] === value_2
				)
				{
					result = items[j];
					break;
				}
			}

			return result;
		}

		return applyFilter;
	}
);
