class GameObject {
  constructor(config) {
    this.id = null;
    this.isMounted = false;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || "down";
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "/images/characters/people/hero.png",
    });

    this.behaviorLoop = config.behaviorLoop || [];
    this.behaviorLoopIndex = 0;

    this.talking = config.talking || [];

  }

  mount(map) {
    console.log("mounting!")
    this.isMounted = true;
    map.addWall(this.x, this.y);

    //Se usa el setTimeout para llamar a la funcion doBehaviorEvent con 10 milisegundos de retraso, para asi dejar que carguen el resto de cosas antes de empezar la animacion
    setTimeout(() => {
      this.doBehaviorEvent(map);
    }, 10)
  }

  update() {
  }

  async doBehaviorEvent(map) { 

  //Sale del bucle de recursividad si hay alguna cutscene mas importante o no hay configuraciones en el array de behaviorLoop
    if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
      return;
    }



    //Informacion relevante del event
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id; //Coge el valor del id, es decir "hero", "npcA", "npcB", etc..



    //Se crea instancia de event con la configuracion de eventConfig
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init(); //Al llevar await, forzamos al programa a esperar que termine la ejecucion del init() antes de continuar.
    //await debe ir acompañado de async en la funcion que lo contiene



    //Se prepara el siguiente event para ejecutarse 
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    } 

    //Recursividad
    this.doBehaviorEvent(map);
    

  }


}