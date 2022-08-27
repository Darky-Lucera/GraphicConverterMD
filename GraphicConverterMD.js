//
// Copyright 2019, Carlos Aragonés
// @luceraproject (www.lucera-project.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The Software shall be used for Good, not Evil.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

//(function() {
    'use strict';
//}());

/* global alert */
/* global console */
/* global ColorQuantizer */
/* eslint "no-redeclare": 'off' */
/* eslint "no-unused-vars": 'off' */
/* eslint "no-undef": 'off' */

// Sorry but this simplify a lot the code
const Globals = {};

Globals.OutputModeNames = {};
Globals.OutputModeNames.JustPalette = 0;
Globals.OutputModeNames.Sprites     = 1;
Globals.OutputModeNames.Image       = 2;

Globals.UseExternalPalette = true;
Globals.FixPaletteColors   = true;    // all palette colors except if > LimitColorsTo

Globals.UseExtTransparentColor = false;
Globals.FixTransparentColor    = true; // first palette color
Globals.TransparentColors      = [ "#fc00fc", "#d800d8", "#b400b4", "#900090"];

Globals.UseExternalTileset = true;

Globals.UseLimitColors = true;
Globals.LimitColorsTo  = 32;
Globals.UseDithering   = false;
Globals.UseBlueNoise   = false;
Globals.AddImageColors = true;

Globals.OutputMode = Globals.OutputModeNames.Image;

Globals.OptimizeSpriteData = true;
Globals.SpriteWidth  = 32;
Globals.SpriteHeight = 32;

Globals.OptimizeImageData = true;
Globals.AddMetadata       = true;
Globals.OptimizedNumTiles = 0;

Globals.PaletteFileName   = "";
Globals.TilesetFileName   = "";
Globals.PaletteName       = "";
Globals.BlueNoiseFileName = "";
Globals.BlueNoiseName     = "";
Globals.ImageFileName     = "";
Globals.ImageName         = "";
Globals.ImageNameCap      = "";
Globals.ImageWidth        = 0;
Globals.ImageHeight       = 0;

Globals.Palette          = [];
Globals.PaletteRGB       = [];
Globals.ColorCount       = [];
Globals.ColorIndices     = [];
Globals.PaletteNumColors = 0;
Globals.ValidTiles       = [];

Globals.Hashes = []

Globals.TilesetExtCanvas       = null;
Globals.TilesetExtContext      = null;
Globals.TilesetExtWidth        = 0;
Globals.TilesetExtHeight       = 0;
Globals.TilesetExtColorIndices = [];

Globals.error = false;

//-------------------------------------
// Called from HTML
//-------------------------------------

function Init() {
    $("#palette_checkbox")[0].checked = Globals.UseExternalPalette;
    $("#fix_palette_colors_checkbox")[0].checked = Globals.FixPaletteColors;
    $("#transparent_color_checkbox")[0].checked = Globals.UseExtTransparentColor;
    $("#fix_transparent_color_checkbox")[0].checked = Globals.FixTransparentColor;
    $("#limit_colors_checkbox")[0].checked = Globals.UseLimitColors;
    if (Globals.LimitColorsTo != 16) {
        $("#num_colors").val(Globals.LimitColorsTo);
        $("#num_colors-16").removeClass("btn-primary");
        $("#num_colors-16").addClass("btn-outline-primary");
        $("#num_colors-" + Globals.LimitColorsTo).removeClass("btn-outline-primary");
        $("#num_colors-" + Globals.LimitColorsTo).addClass("btn-primary");
    }
    $("#dithering_checkbox")[0].checked = Globals.UseDithering;
    $("#blue_noise_checkbox")[0].checked = Globals.UseBlueNoise;
    $("#add_image_colors_checkbox")[0].checked = Globals.AddImageColors;
    $("#tileset_checkbox")[0].checked = Globals.UseExternalTileset;
    $("input[name=mode_radio]")[Globals.OutputMode].checked = true;
    $("#optimize_sprite_checkbox")[0].checked = Globals.OptimizeSpriteData;
    if (Globals.SpriteWidth != 8) {
        $("#spt_width").val(Globals.SpriteWidth);
        $("#spt_width-8").removeClass("btn-primary");
        $("#spt_width-8").addClass("btn-outline-primary");
        $("#spt_width-" + Globals.SpriteWidth).removeClass("btn-outline-primary");
        $("#spt_width-" + Globals.SpriteWidth).addClass("btn-primary");
    }
    if (Globals.SpriteHeight != 8) {
        $("#spt_height").val(Globals.SpriteHeight);
        $("#spt_height-8").removeClass("btn-primary");
        $("#spt_height-8").addClass("btn-outline-primary");
        $("#spt_height-" + Globals.SpriteHeight).removeClass("btn-outline-primary");
        $("#spt_height-" + Globals.SpriteHeight).addClass("btn-primary");
    }
    $("#optimize_image_checkbox")[0].checked = Globals.OptimizeImageData;
    $("#add_metadata_checkbox")[0].checked = Globals.AddMetadata;

    SetUseExternalPalette(Globals.UseExternalPalette);
    SetFixPaletteColors(Globals.FixPaletteColors);
    SetUseExtTransparentColor(Globals.UseExtTransparentColor);
    SetUseExternalTileset(Globals.UseExternalTileset);
    SetFixTransparentColor(Globals.FixTransparentColor);
    SetUseLimitColors(Globals.UseLimitColors);
    SetUseDithering(Globals.UseDithering);
    SetUseBlueNoise(Globals.UseBlueNoise);
    SetAddImageColors(Globals.AddImageColors);
    SetOutputMode(Globals.OutputMode);
    SetOptimizeSpriteData(Globals.OptimizeSpriteData);
    SetOptimizeImageData(Globals.OptimizeImageData);
    SetAddMetadata(Globals.AddMetadata);
}

//-------------------------------------
function SetUseExternalPalette(value) {
    Globals.UseExternalPalette = value;
    $("#palette_group :input").attr("disabled", !value);
    $("#remote_pal").attr("disabled", true);
    if (value) {
        $("#palette_group").css({ opacity: 1.0 });
    }
    else {
        $("#palette_group").css({ opacity: 0.5 });
    }
}

//-------------------------------------
function SetUseExternalTileset(value) {
    Globals.UseExternalTileset = value;
    $("#tileset_group :input").attr("disabled", !value);
    $("#remote_tileset").attr("disabled", true);
    if (value) {
        $("#tileset_group").css({ opacity: 1.0 });
    }
    else {
        $("#tileset_group").css({ opacity: 0.5 });
    }
}

//-------------------------------------
function SetFixPaletteColors(value) {
    Globals.FixPaletteColors = value;
}

//-------------------------------------
function SetUseExtTransparentColor(value) {
    Globals.UseExtTransparentColor = value;
    $("#transparent_color_group :input").attr("disabled", !value);
    if (value) {
        $("#transparent_color_group").css({ opacity: 1.0 });
    }
    else {
        $("#transparent_color_group").css({ opacity: 0.5 });
    }
    $("#fileInputPal").css({ opacity: 0.0 });
}

//-------------------------------------
function SetExtTransparentColor(index, value) {
    const error = document.getElementById("ext_transparent_color_error" + index);
    if (CheckHexColor(value) == false) {
        error.innerHTML = "Invalid color";
        error.style.backgroundColor = "#faa";
        return;
    }
    error.innerHTML = "Ok";
    error.style.backgroundColor = "#e9ecef";

    const ext_transparent_color = document.getElementById("ext_transparent_color" + index);
    ext_transparent_color.style.color = GetLabelColor(value);
    ext_transparent_color.style.backgroundColor = value;

    const ext_transparent_color_md = document.getElementById("ext_transparent_color_md" + index);
    ext_transparent_color_md.value = "MD: " + HexToHexMD888(value);
    ext_transparent_color_md.style.color = GetLabelColor(value);
    ext_transparent_color_md.style.backgroundColor = HexToHexMD888(value);
}

//-------------------------------------
function SetFixTransparentColor(value) {
    Globals.FixTransparentColor = value;
}

//-------------------------------------
function SetUseLimitColors(value) {
    Globals.UseLimitColors = value;
    $("#limit_colors_group :input").attr("disabled", !value);
    if (value) {
        $("#limit_colors_group").css({ opacity: 1.0 });
    }
    else {
        $("#limit_colors_group").css({ opacity: 0.5 });
    }
    $("#num_colors").attr("disabled", true);
}

//-------------------------------------
function SetLimitColorsTo(value) {
    $("#num_colors").val(value);
    $("#num_colors-" + Globals.LimitColorsTo).removeClass("btn-primary");
    $("#num_colors-" + Globals.LimitColorsTo).addClass("btn-outline-primary");
    $("#num_colors-" + value).removeClass("btn-outline-primary");
    $("#num_colors-" + value).addClass("btn-primary");
    Globals.LimitColorsTo = value | 0;
}

//-------------------------------------
function SetUseDithering(value) {
    Globals.UseDithering = value;
}

//-------------------------------------
function SetUseBlueNoise(value) {
    Globals.UseBlueNoise = value;
}

//-------------------------------------
function SetAddImageColors(value) {
    Globals.AddImageColors = value;
}

//-------------------------------------
function SetOutputMode(value) {
    if (value == Globals.OutputModeNames.JustPalette) {
        $("#mode_sprite_group :input").attr("disabled", true);
        $("#mode_sprite_group").css({ opacity: 0.5 });
        $("#mode_image_group :input").attr("disabled", true);
        $("#mode_image_group").css({ opacity: 0.5 });
    }
    else if (value == Globals.OutputModeNames.Sprites) {
        $("#mode_sprite_group :input").attr("disabled", false);
        $("#mode_sprite_group").css({ opacity: 1.0 });
        $("#mode_image_group :input").attr("disabled", true);
        $("#mode_image_group").css({ opacity: 0.5 });
    }
    else if (value == Globals.OutputModeNames.Image) {
        $("#mode_sprite_group :input").attr("disabled", true);
        $("#mode_sprite_group").css({ opacity: 0.5 });
        $("#mode_image_group :input").attr("disabled", false);
        $("#mode_image_group").css({ opacity: 1.0 });
    }

    $("#spt_width").attr("disabled", true);
    $("#spt_height").attr("disabled", true);

    Globals.OutputMode = value;
}

//-------------------------------------
function SetOptimizeSpriteData(value) {
    Globals.OptimizeSpriteData = value;
}

//-------------------------------------
function SetSpriteWidth(value) {
    $("#spt_width").val(value);
    $("#spt_width-" + Globals.SpriteWidth).removeClass("btn-primary");
    $("#spt_width-" + Globals.SpriteWidth).addClass("btn-outline-primary");
    $("#spt_width-" + value).removeClass("btn-outline-primary");
    $("#spt_width-" + value).addClass("btn-primary");
    Globals.SpriteWidth = value | 0;
}

//-------------------------------------
function SetSpriteHeight(value) {
    $("#spt_height").val(value);
    $("#spt_height-" + Globals.SpriteHeight).removeClass("btn-primary");
    $("#spt_height-" + Globals.SpriteHeight).addClass("btn-outline-primary");
    $("#spt_height-" + value).removeClass("btn-outline-primary");
    $("#spt_height-" + value).addClass("btn-primary");
    Globals.SpriteHeight = value | 0;
}

//-------------------------------------
function SetOptimizeImageData(value) {
    Globals.OptimizeImageData = value;
}

//-------------------------------------
function SetAddMetadata(value) {
    Globals.AddMetadata = value;
}

//-------------------------------------
// Log
//-------------------------------------
const kSuccess = "text-success";
const kInfo    = "text-info";
const kWarning = "text-warning";
const kError   = "text-danger";

function WriteMessage(className, message) {
    const span = document.createElement("span");
    span.className = className;
    span.innerHTML = message;
    $("#messages").append(span);
    $("#messages").append(document.createElement("br"));
}

//-------------------------------------
// Helpers
//-------------------------------------
function Capitalize(str) {
    const arr = str.split("_").join(" ").split("-").join(" ").split(" ");
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join("");
}

//-------------------------------------
// File readers
//-------------------------------------

//-------------------------------------
function ReadFilePalette(evt) {
    const file = evt.files[0];
    if (file) {
        Globals.PaletteFileName = file.name;
        Globals.PaletteName     = (file.name.split('\\').pop().split('/').pop());
        $("#fileInputPalLabel").text(Globals.PaletteName);
        Globals.PaletteName     = (Globals.PaletteName.split('.'))[0];

        const fileReader = new FileReader();
        fileReader.onload = function(evtB) {
            const contents = evtB.target.result;
            const tmppath  = URL.createObjectURL(file);
            $("#remote_pal").val(tmppath);
        };
        fileReader.readAsText(file);
    }
    else {
        Globals.PaletteName = "";
        alert("Failed to load file");
    }
}

//-------------------------------------
function ReadFileTileset(evt) {
    const file = evt.files[0];
    if (file) {
        Globals.TilesetFileName = file.name;
        Globals.TilesetName     = (file.name.split('\\').pop().split('/').pop());
        $("#fileInputTilesetLabel").text(Globals.TilesetName);
        Globals.TilesetName     = (Globals.TilesetName.split('.'))[0];

        const fileReader = new FileReader();
        fileReader.onload = function(evtB) {
            const contents = evtB.target.result;
            const tmppath  = URL.createObjectURL(file);
            $("#remote_tileset").val(tmppath);
        };
        fileReader.readAsText(file);
    }
    else {
        Globals.TilesetName = "";
        alert("Failed to load file");
    }
}

//-------------------------------------
function ReadFileBlueNoise(evt) {
    const file = evt.files[0];
    if (file) {
        Globals.BlueNoiseFileName = file.name;
        Globals.BlueNoiseName     = (file.name.split('\\').pop().split('/').pop());
        $("#fileInputBlueNoiseLabel").text(Globals.BlueNoiseName);
        Globals.BlueNoiseName     = (Globals.BlueNoiseName.split('.'))[0];

        const fileReader = new FileReader();
        fileReader.onload = function(evtB) {
            const contents = evtB.target.result;
            const tmppath  = URL.createObjectURL(file);
            $("#remote_blue_noise").val(tmppath);
        };
        fileReader.readAsText(file);
    }
    else {
        Globals.BlueNoiseName = "";
        alert("Failed to load file");
    }
}

//-------------------------------------
function ReadFileImage(evt) {
    const file = evt.files[0];
    if (file) {
        Globals.ImageFileName = file.name;
        Globals.ImageName     = (file.name.split('\\').pop().split('/').pop());
        $("#fileInputImageLabel").text(Globals.ImageName);
        Globals.ImageName     = (Globals.ImageName.split('.'))[0];
        Globals.ImageNameCap  = Capitalize(Globals.ImageName);

        const fileReader = new FileReader();
        fileReader.onload = function(evtB) {
            const contents = evtB.target.result;
            const tmppath  = URL.createObjectURL(file);
            $("#remote_img").val(tmppath);
        };
        fileReader.readAsText(file);
    }
    else {
        Globals.ImageName    = "";
        Globals.ImageNameCap = "";
        alert("Failed to load file");
    }
}

//-------------------------------------
//-------------------------------------

//-------------------------------------
function GetUserTransparentColors() {
    for (let i=0; i<4; ++i) {
        const extTransparentColor = $("#ext_transparent_color" + i).val();
        if (CheckHexColor(extTransparentColor) == false) {
            WriteMessage(kError, "Invalid transparent color" + (i + 1) + ": " + extTransparentColor);
            Globals.error = true;
            return false;
        }
        Globals.TransparentColors[i] = HexToHexMD888(extTransparentColor);
        WriteMessage(kInfo, "User defined transparent color" + (i + 1) + ": " + extTransparentColor + "- MD: " + Globals.TransparentColors[i]);
    }

    Globals.Palette.push(Globals.TransparentColors[0]);
    Globals.ColorCount.push(0);
}

//-------------------------------------
function AddTransparentColorIfNeeded() {
    // Not for the first: Allow get first transparent color from image
    //if (Globals.Palette.length == 0) {
    //    const color = Globals.TransparentColors[0];
    //    WriteMessage(kInfo, "Added alpha: " + color);
    //    Globals.Palette.push(color);
    //    Globals.ColorCount.push(0);
    //}
    //else
    if (Globals.Palette.length == 16) {
        const color = Globals.TransparentColors[1];
        WriteMessage(kInfo, "Added alpha: " + color);
        Globals.Palette.push(color);
        Globals.ColorCount.push(0);
        return true;
    }
    else if (Globals.Palette.length == 32) {
        const color = Globals.TransparentColors[2];
        WriteMessage(kInfo, "Added alpha: " + color);
        Globals.Palette.push(color);
        Globals.ColorCount.push(0);
        return true;
    }
    else if (Globals.Palette.length == 48) {
        const color = Globals.TransparentColors[3];
        WriteMessage(kInfo, "Added alpha: " + color);
        Globals.Palette.push(color);
        Globals.ColorCount.push(0);
        return true;
    }

    return false;
}

// Collect all different colors from the image
//-------------------------------------
function CollectColorsFromImage(context, width, height, isPalette = false) {
    let newColors = 0;
    const imageData = context.getImageData(0, 0, width, height).data;
    for (let y = 0; y < height; y++) {
        const offsetY = y * width * 4;
        for (let x = 0; x < width; x++) {
            const offsetYX = offsetY + x * 4;
            const r = imageData[offsetYX + 0];
            const g = imageData[offsetYX + 1];
            const b = imageData[offsetYX + 2];
            const a = imageData[offsetYX + 4];
            if (a == 0)
                continue;

            const color = RGBToHexMD888(r, g, b);
            const index = Globals.Palette.indexOf(color);
            if (index == -1) {
                newColors++;
                if (isPalette == false)
                    AddTransparentColorIfNeeded();
                Globals.Palette.push(color);
                Globals.ColorCount.push(0);
            }
        }
    }

    Globals.PaletteNumColors = Globals.Palette.length;
    return newColors;
}

// Count every occurrence of every different color in the image (do not modify PaletteNumColors)
//-------------------------------------
function CountColorsFromImage(context, width, height, isPalette = false) {
    let newColors = 0;
    const imageData = context.getImageData(0, 0, width, height).data;
    WriteMessage(kInfo, "Counting image colors.");
    for (let y = 0; y < height; y++) {
        const offsetY = y * width * 4;
        for (let x = 0; x < width; x++) {
            const offsetYX = offsetY + x * 4;
            const r = imageData[offsetYX + 0];
            const g = imageData[offsetYX + 1];
            const b = imageData[offsetYX + 2];
            const a = imageData[offsetYX + 4];
            if (a == 0)
                continue;

            const color = RGBToHexMD888(r, g, b);
            const index = Globals.Palette.indexOf(color);
            if (index == -1) {
                newColors++;
                if (isPalette == false)
                    AddTransparentColorIfNeeded();
                Globals.Palette.push(color);
                Globals.ColorCount.push(1);
                WriteMessage(kWarning, " - New color found in image that is not in palette: " + color);
            }
            else {
                Globals.ColorCount[index]++;
            }
        }
    }

    return newColors;
}

// Transform RGB to MD reducing num colors, if needed, using flags (dithering, blue noise, ...)
//-------------------------------------
function TransformImage(imageContext, imageWidth, imageHeight, blueNoiseData, blueNoiseWidth, blueNoiseHeight) {
    imageContext.imageSmoothingEnabled = false;
    const image = imageContext.getImageData(0, 0, imageWidth, imageHeight);
    const imageData = image.data;

    // Just in case, we are going to count the colors again (dithering may change it)
    Globals.ColorCount = new Array(Globals.PaletteRGB.length);
    Globals.ColorCount.fill(0);

    Globals.ColorIndices = new Array(imageWidth * imageHeight);
    let colIndex = 0;
    for (let y = 0; y < imageHeight; y++) {
        const offsetY = y * imageWidth * 4;
        for (let x = 0; x < imageWidth; x++) {
            const offsetYX = offsetY + x * 4;
            const r = imageData[offsetYX + 0];
            const g = imageData[offsetYX + 1];
            const b = imageData[offsetYX + 2];

            let palIndex;
            if (Globals.UseBlueNoise) {
                const offsetBN = (y % blueNoiseHeight) * blueNoiseWidth * 4 + (x % blueNoiseWidth) * 4;
                const bnx = blueNoiseData[offsetBN + 0] - 128;
                const bny = blueNoiseData[offsetBN + 1] - 128;
                const bnz = blueNoiseData[offsetBN + 2] - 128;
                palIndex = FindNearestColor(r + bnx, g + bny, b + bnz);
            }
            else {
                palIndex = FindNearestColor(r, g, b);
            }

            Globals.ColorCount[palIndex]++;
            Globals.ColorIndices[colIndex++] = palIndex;
            const palColor = Globals.PaletteRGB[palIndex];
            const mdR = palColor[0];
            const mdG = palColor[1];
            const mdB = palColor[2];

            imageData[offsetYX + 0] = mdR;
            imageData[offsetYX + 1] = mdG;
            imageData[offsetYX + 2] = mdB;
            imageData[offsetYX + 3] = 255; // clear original alpha channel

            if (Globals.UseDithering) {
                //const dist = Math.sqrt(ColorDistanceEuclideanPerceptual(mdR, mdG, mdB, r, g, b));
                //const diffR = dist;
                //const diffG = dist;
                //const diffB = dist;
                const diffR = r - mdR;
                const diffG = g - mdG;
                const diffB = b - mdB;
                if (x < imageWidth - 1) {
                    imageData[offsetYX + 4 + 0] = ClampComponent(imageData[offsetYX + 4 + 0] + ((diffR * 7) >> 4));
                    imageData[offsetYX + 4 + 1] = ClampComponent(imageData[offsetYX + 4 + 1] + ((diffG * 7) >> 4));
                    imageData[offsetYX + 4 + 2] = ClampComponent(imageData[offsetYX + 4 + 2] + ((diffB * 7) >> 4));
                }
                if (y < imageHeight - 1) {
                    const offsetAux = offsetYX + imageWidth * 4;

                    if (x > 1) {
                        imageData[offsetAux - 4 + 0] = ClampComponent(imageData[offsetAux - 4 + 0] + ((diffR * 3) >> 4));
                        imageData[offsetAux - 4 + 1] = ClampComponent(imageData[offsetAux - 4 + 1] + ((diffG * 3) >> 4));
                        imageData[offsetAux - 4 + 2] = ClampComponent(imageData[offsetAux - 4 + 2] + ((diffB * 3) >> 4));
                    }

                    imageData[offsetAux + 0] = ClampComponent(imageData[offsetAux + 0] + ((diffR * 5) >> 4));
                    imageData[offsetAux + 1] = ClampComponent(imageData[offsetAux + 1] + ((diffG * 5) >> 4));
                    imageData[offsetAux + 2] = ClampComponent(imageData[offsetAux + 2] + ((diffB * 5) >> 4));

                    if (x < imageWidth - 1) {
                        imageData[offsetAux + 4 + 0] = ClampComponent(imageData[offsetAux + 4 + 0] + ((diffR * 1) >> 4));
                        imageData[offsetAux + 4 + 1] = ClampComponent(imageData[offsetAux + 4 + 1] + ((diffG * 1) >> 4));
                        imageData[offsetAux + 4 + 2] = ClampComponent(imageData[offsetAux + 4 + 2] + ((diffB * 1) >> 4));
                    }
                }
            }
        }
    }
    imageContext.putImageData(image, 0, 0);
    const url = imageContext.canvas.toDataURL();
}

//-------------------------------------
// Draw functions
//-------------------------------------

// Create a table formed by squares with palette colors and pixel count
//-------------------------------------
function DrawPaletteToTable(table) {
    let posY = 0;
    let posX = 0;
    let row = table.insertRow(posY);
    let cell;

    let length = Math.min(Globals.Palette.length, 256);
    for (let i = 0; i < length; ++i, ++posX) {
        //console.log("Color: " + Globals.Palette[i] + " found " + Globals.ColorCount[i] + " times");
        if ((i != 0) && ((i % 16) == 0)) {
            ++posY;
            row  = table.insertRow(posY);
            posX = 0;
        }

        cell = row.insertCell(posX);
        cell.innerHTML             = Globals.ColorCount[i];
        cell.style.backgroundColor = Globals.Palette[i];
        cell.style.color           = GetLabelColor(Globals.Palette[i]);
        cell.style.textAlign       = "center";
    }

    // rest of the colors of the row
    length = 16 - (length % 16);
    if (length != 16) {
        for (let i = 0; i < length; ++i, ++posX) {
            cell = row.insertCell(posX);
            cell.innerHTML       = "-";
            cell.style.textAlign = "center";
        }
    }
}

// Create a table formed by tiles (Sprites or planes)
//-------------------------------------
function DrawTilesToTable(table, context, width, height) {
    let numTilesX    = 0;
    let numTilesY    = 0;
    let tileWidth    = 8;
    let tileHeight   = 8;

    if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
        numTilesX  = width  / Globals.SpriteWidth;
        numTilesY  = height / Globals.SpriteHeight;
        tileWidth  = Globals.SpriteWidth;
        tileHeight = Globals.SpriteHeight;
    }
    else if (Globals.OutputMode == Globals.OutputModeNames.Image) {
        numTilesX  = width  / 8;
        numTilesY  = height / 8;
    }

    // Create canvas for all tiles together
    Globals.TilesetExtCanvas = document.createElement("canvas");
    Globals.TilesetExtCanvas.name   = "tileset_canvas";
    Globals.TilesetExtCanvas.width  = Globals.ValidTiles.filter(x => x==true).length * 8;
    Globals.TilesetExtCanvas.height = 8;
    Globals.TilesetExtCanvas.style.border = "0px";

    const blockContext = Globals.TilesetExtCanvas.getContext("2d");
    blockContext.imageSmoothingEnabled = false;
    blockContext.mozImageSmoothingEnabled = false;

    let image;
    let cell, cellContext, cellCanvas;
    let row = null;
    let index = 0;

    if (Globals.UseExternalTileset) {
        Globals.TilesetExtCanvas.width += Globals.TilesetExtWidth;
        const totalTiles = Globals.TilesetExtWidth / 8;
        for (let i=0; i<totalTiles; ++i) {
            if ((index % 16) == 0) {
                row = document.createElement("div");
                row.className = "row";
                table.appendChild(row);
            }

            cellCanvas = document.createElement("canvas");
            cellCanvas.width = tileWidth;
            cellCanvas.height = tileHeight;
            cellContext = cellCanvas.getContext("2d");
            cellContext.imageSmoothingEnabled = false;
            cellContext.mozImageSmoothingEnabled = false;

            image = Globals.TilesetExtContext.getImageData(i * tileWidth, 0, tileWidth, tileHeight);
            cellContext.putImageData(image, 0, 0);
            blockContext.putImageData(image, index * 8, 0);

            cell = document.createElement("div");
            cell.style.paddingLeft = "0px";
            cell.style.paddingRight = "" + (tileWidth + 8) + "px"; // because 200%
            cell.title = "" + index + " (" + IntToHex4(index) + ")";
            cell.appendChild(cellCanvas);

            row.appendChild(cell);
            ++index;
        }
    }

    let physicalTile = 0;
    for (let y = 0; y < numTilesY; ++y) {
        for (let x = 0; x < numTilesX; ++x) {
            if (Globals.ValidTiles[physicalTile++]) {
                if ((index % 16) == 0) {
                    row = document.createElement("div");
                    row.className = "row";
                    table.appendChild(row);
                }

                cellCanvas = document.createElement("canvas");
                cellCanvas.width  = tileWidth;
                cellCanvas.height = tileHeight;
                cellContext = cellCanvas.getContext("2d");
                cellContext.imageSmoothingEnabled = false;
                cellContext.mozImageSmoothingEnabled = false;

                image = context.getImageData(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
                cellContext.putImageData(image, 0, 0);
                blockContext.putImageData(image, index * 8, 0);

                cell = document.createElement("div");
                //cell.className = "col";
                cell.style.paddingLeft = "0px";
                cell.style.paddingRight = "" + (tileWidth + 8) + "px"; // because 200%
                cell.title = "" + index + " (" + IntToHex4(index) + ")";
                cell.appendChild(cellCanvas);

                row.appendChild(cell);
                ++index;
            }
        }
    }

    if (row != null) {
        index = 16 - (index % 16);
        if (index != 10) {
            for (let i = 0; i < index; ++i) {
                cellCanvas = document.createElement("canvas");
                cellCanvas.width = tileWidth;
                cellCanvas.height = tileHeight;
                cellCanvas.style.border = "0px";

                cell = document.createElement("div");
                //cell.className = "col";
                cell.style.paddingLeft = "0px";
                cell.style.paddingRight = "" + (tileWidth + 8) + "px"; // because 200%
                cell.appendChild(cellCanvas);
                row.appendChild(cell);
            }
        }
    }

    // Add canvas with all tiles together
    if (Globals.OutputMode == Globals.OutputModeNames.Image) {
        row = document.createElement("div");
        row.className = "row";
        const blockDiv = document.createElement("div");
        blockDiv.title = "TileSet";
        blockDiv.style.paddingLeft = "0px";
        blockDiv.style.paddingRight = "8px";
        blockDiv.appendChild(Globals.TilesetExtCanvas);
        row.appendChild(blockDiv);
        document.getElementById("tile_set").append(row);
    }
}

// Draw palette as image for the user
//-------------------------------------
function DrawPaletteToCanvas(paletteCanvas) {
    const paletteContext = paletteCanvas.getContext("2d");
    paletteContext.imageSmoothingEnabled = false;
    paletteContext.mozImageSmoothingEnabled = false;

    const pixel = paletteContext.createImageData(1, 1);
    const pixelData = pixel.data;

    let posY = 0;
    let posX = 0;
    const length = Math.min(Globals.Palette.length, 256);
    for (let i = 0; i < length; ++i, ++posX) {
        if ((i != 0) && ((i % 16) == 0)) {
            ++posY;
            posX = 0;
        }

        const color = Globals.Palette[i];
        pixelData[0] = "0x" + color.substring(1, 3);
        pixelData[1] = "0x" + color.substring(3, 5);
        pixelData[2] = "0x" + color.substring(5);
        pixelData[3] = 0xFF;
        paletteContext.putImageData(pixel, posX, posY);
    }
}

//-------------------------------------
Array.prototype.last = function() { return [...this][this.length - 1]; }

//-------------------------------------
function loadImage(src) {
    return new Promise((resolve, reject) => {
        //const img = new Image();
        const img = document.createElement("img");
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (err) => reject(err));
        img.crossOrigin = "anonymous";
        img.src = src;
    });
}

//-------------------------------------
function renderImage(img) {
    const width   = img.width;
    const height  = img.height;

    const canvas  = document.createElement("canvas");
    canvas.width  = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);

    const url     = canvas.toDataURL(); // Succeeds. Canvas won't be dirty.

    return { context, width, height, canvas };
}

//-------------------------------------
$(document).ready(() => {
    $("#page_form").submit(() => {
        $("#messages").empty();

        // Set transparent colors defined by user
        if (Globals.UseExtTransparentColor == true) {
            GetUserTransparentColors();
        }

        const loadedImages = [];

        // Load external palette
        if (Globals.UseExternalPalette == true) {
            if (Globals.PaletteFileName.length > 0) {
                WriteMessage(kInfo, "Use external palette file: " + Globals.PaletteFileName);
                loadedImages.push(loadImage($("#remote_pal").val()));
                loadedImages.last().then((img) => {
                    WriteMessage(kInfo, "Palette loaded");

                    const { context, width, height } = renderImage(img);

                    CollectColorsFromImage(context, width, height, true);
                    WriteMessage(kInfo, "Collected " + Globals.Palette.length + " colors from <strong>palette</strong>");
                });
            }
            else {
                Globals.UseExternalPalette = false;
                WriteMessage(kWarning, "External palette is checked but no texture is selected");
            }
        }

        // Load external tileset
        if (Globals.UseExternalTileset) {
            if (Globals.TilesetFileName.length > 0) {
                WriteMessage(kInfo, "Use external tileset file: " + Globals.TilesetFileName);
                loadedImages.push(loadImage($("#remote_tileset").val()));
                loadedImages.last().then((img) => {
                    WriteMessage(kInfo, "Tileset loaded");

                    const { context, width, height } = renderImage(img);

                    Globals.TilesetExtContext = context;
                    Globals.TilesetExtWidth   = width;
                    Globals.TilesetExtHeight  = height;

                    // Check limits
                    if ((Globals.TilesetExtWidth % 8) != 0) {
                        WriteMessage(kError, "ERROR. The <strong>external tileset width</strong> must be a multiple of 8 but is: " + Globals.TilesetExtWidth);
                        Globals.error = true;
                        //return false;
                    }

                    if ((Globals.TilesetExtHeight % 8) != 0) {
                        WriteMessage(kError, "ERROR. The <strong>external tileset height</strong> must be a multiple of 8 but is: " + Globals.TilesetExtHeight);
                        Globals.error = true;
                        //return false;
                    }

                    if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
                        if (Globals.TilesetExtWidth % Globals.SpriteWidth != 0) {
                            WriteMessage(kError, "ERROR. The <strong>tileset width</strong> must be a multiple of <strong>sprite width</strong> but are: " + Globals.TilesetExtWidth + " and " + Globals.SpriteWidth);
                            Globals.error = true;
                        }

                        if (Globals.TilesetExtHeight % Globals.SpriteHeight != 0) {
                            WriteMessage(kError, "ERROR. The <strong>tileset Height</strong> must be a multiple of <strong>sprite Height</strong> but are: " + Globals.TilesetExtHeight + " and " + Globals.SpriteHeight);
                            Globals.error = true;
                        }
                    }

                    const oldNumColors = Globals.Palette.length
                    CollectColorsFromImage(Globals.TilesetExtContext, Globals.TilesetExtWidth, Globals.TilesetExtHeight);
                    WriteMessage(kInfo, "Collected " + (Globals.Palette.length - oldNumColors) + " colors from <strong>external tileset</strong>");
                });
            }
            else {
                Globals.UseExternalTileset = false;
                WriteMessage(kWarning, "External tileset is checked but no texture is selected");
            }
        }

        // Load Blue Noise
        let blueNoiseData   = null;
        let blueNoiseWidth  = 0;
        let blueNoiseHeight = 0;
        if (Globals.UseBlueNoise) {
            if (Globals.BlueNoiseFileName.length > 0) {
                WriteMessage(kInfo, "Use external blue noise file: " + Globals.BlueNoiseFileName);
                loadedImages.push(loadImage($("#remote_blue_noise").val()));
                loadedImages.last().then((img) => {
                    WriteMessage(kInfo, "Blue noise image loaded");

                    const { context, width, height } = renderImage(img);

                    blueNoiseData   = context.getImageData(0, 0, width, height).data;
                    blueNoiseWidth  = width;
                    blueNoiseHeight = height;
                });
            }
            else {
                Globals.UseBlueNoise = false;
                WriteMessage(kWarning, "Blue noise is checked but no texture is selected");
            }
        }

        // Load external image
        Promise.all(loadedImages)
            .then((values) => {
                WriteMessage(kInfo, "Use external image file: " + Globals.ImageFileName);
                loadImage($("#remote_img").val())
                .then((img) => {
                    WriteMessage(kInfo, "Image loaded");
                    $("#page_file").replaceWith("<button onclick='location.reload();'>Reset</button>");

                    const { context, width, height, canvas } = renderImage(img);

                    Globals.ImageWidth  = width;
                    Globals.ImageHeight = height;

                    // Check limits
                    if ((Globals.ImageWidth % 8) != 0) {
                        WriteMessage(kError, "ERROR. The <strong>image width</strong> must be a multiple of 8 but is: " + Globals.ImageWidth);
                        Globals.error = true;
                        //return false;
                    }

                    if ((Globals.ImageHeight % 8) != 0) {
                        WriteMessage(kError, "ERROR. The <strong>image height</strong> must be a multiple of 8 but is: " + Globals.ImageHeight);
                        Globals.error = true;
                        //return false;
                    }

                    if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
                        if (Globals.ImageWidth % Globals.SpriteWidth != 0) {
                            WriteMessage(kError, "ERROR. The <strong>image width</strong> must be a multiple of <strong>sprite width</strong> but are: " + Globals.ImageWidth + " and " + Globals.SpriteWidth);
                            Globals.error = true;
                        }

                        if (Globals.ImageHeight % Globals.SpriteHeight != 0) {
                            WriteMessage(kError, "ERROR. The <strong>image height</strong> must be a multiple of <strong>sprite height</strong> but are: " + Globals.ImageHeight + " and " + Globals.SpriteHeight);
                            Globals.error = true;
                        }
                    }

                    //WriteMessage(kInfo, "Collecting colors from Image");

                    let origPaletteColors = 0;

                    // Collect colors from image if there is no palette
                    if (Globals.UseExternalPalette == false) {
                        if (Globals.AddImageColors == false) {
                            WriteMessage(kWarning, "Ignoring uncheck 'Add image colors to palette' because there is no palette");
                            WriteMessage(kInfo, "Collecting colors from Image");
                        }
                        const newColors = CountColorsFromImage(context, width, height);
                        GeneratePaletteRGB();
                        WriteMessage(kInfo, "Collected " + newColors + " colors from <strong>image</strong>");
                    }
                    // Is it only the transparent color?
                    else if ((Globals.UseExtTransparentColor && Globals.Palette.length < 2) || (Globals.UseExtTransparentColor == false && Globals.Palette.length < 1)) {
                        WriteMessage(kWarning, "There are no colors in the Palette image");
                        WriteMessage(kInfo, "Collecting colors from Image");
                        const newColors = CountColorsFromImage(context, width, height);
                        GeneratePaletteRGB();
                        WriteMessage(kInfo, "Collected " + newColors + " colors from <strong>image</strong>");
                    }
                    // Collect image color data
                    else {
                        origPaletteColors = Globals.Palette.length;
                        const newColors = CountColorsFromImage(context, width, height);
                        GeneratePaletteRGB();
                        if (origPaletteColors != Globals.Palette.length) {
                            WriteMessage(kWarning, "There are " + newColors + " new colors in the image");
                            // Reduce extra colors
                            if (Globals.AddImageColors == false) {
                                WriteMessage(kInfo, "Reducing colors to original palette");
                                ReduceColorsToOriginalPalette(origPaletteColors);
                            }
                        }
                    }

                    if (Globals.UseLimitColors) {
                        if (Globals.Palette.length > Globals.LimitColorsTo) {
                            WriteMessage(kWarning, "There are " + Globals.Palette.length + " colors, but the palette can only have " + Globals.LimitColorsTo);
                            WriteMessage(kInfo, "Reseting original palette");
                            WriteMessage(kInfo, "Quantizing extra colors");
                            const quantizer = new ColorQuantizer(4);
                            let firstColor  = 0;
                            let maxColors   = Globals.LimitColorsTo;
                            if (Globals.FixTransparentColor)
                                firstColor = 1;

                            if (Globals.FixPaletteColors) {
                                if (Globals.LimitColorsTo > origPaletteColors) {
                                    firstColor = origPaletteColors;
                                    maxColors = Globals.LimitColorsTo - origPaletteColors;
                                }
                            }
                            let color;
                            for (let i=0; i<firstColor; ++i) {
                                color = Globals.PaletteRGB[i];
                                quantizer.add_color(color[0], color[1], color[2], Globals.ColorCount[i] + 0xffff, true);
                            }
                            for (let i=firstColor; i<Globals.PaletteRGB.length; ++i) {
                                color = Globals.PaletteRGB[i];
                                quantizer.add_color(color[0], color[1], color[2], Globals.ColorCount[i], false);
                            }
                            quantizer.check_integrity();

                            //let newColors = quantizer.reduce_colors(maxColors, false);
                            const numTransparents = (Globals.LimitColorsTo / 16) - 1;
                            const newColors = quantizer.reduce_colors(Globals.LimitColorsTo - numTransparents, false);

                            Globals.PaletteRGB = Globals.PaletteRGB.slice(0, firstColor);
                            Globals.Palette    = Globals.Palette.slice(0, firstColor);
                            Globals.ColorCount = Globals.ColorCount.slice(0, firstColor);

                            // Find palette colors in newColors (to maintain the order in the palette)
                            for (let i=0; i<firstColor; ++i) {
                                let color_pal = Globals.PaletteRGB[i];
                                for (let c=0; c<newColors.length; ++c) {
                                    let color_new = newColors[c];
                                    if (color_new != null) {
                                        if (color_new[0] == color_pal[0] && color_new[1] == color_pal[1] && color_new[2] == color_pal[2]) {
                                            Globals.ColorCount[i] = color_new[3] - 0xffff;
                                            newColors[c] = null;
                                            break;
                                        }
                                    }
                                }
                            }

                            // Add extra colors
                            for (let i=0; i<newColors.length; ++i) {
                                const color = newColors[i];
                                if (color != null) {
                                    if (AddTransparentColorIfNeeded()) {
                                        const rgb = HexMD888ToArray(Globals.Palette[Globals.Palette.length - 1]);
                                        Globals.PaletteRGB.push(rgb);
                                    }
                                    Globals.PaletteRGB.push([color[0], color[1], color[2]]);
                                    Globals.Palette.push(RGBToHexMD888(color[0], color[1], color[2]));
                                    Globals.ColorCount.push(color[3]);
                                    WriteMessage(kSuccess, "New color added: " + Globals.Palette[Globals.Palette.length-1] + " (" + color[3] + ")");
        //                            WriteMessage(kSuccess, `New color added: ${Globals.Palette[Globals.Palette.length-1]} ( ${color[3]} )`);
                                }
                            }
                        }
                        else {
                            WriteMessage(kSuccess, "There are " + Globals.Palette.length + " palette colors");
                        }
                    }

                    if (Globals.UseExternalTileset) {
                        TransformImage(Globals.TilesetExtContext, Globals.TilesetExtWidth, Globals.TilesetExtHeight, blueNoiseData, blueNoiseWidth, blueNoiseHeight)
                        GetHashes(Globals.TilesetExtWidth, Globals.TilesetExtHeight)
                        WriteMessage(kInfo, "Loaded " + Globals.Hashes.length + " tiles from <strong>external tileset</strong>");
                        Globals.TilesetExtColorIndices = Globals.ColorIndices
                        Globals.ColorIndices = []
                    }

                    TransformImage(context, width, height, blueNoiseData, blueNoiseWidth, blueNoiseHeight);

                    // Print Table
                    const table = document.getElementById("palette_table");
                    DrawPaletteToTable(table);

                    // Generate Palette Image
                    const canvas_draw = document.createElement("canvas");
                    canvas_draw.className = "palette";
                    canvas_draw.width = 16;
                    canvas_draw.height = 16;
                    DrawPaletteToCanvas(canvas_draw);

                    // Add palette for download
                    $("#palette").append(canvas_draw);
                    $("#palette").append(document.createElement("br"));
                    const link = document.createElement("a");
                    link.href = canvas_draw.toDataURL();
                    link.download = "palette.png";
                    link.textContent = "Download file!";
                    $("#palette").append(link);

                    // Print info
                    const output = $("#output");
                    if (Globals.error == false) {
                        let info = PrintPalette();
                        if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
                            info += PrintSpriteData();
                        }
                        if (Globals.OutputMode == Globals.OutputModeNames.Image) {
                            info += PrintImageData();
                        }
                        output.text(PrintHeaderInfo() + info);
                    }
                    else {
                        output.text("There were errors!");
                    }

                    // Add image
                    const image = document.createElement("div");
                    image.appendChild(img);
                    $("#image").append(image);

                    // Add image MegaDrive
                    const imageMD = document.createElement("div");
                    imageMD.appendChild(context.canvas);
                    $("#image_md").append(imageMD);

                    // Add tiles
                    if (Globals.OutputMode != Globals.OutputModeNames.JustPalette) {
                        DrawTilesToTable(document.getElementById("tiles_table"), context, width, height);
                        if (Globals.TilesetExtCanvas != null) {
                            const link = document.createElement("a");
                            link.href = Globals.TilesetExtCanvas.toDataURL();
                            link.download = "tileSet.png";
                            link.textContent = "Download file!";
                            $("#tile_set").append(link);
                        }
                    }
                });
            });

            return false;
        });
});

//-------------------------------------
// Print functions
//-------------------------------------

// Print info for the header (.h) file
//-------------------------------------
function PrintHeaderInfo() {
    const numTilesX    = Globals.ImageWidth  / 8;
    const numTilesY    = Globals.ImageHeight / 8;
    const spriteTilesX = Globals.SpriteWidth / 8;
    let length = (Globals.Palette.length >> 4);
    length    += (Globals.Palette.length % 16) == 0 ? 0 : 1;
    length   <<= 4;

    let headerInfo = "\n"
    if (Globals.OutputMode != Globals.OutputModeNames.JustPalette) {
        if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
            headerInfo += "#define k" + Globals.ImageNameCap + "TilesH\t(" + (numTilesX / spriteTilesX) + " * " + spriteTilesX + ")\n";
        }
        if (Globals.OutputMode == Globals.OutputModeNames.Image) {
            headerInfo += "#define k" + Globals.ImageNameCap + "TilesH\t" + numTilesX + "\n";
        }
        headerInfo += "#define k" + Globals.ImageNameCap + "TilesV\t" + numTilesY + "\n";
        if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
            headerInfo += "#define k" + Globals.ImageNameCap + "TileSizeH\t" + Globals.SpriteWidth + "\n";
            headerInfo += "#define k" + Globals.ImageNameCap + "TileSizeV\t" + Globals.SpriteHeight + "\n";
        }
        if (Globals.OutputMode == Globals.OutputModeNames.Image) {
            headerInfo += "#define k" + Globals.ImageNameCap + "NumTiles\t(k" + Globals.ImageNameCap + "TilesH * k" + Globals.ImageNameCap + "TilesV)\n";
            headerInfo += "#define k" + Globals.ImageNameCap + "DataSize\t" + Globals.OptimizedNumTiles + "\n";
        }
        else {
            headerInfo += "#define k" + Globals.ImageNameCap + "DataSize\t(k" + Globals.ImageNameCap + "TilesH * k" + Globals.ImageNameCap + "TilesV)\n";
        }
        headerInfo += "\n";
    }

    headerInfo += "extern const u16 gPal" + Globals.ImageNameCap + "[" + length + "];\n";
    if (Globals.OutputMode != Globals.OutputModeNames.JustPalette) {
        if (Globals.OutputMode == Globals.OutputModeNames.Image) {
            headerInfo += "extern const u16 gTileMap" + Globals.ImageNameCap + "[k" + Globals.ImageNameCap + "NumTiles];\n";
        }
        headerInfo += "extern const u32 gData" + Globals.ImageNameCap + "[k" + Globals.ImageNameCap + "DataSize * 8];\n";
    }
    headerInfo += "\n//--\n";

    return headerInfo;
}

// Print palette info for the source (.c/.cpp) file
//-------------------------------------
function PrintPalette() {
    let length = (Globals.Palette.length >> 4);
    length    += (Globals.Palette.length % 16) == 0 ? 0 : 1;
    length   <<= 4;

    let paletteInfo = "\nconst u16 gPal" + Globals.ImageNameCap + "[" + length + "] = {\n";
    for (let i = 0; i < length; ++i) {
        if ((i % 8) == 0) {
            if (i != 0) {
                paletteInfo += "\n";
            }
            paletteInfo += "\t";
        }
        if (i < Globals.Palette.length)
            paletteInfo += HexMD888ToMDPal(Globals.Palette[i]) + ", ";
        else
            paletteInfo += "0x0000, ";
    }
    paletteInfo += "\n};\n";

    return paletteInfo;
}

// Used for external tileset
//-------------------------------------
function GetHashes(width, height) {
    const tilePalette = new TilePalette();
    let physicalTile = 0;

    for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
            const offset1 = (y * width + x);
            let tileInfo = "";
            for (let tileY = 0; tileY < 8; ++tileY) {
                let tileRow = "0x";
                const offset2 = offset1 + tileY * width;
                tilePalette.reset();
                for (let tileX = 0; tileX < 8; ++tileX) {
                    tileRow += tilePalette.getValueString(Globals.ColorIndices[offset2 + tileX]);
                }
                tilePalette.addPalette();

                tileRow += ", ";
                tileInfo += tileRow;
            }

            tileInfo += " // Palette: " + tilePalette.getPalette();
            let numTile = Globals.Hashes.indexOf(tileInfo);
            if (numTile == -1) {
                numTile = Globals.Hashes.length;
                Globals.Hashes.push(tileInfo);
                Globals.ValidTiles[physicalTile++] = true;
            }
            else {
                Globals.ValidTiles[physicalTile++] = false;
            }
        }
    }

    //WriteMessage(kSuccess, "Loaded " + Globals.Hashes.length + " different tiles <strong>from external tileset</strong>");
    if (Globals.OptimizeImageData) {
        Globals.OptimizedNumTiles = Globals.Hashes.length;
    }
}

// Print sprite info for the source (.c/.cpp) file
//-------------------------------------
function PrintSpriteData() {
    const numTilesX    = Globals.ImageWidth   / 8;
    const numTilesY    = Globals.ImageHeight  / 8;
    const spriteTilesX = Globals.SpriteWidth  / 8;
    const spriteTilesY = Globals.SpriteHeight / 8;
    const spriteTiles  = spriteTilesX * spriteTilesY;
    let imageInfo      = "";
    let lineInfo       = "";
    let spriteInfo     = "";
    let numTile        = 0;
    let numSprite      = 0;
    let numSprites     = 0;
    let uniqueSprites  = [];

    // Cannot optimize sprite num tiles. All must be there
    Globals.OptimizedNumTiles = numTilesX * numTilesY;

    imageInfo += "\nconst u32 gData" + Globals.ImageNameCap + "[k" + Globals.ImageNameCap + "DataSize * 8] = {\n";

    for (let y = 0; y < Globals.ImageHeight; y += spriteTilesY * 8) {
        for (let x = 0; x < Globals.ImageWidth; x += 8) {
            const offset1 = y * Globals.ImageWidth + x;
            for (let spriteY = 0; spriteY < spriteTilesY; ++spriteY) {
                lineInfo = "\t";
                const offset3 = spriteY * 8 * Globals.ImageWidth;
                for (let tileY = 0; tileY < 8; ++tileY) {
                    let data = "0x";
                    const offset2 = offset1 + offset3 + tileY * Globals.ImageWidth;
                    for (let tileX = 0; tileX < 8; ++tileX) {
                        data += Globals.ColorIndices[offset2 + tileX].toString(16);
                    }
                    data += ", ";
                    lineInfo   += data;
                    spriteInfo += data;
                }

                if ((numTile % spriteTiles) == (spriteTiles - 1)) {
                    const index = uniqueSprites.indexOf(spriteInfo);
                    if (index == -1) {
                        uniqueSprites.push(spriteInfo);
                        if (Globals.OptimizeSpriteData) {
                            Globals.ValidTiles[numSprite] = true;
                            const str = " // Sprite " + (uniqueSprites.length - 1) + " (pos: " + numSprite++ + ")\n";
                            imageInfo += spriteInfo.replace("\n", str) + "\n";
                        }
                    }
                    else {
                        if (Globals.OptimizeSpriteData) {
                            Globals.ValidTiles[numSprite++] = false;
                        }
                        WriteMessage(kWarning, "Repeated sprite: " + numSprites + " == " + index)
                    }
                    spriteInfo = "";
                    ++numSprites;
                }

                if (Globals.OptimizeSpriteData == false) {
                    if ((numTile % spriteTiles) == 0) {
                        Globals.ValidTiles[numSprite] = true;
                        lineInfo += " // Sprite " + numSprite++;
                    }

                    imageInfo += lineInfo + "\n";
                }
                else {
                    if ((numTile % spriteTiles) != (spriteTiles - 1)) {
                        spriteInfo += "\n";
                    }
                }

                ++numTile;
            }
        }
    }

    imageInfo += "};\n";
    WriteMessage(kInfo, "Unique sprites: " + uniqueSprites.length)
    WriteMessage(kInfo, "Total sprites: " + numSprite)

    return imageInfo;
}

//-------------------------------------
Set.prototype.getByIndex = function(index) { return [...this][index]; }

//-------------------------------------
String.prototype.hashCode = function() {
    let hash = 0;

    if (this.length == 0)
        return hash;

    const len = this.length
    for (let i = 0; i < len; i++) {
        const chr = this.charCodeAt(i);
        //hash  = ((hash << 5) - hash) + chr;
        hash = hash * 31 + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};

// Ugly class to not repeat this code
class TilePalette {
    constructor() {
        this.reset();
    }

    getValueString(value) {
        if (this.min > value) {
            this.min = value;
        }
        if (this.max < value) {
            this.max = value;
        }

        while(value >= 16) value -= 16;

        return value.toString(16);
    }

    addValue(value) {
        if (value < 16) {
            this.palette.add(0);
            this.data[0] += value.toString(16);
            this.data[1] += "0";
            this.data[2] += "0";
            this.data[3] += "0";
        }
        else if (value < 32) {
            this.palette.add(1);
            this.data[0] += "0";
            this.data[1] += (value - 16).toString(16);
            this.data[2] += "0";
            this.data[3] += "0";
        }
        else if (value < 48) {
            this.palette.add(2);
            this.data[0] += "0";
            this.data[1] += "0";
            this.data[2] += (value - 32).toString(16);
            this.data[3] += "0";
        }
        else if (value < 64) {
            this.palette.add(3);
            this.data[0] += "0";
            this.data[1] += "0";
            this.data[2] += "0";
            this.data[3] += (value - 48).toString(16);
        }
        else {
            // Error
        }
    }

    has(pal) {
        return this.palette.has(pal);
    }

    addPalette() {
        // Palette 1
        if (this.min >= 0 && this.max < 16) {
            this.palette.add(0);
        }
        // Palette 2
        else if (this.min >= 16 && this.max < 32) {
            this.palette.add(1);
        }
        // Palette 3
        else if (this.min >= 32 && this.max < 48) {
            this.palette.add(2);
        }
        // Palette 4
        else if (this.min >= 48 && this.max < 64) {
            this.palette.add(3);
        }
        // Error
        else {
            this.palette.add(-1);
        }
    }

    getPalette() {
        if (this.palette.size == 1) {
            const [pal] = this.palette;
            return pal;
        }

        return "(error)"
    }

    isOk() {
        return (this.palette.size <= 2);
    }

    reset() {
        this.min =  1024;
        this.max = -1024;
        this.data = ["", "", "", ""];
        this.palette = new Set();
    }
}

function ReverseString(str) {
    let result = "";
    for (let i = str.length - 1; i >= 0; i--) {
        result += str[i];
    }
    return result;
}

function GetFlipV(tileInfo) {
    return tileInfo.substr(0, tileInfo.length-2).split(", ").reverse().join(", ") + ", ";
}

function GetFlipH(tileInfo) {
    let result = "";
    const rows = tileInfo.substr(0, tileInfo.length-2).split(", ");
    for (const row of rows) {
        result += "0x" + ReverseString(row.substr(2)) + ", ";
    }

    return result;
}

function GetFlipHV(tileInfo) {
    let result = "";
    const rows = tileInfo.substr(0, tileInfo.length-2).split(", ").reverse();
    for (const row of rows) {
        result += "0x" + ReverseString(row.substr(2)) + ", ";
    }

    return result;
}

function GetNumTileEx(lineInfo, paletteIndex) {
    const pal = " // Palette: " + paletteIndex;

    let numTile = Globals.Hashes.indexOf(lineInfo + pal);
    if (numTile != -1)
        return numTile;

    numTile = Globals.Hashes.indexOf(GetFlipH(lineInfo) + pal);
    if (numTile != -1)
        return numTile | (1 << 11);    // FlipH

    numTile = Globals.Hashes.indexOf(GetFlipV(lineInfo) + pal);
    if (numTile != -1)
        return numTile | (1 << 12);    // FlipV

    numTile = Globals.Hashes.indexOf(GetFlipHV(lineInfo) + pal);
    if (numTile != -1)
        return numTile | (3 << 11);    // FlipH + FlipV

    return -1;
}

//-------------------------------------
function PrintImageData() {
    const num_tiles_x = Globals.ImageWidth  / 8;
    const num_tiles_y = Globals.ImageHeight / 8;
    let numTileA = 0;
    let numTileB = Globals.OptimizeImageData ? 0 : num_tiles_x * num_tiles_y;
    let numMap   = 0;
    let tilePalette = new TilePalette();
    let physical_tile = 0;
    let addPalette = Globals.AddMetadata ? (1 << 13) : 0;

    let palA = -1;
    let palB = -1;
    if (Globals.ColorCount.length <= 16) {
        palA = 0;
    }
    else if (Globals.ColorCount.length <= 32) {
        palA = 0;
        palB = 1;
    }
    else {
        for (let i = 0; i < Globals.ColorCount.length; ++i) {
            if (Globals.ColorCount[i] > 0) {
                const palId = i >> 4;
                if (palA == -1) {
                    palA = palId;
                }
                else if (palA != palId) {
                    if (palB == -1) {
                        palB = palId;
                    }
                    else if (palB != palId) {
                        Globals.error = true;
                    }
                }
            }
        }
    }

    let mapInfoA   = "\nconst u16 gTileMap" + Globals.ImageNameCap + "A[k" + Globals.ImageNameCap + "NumTiles] = {";
    let mapInfoB   = "\nconst u16 gTileMap" + Globals.ImageNameCap + "B[k" + Globals.ImageNameCap + "NumTiles] = {";
    let imageInfoA = "\nconst u32 gData"    + Globals.ImageNameCap +  "[k" + Globals.ImageNameCap + "DataSize * 8] = {\n";
    let imageInfoB = "";

    let offset1  = 0;
    let offset2  = 0;
    let newTiles = 0;
    let usesPalB = false;

    if (Globals.UseExternalTileset) {
        const height = Globals.TilesetExtHeight;
        const width  = Globals.TilesetExtWidth;
        for (let y = 0; y < height; y += 8) {
            for (let x = 0; x < width; x += 8) {
                offset1 = (y * width + x);
                let tileInfo = "";
                for (let tileY = 0; tileY < 8; ++tileY) {
                    let tileRow = "0x";
                    offset2 = offset1 + tileY * width;
                    tilePalette.reset();
                    for (let tileX = 0; tileX < 8; ++tileX) {
                        tileRow += tilePalette.getValueString(Globals.TilesetExtColorIndices[offset2 + tileX]);
                    }
                    tilePalette.addPalette();

                    tileRow  += ", ";
                    tileInfo += tileRow;
                }

                tileInfo   += " // Palette: " + tilePalette.getPalette();
                imageInfoA += tileInfo + " - Tile " + numTileA + " (" + IntToHex4(numTileA) + ")\n";
                if (tilePalette.isOk() == false) {
                    WriteMessage(kWarning, "Mixed palettes in tile: " + numTileA + ". Not yet supported");
                    Globals.error = true;
                }
                ++numTileA;
            }
        }
    }

    for (let y = 0; y < Globals.ImageHeight; y += 8) {
        for (let x = 0; x < Globals.ImageWidth; x += 8) {
            offset1 = (y * Globals.ImageWidth + x);
            let tileInfoA = "";
            let tileInfoB = "";
            for (let tileY = 0; tileY < 8; ++tileY) {
                offset2 = offset1 + tileY * Globals.ImageWidth;

                tilePalette.reset();
                for (let tileX = 0; tileX < 8; ++tileX) {
                    tilePalette.addValue(Globals.ColorIndices[offset2 + tileX]);
                }

                if (tilePalette.has(palA)) {
                    tileInfoA += "0x" + tilePalette.data[palA] + ", ";
                }
                else {
                    tileInfoA += "0x00000000, "
                }

                if (tilePalette.has(palB)) {
                    usesPalB = true;
                    tileInfoB += "0x" + tilePalette.data[palB] + ", ";
                }
                else {
                    tileInfoB += "0x00000000, "
                }
            }

            if (Globals.OptimizeImageData) {
                if (Globals.AddMetadata) {
                    numTileA = GetNumTileEx(tileInfoA, palA);
                    numTileB = GetNumTileEx(tileInfoB, palB);
                }
                else {
                    tileInfoA += " // Palette: " + palA;
                    tileInfoB += " // Palette: " + palB;
                    numTileA = Globals.Hashes.indexOf(tileInfoA);
                    numTileB = Globals.Hashes.indexOf(tileInfoB);
                }
                if (palB == -1)
                    numTileB = null;

                let valid = false;
                if (numTileA == -1) {
                    numTileA = Globals.Hashes.length;
                    if (Globals.AddMetadata) {
                        tileInfoA += " // Palette: " + palA;
                    }
                    imageInfoA += "    " + tileInfoA + " - Tile " + numTileA + " (" + IntToHex4(numTileA) + ")\n";
                    if (tilePalette.isOk() == false) {
                        WriteMessage(kWarning, "Mixed palettes in tile: " + numTileA + ". Not yet supported");
                        Globals.error = true;
                    }

                    Globals.Hashes.push(tileInfoA);
                    valid = true;
                    ++newTiles;
                }

                if (numTileB == -1) {
                    numTileB = Globals.Hashes.length;
                    if (Globals.AddMetadata) {
                        tileInfoB += " // Palette: " + palB;
                    }
                    imageInfoA += "    " + tileInfoB + " - TileB " + numTileB + " (" + IntToHex4(numTileB) + ")\n";
                    if (tilePalette.isOk() == false) {
                        WriteMessage(kWarning, "Mixed palettes in tile: " + numTileB + ". Not yet supported");
                        Globals.error = true;
                    }

                    Globals.Hashes.push(tileInfoB);
                    valid = true;
                    ++newTiles;
                }

                Globals.ValidTiles[physical_tile++] = valid;
            }
            else {
                Globals.ValidTiles[physical_tile++] = true;
            }

            if ((numMap % num_tiles_x) == 0) {
                mapInfoA += "\n\t";
                mapInfoB += "\n\t";
            }

            mapInfoA += IntToHex4(numTileA + (palA * addPalette)) + ", ";
            mapInfoB += IntToHex4(numTileB + (palB * addPalette)) + ", ";
            ++numMap;

            if (Globals.OptimizeImageData == false) {
                imageInfoA += "    " + tileInfoA + " // Tile "  + numTileA++ + "\n";
                imageInfoB += "    " + tileInfoB + " // TileB " + numTileB++ + "\n";
            }
        }
    }

    if (Globals.UseExternalTileset && newTiles > 0) {
        WriteMessage(kSuccess, "Added " + newTiles + " tiles from <strong>image</strong>");
    }

    if (Globals.OptimizeImageData) {
        Globals.OptimizedNumTiles = Globals.Hashes.length;
    }
    else {
        Globals.OptimizedNumTiles = (num_tiles_x * num_tiles_y);
    }

    return mapInfoA + "\n};\n" + (usesPalB ? mapInfoB + "\n};\n" : "") + imageInfoA + (usesPalB ? imageInfoB : "") + "};\n";
}

//-------------------------------------
function ReduceColorsToOriginalPalette(orig_palette_colors) {
    const palette_extra     = Globals.Palette.slice(orig_palette_colors, Globals.Palette.length);
    const palette_extraRGB  = Globals.PaletteRGB.slice(orig_palette_colors, Globals.PaletteRGB.length);
    const color_count_extra = Globals.ColorCount.slice(orig_palette_colors, Globals.ColorCount.length);
    Globals.Palette = Globals.Palette.slice(0, orig_palette_colors);
    Globals.PaletteRGB = Globals.PaletteRGB.slice(0, orig_palette_colors);
    Globals.ColorCount = Globals.ColorCount.slice(0, orig_palette_colors);
    for (let i=0; i<palette_extraRGB.length; ++i) {
        const color = palette_extraRGB[i];
        const r = color[0];
        const g = color[1];
        const b = color[2];
        const new_index = FindNearestColor(r, g, b);
        const old_index = orig_palette_colors + i;
        WriteMessage(kInfo, "Convert color " + palette_extra[i] + " to " + Globals.Palette[new_index] + "(" + color_count_extra[i] + ")");
        Globals.ColorCount[new_index] += color_count_extra[i];
        Globals.ColorIndices.forEach(
            function(item, idx, array) {
                if (item == old_index)
                    array[idx] = new_index;
            }
        );
    }

}
