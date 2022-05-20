class Overworld {
 constructor(config) {
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
   this.map = null;
 }


 //LO QUE SE EJECUTA CONSTANTEMENTE.
  startGameLoop() {
    const step = () => {
      //Limpia el canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Elige el personaje al que seguirá la camara
      const cameraPerson = this.map.gameObjects.hero;

      //Actualiza todos los objetos
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })

      //Pone la capa inferior
      this.map.drawLowerImage(this.ctx, cameraPerson);

      //Pone los GameObject (los personajes)
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })

      //Pone la capa superior
      this.map.drawUpperImage(this.ctx, cameraPerson);
      
      requestAnimationFrame(() => {
        step();   
      })
    }
    step();
 }


 bindActionInput(){
   new KeyPressListener("Enter", () => {
     //Hay algun npc aqui con el que hablar?
     this.map.checkForActionCutscene();
   })
 }

 bindHeroPositionCheck(){
   document.addEventListener("PersonWalkingComplete", e => {
     if(e.detail.whoId === "hero") {
        this.map.checkForFootstepCutscene();
     }
   });
 }

 startMap(mapConfig){
   this.map = new OverworldMap(mapConfig);
   this.map.overworld = this;
   this.map.mountObjects();
 }


 init() {
  this.startMap(window.OverworldMaps.DemoRoom);


  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();//Se crea una nueva instancia de DirectionInput
  this.directionInput.init();//Se llama al metodo init del DirectionInpuit que acabamos de crear, para configurar y preparar los actionListeners para el movimiento

  this.startGameLoop(); //Se llama al metodo de esta misma clase

  this.map.startCutscene([
    // { type: "textMessage", text: "PERO BUENO FOLAGOR!!!"}
    // { who: "hero", type: "walk",  direction: "down" },
    // { who: "hero", type: "walk",  direction: "down" },
    // { who: "npcA", type: "walk",  direction: "left" },
    // { who: "npcA", type: "walk",  direction: "left" },
    // { who: "npcA", type: "stand",  direction: "up", time: 800 },
  ])

 }
}