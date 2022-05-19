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
       Object.values(this.map.gameObjects).forEach(object =>{
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
       })
 
       //Pone la capa inferior
       this.map.drawLowerImage(this.ctx, cameraPerson);
 
       //Pone los GameObject (los personajes)
       Object.values(this.map.gameObjects).forEach(object => {
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
 
  init() {
   this.map = new OverworldMap(window.OverworldMaps.Kitchen); //Asocia al atributo mapa una nueva instancia de Overworldmaps (especificando entre todos los mapas que hay disponibles)
   this.map.mountObjects();
 
   this.directionInput = new DirectionInput(); //Se crea una nueva instancia de DirectionInput
   this.directionInput.init(); //Se llama al metodo init del DirectionInpuit que acabamos de crear, para configurar y preparar los actionListeners para el movimiento
 
   this.startGameLoop(); //Se llama al metodo de esta misma clase
  }
 }