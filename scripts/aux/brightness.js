/*global define*/
define(
	function()
	{
		function brightness( color )
		{
			// (R+R+B+G+G+G)/6
			return ( color[0] + color[0] + color[1] + color[2] + color[2] + color[2] ) / 6;
		}

		return brightness;
	}
);