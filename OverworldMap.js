class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;


    //Devolver a los npcs sus loops de animaciones
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene(){
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if(!this.isCutscenePlaying && match && match.talking.length){
      this.startCutscene(match.talking[0].events)
    }
  }

  checkForFootstepCutscene(){
    
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}` ];
    if(!this.isCutscenePlaying && match){
      this.startCutscene( match[0].events);
    }
  }


  //añade un muro
  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }

  //borra un muro
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }

  //mueve un muro
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY); //borra el muro
    const {x,y} = utils.nextPosition(wasX, wasY, direction); //crea uno nuevo en la siguiente posicion a donde lo habiamos borrado
    this.addWall(x,y); //lo coloca
  }

}

window.OverworldMaps = {
  //--------------------------------------------DEMO ROOM---------------------------------------------------- ***DONE***
  DemoRoom: {
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(10),
        src: "/images/characters/people/hero.png",
        useShadow: true
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/pj5.png",
        useShadow: true,
        behaviorLoop: [
          { type: "stand",  direction: "left", time: 800 },
          { type: "stand",  direction: "up", time: 800 },
          { type: "stand",  direction: "right", time: 1200 },
          { type: "stand",  direction: "up", time: 300 },
        ],
        talking: [
          {
            events: [
              {type: "textMessage", text: "Manolo: Hola como va?", faceHero: "npcA"},
              {type: "textMessage", text: "Manolo: No te procupes si me ves aqui todo el dia"},
              {type: "textMessage", text: "Manolo: Me pegan por estar aqui"},
              { who: "npcA", type: "stand",  direction: "down", time: 1200 },
              {type: "textMessage", text: "Manolo: Digo me pagan!", faceHero: "npcA"},
              {type: "textMessage", text: "Manolo: Aunque tambien me pegan..."},
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/pj4.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Vidente: Hola de nuevo. Te acuerdas de mi? Soy la vidente.", faceHero: "npcB"},
              {type: "textMessage", text: "Vidente: Pues claro que te acuerdas. He tenido una vision de que te acordabas.", faceHero: "npcB"},
              {type: "textMessage", text: "Vidente: He de decirte algo importante. VENGO DEL FUTURO.", faceHero: "npcB"},
              {type: "textMessage", text: "Vidente: Seguro que te has encontrado en la calle a una jefa de cocina con mala uva parecida a mi.", faceHero: "npcB"},
              {type: "textMessage", text: "Vidente: Bueno esa soy yo del presente. Por eso soy capaz de leer tu futuro.", faceHero: "npcB"},
              {type: "textMessage", text: "Vidente: Se que es mucho lio. Pero has de saber que tras esta puerta esta la maquina con la que viaje al pasado.", faceHero: "npcB"},
              {type: "textMessage", text: "Vidente: Lo siento pero no puedo dejar que entres, ya que romperias el espacio-tiempo.", faceHero: "npcB"},
              {type: "textMessage", text: "Vidente: Que como la he usado yo entonces??... Buena pregunta.", faceHero: "npcB"},
              {type: "textMessage", text: "Vidente: No hagas tantas preguntas.", faceHero: "npcB"},
            ]
          }
        ]
      }),
      npcC: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(5),
        src: "/images/characters/people/pj1.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Karma: Hola que tal, me llamo Karma.", faceHero: "npcC"},
              {type: "textMessage", text: "Karma: Toma hostia!!", faceHero: "npcB"},
              { who: "hero", type: "stand",  direction: "up", time: 80 },
              { who: "hero", type: "stand",  direction: "down", time: 80 },
              { who: "hero", type: "stand",  direction: "left", time: 80 },
              { who: "hero", type: "stand",  direction: "down", time: 80 },
              { who: "hero", type: "stand",  direction: "up", time: 80 },
              { who: "hero", type: "stand",  direction: "right", time: 80 },
              { who: "hero", type: "stand",  direction: "left", time: 700 },
              {type: "textMessage", text: "Karma: ....Sabes porque te la he dado :)", faceHero: "npcC"},
            ]
          }
        ]
      }),
      libreria1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(3),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Una libreria con un monton de NADA."},
              {type: "textMessage", text: "JUAS JUAS JUAS....."},
              { who: "libreria1", type: "stand",  direction: "down", time: 900 },
              {type: "textMessage", text: "me estoy volviendo loco."},
            ]
          }
        ]
      }),
      libreria2: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(3),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Una libreria con un monton de NADA."},
              {type: "textMessage", text: "JUAS JUAS JUAS....."},
              { who: "libreria2", type: "stand",  direction: "down", time: 900 },
              {type: "textMessage", text: "me estoy volviendo loco."},
            ]
          }
        ]
      }),
    },
    walls: {
      //mesa
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,

      //Paredes
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(6,4)] : true,
      [utils.asGridCoord(6,2)] : true,
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(7,1)] : true,
      [utils.asGridCoord(8,2)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,
      [utils.asGridCoord(11,4)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,4)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 100 },
            { type: "textMessage", text:"No puedes entrar ahi tio!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "stand",  direction: "left", time: 100 },
            { type: "textMessage", text:"Vamos sal"},
            { who: "hero", type: "stand",  direction: "down", time: 1200 },
            { type: "textMessage", text:"Vamos vamos vamos!"},
            { who: "hero", type: "walk",  direction: "up" },
            { who: "npcB", type: "stand",  direction: "left", time: 50 },
            { type: "textMessage", text:"Me cago en todo!!"},
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "up" },
            { who: "npcB", type: "stand",  direction: "up", time: 100 },
            { type: "textMessage", text:"SAL AHORA!!"},
            { who: "npcB", type: "walk",  direction: "down" },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "stand",  direction: "left", time: 10 },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
            
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            {type: "changeMap", map: "Street" }
          ]
        }
      ]
    }
  },
  //--------------------------------------------COCINA------------------------------------------------------- ***DONE***
  Kitchen: {
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(10),
        src: "/images/characters/people/hero.png",
        useShadow: true,
      }),
      npcA: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/pj3.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Empleado: HOLA", faceHero: "npcA"},
              {type: "textMessage", text: "Empleado: Me estoy encargando de empaquetar el ultimo pedido para mandarselo al cliente.", faceHero: "npcA"},
              {type: "textMessage", text: "Empleado: No toques nada por favor", faceHero: "npcA"},
            ]
          }
        ]
      }),
      Empleado1: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(5),
        src: "/images/characters/people/pj7.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Cocinero Novato: Esperar un segundo que me pierdo. Esto es muy dificil."},
            ]
          }
        ]
      }),
      Empleado2: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        src: "/images/characters/people/pj8.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Cocinero Abuson: Voy a hacerlo perfecto. Voy a conseguir el empleado del mes. VAMOS."},
            ]
          }
        ]
      }),
      Jefa: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(6),
        src: "/images/characters/people/pj4.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Jefa Restaurante: Esto se hace asi chicos. Venga va con mas animo."},
            ]
          }
        ]
      }),
    },
    walls: {
      //mesas
      [utils.asGridCoord(6,7)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(9,7)] : true,
      [utils.asGridCoord(10,7)] : true,
      [utils.asGridCoord(9,9)] : true,
      [utils.asGridCoord(10,9)] : true,
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(1,6)] : true,
      [utils.asGridCoord(1,7)] : true,


      //Paredes
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,
      [utils.asGridCoord(11,4)] : true,
      [utils.asGridCoord(12,4)] : true,
      [utils.asGridCoord(13,5)] : true,
      [utils.asGridCoord(13,6)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(13,8)] : true,
      [utils.asGridCoord(13,9)] : true,
      [utils.asGridCoord(12,10)] : true,
      [utils.asGridCoord(11,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,4)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            {type: "changeMap", map: "Street" }
          ]
        }
      ],
      [utils.asGridCoord(5,9)]: [
        {
          events: [
            { who: "Empleado1", type: "stand",  direction: "left", time: 1 },
            { who: "Empleado2", type: "stand",  direction: "left", time: 1 },
            { who: "Jefa", type: "stand",  direction: "left", time: 1 },
          ]
        }
      ]
    }
  },
  //--------------------------------------------COCINA VERDE------------------------------------------------- ***DONE***
  GreenKitchen: {
    lowerSrc: "/images/maps/GreenKitchenLower.png",
    upperSrc: "/images/maps/GreenKitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        src: "/images/characters/people/hero.png",
        useShadow: true
      }),
      npcA: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(9),
        src: "/images/characters/people/pj1.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Hombre indignado: Llevo una hora esperando a que alguien me traiga la comida!!", faceHero: "npcA"},
              {type: "textMessage", text: "Hombre indignado: Cuanto rato tengo que seguir esperando?", faceHero: "npcA"},
              {type: "textMessage", text: "Hombre indignado: Desde luego esto es indignante...", faceHero: "npcA"},
              {type: "textMessage", text: "Hombre indignado: Espera un momento.", faceHero: "npcA"},
              {type: "textMessage", text: "Hombre indignado: La verdad es que no he pedido nada.", faceHero: "npcA"},

            ]
          }
        ]
      }),
      nevera: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(3),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Al abrir la nevera te das cuenta de que esta vacia.", faceHero: "npcA"},
              {type: "textMessage", text: "Una verdadera lastima porque tenias mucha hambre", faceHero: "npcA"},
              { who: "hero", type: "stand",  direction: "up", time: 500 },
              {type: "textMessage", text: "Espera un segundo. Esta no es tu nevera!", faceHero: "npcA"},
              {type: "textMessage", text: "Que haces robando comida ajena! No te dijeron en casa que robar esta mal?!", faceHero: "npcA"},
            ]
          }
        ]
      }),
      placa1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(3),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Una placa de vitroceramica, pero no tienes ninguna sarten....", faceHero: "npcA"},
              { who: "hero", type: "stand",  direction: "up", time: 500 },
              {type: "textMessage", text: "Ademas esta sigue sin ser tu casa. Quieres largarte de una vez!!", faceHero: "npcA"},
            ]
          }
        ]
      }),
      placa2: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(3),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Una placa de vitroceramica, pero no tienes ninguna sarten....", faceHero: "npcA"},
              { who: "hero", type: "stand",  direction: "up", time: 500 },
              {type: "textMessage", text: "Ademas esta sigue sin ser tu casa. Quieres largarte de una vez!!", faceHero: "npcA"},
            ]
          }
        ]
      }),
      estanteria1: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(3),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Es una estanteria con lo que parece ser....", faceHero: "npcA"},
              {type: "textMessage", text: "Sinceramente, no se que es eso. Parecen botes de cristal.", faceHero: "npcA"},
              { who: "hero", type: "stand",  direction: "down", time: 500 },
              {type: "textMessage", text: "Pero tu que te piensas, que se lo que es cada cosa en este nivel?", faceHero: "npcA"},
              {type: "textMessage", text: "Aunque sea el creador del juego, yo no he dibujado los mapas, asi que preguntale a otro.", faceHero: "npcA"},
              {type: "textMessage", text: "Ademas, se ve muy mal desde aqui arriba.", faceHero: "npcA"},
            ]
          }
        ]
      }),
      estanteria2: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(3),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Que pesao, sigo sin saber lo que hay en la estanteria, da igual desde donde lo mires.", faceHero: "npcA"},
            ]
          }
        ]
      }),
      pizza: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(10),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Hay una pizza en la mesa, no sabes de quien es.", faceHero: "npcA"},
              {type: "textMessage", text: "Quiza lo mejor seria no tocar nada...", faceHero: "npcA"},
            ]
          }
        ]
      }),
      pared: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(12),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Estas enfermo.", faceHero: "npcA"},
              {type: "textMessage", text: "Quien en su sano juicio iria interactuando con todas las paredes de la sala?", faceHero: "npcA"},
              {type: "textMessage", text: "Vaya perdida de tiempo.", faceHero: "npcA"},
            ]
          }
        ]
      }),
      botellas1: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(6),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Un par de botellas de CocaCola(MARCA REGISTRADA) sobre la mesa.", faceHero: "npcA"},
              {type: "textMessage", text: "No te apetece tomarte una??", faceHero: "npcA"},
              {type: "textMessage", text: "La CocaCola(MARCA REGISTRADA) tiene propiedades beneficiosas para el metabolismo.", faceHero: "npcA"},
              {type: "textMessage", text: "Ademas, su gran sabor llena el paladar de una sensacion refrescante. Y con un sabor inigualable!!", faceHero: "npcA"},
              {type: "textMessage", text: "Sin lugar a dudas la mejor bebida para las mejores ocasiones.", faceHero: "npcA"},
              {type: "textMessage", text: "Ya sabes, si quieres calidad, quieres CocaCola(MARCA REGISTRADA)", faceHero: "npcA"},
            ]
          }
        ]
      }),
      botellas2: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(6),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Un par de botellas de Pepsi", faceHero: "npcA"},
              {type: "textMessage", text: "No se porque querrias tomarte algo asi la verdad.", faceHero: "npcA"},
              {type: "textMessage", text: "Numerosos estudios han demostrada lo insalubre que es Pepsi.", faceHero: "npcA"},
              {type: "textMessage", text: "El coste a tu salud que puede suponer UNA sola botella de Pepsi es alarmante.", faceHero: "npcA"},
              {type: "textMessage", text: "Ademas, el sabor de la bebida es rancio, y deja un gusto desagradable al terminarla.", faceHero: "npcA"},
              {type: "textMessage", text: "Cualquier persona con dos dedos de frente escogeria antes la maravillosa COCACOLA(MARCA REGISTRADA)", faceHero: "npcA"},
              {type: "textMessage", text: "Eres una persona con dos dedos de frente? O disfrutas de hacerte sufrir a ti mismo y a tus familiares?", faceHero: "npcA"},
              {type: "textMessage", text: "La respuesta depende de ti......", faceHero: "npcA"},
            ]
          }
        ]
      }),
      comida1: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(6),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Una tortilla de patata en la mesa, sin plato ni nada, a pelo.", faceHero: "npcA"},
              {type: "textMessage", text: "Da un poco de asco, y parece que lleva un par de dias.", faceHero: "npcA"},
              {type: "textMessage", text: "Yo que tu no me comeria eso.", faceHero: "npcA"},
            ]
          }
        ]
      }),
      comida2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Parece una tortilla como la que hay al lado, pero realmente es un trozo de plastico.", faceHero: "npcA"},
              {type: "textMessage", text: "EN FORMA DE TORTILLA!!", faceHero: "npcA"},
              {type: "textMessage", text: "Que confuso es todo.", faceHero: "npcA"},
            ]
          }
        ]
      }),
    },
    
    walls: {
      //paredes
      [utils.asGridCoord(9,4)] : true,
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(10,5)] : true,
      [utils.asGridCoord(10,6)] : true,
      [utils.asGridCoord(10,7)] : true,
      [utils.asGridCoord(10,8)] : true,
      [utils.asGridCoord(10,9)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(10,11)] : true,
      [utils.asGridCoord(9,12)] : true,
      [utils.asGridCoord(8,12)] : true,
      [utils.asGridCoord(7,12)] : true,
      [utils.asGridCoord(6,12)] : true,
      [utils.asGridCoord(5,13)] : true,
      [utils.asGridCoord(4,12)] : true,
      [utils.asGridCoord(3,12)] : true,
      [utils.asGridCoord(2,12)] : true,
      [utils.asGridCoord(0,11)] : true,
      [utils.asGridCoord(0,10)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      //mesas
      [utils.asGridCoord(1,6)] : true,
      [utils.asGridCoord(2,6)] : true,
      [utils.asGridCoord(3,6)] : true,
      [utils.asGridCoord(4,6)] : true,
      [utils.asGridCoord(5,6)] : true,
      [utils.asGridCoord(6,6)] : true,
      [utils.asGridCoord(3,9)] : true,
      
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,12)]: [
        {
          events: [
            {type: "changeMap", map: "StreetNorth" }
          ]
        }
      ]
    }
  },
  //--------------------------------------------EXTERIOR 1--------------------------------------------------- ***DONE***
  StreetNorth: {
    lowerSrc: "/images/maps/StreetNorthLower.png",
    upperSrc: "/images/maps/StreetNorthUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(7),
        y: utils.withGrid(4),
        src: "/images/characters/people/hero.png",
        useShadow: true
      }),
      npcA: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/pj2.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Que divertido es correr por el parque!", faceHero: "npcA"},
              {type: "textMessage", text: "Quieres jugar conmigo al pilla pilla??", faceHero: "npcA"},
            ]
          }
        ],
        behaviorLoop: [
          { type: "walk",  direction: "left" },
          { type: "walk",  direction: "down" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "down" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "up" },
          { type: "walk",  direction: "up" },
          { type: "walk",  direction: "left" },
          { type: "walk",  direction: "left" },
          { type: "walk",  direction: "left" },
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(12),
        y: utils.withGrid(12),
        src: "/images/characters/people/pj3.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Hola, que tal ciudadano!", faceHero: "npcB"},
              {type: "textMessage", text: "Hoy hace un dia maravilloso. No crees?", faceHero: "npcB"},
              {type: "textMessage", text: "Disfruta de la tarde, pero ten cuidado de no pisar las flores.", faceHero: "npcB"},
              {type: "textMessage", text: "Seria una pena que se estropearan con lo bonitas que estan.", faceHero: "npcB"},
            ]
          }
        ]
      }),
      
    },
    walls: {
      //bloque
      [utils.asGridCoord(7,8)] : true,
      [utils.asGridCoord(8,8)] : true,
      [utils.asGridCoord(7,9)] : true,
      [utils.asGridCoord(8,9)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,

      //paredes
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(6,4)] : true,
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(6,5)] : true,
      [utils.asGridCoord(8,5)] : true,
      [utils.asGridCoord(5,5)] : true,
      [utils.asGridCoord(4,5)] : true,
      [utils.asGridCoord(3,6)] : true,
      [utils.asGridCoord(3,7)] : true,
      [utils.asGridCoord(2,7)] : true,
      [utils.asGridCoord(1,7)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(-1,8)] : true,
      [utils.asGridCoord(-1,9)] : true,
      [utils.asGridCoord(-1,10)] : true,
      [utils.asGridCoord(-1,11)] : true,
      [utils.asGridCoord(-1,12)] : true,
      [utils.asGridCoord(-1,13)] : true,
      [utils.asGridCoord(-1,14)] : true,
      [utils.asGridCoord(-1,15)] : true,
      [utils.asGridCoord(0,16)] : true,
      [utils.asGridCoord(1,16)] : true,
      [utils.asGridCoord(2,16)] : true,
      [utils.asGridCoord(3,16)] : true,
      [utils.asGridCoord(4,16)] : true,
      [utils.asGridCoord(5,16)] : true,
      [utils.asGridCoord(6,16)] : true,
      [utils.asGridCoord(7,17)] : true,
      [utils.asGridCoord(8,16)] : true,
      [utils.asGridCoord(9,16)] : true,
      [utils.asGridCoord(10,16)] : true,
      [utils.asGridCoord(11,16)] : true,
      [utils.asGridCoord(12,16)] : true,
      [utils.asGridCoord(13,16)] : true,
      [utils.asGridCoord(14,16)] : true,
      [utils.asGridCoord(15,16)] : true,
      [utils.asGridCoord(16,15)] : true,
      [utils.asGridCoord(16,14)] : true,
      [utils.asGridCoord(16,13)] : true,
      [utils.asGridCoord(16,12)] : true,
      [utils.asGridCoord(16,11)] : true,
      [utils.asGridCoord(16,10)] : true,
      [utils.asGridCoord(16,9)] : true,
      [utils.asGridCoord(16,8)] : true,
      [utils.asGridCoord(16,7)] : true,
      [utils.asGridCoord(15,6)] : true,
      [utils.asGridCoord(14,6)] : true,
      [utils.asGridCoord(13,6)] : true,
      [utils.asGridCoord(12,6)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(10,5)] : true,
      [utils.asGridCoord(9,5)] : true,
      [utils.asGridCoord(8,5)] : true,

      
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            {type: "changeMap", map: "GreenKitchen" }
          ]
        }
      ],
      [utils.asGridCoord(7,16)]: [
        {
          events: [
            {type: "changeMap", map: "Street" }
          ]
        }
      ],
      [utils.asGridCoord(1,10)]: [
        {
          events: [
            {type: "textMessage", text: "EEEEH!!!", faceHero: "npcB"},
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "walk",  direction: "up" },
            { who: "npcB", type: "walk",  direction: "up" },
            { who: "npcB", type: "stand",  direction: "left", time: 5 },
            { who: "hero", type: "stand",  direction: "right", time: 500 },
            {type: "textMessage", text: "No pises las plantas. Las vas a matar!!", faceHero: "npcB"},
            {type: "textMessage", text: "Por favor bajate de ahi.", faceHero: "npcB"},
            { who: "hero", type: "walk",  direction: "right" },
            {type: "textMessage", text: "No vuelvas a pisarlas te lo ruego. Vete a jugar al parque.", faceHero: "npcB"},
            { who: "npcB", type: "stand",  direction: "right", time: 500 },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "walk",  direction: "down" },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "walk",  direction: "down" },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "npcB", type: "walk",  direction: "right" },
          ]
        }
      ],
      [utils.asGridCoord(14,11)]: [
        {
          events: [
            {type: "textMessage", text: "Baja de ahi chaval!"},
            { who: "npcB", type: "walk",  direction: "up" },
            { who: "npcB", type: "stand",  direction: "right", time: 500 },
            {type: "textMessage", text: "Me estas fastidiando las plantas, asi que baja de ahi YA!"},
            { who: "hero", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "right", time: 500 },
            {type: "textMessage", text: "Asi me gusta.", faceHero: "npcB"},
            { who: "npcB", type: "walk",  direction: "down" },
          ]
        }
      ],
    }
  },
  //--------------------------------------------EXTERIOR 2--------------------------------------------------- ***DONE***
  Street: {
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(25),
        y: utils.withGrid(5),
        src: "/images/characters/people/hero.png",
        useShadow: true
      }),
      npc1: new Person({
        x: utils.withGrid(20),
        y: utils.withGrid(12),
        src: "/images/characters/people/pj1.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Persona Impresionada: Es demasiado rapida. Una cosa muy loca.", faceHero: "npc1"},
              {type: "textMessage", text: "Persona Impresionada: Las leyendas cuentan que es capaz de girar 360 grados en un segundo. UNA VERDADERA LOCURA.", faceHero: "npc1"},
              { who: "npc1", type: "stand",  direction: "up", time: 1 },
            ]
          }
        ]
      }),
      npc2: new Person({
        x: utils.withGrid(20),
        y: utils.withGrid(10),
        src: "/images/characters/people/pj2.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "qUe MaReO", faceHero: "npc2"},
            ]
          }
        ],
        behaviorLoop: [
          { type: "stand",  direction: "up", time: 250 },
          { type: "stand",  direction: "left", time: 250 },
          { type: "stand",  direction: "down", time: 250 },
          { type: "stand",  direction: "right", time: 250 },
        ]
      }),
      npc3: new Person({
        x: utils.withGrid(23),
        y: utils.withGrid(12),
        src: "/images/characters/people/pj3.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Fan Incondicional: Si quieres retar a dar vueltas a LA CAMPEONA MUNDIAL DE DAR VUELTAS.", faceHero: "npc3"},
              {type: "textMessage", text: "Fan Incondicional: Tendras que ponerte a su derecha, a 2 bloques de distancia.", faceHero: "npc3"},
              {type: "textMessage", text: "Fan Incondicional: Aunque yo ni lo intentaria. Nunca nadie ha sido capaz de acercarse a su velocidad.", faceHero: "npc3"},
              { who: "npc3", type: "stand",  direction: "up", time: 1 },
            ]
          }
        ]
      }),
      npc4: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(10),
        src: "/images/characters/people/pj4.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Jefa Restaurante: Hola caballero. No le gustaria probar nuestras delicias en nuestro restaurante?", faceHero: "npc4"},
              {type: "textMessage", text: "Jefa Restaurante: Solo durante esta semana ofrecemos el menu degustacion por la mitad de precio.", faceHero: "npc4"},
              {type: "textMessage", text: "Jefa Restaurante: No pierda esta maravillosa oportunidad.", faceHero: "npc4"},
              { who: "hero", type: "stand",  direction: "down", time: 400 },
              { who: "hero", type: "stand",  direction: "left", time: 400 },
              { who: "hero", type: "stand",  direction: "left", time: 400 },
              { who: "hero", type: "stand",  direction: "left", time: 1 },
              {type: "textMessage", text: "Jefa Restaurante: No? Vaya, una verdadera lastima.", faceHero: "npc4"},
              {type: "textMessage", text: "Jefa Restaurante: Bueno casi mejor asi.", faceHero: "npc4"},
              {type: "textMessage", text: "Jefa Restaurante: Dos de mis cocineros se llevan fatal y se han ido a pelear a la tienda de al lado", faceHero: "npc4"},
              {type: "textMessage", text: "Jefa Restaurante: Si tuviera que atender algun cliente tendria que hacer todo yo sola!", faceHero: "npc4"},
              {type: "textMessage", text: "Jefa Restaurante: Ya veras como les coja a esos dos!!!", faceHero: "npc4"},
              { who: "npc4", type: "stand",  direction: "down", time: 1 },
            ]
          }
        ]
      }),
      npc5: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(12),
        src: "/images/characters/people/pj5.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Profesor Sabio: Estamos hablando de la geopolitica europea actual y la distribucion de bienes y riquezas en la misma...", faceHero: "npc5"},
              { who: "npc5", type: "stand",  direction: "right", time: 1 },
            ]
          }
        ]
      }),
      npc6: new Person({
        x: utils.withGrid(12),
        y: utils.withGrid(12),
        src: "/images/characters/people/pj6.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Alumna Entusiasmada: Estamos teniendo una conversacion de lo mas entretenida. Me esta contando cosas muy interesantes...", faceHero: "npc6"},
              { who: "npc6", type: "stand",  direction: "left", time: 1 },
            ]
          }
        ]
      }),
      npc7: new Person({
        x: utils.withGrid(30),
        y: utils.withGrid(13),
        src: "/images/characters/people/pj7.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Cocinero Novato: Dejame tranquilo pesao, que eres un pesao"},
              {type: "textMessage", text: "Cocinero Novato: Lo unico que haces es meterte conmigo todo el rato con lo mal que lo hago"},
              {type: "textMessage", text: "Cocinero Novato: Me estoy esforzando al maximo y la jefa confia en mi"},
              {type: "textMessage", text: "Cocinero Novato: Ademas te dijo que no te metieras conmigo. Abuson!!"},
            ]
          }
        ]
      }),
      npc8: new Person({
        x: utils.withGrid(31),
        y: utils.withGrid(13),
        src: "/images/characters/people/pj8.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Cocinero Abuson: Eres un patan, no haces mas que fastidiarla todo el rato."},
              {type: "textMessage", text: "Cocinero Abuson: Los demas no podemos trabajar teniendote al lado porque lo estropeas todo"},
              {type: "textMessage", text: "Cocinero Abuson: Este curro no es para ti. Vete a limpiar retretes, que es lo unico que sabes hacer."},
              {type: "textMessage", text: "Cocinero Abuson: No se porque te contrato la jefa, y no entiendo como tiene fe en ti despues de todo lo que has hecho!"},
            ]
          }
        ]
      }),
      vidente: new Person({
        x: utils.withGrid(25),
        y: utils.withGrid(7),
        src: "/images/characters/people/pj4.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Vidente: Mmmmh. Hola chico, soy una vidente. Deja que te lea el futuro.", faceHero: "vidente"},
              {type: "textMessage", text: "Vidente: Oh ya veo... Tu futuro se me aparece a la vista tan cristalino como el agua.", faceHero: "vidente"},
              {type: "textMessage", text: "Vidente: En un futuro proximo el karma te dara una ostia de realidad.", faceHero: "vidente"},
              {type: "textMessage", text: "Vidente: Quiza estes preparado, quiza no. En cualquier caso eso es algo que se me escapa a las visiones.", faceHero: "vidente"},
              {type: "textMessage", text: "Vidente: Te deseo suerte jovenzuelo. Estare en el local del al lado para cualquier cosa.", faceHero: "vidente"},
              { who: "vidente", type: "stand",  direction: "down", time: 100 },
              { who: "vidente", type: "walk",  direction: "down"},
              { who: "vidente", type: "walk",  direction: "right"},
              { who: "vidente", type: "walk",  direction: "right"},
              { who: "vidente", type: "walk",  direction: "down"},
              { who: "vidente", type: "walk",  direction: "down"},
              { who: "vidente", type: "walk",  direction: "right"},
              { who: "vidente", type: "walk",  direction: "right"},
              { who: "vidente", type: "walk",  direction: "up"},
              { who: "vidente", type: "walk",  direction: "up"},
              { who: "vidente", type: "stand",  direction: "down", time: 500 },
            ]
          }
        ]
      }),
      pintura1: new Person({
        x: utils.withGrid(23),
        y: utils.withGrid(7),
        talking: [
          {
            events: [
              {type: "textMessage", text: "Es una imagen de 4 circulos de colores unos al lado de otros."},
              {type: "textMessage", text: "Tampoco hace falta que explique esto no?"},
            ]
          }
        ]
      })
    },
    walls: {
      //mesas
      [utils.asGridCoord(5,14)] : true,
      [utils.asGridCoord(6,14)] : true,
      [utils.asGridCoord(7,14)] : true,
      [utils.asGridCoord(8,14)] : true,
      [utils.asGridCoord(5,7)] : true,
      [utils.asGridCoord(4,8)] : true,
      [utils.asGridCoord(6,8)] : true,
      [utils.asGridCoord(4,9)] : true,
      [utils.asGridCoord(6,9)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(3,11)] : true,
      [utils.asGridCoord(3,12)] : true,
      [utils.asGridCoord(3,13)] : true,
      [utils.asGridCoord(3,14)] : true,
      [utils.asGridCoord(3,15)] : true,
      [utils.asGridCoord(3,16)] : true,
      [utils.asGridCoord(3,17)] : true,
      [utils.asGridCoord(3,18)] : true,
      [utils.asGridCoord(4,19)] : true,
      [utils.asGridCoord(5,19)] : true,
      [utils.asGridCoord(6,19)] : true,
      [utils.asGridCoord(7,19)] : true,
      [utils.asGridCoord(8,19)] : true,
      [utils.asGridCoord(9,19)] : true,
      [utils.asGridCoord(10,19)] : true,
      [utils.asGridCoord(11,19)] : true,
      [utils.asGridCoord(12,19)] : true,
      [utils.asGridCoord(13,19)] : true,
      [utils.asGridCoord(14,19)] : true,
      [utils.asGridCoord(15,19)] : true,
      [utils.asGridCoord(16,19)] : true,
      [utils.asGridCoord(17,19)] : true,
      [utils.asGridCoord(18,19)] : true,
      [utils.asGridCoord(19,19)] : true,
      [utils.asGridCoord(20,19)] : true,
      [utils.asGridCoord(21,19)] : true,
      [utils.asGridCoord(22,19)] : true,
      [utils.asGridCoord(23,19)] : true,
      [utils.asGridCoord(24,19)] : true,
      [utils.asGridCoord(25,19)] : true,
      [utils.asGridCoord(26,19)] : true,
      [utils.asGridCoord(27,19)] : true,
      [utils.asGridCoord(28,19)] : true,
      [utils.asGridCoord(29,19)] : true,
      [utils.asGridCoord(30,19)] : true,
      [utils.asGridCoord(31,19)] : true,
      [utils.asGridCoord(32,19)] : true,
      [utils.asGridCoord(33,19)] : true,
      [utils.asGridCoord(34,18)] : true,
      [utils.asGridCoord(34,17)] : true,
      [utils.asGridCoord(34,16)] : true,
      [utils.asGridCoord(34,15)] : true,
      [utils.asGridCoord(34,14)] : true,
      [utils.asGridCoord(34,13)] : true,
      [utils.asGridCoord(34,12)] : true,
      [utils.asGridCoord(34,11)] : true,
      [utils.asGridCoord(34,10)] : true,
      [utils.asGridCoord(33,9)] : true,
      [utils.asGridCoord(32,9)] : true,
      [utils.asGridCoord(31,9)] : true,
      [utils.asGridCoord(30,9)] : true,
      [utils.asGridCoord(30,8)] : true,
      [utils.asGridCoord(28,8)] : true,
      [utils.asGridCoord(28,9)] : true,
      [utils.asGridCoord(27,7)] : true,
      [utils.asGridCoord(26,7)] : true,
      [utils.asGridCoord(26,6)] : true,
      [utils.asGridCoord(26,5)] : true,
      [utils.asGridCoord(25,4)] : true,
      [utils.asGridCoord(24,5)] : true,
      [utils.asGridCoord(24,6)] : true,
      [utils.asGridCoord(24,7)] : true,
      [utils.asGridCoord(22,7)] : true,
      [utils.asGridCoord(21,7)] : true,
      [utils.asGridCoord(20,7)] : true,
      [utils.asGridCoord(19,7)] : true,
      [utils.asGridCoord(18,7)] : true,
      [utils.asGridCoord(17,7)] : true,
      [utils.asGridCoord(16,7)] : true,
      [utils.asGridCoord(15,7)] : true,
      [utils.asGridCoord(14,8)] : true,
      [utils.asGridCoord(13,8)] : true,
      [utils.asGridCoord(12,9)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(10,9)] : true,
      [utils.asGridCoord(9,9)] : true,
      [utils.asGridCoord(8,9)] : true,
      [utils.asGridCoord(7,9)] : true,

      //Macetas
      [utils.asGridCoord(16,9)] : true,
      [utils.asGridCoord(17,9)] : true,
      [utils.asGridCoord(16,10)] : true,
      [utils.asGridCoord(17,10)] : true,
      [utils.asGridCoord(16,11)] : true,
      [utils.asGridCoord(17,11)] : true,
      [utils.asGridCoord(18,11)] : true,
      [utils.asGridCoord(19,11)] : true,
      [utils.asGridCoord(25,9)] : true,
      [utils.asGridCoord(26,9)] : true,
      [utils.asGridCoord(25,10)] : true,
      [utils.asGridCoord(26,10)] : true,
      [utils.asGridCoord(25,11)] : true,
      [utils.asGridCoord(26,11)] : true,

      
    },
    cutsceneSpaces: {
      [utils.asGridCoord(25,5)]: [
        {
          events: [
            {type: "changeMap", map: "StreetNorth" }
          ]
        }
      ],
      [utils.asGridCoord(29,9)]: [
        {
          events: [
            {type: "changeMap", map: "DemoRoom" }
          ]
        }
      ],
      [utils.asGridCoord(5,8)]: [
        {
          events: [
            {type: "changeMap", map: "Kitchen" }
          ]
        }
      ],
      [utils.asGridCoord(25,6)]: [
        {
          events: [
            { who: "npc5", type: "stand",  direction: "right", time: 1 },
            { who: "npc6", type: "stand",  direction: "left", time: 1 },
            { who: "npc1", type: "stand",  direction: "up", time: 1 },
            { who: "npc3", type: "stand",  direction: "up", time: 1 },
            { who: "npc7", type: "stand",  direction: "right", time: 1 },
            { who: "npc8", type: "stand",  direction: "left", time: 1 },
          ]
        }
      ],
      [utils.asGridCoord(11,12)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1 },
            {type: "textMessage", text: "Profesor Sabio:  eeeh.. disculpa, estabamos hablando."},
            { who: "hero", type: "stand",  direction: "right", time: 1 },
            {type: "textMessage", text: "Alumna Entusiasmada:  Si eso. No sabes que es de mala educacion plantarse en medio en una conversacion?"},
            { who: "hero", type: "stand",  direction: "down", time: 1 },
            {type: "textMessage", text: "Los dos a la vez:  APARTA!!"},
            { who: "hero", type: "stand",  direction: "up", time: 80 },
            { who: "hero", type: "stand",  direction: "down", time: 80 },
            { who: "hero", type: "stand",  direction: "left", time: 80 },
            { who: "hero", type: "stand",  direction: "down", time: 80 },
            { who: "hero", type: "stand",  direction: "up", time: 80 },
            { who: "hero", type: "stand",  direction: "right", time: 80 },
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(22,10)]: [
        {
          events: [
            { who: "npc2", type: "stand",  direction: "right", time: 1 },
            {type: "textMessage", text: "Mutitud:  Parece que va a intentar competir contra la campeona."},
            {type: "textMessage", text: "Mutitud:  NO PUEDE SER! ESTA LOCO!!"},
            {type: "textMessage", text: "Campeona:  Veo que quieres intentar superar mi marca. Veamos que tal lo haces."},
            { who: "hero", type: "stand",  direction: "down", time: 1500 },
            {type: "textMessage", text: "Mutitud:  Se esta preparando!"},
            {type: "textMessage", text: "Campeona:  Se lo esta tomando en serio..."},
            { who: "hero", type: "stand",  direction: "down", time: 2000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "hero", type: "stand",  direction: "down", time: 1000 },
            {type: "textMessage", text: "Campeona:  ..."},
            {type: "textMessage", text: "Multitud:  ...Tampoco ha sido para tanto..."},
            { who: "hero", type: "stand",  direction: "down", time: 1000 },

            { who: "hero", type: "stand",  direction: "down", time: 70 },
            { who: "hero", type: "stand",  direction: "right", time: 70 },
            { who: "hero", type: "stand",  direction: "up", time: 70 },
            { who: "hero", type: "stand",  direction: "left", time: 70 },
            { who: "hero", type: "stand",  direction: "down", time: 70 },
            { who: "hero", type: "stand",  direction: "right", time: 70 },
            { who: "hero", type: "stand",  direction: "up", time: 70 },
            { who: "hero", type: "stand",  direction: "left", time: 70 },
            { who: "hero", type: "stand",  direction: "down", time: 70 },
            { who: "hero", type: "stand",  direction: "right", time: 70 },
            { who: "hero", type: "stand",  direction: "up", time: 70 },
            { who: "hero", type: "stand",  direction: "left", time: 70 },
            { who: "hero", type: "stand",  direction: "down", time: 70 },
            { who: "hero", type: "stand",  direction: "right", time: 70 },
            { who: "hero", type: "stand",  direction: "up", time: 70 },
            { who: "hero", type: "stand",  direction: "left", time: 70 },
            { who: "hero", type: "stand",  direction: "down", time: 70 },
            { who: "hero", type: "stand",  direction: "right", time: 70 },
            { who: "hero", type: "stand",  direction: "up", time: 70 },
            { who: "hero", type: "stand",  direction: "left", time: 70 },
            { who: "hero", type: "stand",  direction: "down", time: 70 },
            { who: "hero", type: "stand",  direction: "right", time: 70 },
            { who: "hero", type: "stand",  direction: "up", time: 70 },
            { who: "hero", type: "stand",  direction: "left", time: 70 },
            { who: "hero", type: "stand",  direction: "down", time: 2000 },

            {type: "textMessage", text: "Mutitud:  INCREIBLEEE!!!!"},
            {type: "textMessage", text: "Campeona:  He sido derrotada justamente."},
            {type: "textMessage", text: "Campeona:  Tengo que seguir practicando. No puedo parar."},

          ]
        }
      ],
      [utils.asGridCoord(9,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(10,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(11,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(12,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(13,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(14,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(15,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(16,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(17,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(18,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(19,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(20,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(21,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(22,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(23,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(24,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(25,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(26,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(27,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(28,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(29,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(32,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(33,14)]: [
        {
          events: [
            {type: "textMessage", text: "NO TIMMY. Eres demasiado joven para morir. No te rindas todavia."},
            { who: "hero", type: "walk",  direction: "up"},
          ]
        }
      ],
      [utils.asGridCoord(33,18)]: [
        {
          events: [
            {type: "textMessage", text: "Vaya vaya. Te crees muy listo sabiendo que habia algo aqui verdad."},
            {type: "textMessage", text: "Que esperabas. Un nivel secreto o algo asi?"},
            {type: "textMessage", text: "Bueno pues que disfrutes de ver que mas cosas hay por aqui. Porque te voy a mandar arriba."},
            { who: "hero", type: "walk",  direction: "up"},
            { who: "hero", type: "walk",  direction: "up"},
            { who: "hero", type: "walk",  direction: "up"},
            { who: "hero", type: "walk",  direction: "up"},
            { who: "hero", type: "walk",  direction: "up"},
            {type: "textMessage", text: "Ale. A dar toda la vuelta crack."},
            
          ]
        }
      ],
    }
  },
}