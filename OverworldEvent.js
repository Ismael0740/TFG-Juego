//Los resolve encima de las funciones son las promesas que devolveremos al metodo que llamó a estas funciones,
//de esta manera se devolvera cuando haya terminado de realizar la accion ("walk", "stand", etc...)
//esto es parte de lo que construí anteriormente en la funcion async: doBehaviorEvent, en la clase gameObject, el await

class OverworldEvent {
  constructor({ map, event}) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
    
    //Si la persona ha terminado de andar, hace el resolve del event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }


  //Conecta con StartBehavior, funcion de la clase Person.
    //Es decir, estamos conectando y pasandole los parametros a la misma clase con la que nuestro pj se mueve,
    //solo que al asignarlo desde aqui no se ejecuta por la via del DirectionInput,
    //sino por la de comandos ya hechos desde el OverworldMap en la propia seccion donde se define al npc.
  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Si la persona ha terminado de andar, hace el resolve del event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }


  textMessage(resolve){

    if(this.event.faceHero){
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    })
    message.init(document.querySelector(".game-container"))
  }

  changeMap(resolve){
    this.map.overworld.startMap( window.OverworldMaps[this.event.map] )
    resolve();
  }


  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)      
    })
  }

}