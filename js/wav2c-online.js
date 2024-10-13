//
// WAV2C Online, ENEL599 Version - adapted by Stefan Marks, originally by Guilherme Rodrigues
//

$(document).ready(function(){
    $("#div-actions").hide();
    $("#div-c-out").hide();

    $("#input-audiowav").on("change", convertWavToCode);
    $("#button-copy-clipboard").on("click", copyToClipboard);
    // $("#button-download-h-file").on("click", generateDownloadHFile);
});


/** Convert WAV to TXT */
function convertWavToCode() {
    // console.debug(this.files);
    $( "#label-audio-upload" ).text(`${this.files[0].name} - ${this.files[0].size} bytes`);

    if (this.files.length === 0) {
        console.log("No file selected.");
        return;
    }

    var soundName = this.files[0].name;
    soundName = soundName.replace(/\.[^/.]+$/, ""); // remove file extension
    soundName = soundName.replace(/\s/g, "_");      // remove spaces
    soundName = "SND_" + soundName.toUpperCase();   // prefix and uppercase

    var reader = new FileReader();
    reader.onload = function(e) {
        // No WAV, os 44 bytes iniciais são de cabeçalho: https://wiki.fileformat.com/audio/wav/
        const AUDIO_DATA      = new Uint8Array(e.target.result);
        const SAMPLE_RATE     = (AUDIO_DATA[27] << 24) | (AUDIO_DATA[26] << 16) | (AUDIO_DATA[25] << 8) | AUDIO_DATA[24];
        const BITS_PER_SAMPLE =                                                   (AUDIO_DATA[35] << 8) | AUDIO_DATA[34];
		const SAMPLE_COUNT    = (AUDIO_DATA[43] << 24) | (AUDIO_DATA[42] << 16) | (AUDIO_DATA[41] << 8) | AUDIO_DATA[40];
		const BYTES_PER_LINE  = 16;
        // console.debug(audioBytes)

	    $( "#p-file-info" ).html(
			`Sample rate: <strong>${SAMPLE_RATE} Hz</strong>` + 
			`, Samples: <strong>${SAMPLE_COUNT}</strong>` + 
			`, Bits per Sample: <strong>${BITS_PER_SAMPLE}</strong>`
		);

        let txt = "";
		
		if (BITS_PER_SAMPLE == 8)
		{
//         txt += "// Wav2c Online converter, offline version, adapted by Stefan Marks\n";
//         txt += "// Based on Javascript version by Guilherme Rodrigues: https://github.com/guilhermerodrigues680/wav2c-online\n";
//         txt += "// Based on wav2c in C by Olle Jonsson: https://github.com/olleolleolle/wav2c\n\n";
			txt += `const int    ${soundName}_SAMPLERATE     = ${SAMPLE_RATE}; \n`;
			txt += `const int    ${soundName}_LENGTH         = ${SAMPLE_COUNT}; \n`;
			txt += `const int8_t ${soundName}_DATA[] PROGMEM = {\n  `;

			AUDIO_DATA.slice(44).forEach((sample, idx, arr) => 
			{
				if (idx < SAMPLE_COUNT)
				{
					signedValue = sample - 127;
					if (signedValue >  -10 && signedValue <  10) { txt += " "; }
					if (signedValue > -100 && signedValue < 100) { txt += " "; }
					if (signedValue >=   0                     ) { txt += " "; }
					txt += signedValue;

					if ((idx + 1) != SAMPLE_COUNT) 
					{                
						if (idx % BYTES_PER_LINE == BYTES_PER_LINE-1) {
							txt += ",\n  ";
						} else {
							txt += ", ";
						}
					}
					else 
					{
						txt += "\n};\n"
					}
				}
			});
		}
		else
		{
			txt = `Error: The WAV file has to be 8 bits per sample format, not ${BITS_PER_SAMPLE}`;
		}
		
        $("#code-c-out").html(txt);
        $("#p-status").text("Conversion finished.");
        $("#div-actions").show();
        $("#div-c-out").show();
        // Prism.highlightAll();
    }
  
    $( "#p-status" ).text("Starting the conversion");
    reader.readAsArrayBuffer(this.files[0]);
}


/** Função responsavel por gerar um arquivo para download */
function generateDownloadHFile() {
    const filename = "sounddata.h";
    const text = $("#code-c-out").text();
    let element = document.createElement('a');
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


/** Função responsavel por copiar o codigo para area de trasnferencia */
function copyToClipboard() {
    let containerid = "code-c-out";
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select().createTextRange();
        document.execCommand("copy");
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        // alert("O código gerado foi copiado! Pressione Ctrl+V para colá-lo")
    }
}