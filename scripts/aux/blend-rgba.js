/*global define*/
define(
	function()
	{
		var result = { r: 0, g: 0, b: 0, a: 0 };
		var red_1, red_2, red_result;
		var green_1, green_2, green_result;
		var blue_1, blue_2, blue_result;
		var alpha_1, alpha_2, alpha_result;
		var type = 'array';

		//http://stackoverflow.com/questions/10781953/determine-rgba-colour-received-by-combining-two-colours
		function blendRGBA( color_1, color_2 )
		{
			if ( typeof color_1.r !== 'undefined' )
			{
				red_1   = color_1.r;
				red_2   = color_2.r;
				green_1 = color_1.g;
				green_2 = color_2.g;
				blue_1  = color_1.b;
				blue_2  = color_2.b;
				alpha_1 = color_1.a;
				alpha_2 = color_2.a;
				type = 'short';
			}

			if ( typeof color_1.red !== 'undefined' )
			{
				red_1   = color_1.red;
				red_2   = color_2.red;
				green_1 = color_1.green;
				green_2 = color_2.green;
				blue_1  = color_1.blue;
				blue_2  = color_2.blue;
				alpha_1 = color_1.alpha;
				alpha_2 = color_2.alpha;
				type = 'long';
			}

			if ( typeof color_1[0] !== 'undefined' )
				{
				red_1   = color_1[0];
				red_2   = color_2[0];
				green_1 = color_1[1];
				green_2 = color_2[1];
				blue_1  = color_1[2];
				blue_2  = color_2[2];
				alpha_1 = color_1[3];
				alpha_2 = color_2[3];
				type = 'array';
			}

			alpha_result = alpha_1 + alpha_2 * ( 1 - alpha_1 );
			red_result   = red_1 * alpha_1 + red_2 * alpha_2 * ( 1 - alpha_1 ) / alpha_result;
			green_result = green_1 * alpha_1 + green_2 * alpha_2 * ( 1 - alpha_1 ) / alpha_result;
			blue_result  = blue_1 * alpha_1 + blue_2 * alpha_2 * ( 1 - alpha_1 ) / alpha_result;

			if ( type === 'array' )
			{
				result = [ red_result, green_result, blue_result, alpha_result ];
			}

			if ( type === 'short' )
			{
				result = {
					r: red_result,
					g: green_result,
					b: blue_result,
					a: alpha_result
				};
			}

			if ( type === 'long' )
			{
				result = {
					red: red_result,
					green: green_result,
					blue: blue_result,
					alpha: alpha_result
				};
			}

			return result;
		}

		return blendRGBA;
	}
);