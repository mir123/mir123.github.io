/**
 * Generador de frases clave legibles en español, adaptado de readablePassphraseJS por Steven Zeck
 *
 * @file This is a Spanish version of readablePassphraseJS by Steven Zeck, itself a port of the C# ReadablePassphraseGenerator, by Murray Grant
 * @author Mir Rodriguez Lombardo <mir123@gmail.com>
 * @author Steven Zeck <saintly@innocent.com>
 * @version 1.1
 * @license Apache-2
 *
 *
 *  Los objetos ReadablePassphrase generan frases aleatorias en español
 *  @param {(string|object)} [template] - create a sentence using the given template (either a string name of a predefined template, or an RPSentenceTemplate object)
 *  @param {(string|object)} [mutator]  - use a mutator to add random uppercase & numbers (either a string name of a predefined mutator, or an RPMutator object)
 */

blockCount = 0;
blocks = {};
template = [];
blocksConfig = {};
currentBlock = currentMenu = {}; // just declaring

textoPlantilla.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    renovarPlantillaManual();
  }
  textoPlantilla.style.height = "1px";
  textoPlantilla.style.height = textoPlantilla.scrollHeight + "px";
});

templateChoice.addEventListener("change", changedTemplate);

blocksContainer.addEventListener("dragover", function (event) {
  event.preventDefault();
});

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

// called after the readable passphrase dictionary has loaded (it's about 1MB un-minified)
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

class ReadablePassphrase {
  constructor(template) {
    this.parts = [];
    this.length = 0;
    this.usedWords = {};
    // this.mutator = new RPMutator(mutator);
    if (template) this.addTemplate(template);
    return this;
  }

  /**
   *  Get the string representation of the generated phrase
   *  @return {string} A phrase, eg "the milk will eat the angry decision"
   */
  toString() {
    var phrase = [];
    for (var wordNum = 0; wordNum < this.parts.length; wordNum++)
      phrase.push(this.parts[wordNum].value);
    //return this.mutator.mutate(phrase.join(" "));

    return phrase.join(" ").replace(" ,", ",");
  }

  // ****** methods called by addTemplate() *******
  /**
   *  Add a template to the end of the current phrase.
   *  Called automatically by the constructor if you pass a template to the constructor.
   *  @param {(string|object)} template - use the given template (either a string name of a predefined template, or an RPSentenceTemplate object)
   */
  addTemplate(template) {
    if (typeof template == "string")
      template = RPSentenceTemplate.byName(template);
    this.template = template;
    for (
      var templateNumber = 0;
      templateNumber < template.length;
      templateNumber++
    ) {
      var thisTemplate = template[templateNumber];
      var finalize = this.addClause(new RPRandomFactors(thisTemplate));
      if (finalize) break; // some verb templates cause premature completion
    }
  }

  /**
   *  Get the last clause in the phrase, or null if the phrase is empty
   *  @return {object} an RPWord() object or null
   */
  last() {
    return this.length > 0 ? this.parts[this.length - 1] : null;
  }

  /**
   *  Add a clause to the current passphrase
   *  @param {object} factors - an object representing a clause (see README for examples)
   *  @return {boolean} returns true if no more clauses should be added after this
   */
  addClause(factors) {
    switch (factors.type) {
      case "noun":
        return this.addNoun(factors);
      case "verb":
        return this.addVerb(factors);
      case "conjunction":
        this.appendWord(RPWordList.conjunctions.getRandomWord(this.usedWords));
        return false;
      case "comma":
        this.appendWord(new RPWord(["coma"], ","));
        return false;
      case "directSpeech":
        this.appendWord(RPWordList.speechVerbs.getRandomWord(this.usedWords));
        return false;
      default:
        throw "Unexpected clause type: " + factors.type;
    }
  }

  /**
   *  Add an RPWord() object to the end of the current passphrase
   *  @param {object} word - an RPWord object
   *  @return {object} returns the current ReadablePassphrase object
   */
  appendWord(word) {
    return this.insertWord(word, this.length);
  }

  /**
   *  Insert an RPWord() object at any position in the current passphrase
   *  @param {object} word - an RPWord object
   *  @param {number} position - a number representing the position in the current set of RPWords to add the new one
   *  @return {object} returns the current ReadablePassphrase object
   */
  insertWord(word, position) {
    this.parts.splice(position, 0, word);
    this.usedWords[word.value] = true;
    this.length++;
    // console.log('Adding ' + word.value + ' to sentence');
    return this;
  }

  /**
   *  Add a Verb clause to the current passphrase
   *  @param {object} factors - an object representing a verb clause (see README for examples)
   *  @return {boolean} returns true if no more clauses should be added after this (triggered by some intransitive verbs)
   */
  addVerb(factors) {
    // calculating whether the verb should be plural...
    // var ahora = this;
    // console.log(ahora);
    var firstNoun = null,
      firstIndefinitePronoun = null,
      pluralVerb = null,
      firstComma = 0,
      insertInterrogative = 0;
    // ¿Hay coma? Empezar a contar desde la última coma
    for (
      var minWordNumber = this.length - 1;
      minWordNumber > 0;
      minWordNumber--
    ) {
      var thisWord = this.parts[minWordNumber];
      if (firstComma == 0 && thisWord.hasTypes("coma"))
        firstComma = minWordNumber;
    }

    for (var wordNumber = firstComma; wordNumber < this.length; wordNumber++) {
      var thisWord = this.parts[wordNumber];
      if (!firstNoun && thisWord.hasTypes("noun")) firstNoun = thisWord;
      else if (thisWord.hasTypes("speechVerb")) {
        firstNoun = null;
        insertInterrogative = wordNumber + 1;
      } else if (
        !firstIndefinitePronoun &&
        thisWord.hasTypes("indefinitePronoun")
      )
        firstIndefinitePronoun = thisWord;
    }

    if (firstNoun) pluralVerb = firstNoun.hasTypes("plural") ? true : false;
    else if (firstIndefinitePronoun)
      pluralVerb = firstIndefinitePronoun.hasTypes("plural") ? true : false;
    else pluralVerb = false;

    var makeInterrogative = factors.byName("interrogative"),
      tense = factors.byName("subtype");
    //console.log('Make interrogative: ' + makeInterrogative + ', tense: ' + tense);
    // if (makeInterrogative) {
    //     this.insertWord(
    //         RPWordList.interrogatives.getRandomWord(pluralVerb),
    //         insertInterrogative,
    //         this.usedWords
    //     );
    //     pluralVerb = true;
    //     tense = "presentPlural";
    // }
    var includeAdverb = factors.byName("adverb")
      ? ReadablePassphrase.randomness(2) >= 1
        ? "before"
        : "after"
      : "no";
    if (includeAdverb == "before")
      this.appendWord(RPWordList.adverbs.getRandomWord(this.usedWords));

    //RPWordList[selectTransitive ? "verbs" : "intransitiveVerbs"].getRandomWord(

    this.appendWord(
      RPWordList["verbs"].getRandomWord(tense, pluralVerb, this.usedWords)
    );

    if (includeAdverb == "after")
      this.appendWord(RPWordList.adverbs.getRandomWord(this.usedWords));
    // if (addPreposition)
    //     this.appendWord(RPWordList.prepositions.getRandomWord(this.usedWords));
    //if (removeAccusativeNoun) return true; // Returning true means the sentence is done
    return false;
  }

  /**
   *  Add a Noun clause to the current passphrase
   *  @param {object} factors - an object representing a noun clause (see README for examples)
   *  @return {boolean} returns true if no more clauses should be added after this (currently always false)
   */
  addNoun(factors) {
    if (
      factors.byName("preposition") &&
      (!this.last() || !this.last().hasTypes("preposition"))
    ) {
      this.appendWord(RPWordList.prepositions.getRandomWord(this.usedWords));
    }

    var n = factors.byName("subtype");
    switch (n) {
      case "common":
        return this.addCommonNoun(factors);
        break;
      // case "nounFromAdjective":
      //     return this.addNounFromAdjective(factors);
      //     break;
      case "proper":
        this.appendWord(RPWordList.properNouns.getRandomWord(this.usedWords));
        return false;
      default:
        throw "Unknown noun subtype: " + n;
    }
  }

  /**
   *  Add a common Noun clause to the current passphrase (eg. "dog", "cat", "justice")
   *  @param {object} factors - an object representing a noun clause (see README for examples)
   *  @return {boolean} returns true if no more clauses should be added after this (currently always false)
   */
  addCommonNoun(factors) {
    var isPlural = this.chooseSingularOrPlural(factors);

    if (
      factors.byName("number") &&
      (isPlural || factors.mustBeTrue("singular"))
    ) {
      if (
        !isPlural &&
        !(this.length && this.last().hasTypes(["articulo", "indefinido"]))
      )
        this.appendWord(RPWordList.numbers.getSingularNumberWord());
      else if (isPlural)
        this.appendWord(RPWordList.numbers.getPluralNumberWord());
    }

    var palabra = RPWordList.nouns.getRandomWord(isPlural, this.usedWords);

    this.addNounPrelude(palabra, factors);

    if (factors.byName("adjective") && !factors.byName("adjectiveDespues")) {
      this.appendWord(this.agregarAdjetivo(palabra, factors));
    }
    this.appendWord(palabra);

    if (factors.byName("adjective") && factors.byName("adjectiveDespues")) {
      this.appendWord(this.agregarAdjetivo(palabra, factors));
    }

    return false;
  }

  /**
   *  Decidir si el sustantivo deberá ser singular o plural. Luego agregaremos el preludio
   *  @param {object} factors - an object representing a noun clause (see README for examples)
   *  @return {boolean} returns true if the following noun should be plural
   */
  chooseSingularOrPlural(factors) {
    var isPlural = !factors.byName("singular");
    return isPlural;
  }

  /**
   *  Add a prelude to a noun to the current passphrase, eg. "before the"
   *  @param {object} factors - an object representing a noun clause (see README for examples)
   *  @return {boolean} returns true if the following noun should be plural
   */
  addNounPrelude(palabra, factors) {
    var isPlural = !palabra.types.singular;
    var esFemenino = palabra.types.F ? true : false;
    var definiteOrIndefinite = factors.byName(
      isPlural ? "articuloPlural" : "articuloSingular"
    );
    var prelude = "";

    // if (
    //     factors.byName("preposition") &&
    //     (!this.last() || !this.last().hasTypes("preposition"))
    // ) {
    //     this.appendWord(RPWordList.prepositions.getRandomWord(this.usedWords));
    // }
    switch (definiteOrIndefinite) {
      case "none":
        break;
      case "definido":
        prelude = RPWordList.articulos.getRandomDefiniteArticle(
          isPlural,
          esFemenino
        );
        break;
      case "indefinido":
        prelude = RPWordList.articulos.getRandomIndefiniteArticle(
          isPlural,
          esFemenino
        );
        break;
      // case "demonstrative":
      //     this.appendWord(RPWordList.demonstratives.getRandomWord(isPlural));
      //     break;
      // case "personalPronoun":
      //     this.appendWord(
      //         RPWordList.personalPronouns.getRandomWord(isPlural, this.usedWords)
      //     );
      //    break;
      default:
        throw "Unknown case result from computeFactor";
    }
    if (definiteOrIndefinite != "none") {
      this.appendWord(prelude);
      palabra.prelude = prelude;
    } else {
      palabra.prelude = false;
    }
    return palabra;
  }

  agregarAdjetivo(palabra, factors) {
    var isPlural = !palabra.types.singular;
    var esFemenino = palabra.types.F ? true : false;

    return RPWordList.adjectives.getRandomWord(palabra, this.usedWords);
  }

  /**
   *  ReadablePassphrase.randomness() es usado por todos los objetos ReadablePassphrase como fuente de aleatoriedad.
   *  Aquí usamos una función que utiliza crypto.getRandomValues y que supuestamente produce valores realmente aleatorios
   *  Puedes reemplazar esto por una función mejor si así lo deseas
   *  @param {number} [multiplier=1] - get a value between 0 and multiplier (including 0, but not including multiplier)
   *  @return {number} A random, floating-point number between 0 and 1 (or multiplier, if provided)
   */
  // ReadablePassphrase.randomness = function(multiplier) {
  //     return Math.random() * (multiplier || 1);
  // };
  // http://stackoverflow.com/questions/18230217/javascript-generate-a-random-number-within-a-range-using-crypto-getrandomvalues
  // Tomado de https://github.com/EFForg/OpenWireless/blob/master/app/js/diceware.js
  static randomness(max) {
    var min = 0;
    var rval = 0;
    var range = max * 100;

    var bits_needed = Math.ceil(Math.log2(range));
    if (bits_needed > 53) {
      throw new Exception("We cannot generate numbers larger than 53 bits.");
    }
    var bytes_needed = Math.ceil(bits_needed / 8);
    var mask = Math.pow(2, bits_needed) - 1;
    // 7776 -> (2^13 = 8192) -1 == 8191 or 0x00001111 11111111
    // Create byte array and fill with N random numbers
    var byteArray = new Uint8Array(bytes_needed);
    window.crypto.getRandomValues(byteArray);

    var p = (bytes_needed - 1) * 8;
    for (var i = 0; i < bytes_needed; i++) {
      rval += byteArray[i] * Math.pow(2, p);
      p -= 8;
    }

    // Use & to apply the mask and reduce the number of recursive lookups
    rval = rval & mask;

    if (rval >= range) {
      // Integer out of acceptable range
      return this.randomness(max);
    }
    // Return an integer that falls within the range
    return rval / 100;
  }

  /**
   *  Convenience function: get a random integer
   *  @param {number} [multiplier=2] Get a random number betweeen 0 and multiplier (including 0 but not including multiplier)
   *  @return {number} A random integer
   */
  static randomInt(multiplier) {
    return Math.floor(ReadablePassphrase.randomness(multiplier || 2));
  }

  /**
   *  Get a list of names of predefined templates
   *  @return {string[]} A list of predefined templates, in no particular order
   */
  static templates() {
    var templates = [];
    for (var templateName in RPSentenceTemplate.templates)
      templates.push(templateName);
    return templates;
  }

  /**
   *  Get a list of names of predefined mutators
   *  @return {string[]} A list of predefined mutators, in no particular order
   */
  static mutators() {
    var mutators = [];
    for (var mutatorName in RPMutator.mutators) mutators.push(mutatorName);
    return mutators;
  }

  /**
   *  Get the number of bits of entropy in a template + mutator
   *  @param {string} template - name of the given template (not a template object)
   *  @param {(string|object)} [mutator]  - either a string name of a predefined mutator, or an RPMutator object
   *  @return {number} floating-point number of bits
   */
  static entropyOf(template, mutator) {
    mutator = mutator ? new RPMutator(mutator) : null;
    console.log(RPSentenceTemplate.entropyOf(template));
    console.log(mutator.entropy());

    return (
      RPSentenceTemplate.entropyOf(template) + (mutator ? mutator.entropy() : 0)
    );
  }
}

/**
 *  This object represents a word in a sentence, plus some attributes that describe the type of word
 *  @param {(string|string[])} types  - a string, or array of strings describing the type of the word, eg [ 'verb', 'intransitive' ]
 *  @param {string} value - the text representation of this word
 */
class RPWord {
  constructor(types, value) {
    this.value = value;
    this.types = {};
    this.addTypes(types);
    return this;
  }
  /**
   *  Add one or more types to this word
   *  @param {(string|string[])} types  - a string, or array of strings describing the type of the word, eg [ 'verb', 'intransitive' ]
   *  @return {object} returns this RPWord() object
   */
  addTypes(types) {
    if (typeof types != "object") types = [types];
    var obj = this;
    types.forEach(function (type) {
      obj.types[type] = true;
    });
    return this;
  }
  /**
   *  Returns true if the word has all the given types
   *  @param {(string|string[])} types  - a string, or array of strings you want to check for, eg [ 'verb', 'transitive' ]
   *  @return {boolean} true if the word has all the requested types, false if any are missing
   */
  hasTypes(types) {
    if (typeof types != "object") types = [types];
    for (var typeNum = 0; typeNum < types.length; typeNum++) {
      if (!this.types[types[typeNum]]) return false;
    }
    return true;
  }
}

/**
 *  This object represents a pool of words of a similar type, with the assumption that you will request random members from the pool
 *  @param {string} type  - a string describing the type of all words in this list
 *  @param {string[]} wordArray - an array of words
 */
class RPWordList {
  constructor(type, wordArray) {
    this.list = wordArray;
    this.type = type;
    this.length = wordArray.length;
    return this;
  }
  /**
   *  Get a random word from the pool.
   *  Note that passing alreadyChosen{} actually weakens the overall strength of the passphrase slightly
   *  @param {object} [alreadyChosen] - if a hash of words that are already chosen is provided, this will avoid returning one already chosen
   *  @return {object} an RPWord() object with the chosen word
   */
  getRandomWord(alreadyChosen) {
    var word,
      attempts = 100;
    do {
      word = this.list[ReadablePassphrase.randomInt(this.length)];

      if (attempts-- < 1)
        throw (
          "Exceeded max attempts in RPWordList.getRandomWord() for type " +
          this.type
        );
    } while (alreadyChosen && alreadyChosen[word]);

    return new RPWord(this.type, word);
  }
}

/**
 *  This object represents a pool of word pairs of a similar type, with the first element in each pair being the singular form and the second the plural
 *  @param {string} type  - a string describing the type of all words in this list
 *  @param {object[]} wordArray - an array of a word pairs, eg [[ 'mouse', 'mice ], ['dog','dogs' ]]
 *  Convertido a español eliminando la posibilidad de array -- siempre es string (la primera parte del array) y siempre construye el plural programáticamente.
 */
class RPWordListPlural extends RPWordList {
  constructor(type, pluralWordArray, genero) {
    super(type, pluralWordArray);
    this.genero = genero;
    for (var wordNum = 0; wordNum < this.list.length; wordNum++) {
      var thisWord = this.list[wordNum][0];

      var genero = this.list[wordNum][1];
      //if (typeof thisWord == "string")
      if (thisWord.substring(thisWord.length - 1).match(/^[aeiouáéíóú]/)) {
        this.list[wordNum] = [thisWord, thisWord + "s"];
      } else {
        //Quitar posibles tildes de últimas dos letras -- no van al convertir al plural
        var thisWordP =
          thisWord.substring(0, thisWord.length - 2) +
          thisWord
            .substring(thisWord.length - 2)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (thisWord.substring(thisWord.length - 1).match(/^[z]/)) {
          this.list[wordNum] = [
            thisWord,
            thisWordP.substring(0, thisWordP.length - 1) + "ces",
          ];
        } else {
          this.list[wordNum] = [thisWord, thisWordP + "es"];
        }
      }
      if (type == "noun") {
        this.list[wordNum][2] = genero;
      }
    }

    return this;
  }
  /**
   *  Get a random word from the pool.
   *  Note that passing alreadyChosen{} actually weakens the overall strength of the passphrase slightly
   *  @param {boolean} [isPlural] - true if the plural form of the word is being requested
   *  @param {object} [alreadyChosen] - if a hash of words that are already chosen is provided, this will avoid returning one already chosen
   *  @return {object} an RPWord() object with the chosen word
   */
  getRandomWord(isPlural, alreadyChosen) {
    var word = null,
      attempts = 100,
      x = null,
      gender = null;
    do {
      x = ReadablePassphrase.randomInt(this.length);
      word = this.list[x][isPlural ? 1 : 0];
      gender = this.list[x][2];
      if (attempts-- < 1)
        throw (
          "Exceeded max attempts in RPWordListPlural.getRandomWord() for type " +
          this.type
        );
    } while (!word || (alreadyChosen && alreadyChosen[word]));

    return new RPWord(
      [this.type, isPlural ? "plural" : "singular", gender],
      word
    );
  }
}

/**
 *  Objeto que representa los adjetivos, que vienen en versión masculina y femenina y son convertidos a plural
 *  @param {string} type  - el tipo de palabras en la lista
 *  @param {object[]} wordArray - un array de pares de adjetivos, masculino y femenino
 */

class RPWordListAdjetivo extends RPWordList {
  constructor(type, adjectiveArray) {
    super(type, adjectiveArray);
    var adjetivoPlural = "";
    for (var wordNum = 0; wordNum < this.list.length; wordNum++) {
      var thisWord = this.list[wordNum];
      // Empezamos a construir el array: 0 = masculino singular, 1 = femenino singular, 2 = masculino plural, 3 = femenino plural
      this.list[wordNum] = [thisWord[0], thisWord[1]];
      // Ahora agregamos las formas plurales al array
      var i = 1;
      thisWord.forEach(function (adjetivo) {
        i++;
        if (adjetivo.substring(adjetivo.length - 1).match(/^[aeiou]/)) {
          adjetivoPlural = adjetivo + "s";
        } else if (adjetivo.substring(adjetivo.length - 1).match(/^[z]/)) {
          adjetivoPlural = adjetivo.substring(0, adjetivo.length - 1) + "ces";
        } else {
          adjetivoPlural = adjetivo + "es";
        }
        this.list[wordNum][i] = adjetivoPlural;
      }, this);
    }
    return this;
  }
  /**
   *  Get a random word from the pool.
   *  Note that passing alreadyChosen{} actually weakens the overall strength of the passphrase slightly
   *  @param {boolean} [isPlural] - true if the plural form of the word is being requested
   *  @return {object} an RPWord() object with the chosen word
   */
  getRandomWord(palabra, alreadyChosen) {
    var isPlural = !palabra.types.singular;
    var esFemenino = palabra.types.F ? true : false;
    var word = null,
      attempts = 100,
      x = null,
      y = (isPlural ? 2 : 0) + (esFemenino ? 1 : 0); // 0, 1, 2, 3 según plural o femenino

    do {
      x = ReadablePassphrase.randomInt(this.length);
      word = this.list[x][y];

      if (attempts-- < 1)
        throw (
          "Exceeded max attempts in RPWordListPlural.getRandomWord() for type " +
          this.type
        );
    } while (!word || (alreadyChosen && alreadyChosen[word]));

    return new RPWord(
      [this.type, isPlural ? "plural" : "singular", esFemenino ? "F" : "M"],
      word
    );
  }
}

/**
 *  This object represents a pool of verbs, with each verb having multiple possible tenses
 *  @param {string} transitiveType  - en español por el momento siempre "intransitive"
 *  @param {object[]} verbArray - an array of a verbs, each represented as a 14-element array of tenses (see RPWordListVerb.tenses for order)
 */
class RPWordListVerb {
  constructor(transitiveType, verbArray) {
    this.list = [];

    if (typeof RPWordListVerb.tenses[0] == "string") {
      // compile the tenses
      for (var specNum = 0; specNum < RPWordListVerb.tenses.length; specNum++) {
        var thisSpec = RPWordListVerb.tenses[specNum];
        var specObj = {
          fullTense: thisSpec,
          tense: null,
          continuous: false,
          plural: false,
        };
        var tenseMatch = thisSpec.match(
          /^(preteritoImperfecto|preteritoPerfectoSimple|presente|futuro|subjunctive)/
          //    /^(preterito|presente|futuro)/
        );
        if (tenseMatch) specObj.tense = tenseMatch[0];
        if (thisSpec.match(/Gerundio/)) specObj.continuous = true;
        // if (thisSpec.match(/Gerundio/)) specObj.continuous = true;
        if (thisSpec.match(/Plural/)) specObj.plural = true;
        RPWordListVerb.tenses[specNum] = specObj;
      }
    }

    // Todo este asunto de unpacking, como estaba en el original, no funciona en español, tenemos que guardar los verbos ya conjugados
    // de gerundios: estaba &1, estaban &1, y otros
    for (var verbNum = 0; verbNum < verbArray.length; verbNum++) {
      var thisVerb = verbArray[verbNum];
      if (typeof thisVerb == "string") thisVerb = [thisVerb];
      // var baseWord = thisVerb[0],
      //     baseWordTrim = thisVerb[0].replace(/e$/, "");
      for (var specNum = 0; specNum < RPWordListVerb.tenses.length; specNum++) {
        var thisSpec = RPWordListVerb.tenses[specNum];
        var thisWord = thisVerb[specNum];
        var types = [
          "verb",
          thisSpec.fullTense,
          thisSpec.tense,
          thisSpec.plural ? "plural" : "singular",
          transitiveType,
        ];
        if (thisSpec.continuous) types.push("gerundio");
        this.list.push(new RPWord(types, thisWord));
      }
    }
    this.length = this.list.length;
    return this;
  }
  /**
   *  Get a random word from the pool.
   *  Note that passing alreadyChosen{} actually weakens the overall strength of the passphrase slightly
   *  @param {string} [tense] - name of the tense being requested, eg. 'pastContinuousPlural'
   *  @param {boolean} [isPlural] - true if the plural form of the word is being requested
   *  @param {object} [alreadyChosen] - if a hash of words that are already chosen is provided, this will avoid returning one already chosen
   *  @return {object} an RPWord() object with the chosen word
   */
  getRandomWord(tense, isPlural, alreadyChosen) {
    var types = [];

    if (typeof isPlural == "boolean" && tense && tense != "gerundio") {
      types.push(isPlural ? "plural" : "singular");
      types.push(tense);
    }

    //if (tense && tense == "continuousPast") types.push("continuous", "past");
    else if (tense) types.push(tense);

    var options = [];
    for (var wordNum = 0; wordNum < this.list.length; wordNum++) {
      var thisWord = this.list[wordNum];
      if (
        (!alreadyChosen || !alreadyChosen[thisWord.value]) &&
        thisWord.hasTypes(types)
      )
        options.push(thisWord);
    }
    if (!options.length) throw "No verbs match criteria!";
    return options[ReadablePassphrase.randomInt(options.length)];
  }
  //     /**
  //      *  Returns 'transitive' or 'intransitive', biased toward whichever pool is bigger.  Eg, 5 transitive + 1 intransitive returns 'transitive' 5:1
  //      *  Actualmente en español no hay listas separadas de verbos, todos son "intransitive"
  //      *  @return {string} 'transitive' or 'intransitive'
  //      */
  // static getRandomTransitivity() {
  //     return RPRandomFactors.computeFactor([
  //             RPWordList.verbs.length,
  //             RPWordList.verbs.length,
  //         ]) ?
  //         "transitive" //"intransitive";
  //         :
  //         "transitive";
  // }
}

/**
 *  Static array representing the tenses of each element in a verb passed to RPWordListVerb
 */

RPWordListVerb.tenses = [
  "infinitivo",
  "presenteGerundio",
  "futuroSingular",
  "futuroPlural",
  "presenteSingular",
  "presentePlural",
  "preteritoImperfectoSingular",
  "preteritoImperfectoPlural",
  "preteritoPerfectoSimpleSingular",
  "preteritoPerfectoSimplePlural",
];

/**
 *  This object represents a pool of random articulos.  Currently there is only 1 article in the list "a", "an" or "the"
 *  @param {object[]} articleArray - an array of article objects {definite: ..., indefinite: ..., indefiniteBeforeVowel: ...}
 */
class RPWordListArticle {
  constructor(articleArray) {
    this.list = articleArray;
    this.length = articleArray.length;
  }
  /**
   *  Get a random definite article from the pool.  Currently always returns 'the'
   *  @return {object} an RPWord() object with the chosen word
   */
  getRandomDefiniteArticle(isPlural, esFemenino) {
    return this.getRandomWord(true, isPlural, esFemenino);
  }
  /**
   *  Get a random indefinite article from the pool.  Currently always returns 'a/an'
   *  @return {object} an RPWord() object with the chosen word
   */
  getRandomIndefiniteArticle(isPlural, esFemenino) {
    return this.getRandomWord(false, isPlural, esFemenino);
  }
  /**
   *  Obtiene un artículo de la lista, según sus características
   *  @param {boolean} definido - si es cierto, devuelve un artículo definido, si no uno indefinido
   *  @param {boolean} isPlural - si es cierto, devuelve un artículo plural, si no, singular
   *  @param {boolean} esFemenino - si es cierto, devuelve un artículo femenino, si no, masculino
   *  @return {object} an RPWord() object with the chosen word
   */
  getRandomWord(definido, isPlural, esFemenino) {
    var word = this.list[ReadablePassphrase.randomInt(this.list.length)];

    var returnWord = new RPWord(
      ["articulo", definido ? "definido" : "indefinido"],
      definido
        ? isPlural
          ? esFemenino
            ? word.definido.plural.F
            : word.definido.plural.M
          : esFemenino
          ? word.definido.singular.F
          : word.definido.singular.M // indefinido
        : isPlural
        ? esFemenino
          ? word.indefinido.plural.F
          : word.indefinido.plural.M
        : esFemenino
        ? word.indefinido.singular.F
        : word.indefinido.singular.M
    );
    return returnWord;
  }
}

/**
 *  This object represents a pool of random numbers.
 *  @param {number} start - an integer representing where the lowest number to return
 *  @param {number} end - an integer representing the highest number to return
 */
class RPWordListNumber {
  constructor(start, end) {
    this.start = start;
    this.end = end;
    this.length = 1 + end - start;
  }
  /**
   *  Get a random singular number (always returns '1')
   *  @return {object} an RPWord() object with the chosen word
   */
  getSingularNumberWord() {
    return new RPWord(["number", "requiresSingularNoun"], "1");
  }
  /**
   *  Get a random plural number (between 2 and 'end', inclusive)
   *  @return {object} an RPWord() object with the chosen word
   */
  getPluralNumberWord() {
    var start = this.start;
    if (start < 2) start = 2;
    var thisNumber =
      ReadablePassphrase.randomInt(this.end - this.start) + this.start;
    return new RPWord(["number"], thisNumber.toString());
  }
}

/**
 *  This object represents a pool of indefinite pronouns.  There is currently 1 personal pronoun, and 1 impersonal
 *  @param {object[]} indefinitePronounArray - an array of indefinitePronoun objects {personal: [bool], singular: ..., plural: ...}
 */
class RPWordListIndefinitePronoun {
  constructor(indefinitePronounArray) {
    this.list = indefinitePronounArray;
    this.length = indefinitePronounArray.length;
    this.personal = [];
    this.impersonal = [];
    for (
      var pronounNum = 0;
      pronounNum < indefinitePronounArray.length;
      pronounNum++
    ) {
      var thisPronoun = indefinitePronounArray[pronounNum];
      if (thisPronoun.personal) this.personal.push(thisPronoun);
      else this.impersonal.push(thisPronoun);
    }
  }
  /**
   *  Get a random word from the pool.
   *  @param {string} [personal] - true if a personal pronoun is being requested
   *  @param {boolean} [plural] - true if the plural form of the word is being requested
   *  @return {object} an RPWord() object with the chosen word
   */
  getRandomWord(personal, plural) {
    var searchList = this.list;
    if (personal) searchList = this.personal;
    else if (typeof personal != "undefined") searchList = this.impersonal;

    var word = searchList[ReadablePassphrase.randomInt(searchList.length)];
    var returnWord = new RPWord(
      [
        "indefinitePronoun",
        "pronoun",
        "indefinido",
        plural ? "plural" : "singular",
      ],
      word[plural ? "plural" : "singular"],
      word
    );
    return returnWord;
  }
}

/**
 *  This object represents a set of random factors
 *  A factor is a name, followed by a specification.  If a spec is a boolean, string or number, then it will be returned as-is.
 *  If a spec is a 2-element array, then it will become a boolean with probability true A out of (A+B) times, eg [ 1, 4 ] is true 20% of the time.
 *  If a spec is an object, it will become a string with probability according to all values in the object, eg { a: 1, b: 2, c: 1, d: 0 } returns 'b' 50% of the time.
 *  @param {object} spec - an object describing the specification and weights of various factors
 */
class RPRandomFactors {
  constructor(spec) {
    for (var prop in spec) this[prop] = spec[prop];
  }
  /**
   *  Get the value of a factor according to the weights assigned to it.
   *  @param {string} factorName - name of the factor being requested
   *  @return {string|boolean} returns the string (out of a set of choices) or boolean (out of a 2-element array) randomly chosen for this factor
   */
  byName(factorName) {
    return RPRandomFactors.computeFactor(this[factorName]);
  }
  /**
   *  Returns true if the given factor must always be true
   *  @param {string} factorName - name of the factor
   *  @return {boolean} true if the factor must always be true, false if there is any chance it might be false
   */
  mustBeTrue(factorName) {
    return this.chanceOf(factorName, true) == 1 ? true : false;
  }
  /* Function unused ----
                                      RPRandomFactors.prototype.mustBeFalse = function ( factorName ) { return this.chanceOf(factorName,false) == 1 ? true : false; }
                                      */
  /**
   *  Returns the odds that a given factor will have the given value
   *  @param {string} factorName - name of the factor
   *  @param {*} value - possible value of the factor, or boolean to find out if the factor could be true/false at all
   *  @return {number} floating-point probability between 0 and 1, eg 0.25
   */
  chanceOf(factorName, value) {
    switch (typeof this[factorName]) {
      case "boolean":
        value = value ? true : false;
        return this[factorName] == value ? 1 : 0;
      case "string":
      case "number":
        if (typeof value == "boolean") {
          if (value) return this[factorName] ? 1 : 0;
          else return this[factorName] ? 0 : 1;
        }
        return this[factorName] == value ? 1 : 0;
      case "object":
        if (this[factorName].length === undefined) {
          var total = 0,
            thisWeight = this[factorName][value];
          for (var weightFactor in this[factorName]) {
            total += this[factorName][weightFactor];
          }
          if (!total) return 0;
          if (typeof value == "boolean") {
            if (value) return total ? 1 : 0;
            else return total ? 0 : 1;
          }
          return thisWeight / total;
        } else if (this[factorName].length == 2) {
          var total = this[factorName][0] + this[factorName][1];
          return value
            ? this[factorName][0] / total
            : this[factorName][1] / total;
        }
      default:
        throw (
          "Cannot compute chance of unknown object type: " +
          typeof this[factorName] +
          " factor: " +
          factorName
        );
    }
  }
  /**
   *  Returns the number of bits of entropy in a factor.  Eg a straight [ 1, 1 ] is a 50% chance = 1 bit
   *  @param {string} factorName - name of the factor
   *  @return {number} floating-point number of bits
   */
  entropyOf(factorName) {
    // return number of bits of entropy in a factor
    switch (typeof this[factorName]) {
      case "boolean":
      case "string":
      case "number":
        return 0;
      case "object":
        if (this[factorName].length === undefined) {
          var total = 0,
            totalEntropy = 0;
          for (var weightFactor in this[factorName])
            total += this[factorName][weightFactor];
          for (var weightFactor in this[factorName]) {
            var thisChance = this[factorName][weightFactor] / total;
            if (thisChance)
              totalEntropy += Math.abs(thisChance * Math.log2(thisChance));
          }
          return totalEntropy;
        } else if (this[factorName].length == 2) {
          var a = this[factorName][0],
            b = this[factorName][1],
            total = this[factorName][0] + this[factorName][1];
          // Check if it's actually a boolean, i.e. [0,1] or [1,0]

          if (a == 0 || b == 0) {
            return 0;
          }
          return (
            (a / total) * Math.log2(a / total) +
            (b / total) * Math.log2(b / total)
          );
        }
      default:
        throw (
          "Cannot compute chance of unknown object type: " +
          typeof this[factorName] +
          " factor: " +
          factorName
        );
    }
  }
  /**
   *  Static function that computes a random value for a specification, see RPRandomFactors() for possible specs
   *  @param {*} factor - specification
   *  @return {*} value of the factor, randomly-chosen if possible
   */
  static computeFactor(factor) {
    switch (typeof factor) {
      case "boolean":
      case "string":
      case "number":
        return factor;
      case "object":
        if (factor.length === undefined) {
          var weights = [],
            totalWeight = 0;
          for (var weightFactor in factor) {
            totalWeight += factor[weightFactor];
            weights.push({ value: weightFactor, weight: totalWeight });
          }
          if (totalWeight == 0) return false;

          var chosenWeight = ReadablePassphrase.randomness(totalWeight);
          for (
            var checkWeight = 0;
            checkWeight < weights.length;
            checkWeight++
          ) {
            if (chosenWeight < weights[checkWeight].weight) {
              return weights[checkWeight].value;
              break;
            }
          }

          return false;
        } else if (factor.length == 2) {
          // console.log("factor.length = 2")
          // console.log(factor)
          var chosenWeight = ReadablePassphrase.randomness(
            factor[0] + factor[1]
          );
          // console.log(`chosenWeight`)
          // console.log(chosenWeight)
          return chosenWeight > factor[0] ? false : true;
        } else throw "Unknown object type in computation";
        break;
      default:
        break;
    }
    return null;
  }
}

/**
 *  This object represents a pattern for constructing a sentence.  See the README for constructing new sentence templates.
 *  @param {object[]} template - an array of clause objects
 */
class RPSentenceTemplate {
  constructor(template) {
    this.length = template.length;
    for (var i = 0; i < template.length; i++) {
      var el = template[i];
      if (typeof el == "string") this[i] = { type: el };
      else if (typeof el == "object" && el.length) {
        // reassemble packed templates
        switch (el[0]) {
          case "noun":
            this[i] = {
              type: "noun",
              //subtype: { common: el[1], proper: el[2], nounFromAdjective: el[3] },
              subtype: { common: el[1], proper: el[2] },
              articulo: {
                none: el[3],
                definido: el[4],
                indefinido: el[5],
              },
              adjective: el[6],
              adjectiveDespues: el[7],
              preposition: el[8],
              singular: el[9],
            };
            break;
          case "verb":
            this[i] = {
              type: "verb",
              subtype: {
                gerundio: el[1],
                futuro: el[2],
                presente: el[3],
                preteritoImperfecto: el[4],
                preteritoPerfectoSimple: el[5],
              },
              adverb: el[6],
              interrogative: el[7],
            };

            break;
          default:
            throw (
              "Error unpacking template spec array, unknown type: " +
              thisElement[0]
            );
        }
      } else this[i] = el;
      if (
        this[i].type == "noun" &&
        this[i].articulo &&
        !this[i].articuloSingular
      ) {
        // unpack article weights into Singular and Plural for convenience later
        var s = {},
          p = {};
        for (var articleType in this[i].articulo)
          p[articleType] = s[articleType] = this[i].articulo[articleType];
        //delete s["none"];
        //delete p["indefinido"]; // en español no hay esta limitación
        delete this[i]["articulo"]; // singular nouns must have an article, plural can't have indefinite
        this[i].articuloSingular = s;
        this[i].articuloPlural = p;
      }
    }
    return this;
  }
  /**
   *  Returns the number of bits of entropy in the template
   *  TODO adaptar esto al patrón de plantillas en español
   *  @return {number} floating-point number of bits
   */
  entropy() {
    var totalEntropy = 0,
      currentMultiplier = 1;

    function len2log(listName) {
      return Math.log2(RPWordList[listName].length);
    } // helper function

    for (var templateNum = 0; templateNum < this.length; templateNum++)
      switch (this[templateNum].type) {
        case "comma":
          break;
        case "conjunction":
          totalEntropy += len2log("conjunctions") * currentMultiplier;
          break;
        case "directSpeech":
          totalEntropy += len2log("speechVerbs") * currentMultiplier;
          break;
        case "noun":
          var factors = new RPRandomFactors(this[templateNum]),
            thisEntropy = 0;
          thisEntropy += factors.entropyOf("subtype");
          thisEntropy +=
            factors.chanceOf("subtype", "proper") * len2log("properNouns");

          var preludeEntropy =
            factors.entropyOf("preposition") +
            factors.entropyOf("singular") +
            factors.chanceOf("preposition", true) * len2log("prepositions") +
            // +
            factors.chanceOf("singular", true) *
              (factors.entropyOf("articuloSingular") +
                factors.chanceOf("articuloSingular", "definido") *
                  len2log("articulos") +
                factors.chanceOf("articuloSingular", "indefinido") *
                  len2log("articulos")) +
            factors.chanceOf("singular", false) *
              (factors.entropyOf("articuloPlural") +
                factors.chanceOf("articuloPlural", "definido") *
                  len2log("articulos") +
                factors.chanceOf("articuloPlural", "indefinido") *
                  len2log("articulos"));

          //   console.log(`factors.entropyOf("singular")`);
          //   console.log(factors.entropyOf("singular"));

          thisEntropy +=
            factors.chanceOf("subtype", "common") *
            (len2log("nouns") +
              factors.entropyOf("adjective") +
              preludeEntropy +
              factors.chanceOf("adjective", true) * len2log("adjectives"));

          // +
          // factors.chanceOf("singular", false) *
          // factors.chanceOf("number", true) *
          // len2log("numbers"));

          // thisEntropy +=
          //     factors.chanceOf("subtype", "nounFromAdjective") *
          //     (len2log("indefinitePronouns") +
          //         preludeEntropy +
          //         len2log("adjectives"));
          totalEntropy += thisEntropy * currentMultiplier;
          break;
        case "verb":
          var factors = new RPRandomFactors(this[templateNum]),
            verbLen = RPWordList.verbs.length * 0.9; // No usamos los infinitivos
          //tranLen = RPWordList.verbs.length;
          //var totalLen = intLen + tranLen;
          //var chanceOfIntransitive = intLen / totalLen;
          // console.log("verbLen")
          // console.log(verbLen)
          var thisEntropy =
            //factors.entropyOf("interrogative") +
            factors.entropyOf("adverb") +
            // factors.entropyOf("adverb") +
            //(
            // chanceOfIntransitive * Math.log2(chanceOfIntransitive) +
            //    (tranLen / totalLen) * Math.log2(tranLen / totalLen)) +
            // factors.chanceOf("interrogative", true) * len2log("interrogatives") +
            //factors.chanceOf("adverb", true) * (len2log("adverbs") + 1) +
            //factors.entropyOf("verb") +
            Math.log2(verbLen) +
            factors.chanceOf("adverb", true) * len2log("adverbs");
          // +
          //chanceOfIntransitive *
          //factors.chanceOf("intransitive", "preposition") *
          // factors.chanceOf("preposition", true) *
          // len2log("prepositions");

          totalEntropy += thisEntropy * currentMultiplier;
          // currentMultiplier *=
          //     1 -
          //     chanceOfIntransitive *
          //     factors.chanceOf("intransitive", "noNounClause");
          break;
        default:
          throw "Unknown clause type in entropy";
      }
    return totalEntropy;
  }
  /**
   *  Static function to return the number of bits of entropy in the given template
   *  @param {string} templateName - name of the template
   *  @return {number} floating-point number of bits
   */
  static entropyOf(templateName) {
    var template = RPSentenceTemplate.templates[templateName];

    if (typeof template[0] == "string") {
      // it's a collection of templates, not a template itself
      var entropy = 0;
      template.forEach(function (templateName) {
        entropy += RPSentenceTemplate.entropyOf(templateName);
      });
      return entropy / template.length + Math.log2(template.length); // gain some entropy for choosing a random template
    }

    return template.entropy();
  }
  /**
   *  Static function to return a template of the given name
   *  (if the template is a collection of other templates, returns a random template from the collection)
   *  @param {string} templateName - name of the template
   *  @return {object} RPSentenceTemplate() object
   */
  static byName(templateName) {
    var template = RPSentenceTemplate.templates[templateName];

    if (typeof template[0] == "string") {
      // it's a collection of templates, not a template itself
      templateName = template[ReadablePassphrase.randomInt(template.length)];
      template = RPSentenceTemplate.templates[templateName];
    }

    template.name = templateName;
    return template;
  }
}

/*
 *   ******************* DATA *******************
 *   RPSentence.templates = A set of sentence templates, used to construct predefined sentences
 *   RPWordList.{wordtype} = A static global object that wraps a list of parts of some kind
 */
