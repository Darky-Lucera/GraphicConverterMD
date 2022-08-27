// Megadrive component colors:
//var gMegaDriveColors = [0x00, 0x24, 0x49, 0x6D, 0x92, 0xB6, 0xDB, 0xFF]; // Op A: XXX * 36.5
var gMegaDriveColors = [0x00, 0x24, 0x48, 0x6C, 0x90, 0xB4, 0xD8, 0xFC]; // Op B: XXX * 36
//var gMegaDriveColors = [0x00, 0x20, 0x40, 0x60, 0x80, 0xA0, 0xC0, 0xE0]; // Op C: XXX00000
//var gMegaDriveColors = [0x00, 0x22, 0x44, 0x66, 0x88, 0xAA, 0xCC, 0xEE]; // Op D: XXX0XXX0
//var gMegaDriveColors = [0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF]; // Op D: XXX0XXX1
//var gMegaDriveColors = [0x10, 0x32, 0x54, 0x76, 0x98, 0xBA, 0xDC, 0xFE]; // Op D: XXX1XXX0
//var gMegaDriveColors = [0x11, 0x33, 0x55, 0x77, 0x99, 0xBB, 0xDD, 0xFF]; // Op D: XXX1XXX1

// RGB: (R, G, B) 8 bits per component
// Hex888: #RRGGBB 8 bits per component
// Hex444: #RGB 4 bits per component
// Hex:    Hex888 o Hex444
// HexMD888: #RRGGBB 3 bits per component (Op A)
// MDPal: 0x0RGB -> 0000 BBB0 GGG0 RRR0

//-------------------------------------
function ColorDistanceEuclidean(r1, g1, b1, r2, g2, b2) {
    var diffR, diffG, diffB;

    diffR = r2 - r1;
    diffG = g2 - g1;
    diffB = b2 - b1;

//    return Math.sqrt(diffR*diffR + diffG*diffG + diffB*diffB);
    return (diffR*diffR + diffG*diffG + diffB*diffB);
}

//-------------------------------------
function ColorDistanceEuclideanPerceptual(r1, g1, b1, r2, g2, b2) {
    var meanR;
    var diffR, diffG, diffB;

    meanR = (r2 + r1) >> 1;
    diffR = r2 - r1;
    diffG = g2 - g1;
    diffB = b2 - b1;

//    return Math.sqrt((((512 + meanR) * diffR*diffR) >> 8) + 4 * diffG*diffG + (((767 - meanR) * diffB*diffB) >> 8));
    return ((((512 + meanR) * diffR*diffR) >> 8) + 4 * diffG*diffG + (((767 - meanR) * diffB*diffB) >> 8));
}

var ColorDistance = ColorDistanceEuclideanPerceptual

// From MDPal "#RRGGBB" to [r8, g8, b8]
//-------------------------------------
function GeneratePaletteRGB() {
    var palColor;
    var r, g, b;

    if(Globals.Palette.length > 0) {
        Globals.PaletteRGB = new Array(Globals.Palette.length);
        for(var i=0; i<Globals.Palette.length; ++i) {
            palColor = Globals.Palette[i];
            r = ("0x" + palColor.substring(1, 3)) | 0;
            g = ("0x" + palColor.substring(3, 5)) | 0;
            b = ("0x" + palColor.substring(5)   ) | 0;
            Globals.PaletteRGB[i] = [r, g, b];
        }
    }
}

// You must call first GeneratePaletteRGB
//-------------------------------------
function FindNearestColor(r, g, b) {
    var dist, bestDist = 0x7fffffff, bestIndex = -1;
    var palR, palG, palB;

    for(var i=0; i<Globals.PaletteRGB.length; ++i) {
        palR = Globals.PaletteRGB[i][0];
        palG = Globals.PaletteRGB[i][1];
        palB = Globals.PaletteRGB[i][2];

        //dist = ColorDistanceEuclidean(palR, palG, palB, r, g, b);
        dist = ColorDistance(palR, palG, palB, r, g, b);
        if(dist < bestDist) {
            bestDist = dist;
            bestIndex = i;
        }
    }

    return bestIndex;
}

// Check user input
//-------------------------------------
function CheckHexColor(hex) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);
}

// Convert int to 4 hex digits
//-------------------------------------
function IntToHex4(value) {
    var hex = value.toString(16);
    if (hex.length == 1) {
        return "0x000" + hex;
    }
    else if (hex.length == 2) {
        return "0x00" + hex;
    }
    else if (hex.length == 3) {
        return "0x0" + hex;
    }
    return "0x" + hex;
}

// Optimization for ComponentToHex
//-------------------------------------
var gComponentToHex = new Array(256);
for(var i=0; i<256; ++i) {
    var hex = i.toString(16);
    if(hex.length == 1)
        hex = "0" + hex;
    gComponentToHex[i] = hex;
}

// 2 hex digits "XX"
//-------------------------------------
function ComponentToHex(component) {
    //var hex = component.toString(16);
    //return hex.length == 1 ? "0" + hex : hex;
    return gComponentToHex[component];
}

// 8 bit componet -> MD limited component value (8 posibilities)
//-------------------------------------
function ComponentToMD888(component) {
    var index = component >> 5;
    //var index = Math.round(component / 36.0);
    return gMegaDriveColors[index];
}

// r8, g8, b8 -> "#RRGGBB" (MD values)
//-------------------------------------
function RGBToHexMD888(r, g, b) {
    var R, G, B;

    R = ComponentToHex(ComponentToMD888(r));
    G = ComponentToHex(ComponentToMD888(g));
    B = ComponentToHex(ComponentToMD888(b));

    return "#" + R + G + B;
}

// r8, g8, b8 -> MDPal 0x0RGB (0000 BBB0 GGG0 RRR0)
//-------------------------------------
function RGBToMDPal(r, g, b) {
    var R, G, B;

    R = (r >> 5) << 1;
    G = (g >> 5) << 1;
    B = (b >> 5) << 1;

    // Palette is in BGR
    return "0x" + "0" + B.toString(16) + G.toString(16) + R.toString(16);
}

// "#RRGGBB" -> MDPal (0000 BBB0 GGG0 RRR0)
//-------------------------------------
function HexMD888ToMDPal(hex) {
    var r, g, b;

    r = "0x" + hex.substring(1, 3);
    g = "0x" + hex.substring(3, 5);
    b = "0x" + hex.substring(5);

    return RGBToMDPal(r, g, b);
}

// "#RRGGBB" -> [r8, g8, b8]
//-------------------------------------
function HexMD888ToArray(hex) {
    var r, g, b;

    r = "0x" + hex.substring(1, 3);
    g = "0x" + hex.substring(3, 5);
    b = "0x" + hex.substring(5);

    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
}

// "#RRGGBB" | "#RGB" -> "#RRGGBB" (MD values)
//-------------------------------------
function HexToHexMD888(hex) {
    var r, g, b;

    if (hex.length == 7) {
        r = "0x" + hex.substring(1, 3);
        g = "0x" + hex.substring(3, 5);
        b = "0x" + hex.substring(5);
    }
    else if (hex.length == 4) {
        r = hex.substring(1, 2);
        g = hex.substring(2, 3);
        b = hex.substring(3);
        r = "0x" + r + r;
        g = "0x" + g + g;
        b = "0x" + b + b;
    }
    else {
        return "#000000";
    }

    return RGBToHexMD888(r, g, b);
}

// clamp value to [0, 255]
//-------------------------------------
function ClampComponent(value) {
    if (value < 0)
        return 0;
    else if (value > 255)
        return 255;

    return value;
}

// Select dark/light contrast color
//-------------------------------------
function GetLabelColor(hex) {
    var r, g, b;

    if (hex.length == 7) {
        r = "0x" + hex.substring(1, 3);
        g = "0x" + hex.substring(3, 5);
        b = "0x" + hex.substring(5);
    }
    else if (hex.length == 4) {
        r = hex.substring(1, 2);
        g = hex.substring(2, 3);
        b = hex.substring(3);
        r = "0x" + r + r;
        g = "0x" + g + g;
        b = "0x" + b + b;
    }
    else {
        return "#000000";
    }

    var lightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (lightness > 96) {
        return "#000000";
    }

    return "#FFFFFF";
}
