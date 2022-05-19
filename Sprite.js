class Sprite {
  constructor(config) {

    //Prepara la imagen
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    }

    //Sombra
    this.shadow = new Image();
    this.useShadow = true; //config.useShadow || false
    if (this.useShadow) {
      this.shadow.src = "/images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    }

    //Configurar animaciones y estados iniciales
    this.animations = config.animations || {
      "idle-down" : [ [0,0] ],
      "idle-right": [ [0,1] ],
      "idle-up"   : [ [0,2] ],
      "idle-left" : [ [0,3] ],
      "walk-down" : [ [1,0],[0,0],[3,0],[0,0], ],
      "walk-right": [ [1,1],[0,1],[3,1],[0,1], ],
      "walk-up"   : [ [1,2],[0,2],[3,2],[0,2], ],
      "walk-left" : [ [1,3],[0,3],[3,3],[0,3], ]
    }
    this.currentAnimation = "idle-right"; // config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;
    

    //Referencia al gameObject
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame]
  }

  setAnimation(key) {
    if (this.currentAnimation !== key) {//en caso de que ya este en la animacion que se le ha pasado no hara nada,
                                        //sino cambiará la animacion actual por la que se ha pasado,
                                        //se colocará al principio de la animacion (en la primera coordenada de la imagen del array)
                                        //y se actualizara el tiempo que le queda a la animacion para avanzar al siguiente frame al maximo.

      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
      //Si no es 0, la variable que cuenta el progreso que lleva el frame que se esta mostrando baja 1 unidad y sale del metodo.
      //Si es 0, continua el resto del metodo y cambia la animacion a la siguiente, a no ser que el array de animaciones se acabe, en cuyo caso vuleve a comenzar dicho array

    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    //Reiniciar contador
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0
    }


  }
  

  draw(ctx, cameraPerson) {
    const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
    const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);


    const [frameX, frameY] = this.frame;

    this.isLoaded && ctx.drawImage(this.image,
      frameX * 32, frameY * 32,
      32,32,
      x,y,
      32,32
    )

    this.updateAnimationProgress();
  }

}