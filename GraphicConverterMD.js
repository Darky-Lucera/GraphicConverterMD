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

// Sorry but this simplify a lot the code
var Globals = {};

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
    if(Globals.LimitColorsTo != 16) {
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
    if(Globals.SpriteWidth != 8) {
        $("#spt_width").val(Globals.SpriteWidth);
        $("#spt_width-8").removeClass("btn-primary");
        $("#spt_width-8").addClass("btn-outline-primary");
        $("#spt_width-" + Globals.SpriteWidth).removeClass("btn-outline-primary");
        $("#spt_width-" + Globals.SpriteWidth).addClass("btn-primary");
    }
    if(Globals.SpriteHeight != 8) {
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

    // var v = 0;
    // var c = 0;
    // var str = "";
    // for (var i = 0; i < 256; ++i) {
    //     if (v != ComponentToMD888(i)) {
    //         str += "(" + c + ")\n";
    //         v = ComponentToMD888(i);
    //         c = 0;
    //     }
    //     str += ComponentToMD888(i) + " ";
    //     //if ((i % 16) == 15) str += "\n";
    //     ++c;
    // }
    // str += "(" + c + ")\n";
    // console.log(str);
}

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

function SetFixPaletteColors(value) {
    Globals.FixPaletteColors = value;
}

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

function SetExtTransparentColor(index, value) {
    var error = document.getElementById("ext_transparent_color_error" + index);
    if (CheckHexColor(value) == false) {
        error.innerHTML = "Invalid color";
        error.style.backgroundColor = "#faa";
        return;
    }
    error.innerHTML = "Ok";
    error.style.backgroundColor = "#e9ecef";

    var ext_transparent_color = document.getElementById("ext_transparent_color" + index);
    ext_transparent_color.style.color = GetLabelColor(value);
    ext_transparent_color.style.backgroundColor = value;

    var ext_transparent_color_md = document.getElementById("ext_transparent_color_md" + index);
    ext_transparent_color_md.value = "MD: " + HexToHexMD888(value);
    ext_transparent_color_md.style.color = GetLabelColor(value);
    ext_transparent_color_md.style.backgroundColor = HexToHexMD888(value);
}

function SetFixTransparentColor(value) {
    Globals.FixTransparentColor = value;
}

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

function SetLimitColorsTo(value) {
    $("#num_colors").val(value);
    $("#num_colors-" + Globals.LimitColorsTo).removeClass("btn-primary");
    $("#num_colors-" + Globals.LimitColorsTo).addClass("btn-outline-primary");
    $("#num_colors-" + value).removeClass("btn-outline-primary");
    $("#num_colors-" + value).addClass("btn-primary");
    Globals.LimitColorsTo = value | 0;
}

function SetUseDithering(value) {
    Globals.UseDithering = value;
}

function SetUseBlueNoise(value) {
    Globals.UseBlueNoise = value;
}

function SetAddImageColors(value) {
    Globals.AddImageColors = value;
}

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

function SetOptimizeSpriteData(value) {
    Globals.OptimizeSpriteData = value;
}

function SetSpriteWidth(value) {
    $("#spt_width").val(value);
    $("#spt_width-" + Globals.SpriteWidth).removeClass("btn-primary");
    $("#spt_width-" + Globals.SpriteWidth).addClass("btn-outline-primary");
    $("#spt_width-" + value).removeClass("btn-outline-primary");
    $("#spt_width-" + value).addClass("btn-primary");
    Globals.SpriteWidth = value | 0;
}

function SetSpriteHeight(value) {
    $("#spt_height").val(value);
    $("#spt_height-" + Globals.SpriteHeight).removeClass("btn-primary");
    $("#spt_height-" + Globals.SpriteHeight).addClass("btn-outline-primary");
    $("#spt_height-" + value).removeClass("btn-outline-primary");
    $("#spt_height-" + value).addClass("btn-primary");
    Globals.SpriteHeight = value | 0;
}

function SetOptimizeImageData(value) {
    Globals.OptimizeImageData = value;
}

function SetAddMetadata(value) {
    Globals.AddMetadata = value;
}

function ReadFilePalette(evt) {
    var file = evt.files[0];
    if (file) {
        Globals.PaletteFileName = file.name;
        Globals.PaletteName = (file.name.split('\\').pop().split('/').pop());
        $("#fileInputPalLabel").text(Globals.PaletteName);
        Globals.PaletteName = (Globals.PaletteName.split('.'))[0];
        var fileReader = new FileReader();
        fileReader.onload = function(evtB) {
            var contents = evtB.target.result;
            var tmppath = URL.createObjectURL(file);
            $("#remote_pal").val(tmppath);
        };
        fileReader.readAsText(file);
    }
    else {
        Globals.PaletteName = "";
        alert("Failed to load file");
    }
}

function ReadFileTileset(evt) {
    var file = evt.files[0];
    if (file) {
        Globals.TilesetFileName = file.name;
        Globals.TilesetName = (file.name.split('\\').pop().split('/').pop());
        $("#fileInputTilesetLabel").text(Globals.TilesetName);
        Globals.TilesetName = (Globals.TilesetName.split('.'))[0];
        var fileReader = new FileReader();
        fileReader.onload = function(evtB) {
            var contents = evtB.target.result;
            var tmppath = URL.createObjectURL(file);
            $("#remote_tileset").val(tmppath);
        };
        fileReader.readAsText(file);
    }
    else {
        Globals.TilesetName = "";
        alert("Failed to load file");
    }
}

function ReadFileBlueNoise(evt) {
    var file = evt.files[0];
    if (file) {
        Globals.BlueNoiseFileName = file.name;
        Globals.BlueNoiseName = (file.name.split('\\').pop().split('/').pop());
        $("#fileInputBlueNoiseLabel").text(Globals.BlueNoiseName);
        Globals.BlueNoiseName = (Globals.BlueNoiseName.split('.'))[0];
        var fileReader = new FileReader();
        fileReader.onload = function(evtB) {
            var contents = evtB.target.result;
            var tmppath = URL.createObjectURL(file);
            $("#remote_blue_noise").val(tmppath);
        };
        fileReader.readAsText(file);
    }
    else {
        Globals.BlueNoiseName = "";
        alert("Failed to load file");
    }
}

function Capitalize(str) {
    const arr = str.split("_").join(" ").split("-").join(" ").split(" ");
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join("");
}

function ReadFileImage(evt) {
    var file = evt.files[0];
    if (file) {
        Globals.ImageFileName = file.name;
        Globals.ImageName = (file.name.split('\\').pop().split('/').pop());
        $("#fileInputImageLabel").text(Globals.ImageName);
        Globals.ImageName = (Globals.ImageName.split('.'))[0];
        Globals.ImageNameCap = Capitalize(Globals.ImageName);
        var fileReader = new FileReader();
        fileReader.onload = function(evtB) {
            var contents = evtB.target.result;
            var tmppath = URL.createObjectURL(file);
            $("#remote_img").val(tmppath);
        };
        fileReader.readAsText(file);
    }
    else {
        Globals.ImageName = "";
        Globals.ImageNameCap = "";
        alert("Failed to load file");
    }
}

//-------------------------------------

function WriteMessage(className, message) {
    var span = document.createElement("span");
    span.className = className;
    span.innerHTML = message;
    $("#messages").append(span);
    $("#messages").append(document.createElement("br"));
}

function AddTransparentIfNeeded() {
    // Allow get first transparent color from image
    //if(Globals.Palette.length == 0) {
    //    const color = Globals.TransparentColors[0];
    //    WriteMessage("text-info", "Added alpha: " + color);
    //    Globals.Palette.push(color);
    //    Globals.ColorCount.push(0);
    //}
    //else 
    if(Globals.Palette.length == 16) {
        const color = Globals.TransparentColors[1];
        WriteMessage("text-info", "Added alpha: " + color);
        Globals.Palette.push(color);
        Globals.ColorCount.push(0);
        return true;
    }
    else if(Globals.Palette.length == 32) {
        const color = Globals.TransparentColors[2];
        WriteMessage("text-info", "Added alpha: " + color);
        Globals.Palette.push(color);
        Globals.ColorCount.push(0);
        return true;
    }
    else if(Globals.Palette.length == 48) {
        const color = Globals.TransparentColors[3];
        WriteMessage("text-info", "Added alpha: " + color);
        Globals.Palette.push(color);
        Globals.ColorCount.push(0);
        return true;
    }

    return false;
}

// Collect all different colors from the image
function CollectColorsFromImage(context, width, height) {
    var newColors = 0;
    var image_data = context.getImageData(0, 0, width, height).data;
    for (var y = 0; y < height; y++) {
        var offsetY = y * width * 4;
        for (var x = 0; x < width; x++) {
            var offsetYX = offsetY + x * 4;
            var r = image_data[offsetYX + 0];
            var g = image_data[offsetYX + 1];
            var b = image_data[offsetYX + 2];

            var color = RGBToHexMD888(r, g, b);
            var index = Globals.Palette.indexOf(color);
            if (index == -1) {
                newColors++;
                AddTransparentIfNeeded();
                Globals.Palette.push(color);
                Globals.ColorCount.push(0);
            }
        }
    }
    
    Globals.PaletteNumColors = Globals.Palette.length;
    return newColors;
}

function CountColorsFromImage(context, width, height) {
    var newColors = 0;
    var image_data = context.getImageData(0, 0, width, height).data;
    for (var y = 0; y < height; y++) {
        var offsetY = y * width * 4;
        for (var x = 0; x < width; x++) {
            var offsetYX = offsetY + x * 4;
            var r = image_data[offsetYX + 0];
            var g = image_data[offsetYX + 1];
            var b = image_data[offsetYX + 2];

            var color = RGBToHexMD888(r, g, b);
            var index = Globals.Palette.indexOf(color);
            if (index == -1) {
                newColors++;
                AddTransparentIfNeeded();
                Globals.Palette.push(color);
                Globals.ColorCount.push(1);
                WriteMessage("text-warning", "New color found in image that is not in palette: " + color);
            }
            else {
                Globals.ColorCount[index]++;
            }
        }
    }

    return newColors;
}

function TransformImage(image_context, image_width, image_height, blue_noise_data, blue_noise_width, blue_noise_height) {
    var image = image_context.getImageData(0, 0, image_width, image_height);
    var image_data = image.data;

    // Just in case, we are going to count the colors again (dithering may change it)
    Globals.ColorCount = new Array(Globals.PaletteRGB.length);
    Globals.ColorCount.fill(0);

    Globals.ColorIndices = new Array(image_width * image_height);
    var col_index = 0;
    for (var y = 0; y < image_height; y++) {
        var offsetY = y * image_width * 4;
        for (var x = 0; x < image_width; x++) {
            var offsetYX = offsetY + x * 4;
            var r = image_data[offsetYX + 0];
            var g = image_data[offsetYX + 1];
            var b = image_data[offsetYX + 2];

            var pal_index;
            if(Globals.UseBlueNoise) {
                var offsetBN = (y % blue_noise_height) * blue_noise_width * 4 + (x % blue_noise_width) * 4;
                var bnx = blue_noise_data[offsetBN + 0] - 128;
                var bny = blue_noise_data[offsetBN + 1] - 128;
                var bnz = blue_noise_data[offsetBN + 2] - 128;
                pal_index = FindNearestColor(r + bnx, g + bny, b + bnz);
            }
            else {
                pal_index = FindNearestColor(r, g, b);
            }

            Globals.ColorCount[pal_index]++;
            Globals.ColorIndices[col_index++] = pal_index;
            var pal_color = Globals.PaletteRGB[pal_index];
            var mdR = pal_color[0];
            var mdG = pal_color[1];
            var mdB = pal_color[2];

            image_data[offsetYX + 0] = mdR;
            image_data[offsetYX + 1] = mdG;
            image_data[offsetYX + 2] = mdB;

            if (Globals.UseDithering) {
                //var dist = Math.sqrt(ColorDistanceEuclideanPerceptual(mdR, mdG, mdB, r, g, b));
                //var diffR = dist;
                //var diffG = dist;
                //var diffB = dist;
                var diffR = r - mdR;
                var diffG = g - mdG;
                var diffB = b - mdB;
                if (x < image_width - 1) {
                    image_data[offsetYX + 4 + 0] = ClampComponent(image_data[offsetYX + 4 + 0] + ((diffR * 7) >> 4));
                    image_data[offsetYX + 4 + 1] = ClampComponent(image_data[offsetYX + 4 + 1] + ((diffG * 7) >> 4));
                    image_data[offsetYX + 4 + 2] = ClampComponent(image_data[offsetYX + 4 + 2] + ((diffB * 7) >> 4));
                }
                if (y < image_height - 1) {
                    var offsetAux = offsetYX + image_width * 4;

                    if (x > 1) {
                        image_data[offsetAux - 4 + 0] = ClampComponent(image_data[offsetAux - 4 + 0] + ((diffR * 3) >> 4));
                        image_data[offsetAux - 4 + 1] = ClampComponent(image_data[offsetAux - 4 + 1] + ((diffG * 3) >> 4));
                        image_data[offsetAux - 4 + 2] = ClampComponent(image_data[offsetAux - 4 + 2] + ((diffB * 3) >> 4));
                    }

                    image_data[offsetAux + 0] = ClampComponent(image_data[offsetAux + 0] + ((diffR * 5) >> 4));
                    image_data[offsetAux + 1] = ClampComponent(image_data[offsetAux + 1] + ((diffG * 5) >> 4));
                    image_data[offsetAux + 2] = ClampComponent(image_data[offsetAux + 2] + ((diffB * 5) >> 4));

                    if (x < image_width - 1) {
                        image_data[offsetAux + 4 + 0] = ClampComponent(image_data[offsetAux + 4 + 0] + ((diffR * 1) >> 4));
                        image_data[offsetAux + 4 + 1] = ClampComponent(image_data[offsetAux + 4 + 1] + ((diffG * 1) >> 4));
                        image_data[offsetAux + 4 + 2] = ClampComponent(image_data[offsetAux + 4 + 2] + ((diffB * 1) >> 4));
                    }
                }
            }
        }
    }
    image_context.putImageData(image, 0, 0);
}

function DrawPaletteToTable(table) {
    var pos_y = 0;
    var pos_x = 0;
    var row = table.insertRow(pos_y);
    var cell;
    var length = Math.min(Globals.Palette.length, 256);
    for (var i = 0; i < length; ++i, ++pos_x) {
        //console.log("Color: " + Globals.Palette[i] + " found " + Globals.ColorCount[i] + " times");
        if ((i != 0) && ((i % 16) == 0)) {
            ++pos_y;
            row = table.insertRow(pos_y);
            pos_x = 0;
        }

        cell = row.insertCell(pos_x);
        cell.innerHTML = Globals.ColorCount[i];
        cell.style.backgroundColor = Globals.Palette[i];
        cell.style.color = GetLabelColor(Globals.Palette[i]);
        cell.style.textAlign = "center";
    }
    length = 16 - (length % 16);
    if (length != 16) {
        for (i = 0; i < length; ++i, ++pos_x) {
            cell = row.insertCell(pos_x);
            cell.innerHTML = "-";
            cell.style.textAlign = "center";
        }
    }
}

function DrawTilesToTable(table, context, width, height) {
    var num_tiles_x = 0;
    var num_tiles_y = 0;
    var tile_width = 8;
    var tile_height = 8;
    var physical_tile = 0;

    if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
        num_tiles_x = width  / Globals.SpriteWidth;
        num_tiles_y = height / Globals.SpriteHeight;
        tile_width  = Globals.SpriteWidth;
        tile_height = Globals.SpriteHeight;
    }
    else if (Globals.OutputMode == Globals.OutputModeNames.Image) {
        num_tiles_x = width  / 8;
        num_tiles_y = height / 8;
    }

    // Create canvas for all tiles together
    Globals.TilesetExtCanvas = document.createElement("canvas");
    Globals.TilesetExtCanvas.name = "tileset_canvas";
    Globals.TilesetExtCanvas.width  = Globals.ValidTiles.filter(x => x==true).length * 8;
    Globals.TilesetExtCanvas.height = 8;
    Globals.TilesetExtCanvas.style.border = "0px";
    var all_context = Globals.TilesetExtCanvas.getContext("2d");
    all_context.imageSmoothingEnabled = false;
    all_context.mozImageSmoothingEnabled = false;

    //--
    var row = null, cell, cell_canvas, cell_context, image;
    var index = 0;

    if(Globals.UseExternalTileset) {
        Globals.TilesetExtCanvas.width += Globals.TilesetExtWidth;
        var totalTiles = Globals.TilesetExtWidth / 8;
        for(var i=0; i<totalTiles; ++i) {
            if ((index % 16) == 0) {
                row = document.createElement("div");
                row.className = "row";
                table.appendChild(row);
            }

            cell_canvas = document.createElement("canvas");
            cell_canvas.width = tile_width;
            cell_canvas.height = tile_height;
            cell_context = cell_canvas.getContext("2d");
            cell_context.imageSmoothingEnabled = false;
            cell_context.mozImageSmoothingEnabled = false;

            image = Globals.TilesetExtContext.getImageData(i * tile_width, 0, tile_width, tile_height);
            cell_context.putImageData(image, 0, 0);
            all_context.putImageData(image, index * 8, 0);

            cell = document.createElement("div");
            cell.style.paddingLeft = "0px";
            cell.style.paddingRight = "" + (tile_width + 8) + "px"; // because 200%
            cell.title = "" + index + " (" + ToHex4(index) + ")";
            cell.appendChild(cell_canvas);

            row.appendChild(cell);
            ++index;
        }
    }

    for (var y = 0; y < num_tiles_y; ++y) {
        for (var x = 0; x < num_tiles_x; ++x) {
            if (Globals.ValidTiles[physical_tile++]) {
                if ((index % 16) == 0) {
                    row = document.createElement("div");
                    row.className = "row";
                    table.appendChild(row);
                }

                cell_canvas = document.createElement("canvas");
                cell_canvas.width  = tile_width;
                cell_canvas.height = tile_height;
                cell_context = cell_canvas.getContext("2d");
                cell_context.imageSmoothingEnabled = false;
                cell_context.mozImageSmoothingEnabled = false;

                image = context.getImageData(x * tile_width, y * tile_height, tile_width, tile_height);
                cell_context.putImageData(image, 0, 0);
                all_context.putImageData(image, index * 8, 0);

                cell = document.createElement("div");
                //cell.className = "col";
                cell.style.paddingLeft = "0px";
                cell.style.paddingRight = "" + (tile_width + 8) + "px"; // because 200%
                cell.title = "" + index + " (" + ToHex4(index) + ")";
                cell.appendChild(cell_canvas);

                row.appendChild(cell);
                ++index;
            }
        }
    }

    if(row != null) {
        index = 16 - (index % 16);
        if (index != 10) {
            for (var i = 0; i < index; ++i) {
                cell_canvas = document.createElement("canvas");
                cell_canvas.width = tile_width;
                cell_canvas.height = tile_height;
                cell_canvas.style.border = "0px";

                cell = document.createElement("div");
                //cell.className = "col";
                cell.style.paddingLeft = "0px";
                cell.style.paddingRight = "" + (tile_width + 8) + "px"; // because 200%
                cell.appendChild(cell_canvas);
                row.appendChild(cell);
            }
        }
    }

    // Add canvas with all tiles together
    if (Globals.OutputMode == Globals.OutputModeNames.Image) {
        row = document.createElement("div");
        row.className = "row";
        var all_div = document.createElement("div");
        all_div.title = "TileSet";
        all_div.style.paddingLeft = "0px";
        all_div.style.paddingRight = "8px";
        all_div.appendChild(Globals.TilesetExtCanvas);
        row.appendChild(all_div);
        document.getElementById("tile_set").append(row);
    }
}

function DrawPaletteToCanvas(canvas_draw) {
    var context_draw = canvas_draw.getContext("2d");
    context_draw.imageSmoothingEnabled = false;
    context_draw.mozImageSmoothingEnabled = false;

    var pixel = context_draw.createImageData(1, 1);
    var pixel_data = pixel.data;

    var pos_y = 0;
    var pos_x = 0;
    var length = Math.min(Globals.Palette.length, 256);
    for (var i = 0; i < length; ++i, ++pos_x) {
        if ((i != 0) && ((i % 16) == 0)) {
            ++pos_y;
            pos_x = 0;
        }

        var color = Globals.Palette[i];
        pixel_data[0] = "0x" + color.substring(1, 3);
        pixel_data[1] = "0x" + color.substring(3, 5);
        pixel_data[2] = "0x" + color.substring(5);
        pixel_data[3] = 0xFF;
        context_draw.putImageData(pixel, pos_x, pos_y);
    }
}

function GetTransparentColors() {
    for(var i=0; i<4; ++i) {
        var extTransparentColor = $("#ext_transparent_color" + i).val();
        if (CheckHexColor(extTransparentColor) == false) {
            WriteMessage("text-danger", "Invalid transparent color" + (i + 1) + ": " + extTransparentColor);
            Globals.error = true;
            return false;
        }
        Globals.TransparentColors[i] = HexToHexMD888(extTransparentColor);
        WriteMessage("text-info", "User defined transparent color" + (i + 1) + ": " + extTransparentColor + "- MD: " + Globals.TransparentColors[i]);
    }

    Globals.Palette.push(Globals.TransparentColors[0]);
    Globals.ColorCount.push(0);
}

$(document).ready(function() {

    $("#page_form").submit(function() {

        $("#messages").empty();

        // Set transparent colors defined by user
        if (Globals.UseExtTransparentColor == true) {
            GetTransparentColors();
        }

        // Load external palette
        if (Globals.UseExternalPalette == true) {
            if(Globals.PaletteFileName.length > 0) {
                var palette_ex_source = null;
                WriteMessage("text-info", "Use external palette file: " + Globals.PaletteFileName);
                palette_ex_source = document.createElement("img");
                palette_ex_source.onload = function(evt) {
                    WriteMessage("text-info", "Palette loaded");
                    var palette_ex_width = palette_ex_source.width;
                    var palette_ex_height = palette_ex_source.height;

                    var palette_ex_canvas = document.createElement("canvas");
                    var palette_ex_context = palette_ex_canvas.getContext("2d");
                    palette_ex_canvas.width = palette_ex_width;
                    palette_ex_canvas.height = palette_ex_height;
                    palette_ex_context.drawImage(palette_ex_source, 0, 0);
                    var url = palette_ex_canvas.toDataURL(); // Succeeds. Canvas won't be dirty.

                    CollectColorsFromImage(palette_ex_context, palette_ex_width, palette_ex_height);
                    WriteMessage("text-info", "Collected " + Globals.Palette.length + " colors from <strong>palette</strong>");
                };

                palette_ex_source.crossOrigin = "anonymous";
                //console.log("Remote Palette = " + $("#remote_pal").val());
                palette_ex_source.src = $("#remote_pal").val();
            }
            else {
                Globals.UseExternalPalette = false;
                WriteMessage("text-warning", "External palette is checked but no texture is selected");
            }
        }

        // Load external tileset
        if(Globals.UseExternalTileset) {
            if(Globals.TilesetFileName.length > 0) {
                var tileset_ex_source = null;
                WriteMessage("text-info", "Use external tileset file: " + Globals.TilesetFileName);
                tileset_ex_source = document.createElement("img");
                tileset_ex_source.onload = function(evt) {
                    WriteMessage("text-info", "Tileset loaded");
                    var tileset_ex_canvas = document.createElement("canvas");
                    Globals.TilesetExtContext = tileset_ex_canvas.getContext("2d");
                    Globals.TilesetExtWidth   = tileset_ex_source.width;
                    Globals.TilesetExtHeight  = tileset_ex_source.height;
                    tileset_ex_canvas.width   = Globals.TilesetExtWidth;
                    tileset_ex_canvas.height  = Globals.TilesetExtHeight;
                    Globals.TilesetExtContext.drawImage(tileset_ex_source, 0, 0);
                    var url = tileset_ex_canvas.toDataURL(); // Succeeds. Canvas won't be dirty.

                    // Check limits
                    if ((Globals.TilesetExtWidth % 8) != 0) {
                        WriteMessage("text-danger", "ERROR. The <strong>external tileset width</strong> must be a multiple of 8 but is: " + Globals.TilesetExtWidth);
                        Globals.error = true;
                        //return false;
                    }

                    if ((Globals.TilesetExtHeight % 8) != 0) {
                        WriteMessage("text-danger", "ERROR. The <strong>external tileset height</strong> must be a multiple of 8 but is: " + Globals.TilesetExtHeight);
                        Globals.error = true;
                        //return false;
                    }

                    var colors = Globals.Palette.length
                    CollectColorsFromImage(Globals.TilesetExtContext, Globals.TilesetExtWidth, Globals.TilesetExtHeight);
                    WriteMessage("text-info", "Collected " + (Globals.Palette.length - colors) + " colors from <strong>external tileset</strong>");
                };

                tileset_ex_source.crossOrigin = "anonymous";
                //console.log("Remote Palette = " + $("#remote_pal").val());
                tileset_ex_source.src = $("#remote_tileset").val();
            }
            else {
                Globals.UseExternalTileset = false;
                WriteMessage("text-warning", "External tileset is checked but no texture is selected");
            }
        }

        // Load Blue Noise
        var blue_noise_data   = null;
        var blue_noise_width  = 0;
        var blue_noise_height = 0;
        if(Globals.UseBlueNoise) {
            if(Globals.BlueNoiseFileName.length > 0) {
                WriteMessage("text-info", "Use external blue noise file: " + Globals.BlueNoiseFileName);
                var blue_noise_canvas  = document.createElement("canvas");
                var blue_noise_context = blue_noise_canvas.getContext("2d");
                var blue_noise_img     = document.createElement("img");
                blue_noise_img.onload = function(evt) {
                    blue_noise_width  = blue_noise_img.width;
                    blue_noise_height = blue_noise_img.height;
                    blue_noise_canvas.width  = blue_noise_width;
                    blue_noise_canvas.height = blue_noise_height;

                    blue_noise_context.drawImage(blue_noise_img, 0, 0);
                    var url = blue_noise_canvas.toDataURL(); // Succeeds. Canvas won't be dirty.
                    blue_noise_data = blue_noise_context.getImageData(0, 0, blue_noise_width, blue_noise_height).data;
                    WriteMessage("text-info", "Blue noise image loaded");
                }
                blue_noise_img.crossOrigin = "anonymous";
                blue_noise_img.src = $("#remote_blue_noise").val();
            }
            else {
                Globals.UseBlueNoise = false;
                WriteMessage("text-warning", "Blue noise is checked but no texture is selected");
            }
        }

        // Load external image
        WriteMessage("text-info", "Use external image file: " + Globals.ImageFileName);
        var image_source = document.createElement("img");
        image_source.onload = function(evt) {
            WriteMessage("text-info", "Image loaded");
            $("#page_file").replaceWith("<button onclick='location.reload();'>Reset</button>");
            var image_width = image_source.width;
            var image_height = image_source.height;

            var canvas_image = document.createElement("canvas");
            var context_image = canvas_image.getContext("2d");
            canvas_image.width = image_width;
            canvas_image.height = image_height;
            context_image.drawImage(image_source, 0, 0);
            var url = canvas_image.toDataURL(); // Succeeds. Canvas won't be dirty.

            Globals.ImageWidth  = image_width;
            Globals.ImageHeight = image_height;

            // Check limits
            if ((Globals.ImageWidth % 8) != 0) {
                WriteMessage("text-danger", "ERROR. The <strong>image width</strong> must be a multiple of 8 but is: " + Globals.ImageWidth);
                Globals.error = true;
                //return false;
            }

            if ((Globals.ImageHeight % 8) != 0) {
                WriteMessage("text-danger", "ERROR. The <strong>image height</strong> must be a multiple of 8 but is: " + Globals.ImageHeight);
                Globals.error = true;
                //return false;
            }

            if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
                if(Globals.ImageWidth % Globals.SpriteWidth != 0) {
                    WriteMessage("text-danger", "ERROR. The <strong>image width</strong> must be a multiple of <strong>sprite width</strong> but are: " + Globals.ImageWidth + " and " + Globals.SpriteWidth);
                    Globals.error = true;
                }

                if(Globals.ImageHeight % Globals.SpriteHeight != 0) {
                    WriteMessage("text-danger", "ERROR. The <strong>image height</strong> must be a multiple of <strong>sprite height</strong> but are: " + Globals.ImageHeight + " and " + Globals.SpriteHeight);
                    Globals.error = true;
                }
            }
            
            WriteMessage("text-info", "Collecting colors from Image");

            // Collect colors from image if there is not pallete
            if (Globals.UseExternalPalette == false) {
                const newColors = CountColorsFromImage(context_image, image_width, image_height);
                GeneratePaletteRGB();
                WriteMessage("text-info", "Collected " + newColors + " colors from <strong>image</strong>");
            }
            // Is it only the transparent color?
            else if ((Globals.UseExtTransparentColor && Globals.Palette.length < 2) || (Globals.UseExtTransparentColor == false && Globals.Palette.length < 1)) {
                WriteMessage("text-warning", "There are no colors in the Palette image");
                const newColors = CountColorsFromImage(context_image, image_width, image_height);
                GeneratePaletteRGB();
                WriteMessage("text-info", "Collected " + newColors + " colors from <strong>image</strong>");
            }
            // Collect image color data
            else {
                var orig_palette_colors = Globals.Palette.length;
                const newColors = CountColorsFromImage(context_image, image_width, image_height);
                GeneratePaletteRGB();
                if (orig_palette_colors != Globals.Palette.length) {
                    WriteMessage("text-warning", "There are " + newColors + " new colors in the image");
                    // Reduce extra colors
                    if(Globals.AddImageColors == false) {
                        WriteMessage("text-info", "Reducing colors to original palette");
                        ReduceColorsToOriginalPalette(orig_palette_colors);
                    }
                }
            }

            if(Globals.UseLimitColors) {
                if (Globals.Palette.length > Globals.LimitColorsTo) {
                    WriteMessage("text-warning", "There are " + Globals.Palette.length + " colors, but the palette can only have " + Globals.LimitColorsTo);
                    WriteMessage("text-info", "Reseting original palette");
                    WriteMessage("text-info", "Quantizing extra colors");
                    var quantizer = new ColorQuantizer(4);
                    var firstColor = 0;
                    var maxColors = Globals.LimitColorsTo;
                    if(Globals.FixTransparentColor)
                        firstColor = 1;
                    if(Globals.FixPaletteColors) {
                        if(Globals.LimitColorsTo > orig_palette_colors) {
                            firstColor = orig_palette_colors;
                            maxColors = Globals.LimitColorsTo - orig_palette_colors;
                        }
                    }
                    var color;
                    for(i=0; i<firstColor; ++i) {
                        color = Globals.PaletteRGB[i];
                        quantizer.add_color(color[0], color[1], color[2], Globals.ColorCount[i] + 0xffff, true);
                    }
                    for(i=firstColor; i<Globals.PaletteRGB.length; ++i) {
                        color = Globals.PaletteRGB[i];
                        quantizer.add_color(color[0], color[1], color[2], Globals.ColorCount[i], false);
                    }
                    quantizer.check_integrity();

                    //var newColors = quantizer.reduce_colors(maxColors, false);
                    const numTransparents = (Globals.LimitColorsTo / 16) - 1;
                    var newColors = quantizer.reduce_colors(Globals.LimitColorsTo - numTransparents, true);

                    Globals.PaletteRGB = Globals.PaletteRGB.slice(0, firstColor);
                    Globals.Palette    = Globals.Palette.slice(0, firstColor);
                    Globals.ColorCount = Globals.ColorCount.slice(0, firstColor);

                    // Find palette colors in newColors (to maintain the order in the palette)
                    for(i=0; i<firstColor; ++i) {
                        var color_pal = Globals.PaletteRGB[i];
                        for(var c=0; c<newColors.length; ++c) {
                            var color_new = newColors[c];
                            if(color_new != null) {
                                if(color_new[0] == color_pal[0] && color_new[1] == color_pal[1] && color_new[2] == color_pal[2]) {
                                    Globals.ColorCount[i] = color_new[3] - 0xffff;
                                    newColors[c] = null;
                                    break;
                                }
                            }
                        }
                    }

                    // Add extra colors
                    for(i=0; i<newColors.length; ++i) {
                        var color = newColors[i];
                        if(color != null) {
                            if(AddTransparentIfNeeded()) {
                                const rgb = HexMD888ToArray(Globals.Palette[Globals.Palette.length - 1]);
                                Globals.PaletteRGB.push(rgb);
                            }
                            Globals.PaletteRGB.push([color[0], color[1], color[2]]);
                            Globals.Palette.push(RGBToHexMD888(color[0], color[1], color[2]));
                            Globals.ColorCount.push(color[3]);
                            WriteMessage("text-success", "New color added: " + Globals.Palette[Globals.Palette.length-1] + " (" + color[3] + ")");
//                            WriteMessage("text-success", `New color added: ${Globals.Palette[Globals.Palette.length-1]} ( ${color[3]} )`);
                        }
                    }
                }
                else {
                    WriteMessage("text-success", "There are " + Globals.Palette.length + " palette colors");
                }
            }

            if(Globals.UseExternalTileset) {
                TransformImage(Globals.TilesetExtContext, Globals.TilesetExtWidth, Globals.TilesetExtHeight, blue_noise_data, blue_noise_width, blue_noise_height)
                GetHashes(Globals.TilesetExtWidth, Globals.TilesetExtHeight)
                WriteMessage("text-info", "Loaded " + Globals.Hashes.length + " tiles from <strong>external tileset</strong>");
                Globals.TilesetExtColorIndices = Globals.ColorIndices
                Globals.ColorIndices = []
            }
            TransformImage(context_image, image_width, image_height, blue_noise_data, blue_noise_width, blue_noise_height);

/*
            var dist1 = ColorDistanceEuclidean(255, 255, 255, 0, 0, 0);
            var dist2 = ColorDistanceEuclideanPerceptual(255, 255, 255, 0, 0, 0);
            console.log("Ref: " + dist1 + ", " + dist2);
            var means1 = new Array(Globals.PaletteRGB.length);
            var means2 = new Array(Globals.PaletteRGB.length);
            var values1 = [];
            var values2 = [];
            var data = [];
            for(var p1=0; p1<Globals.PaletteRGB.length; ++p1) {
                means1[p1] = 0;
                means2[p1] = 0;
            }
            for(var p1=0; p1<Globals.PaletteRGB.length; ++p1) {
                var col1 = Globals.PaletteRGB[p1];
                var log = "";
                for(var p2=p1+1; p2<Globals.PaletteRGB.length; ++p2) {
                    var col2 = Globals.PaletteRGB[p2];
                    var dist1 = ColorDistanceEuclidean(col1[0], col1[1], col1[2], col2[0], col2[1], col2[2]) | 0;
                    var dist2 = ColorDistanceEuclideanPerceptual(col1[0], col1[1], col1[2], col2[0], col2[1], col2[2]) | 0;

                    var index1 = values1.indexOf(dist1);
                    if(index1 == -1) values1.push(dist1);
                    var index2 = values2.indexOf(dist2);
                    if(index2 == -1) values2.push(dist2);
                    means1[p1] += dist1;
                    means1[p2] += dist1;
                    means2[p1] += dist2;
                    means2[p2] += dist2;

                    data.push([p1, p2, dist1, dist2]);
                    log += "([" + p1 + ", " + p2 + "] = " + dist1 + ", " + dist2 + "), ";
                }
                console.log(log);
            }
            console.log(means1);
            console.log(means2);
            values1.sort(function(a, b) { return a-b; });
            values2.sort(function(a, b) { return a-b; });
            console.log(values1);
            console.log(values2);
            data.sort(function(a, b) { return a[2] - b[2]; });
            console.log(data);
*/
            // Print Table
            var table = document.getElementById("palette_table");
            DrawPaletteToTable(table);

            // Generate Palette Image
            var canvas_draw = document.createElement("canvas");
            canvas_draw.className = "palette";
            canvas_draw.width = 16;
            canvas_draw.height = 16;
            DrawPaletteToCanvas(canvas_draw);

            // Add palette for download
            $("#palette").append(canvas_draw);
            $("#palette").append(document.createElement("br"));
            var link = document.createElement("a");
            link.href = canvas_draw.toDataURL();
            link.download = "palette.png";
            link.textContent = "Download file!";
            $("#palette").append(link);

            // Print info
            var output = $("#output");
            if (Globals.error == false) {
                var info = PrintPalette();
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
            var image = document.createElement("div");
            image.appendChild(image_source);
            $("#image").append(image);

            // Add image MegaDrive
            var imageMD = document.createElement("div");
            imageMD.appendChild(canvas_image);
            $("#image_md").append(imageMD);

            // Add tiles
            if (Globals.OutputMode != Globals.OutputModeNames.JustPalette) {
                DrawTilesToTable(document.getElementById("tiles_table"), context_image, image_width, image_height);
                if(Globals.TilesetExtCanvas != null) {
                    var link = document.createElement("a");
                    link.href = Globals.TilesetExtCanvas.toDataURL();
                    link.download = "tileSet.png";
                    link.textContent = "Download file!";
                    $("#tile_set").append(link);
                }
            }
        };

        image_source.crossOrigin = "anonymous";
        //console.log("Remote Image = " + $("#remote_img").val());
        image_source.src = $("#remote_img").val();
        return false;
    });
});

function PrintHeaderInfo() {
    var num_tiles_x = Globals.ImageWidth  / 8;
    var num_tiles_y = Globals.ImageHeight / 8;
    var sprite_tiles_x = Globals.SpriteWidth / 8;
    var length = (Globals.Palette.length >> 4);
    length += (Globals.Palette.length % 16) == 0 ? 0 : 1;
    length <<= 4;

    var header_info = "\n"
    if (Globals.OutputMode != Globals.OutputModeNames.JustPalette) {
        if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
            header_info += "#define k" + Globals.ImageNameCap + "TilesH\t(" + (num_tiles_x / sprite_tiles_x) + " * " + sprite_tiles_x + ")\n";
        }
        if (Globals.OutputMode == Globals.OutputModeNames.Image) {
            header_info += "#define k" + Globals.ImageNameCap + "TilesH\t" + num_tiles_x + "\n";
        }
        header_info += "#define k" + Globals.ImageNameCap + "TilesV\t" + num_tiles_y + "\n";
        if (Globals.OutputMode == Globals.OutputModeNames.Sprites) {
            header_info += "#define k" + Globals.ImageNameCap + "TileSizeH\t" + Globals.SpriteWidth + "\n";
            header_info += "#define k" + Globals.ImageNameCap + "TileSizeV\t" + Globals.SpriteHeight + "\n";
        }
        if (Globals.OutputMode == Globals.OutputModeNames.Image) {
            header_info += "#define k" + Globals.ImageNameCap + "NumTiles\t(k" + Globals.ImageNameCap + "TilesH * k" + Globals.ImageNameCap + "TilesV)\n";
            header_info += "#define k" + Globals.ImageNameCap + "DataSize\t" + Globals.OptimizedNumTiles + "\n";
        }
        else {
            header_info += "#define k" + Globals.ImageNameCap + "DataSize\t(k" + Globals.ImageNameCap + "TilesH * k" + Globals.ImageNameCap + "TilesV)\n";
        }
        header_info += "\n";
    }
    header_info += "extern const u16 gPal" + Globals.ImageNameCap + "[" + length + "];\n";
    if (Globals.OutputMode != Globals.OutputModeNames.JustPalette) {
        if (Globals.OutputMode == Globals.OutputModeNames.Image) {
            header_info += "extern const u16 gTileMap" + Globals.ImageNameCap + "[k" + Globals.ImageNameCap + "NumTiles];\n";
        }
        header_info += "extern const u32 gData" + Globals.ImageNameCap + "[k" + Globals.ImageNameCap + "DataSize * 8];\n";
    }
    header_info += "\n//--\n";
    return header_info;
}

function PrintPalette() {
    var length = (Globals.Palette.length >> 4);
    length += (Globals.Palette.length % 16) == 0 ? 0 : 1;
    length <<= 4;
    var palette_info = "\nconst u16 gPal" + Globals.ImageNameCap + "[" + length + "] = {\n";
    for (var i = 0; i < length; ++i) {
        if ((i % 8) == 0) {
            if (i != 0) {
                palette_info += "\n";
            }
            palette_info += "\t";
        }
        if (i < Globals.Palette.length)
            palette_info += HexMD888ToMDPal(Globals.Palette[i]) + ", ";
        else
            palette_info += "0x0000, ";
    }
    palette_info += "\n};\n";

    return palette_info;
}

function GetHashes(width, height) {
    var num_tile = 0;
    var tilePalette = new TilePalette();
    var physical_tile = 0;

    var offset1 = 0;
    var offset2 = 0;
    var currentIndex = 0;
    for (var y = 0; y < height; y += 8) {
        for (var x = 0; x < width; x += 8) {
            offset1 = (y * width + x);
            var line_info = "";
            for (var tile_y = 0; tile_y < 8; ++tile_y) {
                var data = "0x";
                offset2 = offset1 + tile_y * width;
                tilePalette.reset();
                for (var tile_x = 0; tile_x < 8; ++tile_x) {
                    data += tilePalette.getValueString(Globals.ColorIndices[offset2 + tile_x]);
                }
                tilePalette.addPalette();

                data += ", ";
                line_info += data;
            }

            //if (Globals.OptimizeImageData) {
                line_info += " // Palette: " + tilePalette.getPalette();
                var hash = line_info;//.hashCode();
                num_tile = Globals.Hashes.indexOf(hash);
                if (num_tile == -1) {
                    num_tile = Globals.Hashes.length;
                    Globals.Hashes.push(hash);
                    Globals.ValidTiles[physical_tile++] = true;
                }
                else {
                    Globals.ValidTiles[physical_tile++] = false;
                }
            //}
            //else {
            //    Globals.ValidTiles[physical_tile++] = true;
            //}
            ++currentIndex;
        }
    }

    //WriteMessage("text-success", "Loaded " + Globals.Hashes.length + " different tiles <strong>from external tileset</strong>");
    if (Globals.OptimizeImageData) {
        Globals.OptimizedNumTiles = Globals.Hashes.length;
    }
}

function PrintSpriteData() {
    var image_info     = "";
    var line_info      = "";
    var sprite_info    = "";
    var num_tiles_x    = Globals.ImageWidth  / 8;
    var num_tiles_y    = Globals.ImageHeight / 8;
    var num_tile       = 0;
    var sprite_tiles_x = Globals.SpriteWidth  / 8;
    var sprite_tiles_y = Globals.SpriteHeight / 8;
    var sprite_tiles   = sprite_tiles_x * sprite_tiles_y;
    var num_sprite     = 0;
    var num_sprites    = 0;
    var unique_sprites = [];

    // Cannot optimize sprite num tiles. All must be there
    Globals.OptimizedNumTiles = num_tiles_x * num_tiles_y;

    image_info += "\nconst u32 gData" + Globals.ImageNameCap + "[k" + Globals.ImageNameCap + "DataSize * 8] = {\n";

    var offset1 = 0;
    var offset2 = 0;
    var offset3 = 0;
    for (var y = 0; y < Globals.ImageHeight; y += sprite_tiles_y * 8) {
        for (var x = 0; x < Globals.ImageWidth; x += 8) {
            offset1 = y * Globals.ImageWidth + x;
            for (var sprite_y = 0; sprite_y < sprite_tiles_y; ++sprite_y) {
                line_info = "\t";
                offset3 = sprite_y * 8 * Globals.ImageWidth;
                for (var tile_y = 0; tile_y < 8; ++tile_y) {
                    //var info = "";
                    var data = "0x";
                    offset2 = offset1 + offset3 + tile_y * Globals.ImageWidth;
                    for (var tile_x = 0; tile_x < 8; ++tile_x) {
                        data += Globals.ColorIndices[offset2 + tile_x].toString(16);
                        //info += offset2 + tile_x + " ";
                    }
                    data += ", ";
                    line_info   += data;
                    sprite_info += data;
                }

                if ((num_tile % sprite_tiles) == (sprite_tiles - 1)) {
                    var index = unique_sprites.indexOf(sprite_info);
                    if(index == -1) {
                        unique_sprites.push(sprite_info);
                        if(Globals.OptimizeSpriteData) {
                            Globals.ValidTiles[num_sprite] = true;
                            const str = " // Sprite " + (unique_sprites.length - 1) + " (pos: " + num_sprite++ + ")\n";
                            image_info += sprite_info.replace("\n", str) + "\n";
                        }
                    }
                    else {
                        if(Globals.OptimizeSpriteData) {
                            Globals.ValidTiles[num_sprite++] = false;
                        }
                        WriteMessage("text-warning", "Repeated sprite: " + num_sprites + " == " + index)
                    }
                    sprite_info = "";
                    ++num_sprites;
                }

                if(Globals.OptimizeSpriteData == false) {
                    if ((num_tile % sprite_tiles) == 0) {
                        Globals.ValidTiles[num_sprite] = true;
                        line_info += " // Sprite " + num_sprite++;
                    }

                    image_info += line_info + "\n";
                }
                else {
                    if ((num_tile % sprite_tiles) != (sprite_tiles - 1)) {
                        sprite_info += "\n";
                    }
                }

                ++num_tile;
            }
        }
    }
    image_info += "};\n";
    WriteMessage("text-info", "Unique sprites: " + unique_sprites.length)
    WriteMessage("text-info", "Total sprites: " + num_sprite)

    return image_info;
}

Set.prototype.getByIndex = function(index) { return [...this][index]; }

// Ugly class to not repeat this code
class TilePalette {
    constructor() {
        this.reset();
    }

    getValueString(value) {
        if(this.min > value) {
            this.min = value;
        }
        if(this.max < value) {
            this.max = value;
        }

        while(value >= 16) value -= 16;

        return value.toString(16);
    }

    addValue(value) {
        if(value < 16) {
            this.palette.add(0);
            this.data[0] += value.toString(16);
            this.data[1] += "0";
            this.data[2] += "0";
            this.data[3] += "0";
        }
        else if(value < 32) {
            this.palette.add(1);
            this.data[0] += "0";
            this.data[1] += (value - 16).toString(16);
            this.data[2] += "0";
            this.data[3] += "0";
        }
        else if(value < 48) {
            this.palette.add(2);
            this.data[0] += "0";
            this.data[1] += "0";
            this.data[2] += (value - 32).toString(16);
            this.data[3] += "0";
        }
        else if(value < 64) {
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
        if(this.min >= 0 && this.max < 16) {
            this.palette.add(0);
        }
        // Palette 2
        else if(this.min >= 16 && this.max < 32) {
            this.palette.add(1);
        }
        // Palette 3
        else if(this.min >= 32 && this.max < 48) {
            this.palette.add(2);
        }
        // Palette 4
        else if(this.min >= 48 && this.max < 64) {
            this.palette.add(3);
        }
        // Error
        else {
            this.palette.add(-1);
        }
    }

    getPalette() {
        if(this.palette.size == 1) {
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

function reverseString(str) {
    var result = "";
    for (var i = str.length - 1; i >= 0; i--) {
        result += str[i];
    }
    return result;
}

function GetFlipV(tileInfo) {
    return tileInfo.substr(0, tileInfo.length-2).split(", ").reverse().join(", ") + ", ";
}

function GetFlipH(tileInfo) {
    var result = "";
    const rows = tileInfo.substr(0, tileInfo.length-2).split(", ");
    for(const row of rows) {
        result += "0x" + reverseString(row.substr(2)) + ", ";
    }

    return result;
}

function GetFlipHV(tileInfo) {
    var result = "";
    const rows = tileInfo.substr(0, tileInfo.length-2).split(", ").reverse();
    for(const row of rows) {
        result += "0x" + reverseString(row.substr(2)) + ", ";
    }

    return result;
}

function GetNumTileEx(line_info, paletteIndex) {
    var num_tile;
    var pal = " // Palette: " + paletteIndex;

    num_tile = Globals.Hashes.indexOf(line_info + pal);
    if(num_tile != -1)
        return num_tile;

    num_tile = Globals.Hashes.indexOf(GetFlipH(line_info) + pal);
    if(num_tile != -1)
        return num_tile | (1 << 11);    // FlipH

    num_tile = Globals.Hashes.indexOf(GetFlipV(line_info) + pal);
    if(num_tile != -1)
        return num_tile | (1 << 12);    // FlipV

    num_tile = Globals.Hashes.indexOf(GetFlipHV(line_info) + pal);
    if(num_tile != -1)
        return num_tile | (3 << 11);    // FlipH + FlipV

    return -1;
}

function PrintImageData() {
    const num_tiles_x = Globals.ImageWidth  / 8;
    const num_tiles_y = Globals.ImageHeight / 8;
    var num_tileA = 0;
    var num_tileB = Globals.OptimizeImageData ? 0 : num_tiles_x * num_tiles_y;
    var map_infoA, map_infoB;
    var image_info;
    var image_infoB = "";
    var num_map = 0;
    var tilePalette = new TilePalette();
    var physical_tile = 0;
    var addPalette = Globals.AddMetadata ? (1 << 13) : 0;

    var palA = -1;
    var palB = -1;
    if(Globals.ColorCount <= 16) {
        palA = 0;
    }
    if(Globals.ColorCount <= 32) {
        palB = 1;
    }
    else {
        for (var i = 0; i < Globals.ColorCount.length; ++i) {
            if(Globals.ColorCount[i] > 0) {
                const palId = i >> 4;
                if(palA == -1) {
                    palA = palId;
                }
                else if(palA != palId) {
                    if(palB == -1) {
                        palB = palId;
                    }
                    else if(palB != palId) {
                        Globals.error = true;
                    }
                }
            }
        }
    }

    map_infoA  = "\nconst u16 gTileMap" + Globals.ImageNameCap + "A[k" + Globals.ImageNameCap + "NumTiles] = {";
    map_infoB  = "\nconst u16 gTileMap" + Globals.ImageNameCap + "B[k" + Globals.ImageNameCap + "NumTiles] = {";
    image_info = "\nconst u32 gData"    + Globals.ImageNameCap +  "[k" + Globals.ImageNameCap + "DataSize * 8] = {\n";

    var offset1   = 0;
    var offset2   = 0;
    var new_tiles = 0;
    var usesPalB  = false;

    if(Globals.UseExternalTileset) {
        for (var x = 0; x < Globals.TilesetExtWidth; x += 8) {
            offset1 = x;
            var tile_infoA = "\t";
            for (var tile_y = 0; tile_y < 8; ++tile_y) {
                var tile_row = "0x";
                offset2 = offset1 + tile_y * Globals.TilesetExtWidth;
                tilePalette.reset();
                for (var tile_x = 0; tile_x < 8; ++tile_x) {
                    tile_row += tilePalette.getValueString(Globals.TilesetExtColorIndices[offset2 + tile_x])
                }
                tilePalette.addPalette();

                tile_row += ", ";
                tile_infoA += tile_row;
            }

            tile_infoA += " // Palette: " + tilePalette.getPalette();
            image_info += tile_infoA + " - Tile " + num_tileA + " (" + ToHex4(num_tileA) + ")\n";
            if(tilePalette.isOk() == false) {
                WriteMessage("text-warning", "Mixed palletes in tile: " + num_tileA + ". Not yet supported");
                Globals.error = true;
            }
            ++num_tileA;
        }
    }

    for (var y = 0; y < Globals.ImageHeight; y += 8) {
        for (var x = 0; x < Globals.ImageWidth; x += 8) {
            offset1 = (y * Globals.ImageWidth + x);
            var tile_infoA = "";
            var tile_infoB = "";
            for (var tile_y = 0; tile_y < 8; ++tile_y) {
                offset2 = offset1 + tile_y * Globals.ImageWidth;

                tilePalette.reset();
                for (var tile_x = 0; tile_x < 8; ++tile_x) {
                    tilePalette.addValue(Globals.ColorIndices[offset2 + tile_x]);
                }

                if(tilePalette.has(palA)) {
                    tile_infoA += "0x" + tilePalette.data[palA] + ", ";
                }
                else {
                    tile_infoA += "0x00000000, "
                }

                if(tilePalette.has(palB)) {
                    usesPalB = true;
                    tile_infoB += "0x" + tilePalette.data[palB] + ", ";
                }
                else {
                    tile_infoB += "0x00000000, "
                }
            }

            if (Globals.OptimizeImageData) {
                if(Globals.AddMetadata) {
                    num_tileA = GetNumTileEx(tile_infoA, palA);
                    num_tileB = GetNumTileEx(tile_infoB, palB);
                }
                else {
                    tile_infoA += " // Palette: " + palA;
                    tile_infoB += " // Palette: " + palB;
                    num_tileA = Globals.Hashes.indexOf(tile_infoA);
                    num_tileB = Globals.Hashes.indexOf(tile_infoB);
                }

                var valid = false;
                if (num_tileA == -1) {
                    num_tileA = Globals.Hashes.length;
                    if(Globals.AddMetadata) {
                        tile_infoA += " // Palette: " + palA;
                    }
                    image_info += "    " + tile_infoA + " - Tile " + num_tileA + " (" + ToHex4(num_tileA) + ")\n";
                    if(tilePalette.isOk() == false) {
                        WriteMessage("text-warning", "Mixed palletes in tile: " + num_tileA + ". Not yet supported");
                        Globals.error = true;
                    }

                    Globals.Hashes.push(tile_infoA);
                    valid = true;
                    ++new_tiles;
                }

                if (num_tileB == -1) {
                    num_tileB = Globals.Hashes.length;
                    if(Globals.AddMetadata) {
                        tile_infoB += " // Palette: " + palB;
                    }
                    image_info += "    " + tile_infoB + " - TileB " + num_tileB + " (" + ToHex4(num_tileB) + ")\n";
                    if(tilePalette.isOk() == false) {
                        WriteMessage("text-warning", "Mixed palletes in tile: " + num_tileB + ". Not yet supported");
                        Globals.error = true;
                    }

                    Globals.Hashes.push(tile_infoB);
                    valid = true;
                    ++new_tiles;
                }

                Globals.ValidTiles[physical_tile++] = valid;
            }
            else {
                Globals.ValidTiles[physical_tile++] = true;
            }

            if ((num_map % num_tiles_x) == 0) {
                map_infoA += "\n\t";
                map_infoB += "\n\t";
            }

            map_infoA += ToHex4(num_tileA + (palA * addPalette)) + ", ";
            map_infoB += ToHex4(num_tileB + (palB * addPalette)) + ", ";
            ++num_map;

            if (Globals.OptimizeImageData == false) {
                image_info  += "    " + tile_infoA + " // Tile "  + num_tileA++ + "\n";
                image_infoB += "    " + tile_infoB + " // TileB " + num_tileB++ + "\n";
            }
        }
    }

    if(Globals.UseExternalTileset && new_tiles > 0) {
        WriteMessage("text-success", "Added " + new_tiles + " tiles from <strong>image</strong>");
    }

    if (Globals.OptimizeImageData) {
        Globals.OptimizedNumTiles = Globals.Hashes.length;
    }
    else {
        Globals.OptimizedNumTiles = (num_tiles_x * num_tiles_y);
    }

    return map_infoA + "\n};\n" + (usesPalB ? map_infoB + "\n};\n" : "") + image_info + (usesPalB ? image_infoB : "") + "};\n";
}

function ReduceColorsToOriginalPalette(orig_palette_colors) {
    var palette_extra = Globals.Palette.slice(orig_palette_colors, Globals.Palette.length);
    var palette_extraRGB = Globals.PaletteRGB.slice(orig_palette_colors, Globals.PaletteRGB.length);
    var color_count_extra = Globals.ColorCount.slice(orig_palette_colors, Globals.ColorCount.length);
    Globals.Palette = Globals.Palette.slice(0, orig_palette_colors);
    Globals.PaletteRGB = Globals.PaletteRGB.slice(0, orig_palette_colors);
    Globals.ColorCount = Globals.ColorCount.slice(0, orig_palette_colors);
    for(i=0; i<palette_extraRGB.length; ++i) {
        var color = palette_extraRGB[i];
        var r = color[0];
        var g = color[1];
        var b = color[2];
        var new_index = FindNearestColor(r, g, b);
        var old_index = orig_palette_colors + i;
        WriteMessage("text-info", "Convert color " + palette_extra[i] + " to " + Globals.Palette[new_index] + "(" + color_count_extra[i] + ")");
        Globals.ColorCount[new_index] += color_count_extra[i];
        Globals.ColorIndices.forEach(
            function(item, idx, array) {
                if (item == old_index)
                    array[idx] = new_index;
            }
        );
    }

}

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

function ColorDistanceEuclidean(r1, g1, b1, r2, g2, b2) {
    var diffR, diffG, diffB;

    diffR = r2 - r1;
    diffG = g2 - g1;
    diffB = b2 - b1;

//    return Math.sqrt(diffR*diffR + diffG*diffG + diffB*diffB);
    return (diffR*diffR + diffG*diffG + diffB*diffB);
}

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

// You must call first GeneratePaletteRGB
function FindNearestColor(r, g, b) {
    var dist, best_dist = 0x7fffffff, best_index = -1;
    var palR, palG, palB;

    for(var i=0; i<Globals.PaletteRGB.length; ++i) {
        palR = Globals.PaletteRGB[i][0];
        palG = Globals.PaletteRGB[i][1];
        palB = Globals.PaletteRGB[i][2];

        //dist = ColorDistanceEuclidean(palR, palG, palB, r, g, b);
        dist = ColorDistanceEuclideanPerceptual(palR, palG, palB, r, g, b);
        if(dist < best_dist) {
            best_dist = dist;
            best_index = i;
        }
    }

    return best_index;
}

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

function CheckHexColor(hex) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);
}

function ToHex4(value) {
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

// Optimization
var gComponentToHex = new Array(256);
for(var i=0; i<256; ++i) {
    var hex = i.toString(16);
    if(hex.length == 1)
        hex = "0" + hex;
    gComponentToHex[i] = hex;
}

function ComponentToHex(component) {
    //var hex = component.toString(16);
    //return hex.length == 1 ? "0" + hex : hex;
    return gComponentToHex[component];
}

function ComponentToMD888(component) {
    var index = component >> 5;
    //var index = Math.round(component / 36.0);
    return gMegaDriveColors[index];
}

function RGBToHexMD888(r, g, b) {
    var R, G, B;

    R = ComponentToHex(ComponentToMD888(r));
    G = ComponentToHex(ComponentToMD888(g));
    B = ComponentToHex(ComponentToMD888(b));

    return "#" + R + G + B;
}

function RGBToMDPal(r, g, b) {
    var R, G, B;

    R = (r >> 5) << 1;
    G = (g >> 5) << 1;
    B = (b >> 5) << 1;

    // Palette is in BGR
    return "0x" + "0" + B.toString(16) + G.toString(16) + R.toString(16);
}

function HexMD888ToMDPal(hex) {
    var r, g, b;

    r = "0x" + hex.substring(1, 3);
    g = "0x" + hex.substring(3, 5);
    b = "0x" + hex.substring(5);

    return RGBToMDPal(r, g, b);
}

function HexMD888ToArray(hex) {
    var r, g, b;

    r = "0x" + hex.substring(1, 3);
    g = "0x" + hex.substring(3, 5);
    b = "0x" + hex.substring(5);

    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
}

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

function ClampComponent(value) {
    if (value < 0)
        return 0;
    else if (value > 255)
        return 255;

    return value;
}

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

String.prototype.hashCode = function() {
    var hash = 0;
    var i, chr, len;

    if (this.length == 0)
        return hash;

    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        //hash  = ((hash << 5) - hash) + chr;
        hash = hash * 31 + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};
