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

			var p1, p2, p3, p4;

			canvas_helper.clear( tmp_canvas, tmp_ctx );
			tmp_ctx.beginPath();

			for ( i = 0; i < distorted_points.length; i++ )
			{
				p1 = distorted_points[i];
				p2 = getItemByValue( distorted_points, 'row', p1.row,     'column', p1.column + 1 );
				p3 = getItemByValue( distorted_points, 'row', p1.row + 1, 'column', p1.column + 1 );
				p4 = getItemByValue( distorted_points, 'row', p1.row + 1, 'column', p1.column );

				if ( p1 && p2 && p3 && p4 )
				{
					//if ( i === 0 )
					//{
						drawCell( tmp_ctx, distorted_points[i].image_data, p1, p2, p3, p4 );
					//}

					tmp_ctx.moveTo( p1.end_x, p1.end_y );
					tmp_ctx.lineTo( p2.end_x, p2.end_y );
					tmp_ctx.lineTo( p3.end_x, p3.end_y );
					tmp_ctx.lineTo( p4.end_x, p4.end_y );
					tmp_ctx.lineTo( p1.end_x, p1.end_y );
				}
			}

			tmp_ctx.stroke();
			tmp_ctx.closePath();

			return tmp_ctx.getImageData( 0, 0, canvas.width, canvas.height );
		}

		// by @canvastag; http://jsdo.it/canvastag/y56M
		function drawCell( ctx, image_data, p1, p2, p3, p4 )
		{
			var xm = getLinearSolution( 0, 0, p1.end_x, image_data.width, 0, p2.end_x, 0, image_data.height, p3.end_x );
			var ym = getLinearSolution( 0, 0, p1.end_y, image_data.width, 0, p2.end_y, 0, image_data.height, p3.end_y );
			var xn = getLinearSolution( image_data.width, image_data.height, p4.end_x, image_data.width, 0, p2.end_x, 0, image_data.height, p3.end_x );
			var yn = getLinearSolution( image_data.width, image_data.height, p4.enx_y, image_data.width, 0, p2.end_y, 0, image_data.height, p3.end_y );

			ctx.save();
			ctx.setTransform( xm[0], ym[0], xm[1], ym[1], xm[2], ym[2] );
			ctx.beginPath();
			ctx.moveTo( 0, 0 );
			ctx.lineTo( image_data.width, 0 );
			ctx.lineTo( 0, image_data.height );
			ctx.lineTo( 0, 0 );
			ctx.closePath();
			ctx.fill();
			ctx.clip();
			ctx.putImageData( image_data, 0, 0 );
			ctx.restore();

			ctx.save();
			ctx.setTransform( xn[0], yn[0], xn[1], yn[1], xn[2], yn[2] );
			ctx.beginPath();
			ctx.moveTo( image_data.width, image_data.height );
			ctx.lineTo( image_data.width, 0 );
			ctx.lineTo( 0, image_data.height );
			ctx.lineTo( image_data.width, image_data.height );
			ctx.closePath();
			ctx.fill();
			ctx.clip();
			ctx.putImageData( image_data, 0, 0 );
			ctx.restore();
		}

		function getLinearSolution( r1, s1, t1, r2, s2, t2, r3, s3, t3 )
		{
			r1 = parseFloat( r1 );
			s1 = parseFloat( s1 );
			t1 = parseFloat( t1 );
			r2 = parseFloat( r2 );
			s2 = parseFloat( s2 );
			t2 = parseFloat( t2 );
			r3 = parseFloat( r3 );
			s3 = parseFloat( s3 );
			t3 = parseFloat( t3 );

			var a = (((t2 - t3) * (s1 - s2)) - ((t1 - t2) * (s2 - s3))) / (((r2 - r3) * (s1 - s2)) - ((r1 - r2) * (s2 - s3)));
			var b = (((t2 - t3) * (r1 - r2)) - ((t1 - t2) * (r2 - r3))) / (((s2 - s3) * (r1 - r2)) - ((s1 - s2) * (r2 - r3)));
			var c = t1 - ( r1 * a ) - ( s1 * b );

			return [ a, b, c ];
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
