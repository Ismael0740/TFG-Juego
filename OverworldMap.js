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
  DemoRoom: {
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
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
        src: "/images/characters/people/npc2.png",
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
            {type: "changeMap", map: "Kitchen" }
          ]
        }
      ]
    }
  },
  Kitchen: {
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(10)
      }),
      npcA: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc3.png",
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
            {type: "changeMap", map: "DemoRoom" }
          ]
        }
      ]
    }
  },
}