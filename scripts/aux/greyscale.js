/*global define*/
define(
	function()
	{
		function greyscale( image_data )
		{
			var data = image_data.data;
			var len  = image_data.data.length;
			var i    = 0;
			var brightness;

			for ( i = 0; i < len; i += 4 )
			{
				brightness  = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
				data[i]     = brightness;
				data[i + 1] = brightness;
				data[i + 2] = brightness;
			}

			image_data.data = data;
			return image_data;
		}

		return greyscale;
	}
);