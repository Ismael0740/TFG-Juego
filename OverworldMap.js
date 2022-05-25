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

      //TODO: hacer que compruebe si el objeto deberia montarse o no
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
  //--------------------------------------------DEMO ROOM-------------------------------------------------
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
              {type: "textMessage", text: "h0lA BuEn4s", faceHero: "npcA"},
              {type: "textMessage", text: "Como vamos?!"},
              { who: "hero", type: "walk",  direction: "up" },
              { who: "hero", type: "walk",  direction: "right" },
              { who: "hero", type: "walk",  direction: "right" },
              { who: "hero", type: "walk",  direction: "down" },
              { who: "hero", type: "stand",  direction: "left", time: 100 },
              { who: "npcA", type: "stand",  direction: "right", time: 100 },
              {type: "textMessage", text: "Que haces?", faceHero: "npcA"},
              {type: "textMessage", text: "Eres tonto o que?"},
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
              {type: "textMessage", text: "Hola como va?", faceHero: "npcB"},
              {type: "textMessage", text: "No te procupes si me ves aqui todo el dia"},
              {type: "textMessage", text: "Me pegan por estar aqui"},
              { who: "npcB", type: "stand",  direction: "down", time: 1200 },
              {type: "textMessage", text: "Digo me pagan!", faceHero: "npcB"},
              {type: "textMessage", text: "Aunque tambien me pegan..."},
            ]
          }
        ]
        // behaviorLoop: [
        //   { type: "walk",  direction: "left" },
        //   { type: "stand",  direction: "up", time: 800 },
        //   { type: "walk",  direction: "up" },
        //   { type: "walk",  direction: "right" },
        //   { type: "walk",  direction: "down" },
        // ]
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
      [utils.asGridCoord(3,3)] : true,
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
  //--------------------------------------------COCINA-------------------------------------------------
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
              {type: "textMessage", text: "Dejame tranquilo pesao, que eres un pesao", faceHero: "npcA"},
              { who: "hero", type: "walk",  direction: "left" },
              { who: "npcA", type: "stand",  direction: "left", time: 5 },
              {type: "textMessage", text: "ESPERA!!"},
              { who: "hero", type: "stand",  direction: "left", time: 500 },
              { who: "hero", type: "stand",  direction: "right", time: 1500 },
              {type: "textMessage", text: "me he pasado un poco, me perdonas??"},
              {type: "textMessage", text: "..??"},
              {type: "textMessage", text: "......??"},
              {type: "textMessage", text: "Pero di algo!"},
              {type: "textMessage", text: "Que verguenza!!"},
              { who: "npcA", type: "walk",  direction: "right" },
              { who: "npcA", type: "walk",  direction: "down" },
              { who: "npcA", type: "walk",  direction: "right" },
              { who: "npcA", type: "stand",  direction: "right", time: 1000 },
            ]
          }
        ]
      })
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
      ]
    }
  },
  //--------------------------------------------COCINA VERDE-------------------------------------------------
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
              {type: "textMessage", text: "Hombre indignado: Llevo 1 hora esperando a que alguien me traiga la comida!!", faceHero: "npcA"},
              {type: "textMessage", text: "Hombre indignado: Cuanto rato tengo que seguir esperando.", faceHero: "npcA"},
              {type: "textMessage", text: "Hombre indignado: Desde luego esto es indignante...", faceHero: "npcA"},
              {type: "textMessage", text: "Hombre indignado: Espera un momento.", faceHero: "npcA"},
              {type: "textMessage", text: "Hombre indignado: La verdad es que no he llegado a pedir comida, supongo que por eso nadie a venido a servirme.", faceHero: "npcA"},

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
      [utils.asGridCoord(1,12)] : true,
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
      [utils.asGridCoord(1,6)] : true,
      [utils.asGridCoord(2,6)] : true,
      [utils.asGridCoord(3,6)] : true,
      [utils.asGridCoord(4,6)] : true,
      [utils.asGridCoord(5,6)] : true,
      [utils.asGridCoord(6,6)] : true,
      
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
  //--------------------------------------------EXTERIOR 1-------------------------------------------------
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
              {type: "textMessage", text: "Dejame tranquilo pesao, que eres un pesao", faceHero: "npcA"},
              { who: "hero", type: "walk",  direction: "left" },
              { who: "npcA", type: "stand",  direction: "left", time: 5 },
              {type: "textMessage", text: "ESPERA!!"},
              { who: "hero", type: "stand",  direction: "left", time: 500 },
              { who: "hero", type: "stand",  direction: "right", time: 1500 },
              {type: "textMessage", text: "me he pasado un poco, me perdonas??"},
              {type: "textMessage", text: "..??"},
              {type: "textMessage", text: "......??"},
              {type: "textMessage", text: "Pero di algo!"},
              {type: "textMessage", text: "Que verguenza!!"},
              { who: "npcA", type: "walk",  direction: "right" },
              { who: "npcA", type: "walk",  direction: "down" },
              { who: "npcA", type: "walk",  direction: "right" },
              { who: "npcA", type: "stand",  direction: "right", time: 1000 },
            ]
          }
        ]
      })
    },
    walls: {
      //mesas
      
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
    }
  },
  //-------------------------------------EXTERIOR 2-----------------------------------------------
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
      npcA: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/pj2.png",
        useShadow: true,
        talking: [
          {
            events: [
              {type: "textMessage", text: "Dejame tranquilo pesao, que eres un pesao", faceHero: "npcA"},
              { who: "hero", type: "walk",  direction: "left" },
              { who: "npcA", type: "stand",  direction: "left", time: 5 },
              {type: "textMessage", text: "ESPERA!!"},
              { who: "hero", type: "stand",  direction: "left", time: 500 },
              { who: "hero", type: "stand",  direction: "right", time: 1500 },
              {type: "textMessage", text: "me he pasado un poco, me perdonas??"},
              {type: "textMessage", text: "..??"},
              {type: "textMessage", text: "......??"},
              {type: "textMessage", text: "Pero di algo!"},
              {type: "textMessage", text: "Que verguenza!!"},
              { who: "npcA", type: "walk",  direction: "right" },
              { who: "npcA", type: "walk",  direction: "down" },
              { who: "npcA", type: "walk",  direction: "right" },
              { who: "npcA", type: "stand",  direction: "right", time: 1000 },
            ]
          }
        ]
      })
    },
    walls: {
      //mesas
      
    },
    cutsceneSpaces: {
      [utils.asGridCoord(25,5)]: [
        {
          events: [
            {type: "changeMap", map: "StreetNorth" }
          ]
        }
      ],
      [utils.asGridCoord(29,8)]: [
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
      ]
    }
  },
}