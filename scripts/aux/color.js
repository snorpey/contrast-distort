/*global define*/
define(
	[ 'aux/canvas', 'aux/greyscale', 'aux/average-rgba', 'aux/blend-rgba' ],
	function( canvas_helper, greyscale, averageRGBA, blendRGBA )
	{
		var canvas = document.createElement( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );

		var amount;
		var grid_size;

		var i, j;
		var len, len_2;

		function applyFilter( image_data, input, callback )
		{
			amount = input.amount;
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
			var tiled_image_data = getTiledImageData( image_data, grid_points, grid_size, grid_size );

			return tiled_image_data;
		}

		function getGridPoints( image_data, tile_width, tile_height )
		{
			var grid_points = [ ];
			var index = 0;
			var x = 0;
			var y = 0;
			var width = image_data.width;
			var height = image_data.height;

			for ( x = 0; x < height; x += tile_height )
			{
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
							data_index : ( x * width + y ) * 4
						};

						index++;
					}
				}
			}

			return grid_points;
		}

		function getTiledImageData( image_data, grid_points, tile_width, tile_height )
		{
			var tile_image_data;
			var average_color;
			var fs;
			var tile_data = { };
			var key;

			len = grid_points.length;

			for ( i = 0; i < len; i++ )
			{
				tile_image_data = ctx.getImageData( grid_points[i].x, grid_points[i].y, tile_width, tile_height );
				average_color = averageRGBA( tile_image_data, 30 );
				fs = 'rgba(' + average_color.join( ', ' ) + ')';

				// order by color for fewer canvas state changes / faster drawing...
				if ( ! tile_data[fs] )
				{
					tile_data[fs] = [ ];
				}

				tile_data[fs].push( grid_points[i] );
			}

			for ( key in tile_data )
			{
				len = tile_data[key].length;

				for ( i = 0; i < len; i++ )
				{
					tmp_ctx.fillStyle = key;
					tmp_ctx.fillRect( tile_data[key][i].x, tile_data[key][i].y, tile_width, tile_height );
				}
			}

			return tmp_ctx.getImageData( 0, 0, image_data.width, image_data.height );
		}

		function drawBackground( canvas, ctx, color )
		{
			ctx.fillStyle = color;
			ctx.fillRect( 0, 0, canvas.width, canvas.height );
		}

		return applyFilter;
	}
);
