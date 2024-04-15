import React from "react";


class Color {

    constructor(hue = null, saturation = null, brightness = null,
               red = null, green = null, blue = null,
               hex = null,
               alpha = null) {

        // If the argument for alpha is supplied and valid...
        if (alpha != null && !isNaN(alpha) && alpha >= 0 && alpha <= 1) {
            this.alpha = alpha;
        // Otherwise default to full opacity
        } else {
            this.alpha = 1;
        }

        // If the arguments for HSV are supplied and valid...
        if (hue != null && saturation != null && brightness != null &&
            !isNaN(hue) && !isNaN(saturation) && !isNaN(brightness) &&
            hue >= 0    && saturation >= 0    && brightness >= 0    && 
            hue <= 360  && saturation <= 1    && brightness <= 1    ) {

            this.hue = hue;
            this.saturation = saturation;
            this.brightness = brightness;

            this.setRGB();
            this.setHex();

            
        // If the arguments for RGB are supplied and valid...
        } else if (red != null && green != null && blue != null &&
                   !isNaN(red) && !isNaN(green) && !isNaN(blue) &&
                   red >= 0    && green >= 0    && blue >= 0    &&
                   red <= 255  && green <= 255  && blue <= 255  ) { 

            this.red = red;
            this.green = green;
            this.blue = blue;

            this.setHSV();
            this.setHex();


        // If the argument for hex is supplied...
        // TODO: Add validity check for hex
        } else if (hex) {

            this.hex = hex;

            this.red = parseInt(this.hex.substring(0, 2), 16);
            this.green = parseInt(this.hex.substring(2, 4), 16);
            this.blue = parseInt(this.hex.substring(4), 16);

            this.setHSV();


        // Otherwise, default to black
        } else {

            this.hue = 0;
            this.saturation = 0;
            this.brightness = 0;

            this.red = 0;
            this.green = 0;
            this.blue = 0;

            this.hex = "000000";
        }
    }
    
    
    // Converts HSV to RGB 
    setRGB() {
        let hue = this.hue;
        let saturation = this.saturation;
        let brightness = this.brightness;

        let red = 0;
        let green = 0;
        let blue = 0;

        // Adjust for max hue value
        if (hue == 360) {
            hue = 0;
        }

        // TODO: Check use of parseFloat here
        let max = parseFloat(brightness); 
        let c = brightness * saturation;
        let min = max - c;

        let huePrime;

        if (hue >= 300) {
            huePrime = (hue - 360) / 60;
        } else {
            huePrime = hue / 60;
        }

        if (huePrime >= -1 && huePrime < 1) {
            if (huePrime < 0) {
                red = max;
                green = min;
                blue = green - huePrime * c;
            } else {
                red = max;
                green = min + huePrime * c;
                blue = min;
            }

        } else if (huePrime >= 1 && huePrime < 3) {
            if (huePrime - 2 < 0) {
                red = min - (huePrime - 2) * c;
                green = max;
                blue = min;
            } else {
                red = min;
                green = max;
                blue = min + (huePrime - 2) * c;
            }

        } else if (huePrime >= 3 && huePrime < 5) {
            if (huePrime - 4 < 0) {
                red = min;
                green = min - (huePrime - 4) * c;
                blue = max;
            } else {
                red = min + (huePrime - 4) * c;
                green = min;
                blue = max;
            }
        }
        
        // Convert calculated RGB values to 0-255.
        this.red = 255 * red;
        this.blue = 255 * blue;
        this.green = 255 * green;
    };



    // Converts RGB to HSV
    setHSV() {
        let red = this.red;
        let green = this.green;
        let blue = this.blue;

        let hue = 0;
        let saturation = 0;
        let brightness = 0;

        // Adjust RGB values to be within 0 to 1, inclusively.
        red /= 255;
        green /= 255;
        blue /= 255;

        let minRGB = Math.min(red, Math.min(green, blue));
        let maxRGB = Math.max(red, Math.max(green, blue));

        // Grayscale values (hue and saturation are 0)
        if (minRGB == maxRGB) {
            brightness = minRGB;
            
            this.hue = hue;
            this.saturation = saturation;
            this.brightness = brightness;

        // Non-grayscale values
        } else {
            let d = (red == minRGB) ? green - blue : ((blue == minRGB) ? red - green : blue - red);
            let h = (red == minRGB) ? 3 : ((blue == minRGB) ? 1 : 5);

            hue = 60 * (h - d / (maxRGB - minRGB));
            saturation = (maxRGB - minRGB) / maxRGB;
            brightness = maxRGB;

            this.hue = hue;
            this.saturation = saturation;
            this.brightness = brightness;
        }
    };


    // Converts RGB to hexadecimal
    setHex() {
        let red = parseInt(this.red).toString(16).padStart(2, "0");
        let green = parseInt(this.green).toString(16).padStart(2, "0"); 
        let blue = parseInt(this.blue).toString(16).padStart(2, "0");
        let alpha = (parseInt(255 * this.alpha)).toString(16).padStart(2, "0");

        this.hex = red + green + blue; // + alpha;
    };
}

export default Color;