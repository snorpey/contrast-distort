/*global define*/
define(
	function()
	{
		var result;
		var delta_x;
		var delta_y;
		var step_x;
		var step_y;
		var sign_dx;
		var sign_dy;
		var until_x;
		var until_y;
		var pos_x;
		var pos_y;
		var e_x;
		var e_y;
		var i;
		var len;
		var add;

		// https://gist.github.com/nikcorg/2323429
		function bresenham( from, to, max )
		{
			result = [ ];

			delta_x = to.x - from.x;
			delta_y = to.y - from.y;

			step_x = Math.min( 1, Math.abs( delta_x / delta_y ) || 0 );
			step_y = Math.min( 1, Math.abs( delta_y / delta_x ) || 0 );

			sign_dx = -1 * ( delta_x / -Math.abs( delta_x ) ) || 1;
			sign_dy = -1 * ( delta_y / -Math.abs( delta_y ) ) || 1;

			until_x = from.x * sign_dx + delta_x * sign_dx;
			until_y = from.y * sign_dy + delta_y * sign_dy;

			pos_x = from.x;
			pos_y = from.y;

			e_x = 0;
			e_y = 0;

			var i, len, add;

			while (
				( pos_x * sign_dx < until_x ) ||
				( pos_y * sign_dy < until_y )
			)
			{
				len = result.length;

				if ( len >= max )
				{
					break;
				}

				add = true;

				for ( i = 0; i < len; i++ )
				{
					if (
						result[i].x === pos_x &&
						result[i].y === pos_y
					)
					{
						add = false;
						break;
					}
				}

				if ( add )
				{
					result[len] = { x: pos_x, y: pos_y };
				}

				e_x += step_x * sign_dx;

				if ( Math.abs( e_x ) > 0.5 )
				{
					pos_x += sign_dx;
					e_x += 1.0 * -sign_dx;
				}

				e_y += step_y * sign_dy;

				if ( Math.abs( e_y ) > 0.5 )
				{
					pos_y += sign_dy;
					e_y += 1.0 * -sign_dy;
				}
			}

			return result;
		}

		return bresenham;
	}
);