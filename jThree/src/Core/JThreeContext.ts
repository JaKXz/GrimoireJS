import GLSpecManager = require("./GLSpecManager");
﻿import ContextTimer = require("./ContextTimer");
import Timer = require("./Timer");
import GomlLoader = require("../Goml/GomlLoader");
import Delegates = require("../Base/Delegates");
import ResourceManager = require("./ResourceManager");
import Canvas = require("./Canvas");
import JThreeObject = require("../Base/JThreeObject");
import CanvasListChangedEventArgs = require("./CanvasListChangedEventArgs");
import SceneManager = require("./SceneManager");
import ListStateChangedType = require("./ListStateChangedType");
import AnimaterBase = require("../Goml/Animater/AnimaterBase");
import JThreeCollection = require("../Base/JThreeCollection");
import JThreeEvent = require("../Base/JThreeEvent");
import DebugInfo = require("../Debug/DebugInfo");
import ContextComponent = require("../ContextComponents");
import NewJThreeContext = require("../NJThreeContext");
import CanvasManager = require("./CanvasManager");
import ContextComponents = require("../ContextComponents");
import LoopManager = require("./LoopManager");
class JThreeContext extends JThreeObject
{
    private static instance:JThreeContext;

    /**
    * Every user of this library should not call this method.
    * You should use JThreeContextProxy.getInstance() instead of this function.
    *
    * If you want to know more, please see the doc comment of JThreeContextProxy
    */
    public static getInstanceForProxy()
    {
      JThreeContext.instance=JThreeContext.instance||new JThreeContext();
      return JThreeContext.instance;
    }

    private resourceManager: ResourceManager;

    private timer: ContextTimer;

    private gomlLoader:GomlLoader;

    private registerNextLoop:Delegates.Action0;

    private animaters:JThreeCollection<AnimaterBase>=new JThreeCollection<AnimaterBase>();

    private canvasChangedEvent:JThreeEvent<CanvasListChangedEventArgs>=new JThreeEvent<CanvasListChangedEventArgs>();

    private canvasManager:CanvasManager;

    public addAnimater(animater:AnimaterBase):void
    {
      this.animaters.insert(animater);
    }

    private updateAnimation():void
    {
      var time=this.timer.Time;
      this.animaters.each(v=>{
        if(v.update(time))this.animaters.del(v);
      });
    }
    /**
     * Getter for reference to manage entire scenes.
     */
    public get SceneManager(): SceneManager {
        return NewJThreeContext.getContextComponent<SceneManager>(ContextComponent.SceneManager);
    }
    /**
     * Getter for reference to manage gomls.
     */
    public get GomlLoader(): GomlLoader {
        return this.gomlLoader;
    }

    constructor() {
        super();
        this.resourceManager = new ResourceManager();
        this.timer = new ContextTimer();
        this.gomlLoader = new GomlLoader();
        this.canvasManager = NewJThreeContext.getContextComponent<CanvasManager>(ContextComponents.CanvasManager);
        var lm = NewJThreeContext.getContextComponent<LoopManager>(ContextComponent.LoopManager);
        lm.addAction(1000,()=>this.timer.updateTimer());
        lm.addAction(2000,()=>this.updateAnimation());
        lm.addAction(3000,()=>this.gomlLoader.update());
        lm.addAction(4000,()=>this.canvasManager.beforeRenderAll());
        lm.addAction(5000,()=>this.SceneManager.renderAll());
        lm.addAction(6000,()=>this.canvasManager.afterRenderAll());
    }

    /**
    * Getter of Timer
    */
    public get Timer(): Timer {
        return this.timer;
    }

    /**
     * The class managing resources over multiple canvas(Buffer,Shader,Program,Texture)
     */
    public get ResourceManager(): ResourceManager {
        return this.resourceManager;
    }
}

export=JThreeContext;
