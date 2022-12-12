blockCount = 0;
blocks = {};
template = [];
blocksConfig = {};
currentBlock = currentMenu = {}; // just declaring

window.addEventListener(
  "DOMContentLoaded",
  function () {
    console.log("dom loaded");
    loadRPScripts();
    passPhraseBox = document.getElementById("passphrasebox");
    passPhraseElement = document.getElementById("passphrase");
    blocksContainer = document.getElementById("blocksContainer");
    textoPlantilla = document.getElementById("textoPlantilla");
    menuContainer = document.getElementById("menuContainer");
    templateChoice = document.getElementById("templateChoice");
    // Handle template erros so we can show a message in the passphrase box
    window.onerror = function (message, file, line) {
      console.error(
        "An error occurred: " + message + " in " + file + " on line " + line
      );
      passPhraseElement.innerHTML = "ERROR -- check template";
    };
    textoPlantilla.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        renovarPlantillaManual();
      }
      textoPlantilla.style.height = "1px";
      textoPlantilla.style.height = textoPlantilla.scrollHeight + "px";
    });

    templateChoice.addEventListener("change", changedTemplate);

    // blocksContainer.addEventListener("dragend", function (event) {
    //   console.log("drag ended");
    // });

    blocksContainer.addEventListener("dragover", function (event) {
      event.preventDefault();
    });
  },
  false
);

// Structure for word type blocks

// An array as object value means it's a boolean

// This is the original noun strucure for readablePassphraseJS
//
// noun = {
//     type: "noun",
//     label: "sustantivo",
//     subtypo: {
//         común: 1,
//         propio: 1,
//         nounFromAdjective: 1,
//     },
//     artículo: {
//         ninguno: 1,
//         definido: 1,
//         indefinido: 1,
//         demostrativo: 1,
//         personalPronoun: 1,
//     },
//     adjetivo: [0, 1],
//     preposición: [0, 1],
//     número: [0, 1],
//     single: [0, 1],
// };
//
// This is the noun structure for readablePassphraseJS-ES
//
// Sustantivo:
// subtype [choice: common, proper]
// article [choice: none, definite, indefinite ]
// adjective [boolean] - whether to include an adjective
// position adjetivo [boolean] - si el adjetivo va después (true) o antes (false) del sustantivo
// preposition[boolean] - whether to include a preposition
// singular [boolean] - whether the noun is singular (plural if false)
//
// This is the original verb strucure for readablePassphraseJS
// verb = {
//     type: "verb",
//     label: "verbo",
//     subtipo: {
//         presente: 1,
//         pasado: 1,
//         futuro: 1,
//         contínuo: 1,
//         "contínuo pasado": 1,
//         perfecto: 1,
//         subjunctivo: 1,
//     },
//     adverbio: [0, 1],
//     interrogativo: [0, 1],
//     intransitivo: {
//         noNounClause: 1,
//         preposition: 1,
//     },
//
// This is the verb structure for readablePassphraseJS-ES
//
// Verbo:
// subtype [choice: gerundio,futuro,presente,  preteritoImperfecto,preteritoPerfectoSimple ]
// adverb [boolean] - whether to include an adverb
// interrogative [boolean] - whether to make the whole phrase interrogative

blocksDef = {
  noun: {
    type: "noun",
    label: "sustantivo",
    subtipo: {
      nozero: true,
      común: 5,
      propio: 5,
    },
    artículo: {
      nozero: true,
      ninguno: 5,
      definido: 5,
      indefinido: 5,
    },
    "adjetivo sí / no": [5, 5],
    "adjetivo después / antes": [5, 5],
    "preposición sí / no": [5, 5],
    "singular / plural": [5, 5],
  },

  verb: {
    type: "verb",
    label: "verbo",
    subtipo: {
      gerundio: 5,
      futuro: 5,
      presente: 5,
      "pasado imperfecto": 5,
      "pasado perfecto": 5,
    },
    "adverbio sí / no": [5, 5],
    interrogativo: [5, 5],
  },

  conjunction: {
    type: "conjunction",
    label: "conjunción",
  },

  directSpeech: {
    type: "directSpeech",
    label: "declarativo",
  },
  comma: {
    type: "comma",
    label: "coma",
  },
};

// called after the readable passphrase dictionary has loaded (it's about 250k un-minified)
function ReadablePassphrase_Callback() {
  document.getElementById("morePhrasesButton").disabled = false;
  renovarTemplateOption();
  getMorePhrases();
}

function getMorePhrases() {
  var phrases = [];
  var allPhrases = [];
  passPhrase = new ReadablePassphrase(
    document.getElementById("templateChoice").value
  );
  passPhraseElement = document.getElementById("passphrase");
  entropyElement = document.getElementById("entropia");

  entropyElement.innerHTML =
    "(entropía:&nbsp;" + Math.round(passPhrase.template.entropy()) + ")";

  passPhraseElement.value = passPhrase;
  allPhrases.push("-" + passPhrase);
  var largo = passPhraseElement.value.length;
  var random = Math.random() * 10;
  var factor = random + 500 / largo + 10;
  passPhraseElement.style.fontSize = factor + "px";

  var pattern = GeoPattern.generate(allPhrases[0].toString());
  passPhraseBox.style.backgroundImage = pattern.toDataUrl();

  a = passPhraseElement.scrollHeight;
  passPhraseElement.style.height = "1px";
  altura = passPhraseElement.scrollHeight;
  passPhraseElement.style.height = altura + "px";
}

// This event listener is to hide block menus
document.addEventListener("click", function canvasListener(event) {
  if (currentMenu instanceof Element) {
    if (!currentMenu.contains(event.target)) {
      // Handle the event
      if (currentMenu.style.display === "block") {
        hideMenus();
      }
    }
  }
});

// This function runs when an add block button is clicked or when a template is parsed

function addBlock(blockType, manual = true) {
  blockId = blockType.type + "_" + blockCount;
  let wordBlock = document.createElement("div");
  wordBlock.setAttribute("id", blockId);
  wordBlock.setAttribute("tipo", blockType.type);

  wordBlock.draggable = true;
  wordBlock.className = "block";

  let verbInnerBlock = document.createElement("div");
  verbInnerBlock.setAttribute("id", "innerblock_" + blockId);
  verbInnerBlock.className = "innerblock";
  verbInnerBlock.innerHTML = blockType.label + " (" + blockCount + ")";

  if (blockType.type == "noun" || blockType.type == "verb") {
    // This block type has parameters. Let's create a menu

    // *** MENU ***
    menuBloque = document.createElement("div");
    menuBloque.className = "menu" + blockType.type;

    botón = document.createElement("button");
    botón.setAttribute("id", "dropdownButton_" + blockId);
    botón.className = "botónMenu";

    botón.addEventListener("click", function (event) {
      event.stopPropagation();
      showBlockMenu("dropdownMenu_" + event.target.parentNode.parentNode.id);
    });

    botón.innerHTML = "+";
    verbInnerBlock.appendChild(botón);

    // The div that holds the menu
    dropdown = document.createElement("div");
    dropdown.className = "dropdownMenu";
    dropdown.setAttribute("id", "dropdownMenu_" + blockId);
    dropdown.setAttribute("data-type", blockType.type);
    dropdown.setAttribute("data-block", blockId);
    dropdown.style.display = "none";

    // The menu title and legend
    item = document.createElement("div");
    item.className = "parámetro";

    dropdownTitleContainer = document.createElement("div");
    dropdownTitleContainer.className = "opción";

    dropdownTitle = document.createElement("p");
    dropdownTitleContainer.appendChild(dropdownTitle);

    leyendaSliders = document.createElement("div");
    leyendaSliders.className = "leyenda";

    leyendaTexto1 = document.createElement("p");
    leyendaTexto1.innerHTML = "probabilidad<br/>alta";

    leyendaSliders.appendChild(leyendaTexto1);

    leyendaTexto2 = document.createElement("p");
    leyendaTexto2.innerHTML = "probabilidad<br/>baja";

    leyendaSliders.appendChild(leyendaTexto2);
    dropdownTitleContainer.appendChild(leyendaSliders);
    item.appendChild(dropdownTitleContainer);
    dropdown.appendChild(item);

    for (let parámetro in blockType) {
      if (typeof blockType[parámetro] == "object") {
        // This array value is not the block's type or label (i.e. "verbo")

        item = document.createElement("div");
        item.className = "parámetro";

        // textoparámetro = document.createElement("label");
        // textoparámetro.setAttribute("for", "parámetro");

        textoparámetro = document.createElement("p");
        textoparámetro.innerHTML = parámetro;

        item.appendChild(textoparámetro);

        if (Array.isArray(blockType[parámetro])) {
          // It's a boolean type parameter

          sliderContainer = document.createElement("div");
          sliderContainer.className = "booleanSliderContainer";

          itemOpción = document.createElement("div");
          itemOpción.className = "opción";

          textoOpción = document.createElement("label");
          textoOpción.setAttribute("for", blockId + "_" + parámetro);
          textoOpción.innerHTML = "&nbsp;";

          itemOpción.appendChild(textoOpción);

          slider = document.createElement("input");
          slider.setAttribute("id", blockId + "_" + parámetro);
          slider.className = "booleanSlider";
          slider.setAttribute("type", "range");
          slider.setAttribute("min", "0");
          slider.setAttribute("max", "10");
          valor = 10 - blockType[parámetro][0];
          slider.setAttribute("value", valor);
          slider.setAttribute("data-optiontype", "boolean");

          slider.addEventListener("change", function () {
            updateSliderArray(this);
            renovarPlantilla(true);
          });

          falseLabel = document.createElement("p");
          trueLabel = document.createElement("p");
          falseLabel.innerHTML = "no";
          trueLabel.innerHTML = "sí";

          itemOpción.appendChild(slider);
          item.appendChild(itemOpción);
        } else {
          // Parameter with various weighed options

          for (let opción in blockType[parámetro]) {
            if (opción == "nozero") {
              item.setAttribute("data-nozero", true);
              continue;
            }

            itemOpción = document.createElement("div");
            itemOpción.className = "opción";

            textoOpción = document.createElement("label");
            textoOpción.setAttribute("for", blockId + "_" + opción);
            textoOpción.innerHTML = opción;

            itemOpción.appendChild(textoOpción);

            slider = document.createElement("input");
            slider.setAttribute("id", blockId + "_" + opción);
            slider.className = "optionsSlider";
            slider.setAttribute("type", "range");
            slider.setAttribute("min", "0");
            slider.setAttribute("max", "10");
            valor = blockType[parámetro][opción];
            slider.setAttribute("value", valor);
            slider.setAttribute("data-optiontype", "option");

            slider.addEventListener("change", function () {
              updateSliderArray(this);
              renovarPlantilla(true);
            });

            itemOpción.appendChild(slider);
            item.appendChild(itemOpción);
          }
        }

        dropdown.appendChild(item);
      }
    }

    menuContainer.appendChild(dropdown);

    if (manual) {
      updateSliderArray();
    }
  }

  cerrar = document.createElement("div");
  cerrar.className = "closeIcon";
  cerrar.innerHTML = "&#215;";
  cerrar.addEventListener("click", function (event) {
    event.stopPropagation();
    deleteBlock(event.target.parentNode.parentNode.id);
  });
  verbInnerBlock.appendChild(cerrar);

  wordBlock.appendChild(verbInnerBlock);

  blocksContainer.appendChild(wordBlock);

  blockCount++;

  // Check if function was run after adding block (true)
  // Or from editing the template

  if (manual) {
    renovarPlantilla(true);
  }

  wordBlock.addEventListener("drop", function (event) {
    event.preventDefault();
    console.log("drop. currentBlock is: ", currentBlock);
    if (wordBlock != currentBlock) {
      let currentPos = 0,
        droppedPos = 0;
      for (let it = 0; it < blocks.length; it++) {
        if (currentBlock == blocks[it]) {
          currentPos = it;
        }
        if (wordBlock == blocks[it]) {
          droppedPos = it;
        }
      }
      if (currentPos < droppedPos) {
        wordBlock.parentNode.insertBefore(currentBlock, wordBlock.nextSibling);
      } else {
        wordBlock.parentNode.insertBefore(currentBlock, wordBlock);
      }
      for (let it of blocks) {
        it.classList.remove("active");
      }
      renovarPlantilla(true);
    }
  });

  wordBlock.addEventListener("dragstart", function (event) {
    currentBlock = wordBlock;
  });

  wordBlock.addEventListener("dragenter", function (event) {
    event.preventDefault();

    if (wordBlock != currentBlock) {
      setTimeout(() => wordBlock.classList.add("active"), 500);
    } else {
    }
  });

  wordBlock.addEventListener("dragleave", function (event) {
    event.preventDefault();

    if (wordBlock != currentBlock) {
      setTimeout(() => wordBlock.classList.remove("active"), 800);
    }
  });

  wordBlock.addEventListener("dragend", function (event) {
    for (let it of blocks) {
      it.classList.remove("active");
    }
  });
}

// This one runs when template blocks are moved around or deleted or when parameters are changed
function renovarPlantilla(switchToCustom = false) {
  blocks = document.querySelectorAll(".block");
  template = [];
  for (bloque of blocks) {
    if (
      bloque.getAttribute("tipo") == "verb" ||
      bloque.getAttribute("tipo") == "noun"
    ) {
      template.push(blocksConfig[bloque.getAttribute("id")]);
    } else {
      template.push(bloque.getAttribute("tipo"));
    }
  }

  textoPlantilla.value = JSON.stringify(template);
  textoPlantilla.style.height = "1px";
  textoPlantilla.style.height = textoPlantilla.scrollHeight + "px";
  RPSentenceTemplate.templates.custom = new RPSentenceTemplate(template);
  renovarTemplateOption();

  // if (switchToCustom) {
  templateChoice.value = "custom";
  // }

  // if (templateChoice.value == "custom") {
  getMorePhrases();
  // }
}

// This runs when a template is manually edited in the textarea and enter is pressed
function renovarPlantillaManual() {
  plantilla = textoPlantilla.value;
  if (plantilla == "") {
    document.getElementById("textoPlantilla").value = "";
    delete RPSentenceTemplate.templates.custom;
    passPhrase = new ReadablePassphrase(
      document.getElementById("templateChoice").value
    );
  } else {
    textoPlantilla.value = plantilla.replace(/\n|\r|\r\n/g, "").trim();
    RPSentenceTemplate.templates.custom = new RPSentenceTemplate(
      JSON.parse(textoPlantilla.value)
    );
    renovarTemplateOption();
    deleteAllBlocks(true);
    templateToBlocks(JSON.parse(textoPlantilla.value));
  }
  templateChoice.value = "custom";
  getMorePhrases();
}

function showBlockMenu(id) {
  var menu = document.getElementById(id);

  if (menu.style.display === "block") {
    // el.style.display = "none";
    hideMenus();
  } else {
    hideMenus();
    menu.style.display = "block";
    currentMenu = menu;
  }
}

function hideMenus() {
  var menus = document.querySelectorAll(".dropdownMenu");
  menus.forEach((menu) => {
    if (menu.style.display === "block") {
      menu.style.display = "none";
    }
  });
  currentMenu = {};
}

function deleteBlock(blockId) {
  document.getElementById(blockId).remove();
  renovarPlantilla(true);
  if (document.querySelectorAll(".block").length == 0) {
    document.getElementById("textoPlantilla").value = "";
    delete RPSentenceTemplate.templates.custom;
    if (templateChoice.value == "custom") {
      renovarTemplateOption();
      templateChoice.value = "random";
    } else {
      // templateChoiceCurrent = templateChoice.value
      renovarTemplateOption();
    }
    passPhrase = new ReadablePassphrase(
      document.getElementById("templateChoice").value
    );
    getMorePhrases();
  }
}

function deleteAllBlocks(manual = false) {
  blocks = document.querySelectorAll(".block");
  for (bloque of blocks) {
    bloque.remove();
  }
  if (!manual) {
    document.getElementById("textoPlantilla").value = "";
    delete RPSentenceTemplate.templates.custom;
    if (templateChoice.value == "custom") {
      renovarTemplateOption();
      templateChoice.value = "random";
    }
  } else {
    templateChoice.value == "custom";
  }
  passPhrase = new ReadablePassphrase(
    document.getElementById("templateChoice").value
  );
  getMorePhrases();
}

function updateSliderArray(element = false) {
  if (element) {
    if (element.parentNode.parentNode.dataset.nozero) {
      // Some parameters such as noun type can't be both zero
      nonzeroSliders =
        element.parentNode.parentNode.querySelectorAll("input[type=range]");
      i = 0;
      nonzeroSliders.forEach((slider) => {
        i += parseInt(slider.value);
      });
      if (i < 1) {
        element.value = 1;
      }
    }
  }
  // Iterate through all menus (word types with parameters, noun and verb)
  var menus = document.querySelectorAll(".dropdownMenu");
  blocksConfig = {};
  menus.forEach((menu) => {
    values = [];
    block = menu.dataset.block;
    type = menu.dataset.type;
    values.push(type);
    // Get the range sliders within the div
    var sliders = menu.querySelectorAll("input[type=range]");

    // Loop through the sliders and get their values
    sliders.forEach((slider) => {
      // Get the value of the slider and add it to the values array
      if (slider.dataset.optiontype == "boolean") {
        values.push([10 - slider.value, parseInt(slider.value)]);
      } else {
        values.push(parseInt(slider.value));
      }
    });
    blocksConfig[block] = values;
  });
}

// Parse the template in the box and convert it to blocks
function templateToBlocks(template) {
  length = template.length;
  bloques = [];

  for (var i = 0; i < length; i++) {
    el = template[i];
    if (typeof el == "string") {
      addBlock(blocksDef[el], false);
    } else if (typeof el == "object" && el.length) {
      bloque = {};

      switch (el[0]) {
        case "noun":
          booleanToArray(6, 9);
          bloque = {
            type: "noun",
            label: "sustantivo",
            subtipo: {
              nozero: true,
              común: el[1],
              propio: el[2],
            },
            artículo: {
              nozero: true,
              ninguno: el[3],
              definido: el[4],
              indefinido: el[5],
            },
            "adjetivo sí / no": el[6],
            "adjetivo después / antes": el[7],
            "preposición sí / no": el[8],
            "singular / plural": el[9],
          };
          break;

        case "verb":
          booleanToArray(6, 7);
          bloque = {
            type: "verb",
            label: "verbo",
            subtipo: {
              gerundio: el[1],
              futuro: el[2],
              presente: el[3],
              "pasado imperfecto": el[4],
              "pasado perfecto": el[5],
            },
            "adverbio sí / no": el[6],
            interrogativo: el[7],
          };
          break;
        default:
          throw (
            "Error unpacking template spec array, unknown type: " +
            thisElement[0]
          );
      }
      bloques.push(bloque);
      addBlock(bloque, false);
    }
  }
  updateSliderArray();
  return bloques;
}

// This function converts booleans in templates to arrays that can be displayed as sliders in the blocks
function booleanToArray(min, max) {
  for (x = min; x < max + 1; x++) {
    if (typeof el[x] == "boolean") {
      // convert to equivalent array form
      el[x] = el[x] ? [10, 0] : [0, 10];
    } else if (Array.isArray(el[x]) && el[x].length == 2);
    {
      tot = el[x][0] + el[x][1];
      el[x][0] = parseInt((el[x][0] / tot) * 10);
      el[x][1] = 10 - el[x][0];
    }
  }
}

// When the user chooses a sentence template this function turns that object back to an array
// This array is displayed, converted to blocks and can be manually edited in the textarea or with the blocks

function RPSentenceTemplateToArray(templateObject) {
  templateArray = [];
  length = templateObject.length;
  for (var i = 0; i < length; i++) {
    var el = templateObject[i];

    // disassemble templates
    switch (el.type) {
      case "noun":
        templateArray.push([
          el.type,
          el.subtype.common,
          el.subtype.proper,
          el.articuloPlural.none,
          el.articuloPlural.definido,
          el.articuloPlural.indefinido,
          el.adjective,
          el.adjectiveDespues,
          el.preposition,
          el.singular,
        ]);
        break;
      case "verb":
        templateArray.push([
          el.type,
          el.subtype.gerundio,
          el.subtype.futuro,
          el.subtype.presente,
          el.subtype.preteritoImperfecto,
          el.subtype.preteritoPerfectoSimple,
          el.adverb,
          el.interrogative,
        ]);
        break;
      default:
        templateArray.push(el.type);
    }
  }
  return templateArray;
}

function renovarTemplateOption() {
  templateChoice.innerHTML = "";

  for (plantilla in RPSentenceTemplate.templates) {
    templateOption = document.createElement("option");
    templateOption.setAttribute("value", plantilla);
    templateOption.innerHTML = plantilla;
    templateChoice.appendChild(templateOption);
  }
}

function changedTemplate() {
  deleteAllBlocks(true);
  if (templateChoice.value == "random") {
    textoPlantilla.value = "";
  } else {
    textoPlantilla.value = JSON.stringify(
      RPSentenceTemplateToArray(
        RPSentenceTemplate.templates[templateChoice.value]
      )
    );
    templateToBlocks(JSON.parse(textoPlantilla.value));
  }
  getMorePhrases();
  textoPlantilla.style.height = "1px";
  textoPlantilla.style.height = textoPlantilla.scrollHeight + "px";
}

function accordion(id) {
  var x = document.getElementById(id);
  if (x.className.indexOf("mostrar") == -1) {
    x.className += " mostrar";
  } else {
    x.className = x.className.replace(" mostrar", "");
  }
}

// Select and copy passPhraseBox to clipboard

function copyToClipboard() {
  var copyText = document.getElementById("passphrase");
  copyText.select();
  document.execCommand("copy");
  var buttonC = document.getElementById("copyButton");
  buttonC.focus();
}
