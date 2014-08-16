/*global define*/
define(
	[ 'aux/canvas', 'aux/imagedata-contrast' ],
	function( canvas_helper, getImageDataContrast )
	{
		var canvas = document.createElement( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );

		var amount;
		var grid_size;
		var detail;

		var direction = { x: 0, y: 1 };

		var i, j;
		var len, len_2;

		var done;

		function applyFilter( image, input, callback )
		{
			amount      = input.amount;
			grid_size   = input.grid_size;
			detail      = 100 - input.detail;
			direction.x = input.horizontal;
			direction.y = input.vertical;
			done        = callback;

			ctx.clearRect( 0, 0, canvas.width, canvas.height );
			tmp_ctx.clearRect( 0, 0, tmp_canvas.width, tmp_canvas.height );

			canvas_helper.resize( canvas, image );
			canvas_helper.resize( tmp_canvas, image );

			tmp_ctx.drawImage( image, 0, 0 );

			process( image, grid_size, amount );
		}

		function process( image, grid_size, amount )
		{
			var grid_points = getGridPoints( image, grid_size, grid_size );
			var distorted_points = getDistortedPoints( grid_points, grid_size, grid_size );

			len = distorted_points.length;

			for ( i = 0; i < len; i++ )
			{
				processPoint( ctx, image, distorted_points, distorted_points[i], grid_size );
			}

			done( ctx.getImageData( 0, 0, canvas.width, canvas.height ) );
		}

		// by @migurski
		// http://mike.teczno.com/notes/canvas-warp.html
		function processPoint( ctx, image, points, p1, grid_size )
		{
			var p2 = getItemByValue( points, 'row', p1.row + 1, 'column', p1.column );
			var p3 = getItemByValue( points, 'row', p1.row,     'column', p1.column + 1 );
			var p4 = getItemByValue( points, 'row', p1.row + 1, 'column', p1.column + 1 );

			if ( p1 && p2 && p3 && p4 )
			{
				var xm = getLinearSolution( 0, 0, p1.x_end, grid_size, 0, p2.x_end, 0, grid_size, p3.x_end );
				var ym = getLinearSolution( 0, 0, p1.y_end, grid_size, 0, p2.y_end, 0, grid_size, p3.y_end );
				var xn = getLinearSolution( grid_size, grid_size, p4.x_end, grid_size, 0, p2.x_end, 0, grid_size, p3.x_end );
				var yn = getLinearSolution( grid_size, grid_size, p4.y_end, grid_size, 0, p2.y_end, 0, grid_size, p3.y_end );

				ctx.save();
				ctx.setTransform( xm[0], ym[0], xm[1], ym[1], xm[2], ym[2] );
				ctx.beginPath();
				ctx.moveTo( 0, 0 );
				ctx.lineTo( grid_size, 0 );
				ctx.lineTo( 0, grid_size );
				ctx.lineTo( 0, 0 );
				ctx.closePath();
				ctx.fill();
				ctx.clip();
				ctx.drawImage( image, p1.x, p1.y, grid_size, grid_size, 0, 0, grid_size, grid_size );
				ctx.restore();

				ctx.save();
				ctx.setTransform( xn[0], yn[0], xn[1], yn[1], xn[2], yn[2] );
				ctx.beginPath();
				ctx.moveTo( grid_size, grid_size );
				ctx.lineTo( grid_size, 0 );
				ctx.lineTo( 0, grid_size );
				ctx.lineTo( grid_size, grid_size );
				ctx.closePath();
				ctx.fill();
				ctx.clip();
				ctx.drawImage( image, p1.x, p1.y, grid_size, grid_size, 0, 0, grid_size, grid_size );
				ctx.restore();
			}
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

		function getGridPoints( image, tile_width, tile_height )
		{
			var grid_points = [ ];
			var index = 0;
			var x = 0;
			var y = 0;
			var width = image.width + tile_width;
			var height = image.height + tile_height;

			var column = 0;
			var row = 0;

			for ( x = 0; x < width; x += tile_height )
			{
				column = 0;

				for ( y = 0; y < height; y += tile_width )
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
			var cell_contrast;
			var key;
			var distortion;
			var tile_points = [ ];

			len = grid_points.length;

			for ( i = 0; i < len; i++ )
			{
				tile_image_data = tmp_ctx.getImageData( grid_points[i].x, grid_points[i].y, tile_width, tile_height );
				cell_contrast   = getImageDataContrast( tile_image_data, detail );
				distortion      = amount * cell_contrast;

				grid_points[i].image_data = tile_image_data;
				grid_points[i].x_end = parseInt( grid_points[i].x + ( direction.x * distortion ), 10 );
				grid_points[i].y_end = parseInt( grid_points[i].y + ( direction.y * distortion ), 10 );
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
